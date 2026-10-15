import { SpeechAudioCache, SpeechTimeoutError, synthesizeNeuralAudio } from "@/lib/audio/neural-tts";
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
const MAX_TRACKED_CLIENTS = 5_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestsByClient = new Map<string, RateLimitEntry>();
let activeSyntheses = 0;
const audioCache = new SpeechAudioCache();

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

function audioResponse(audio: Uint8Array) {
  return new Response(Uint8Array.from(audio).buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.byteLength),
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
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
  if (request.signal.aborted) return new Response(null, { status: 499 });
  const cacheKey = audioCache.key(voice, text);
  const cached = audioCache.get(cacheKey);
  if (cached) return audioResponse(cached);

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
  try {
    const audio = await synthesizeNeuralAudio(voice, text, request.signal);
    request.signal.throwIfAborted();
    audioCache.set(cacheKey, audio);
    return audioResponse(audio);
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("TTS synthesis failed:", error);
    const timedOut = error instanceof SpeechTimeoutError;
    return Response.json(
      { error: timedOut ? "Speech synthesis timed out" : "Speech synthesis failed" },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    activeSyntheses = Math.max(0, activeSyntheses - 1);
  }
}
