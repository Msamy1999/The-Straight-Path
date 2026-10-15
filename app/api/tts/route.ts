import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { requestClientKey } from "@/lib/request-client";

/**
 * Neural text-to-speech proxy used by the website and the mobile app's
 * "Read article" feature. Synthesizes short text chunks (the clients split
 * articles into sentences) through the Microsoft Edge Read Aloud neural
 * voices — dramatically more natural than on-device speechSynthesis /
 * expo-speech defaults. GET so <audio> elements and expo-av can stream the
 * result directly by URL.
 *
 * Note: this uses the same public endpoint the Edge browser's own Read
 * Aloud feature calls. The website waits and retries this neural voice if it
 * is unavailable; it never substitutes an on-device speech engine. Mobile
 * playback has its own availability handling.
 */

const DEFAULT_VOICE = "en-US-GuyNeural";
const ALLOWED_VOICES = new Set([DEFAULT_VOICE, "ar-SA-HamedNeural"]);
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

function escapeSsmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function synthesize(voice: string, text: string): Promise<Uint8Array> {
  const tts = new MsEdgeTTS();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const operation = async () => {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(escapeSsmlText(text));

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
  };

  const timedOut = new Promise<Uint8Array>((_, reject) => {
    timeout = setTimeout(() => {
      tts.close();
      reject(new Error("TTS synthesis timed out"));
    }, SYNTHESIS_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation(), timedOut]);
  } finally {
    if (timeout) clearTimeout(timeout);
    tts.close();
  }
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
  const voice = ALLOWED_VOICES.has(voiceParam) ? voiceParam : DEFAULT_VOICE;

  const retryAfter = consumeRequest(requestClientKey(request));
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
  void synthesis.then(
    () => {
      activeSyntheses = Math.max(0, activeSyntheses - 1);
    },
    () => {
      activeSyntheses = Math.max(0, activeSyntheses - 1);
    },
  );

  try {
    const audio = await synthesis;

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
