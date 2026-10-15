import assert from "node:assert/strict";
import { PassThrough, Readable } from "node:stream";
import { MsEdgeTTS } from "msedge-tts";
import { SpeechAudioCache, SpeechTimeoutError, synthesizeNeuralAudio } from "../lib/audio/neural-tts";
import { isReferenceOnlyLine } from "../lib/article-text";

for (const line of ["[Review](https://example.org/paper)", " [CDC](https://example.org) ", "[A](https://example.org/a); [B](https://example.org/b)"]) {
  assert.equal(isReferenceOnlyLine(line), true);
}
for (const line of ["A review found a benefit.", "See [the review](https://example.org) for the methods.", "Take regular breaks.", "- A meaningful list item."]) {
  assert.equal(isReferenceOnlyLine(line), false);
}

const cache = new SpeechAudioCache(8, 2, 100);
cache.set("a", new Uint8Array(4), 0);
cache.set("b", new Uint8Array(4), 0);
assert.equal(cache.get("a", 10)?.byteLength, 4);
cache.set("c", new Uint8Array(4), 10);
assert.equal(cache.get("b", 11), undefined, "LRU entry must be evicted");
assert.equal(cache.get("a", 101), undefined, "Expired audio must not be reused");
cache.set("oversized", new Uint8Array(9), 11);
assert.equal(cache.get("oversized", 12), undefined);
assert.notEqual(cache.key("en-US-GuyNeural", "Text"), cache.key("ar-SA-HamedNeural", "Text"));

let submitted = "";
let closed = 0;
const result = await synthesizeNeuralAudio("en-US-GuyNeural", "A & <B>", new AbortController().signal, () => ({
  setMetadata: async (voice) => { assert.equal(voice, "en-US-GuyNeural"); },
  toStream: (text) => { submitted = text; return { audioStream: Readable.from([Buffer.from("audio")]), metadataStream: null }; },
  close: () => { closed += 1; },
}));
assert.equal(Buffer.from(result).toString(), "audio");
assert.equal(submitted, "A &amp; &lt;B&gt;");
assert.equal(closed, 1);

for (const interrupt of ["abort", "timeout"] as const) {
  const controller = new AbortController();
  let finishMetadata = () => {};
  let streamsStarted = 0;
  let socketClosed = false;
  const pending = synthesizeNeuralAudio("en-US-GuyNeural", "Held", controller.signal, () => ({
    setMetadata: () => new Promise<void>((resolve) => { finishMetadata = resolve; }),
    toStream: () => { streamsStarted += 1; return { audioStream: Readable.from([Buffer.from("late")]), metadataStream: null }; },
    close: () => { socketClosed = true; },
  }), 20);
  if (interrupt === "abort") controller.abort();
  await assert.rejects(pending, interrupt === "abort" ? { name: "AbortError" } : SpeechTimeoutError);
  assert.equal(socketClosed, true);
  finishMetadata();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(streamsStarted, 0, "An interrupted connection must not start late synthesis");
}

const stream = new PassThrough();
const controller = new AbortController();
const pending = synthesizeNeuralAudio("en-US-GuyNeural", "Streaming", controller.signal, () => ({
  setMetadata: async () => {},
  toStream: () => ({ audioStream: stream, metadataStream: null }),
  close: () => { if (!stream.destroyed) stream.destroy(new Error("closed")); },
}));
await new Promise((resolve) => setTimeout(resolve, 5));
controller.abort();
await assert.rejects(pending, { name: "AbortError" });
assert.equal(stream.destroyed, true);

// Exercise the actual route's limiter, cache and concurrency with a fake
// upstream transport in this isolated process, never the live service.
const original = {
  setMetadata: MsEdgeTTS.prototype.setMetadata,
  toStream: MsEdgeTTS.prototype.toStream,
  close: MsEdgeTTS.prototype.close,
};
let syntheses = 0;
let hold = false;
const activeStreams = new Map<MsEdgeTTS, PassThrough>();
MsEdgeTTS.prototype.setMetadata = async () => {};
MsEdgeTTS.prototype.toStream = function () {
  syntheses += 1;
  if (!hold) return { audioStream: Readable.from([Buffer.from("test-mp3")]), metadataStream: null };
  const audioStream = new PassThrough();
  activeStreams.set(this, audioStream);
  return { audioStream, metadataStream: null };
};
MsEdgeTTS.prototype.close = function () {
  const active = activeStreams.get(this);
  if (active && !active.destroyed) active.destroy(new Error("closed"));
  activeStreams.delete(this);
};
try {
  const { GET } = await import("../app/api/tts/route");
  const request = (text: string, ip: string, signal?: AbortSignal) => new Request(`http://localhost/api/tts?text=${encodeURIComponent(text)}&voice=en-US-GuyNeural`, {
    headers: { "x-real-ip": ip }, signal,
  });
  for (let i = 0; i < 12; i += 1) assert.equal((await GET(request(`limit-${i}`, "192.0.2.1"))).status, 200);
  const limited = await GET(request("limit-13", "192.0.2.1"));
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  const before = syntheses;
  assert.equal((await GET(request("limit-0", "192.0.2.1"))).status, 200);
  assert.equal(syntheses, before, "Cached audio must not start another synthesis");

  hold = true;
  const controllers = Array.from({ length: 3 }, () => new AbortController());
  const waiting = controllers.map((entry, index) => GET(request(`held-${index}`, `192.0.2.${index + 2}`, entry.signal)));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal((await GET(request("busy", "192.0.2.9"))).status, 503);
  controllers[0].abort();
  assert.equal((await waiting[0]).status, 499);
  hold = false;
  assert.equal((await GET(request("foreground-after-cancel", "192.0.2.9"))).status, 200, "Cancellation must release the concurrency slot immediately");
  controllers[1].abort();
  controllers[2].abort();
  assert.equal((await waiting[1]).status, 499);
  assert.equal((await waiting[2]).status, 499);
} finally {
  Object.assign(MsEdgeTTS.prototype, original);
}
console.log("Neural TTS cache, cancellation, timeout, limiter, concurrency and reference classification verified.");
