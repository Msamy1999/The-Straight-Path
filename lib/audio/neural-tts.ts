import { createHash } from "node:crypto";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

type SpeechClient = Pick<MsEdgeTTS, "setMetadata" | "toStream" | "close">;

export class SpeechTimeoutError extends Error {}

/** Bounded, process-local audio reuse; no database or persistent text storage. */
export class SpeechAudioCache {
  private entries = new Map<string, { audio: Uint8Array; expiresAt: number }>();
  private bytes = 0;

  constructor(
    private maxBytes = 16 * 1024 * 1024,
    private maxEntries = 128,
    private ttlMs = 30 * 60 * 1_000,
  ) {}

  key(voice: string, text: string): string {
    return createHash("sha256").update(`${voice}\0${text}`).digest("hex");
  }

  get(key: string, now = Date.now()): Uint8Array | undefined {
    const entry = this.entries.get(key);
    if (!entry) return;
    this.entries.delete(key);
    if (entry.expiresAt <= now) {
      this.bytes -= entry.audio.byteLength;
      return;
    }
    this.entries.set(key, entry);
    return entry.audio;
  }

  set(key: string, audio: Uint8Array, now = Date.now()) {
    if (!audio.byteLength || audio.byteLength > this.maxBytes) return;
    const existing = this.entries.get(key);
    if (existing) this.bytes -= existing.audio.byteLength;
    this.entries.delete(key);
    this.entries.set(key, { audio, expiresAt: now + this.ttlMs });
    this.bytes += audio.byteLength;
    while (this.bytes > this.maxBytes || this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value!;
      this.bytes -= this.entries.get(oldest)!.audio.byteLength;
      this.entries.delete(oldest);
    }
  }
}

function escapeSsmlText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

/** Abort a skipped paragraph at the upstream socket, not just in the browser. */
export async function synthesizeNeuralAudio(
  voice: string,
  text: string,
  signal: AbortSignal,
  createClient: () => SpeechClient = () => new MsEdgeTTS({
    connectionTimeoutMs: 5_000,
    synthesisTimeoutMs: 10_000,
  }),
  timeoutMs = 15_000,
): Promise<Uint8Array> {
  signal.throwIfAborted();
  const tts = createClient();
  let interruption: Error | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let onAbort: () => void = () => {};
  const interrupted = new Promise<Uint8Array>((_, reject) => {
    onAbort = () => {
      interruption = new DOMException("Speech request cancelled", "AbortError");
      reject(interruption);
      tts.close();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    timeout = setTimeout(() => {
      interruption = new SpeechTimeoutError("TTS synthesis timed out");
      reject(interruption);
      tts.close();
    }, timeoutMs);
  });
  const operation = async () => {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    if (interruption) throw interruption;
    signal.throwIfAborted();
    const { audioStream } = tts.toStream(escapeSsmlText(text));
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
    });
    const audio = Buffer.concat(chunks);
    if (!audio.byteLength) throw new Error("Empty synthesis result");
    return new Uint8Array(audio);
  };
  try {
    return await Promise.race([operation(), interrupted]);
  } finally {
    if (timeout) clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
    tts.close();
  }
}
