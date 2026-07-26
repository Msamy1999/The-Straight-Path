import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

/**
 * Neural text-to-speech proxy used by the website and the mobile app's
 * "Read article" feature. Synthesizes short text chunks (the clients split
 * articles into sentences) through the Microsoft Edge Read Aloud neural
 * voices — dramatically more natural than on-device speechSynthesis /
 * expo-speech defaults. GET so <audio> elements and expo-av can stream the
 * result directly by URL.
 *
 * Note: this uses the same public endpoint the Edge browser's own Read
 * Aloud feature calls. If it ever breaks, both clients fall back to their
 * on-device speech engines automatically.
 */

const DEFAULT_VOICE = "en-US-GuyNeural";
const MAX_CHARS = 1200;
const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_CONCURRENT_SYNTHESIS = 3;
const SYNTHESIS_TIMEOUT_MS = 45_000;
const MAX_TRACKED_CLIENTS = 5_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestsByClient = new Map<string, RateLimitEntry>();
let activeSyntheses = 0;

// Only allow well-formed Edge voice names, e.g. "en-US-AriaNeural".
const VOICE_PATTERN = /^[a-z]{2,3}-[A-Za-z]{2,4}-[A-Za-z0-9]+Neural$/;

function clientKey(request: Request): string {
  // Hosting platforms set this header from the connection. Keeping only the
  // first value prevents a forwarded chain from becoming an unbounded key.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function consumeRequest(client: string): number | null {
  const now = Date.now();

  if (requestsByClient.size >= MAX_TRACKED_CLIENTS) {
    for (const [key, value] of requestsByClient) {
      if (value.resetAt <= now) {
        requestsByClient.delete(key);
      }
    }
    // Keep the in-memory limiter bounded even if a bot rotates source IPs.
    if (requestsByClient.size >= MAX_TRACKED_CLIENTS) {
      requestsByClient.delete(requestsByClient.keys().next().value!);
    }
  }

  const entry = requestsByClient.get(client);

  if (!entry || entry.resetAt <= now) {
    requestsByClient.set(client, {
      count: 1,
      resetAt: now + REQUEST_WINDOW_MS,
    });
    return null;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  }

  entry.count += 1;
  return null;
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("TTS synthesis timed out")),
      SYNTHESIS_TIMEOUT_MS,
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function synthesize(voice: string, text: string): Promise<Uint8Array> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = await tts.toStream(text);

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
  });

  const audio = Buffer.concat(chunks);
  if (audio.length === 0) {
    throw new Error("Empty synthesis result");
  }

  return new Uint8Array(audio);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text")?.trim();
  const voiceParam = url.searchParams.get("voice") ?? DEFAULT_VOICE;

  if (!text) {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return Response.json(
      { error: `Text too long (max ${MAX_CHARS} characters per request)` },
      { status: 400 },
    );
  }
  const voice = VOICE_PATTERN.test(voiceParam) ? voiceParam : DEFAULT_VOICE;

  const retryAfter = consumeRequest(clientKey(request));
  if (retryAfter !== null) {
    return Response.json(
      { error: "Too many speech requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  if (activeSyntheses >= MAX_CONCURRENT_SYNTHESIS) {
    return Response.json(
      { error: "Speech service is busy. Please try again shortly." },
      { status: 503, headers: { "Retry-After": "10" } },
    );
  }

  activeSyntheses += 1;
  const synthesis = synthesize(voice, text);
  // Do not free the concurrency slot merely because the client timed out:
  // the upstream request may still be running and consuming resources.
  void synthesis.then(
    () => {
      activeSyntheses -= 1;
    },
    () => {
      activeSyntheses -= 1;
    },
  );

  try {
    const audio = await withTimeout(synthesis);

    // Copy into a plain ArrayBuffer; the Node Buffer backing store type is
    // wider than the Web Response body type used by Next's TypeScript setup.
    const audioBody = Uint8Array.from(audio).buffer;

    return new Response(audioBody, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        // Same text+voice always yields the same audio — cache aggressively.
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (error) {
    console.error("TTS synthesis failed:", error);
    const timedOut = error instanceof Error && error.message === "TTS synthesis timed out";
    return Response.json(
      { error: timedOut ? "Speech synthesis timed out" : "Speech synthesis failed" },
      { status: timedOut ? 504 : 502 },
    );
  }
}
