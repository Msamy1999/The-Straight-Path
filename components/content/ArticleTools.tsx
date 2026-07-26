"use client";

import { Check, Copy, Pause, Play, Square, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ArticleToolsProps = {
  /** Full plain-text of the article (title, sections, Q&A). */
  articleText: string;
  articleTitle: string;
  className?: string;
};

type PlayState = "idle" | "loading" | "playing" | "paused";

type CopyStatus = { kind: "success" | "error"; message: string } | null;

const MAX_CHUNK_LENGTH = 360;
const KEEP_ALIVE_MS = 10_000;
const COPY_STATUS_MS = 2_500;
const VOICE_RETRY_MS = 400;
const NEURAL_VOICE = "en-US-GuyNeural";
const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;

/**
 * Rank English voices by expected quality — used only by the on-device
 * FALLBACK engine when the server's neural voice is unreachable.
 * Edge "Natural" neural voices > Chrome "Google" cloud voices > other
 * online/remote voices > good Apple local voices > platform default.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (name.includes("natural")) {
    score += 100;
  }
  if (name.includes("google")) {
    score += 80;
  }
  if (name.includes("online")) {
    score += 60;
  }
  if (!voice.localService) {
    score += 40;
  }
  if (name.includes("samantha") || name.includes("daniel")) {
    score += 20;
  }
  if (voice.default) {
    score += 1;
  }
  return score;
}

function pickBestEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    if (!voice.lang.toLowerCase().startsWith("en")) {
      continue;
    }
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Speech-only cleanup: strip leftover markdown symbols, soften em-dashes
 * into commas for better pacing, and collapse whitespace. The Copy button
 * keeps the untouched articleText for full fidelity.
 */
function toSpeechText(text: string): string {
  return text
    .replace(/[*_#`]+/g, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Split text into sentence-accumulating chunks (~360 chars), never breaking
 * mid-sentence unless a single sentence exceeds the limit. Short chunks keep
 * the neural stream's time-to-first-audio low (each chunk synthesizes while
 * the previous one plays) and dodge Chrome's ~15s cutoff in the fallback.
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];

  const pushLongSentence = (sentence: string) => {
    let piece = "";
    for (const word of sentence.split(/\s+/)) {
      const candidate = piece ? `${piece} ${word}` : word;
      if (candidate.length > MAX_CHUNK_LENGTH && piece) {
        chunks.push(piece);
        piece = word;
      } else {
        piece = candidate;
      }
    }
    if (piece) {
      chunks.push(piece);
    }
  };

  for (const paragraph of text.split(/\n+/)) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      continue;
    }

    const sentences =
      trimmed.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [trimmed];
    let current = "";

    for (const raw of sentences) {
      const sentence = raw.trim();
      if (!sentence) {
        continue;
      }
      if (sentence.length > MAX_CHUNK_LENGTH) {
        if (current) {
          chunks.push(current);
          current = "";
        }
        pushLongSentence(sentence);
        continue;
      }
      const candidate = current ? `${current} ${sentence}` : sentence;
      if (candidate.length > MAX_CHUNK_LENGTH && current) {
        chunks.push(current);
        current = sentence;
      } else {
        current = candidate;
      }
    }

    if (current) {
      chunks.push(current);
    }
  }

  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

/**
 * A ~44-byte silent WAV. Played synchronously inside the click handler it
 * "unlocks" the audio element on Safari/iOS, whose autoplay policy would
 * otherwise reject the real play() that happens after the first TTS fetch.
 */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const toolButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const primaryToolClass = "bg-accent text-accent-foreground hover:brightness-110";

const secondaryToolClass =
  "border border-border bg-card text-foreground hover:bg-muted";

export function ArticleTools({
  articleText,
  articleTitle,
  className,
}: ArticleToolsProps) {
  const pathname = usePathname();
  const [speechSupported, setSpeechSupported] = useState(false);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [voiceName, setVoiceName] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);

  const stoppedRef = useRef(false);
  /** Increments on every play/stop so stale async callbacks self-discard. */
  const sessionRef = useRef(0);
  const keepAliveRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  /** "neural" (server audio) or "system" (speechSynthesis fallback). */
  const engineRef = useRef<"neural" | "system">("neural");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<Promise<Blob> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playbackRateRef = useRef(1);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    setSpeechSupported(true);

    // getVoices() is async-populated: Chrome often returns [] on first call.
    // Listen for voiceschanged AND retry once after a short timeout.
    const pickVoice = () => {
      const best = pickBestEnglishVoice(window.speechSynthesis.getVoices());
      if (best) {
        voiceRef.current = best;
      }
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    const retryTimeout = window.setTimeout(pickVoice, VOICE_RETRY_MS);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.clearTimeout(retryTimeout);
    };
  }, []);

  // Stop playback and timers on unmount and on route change.
  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      stoppedRef.current = true;
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (keepAliveRef.current !== null) {
        window.clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pathname]);

  function clearKeepAlive() {
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }

  function startKeepAlive() {
    clearKeepAlive();
    // Chrome workaround: nudge the engine every ~10s or long reads go silent.
    keepAliveRef.current = window.setInterval(() => {
      const synth = window.speechSynthesis;
      if (synth.speaking && !synth.paused) {
        synth.resume();
      }
    }, KEEP_ALIVE_MS);
  }

  function finishPlayback() {
    stoppedRef.current = true;
    clearKeepAlive();
    setPlayState("idle");
  }

  // -------------------------------------------------------------------------
  // Primary engine: server-side neural voice, played as a queued audio stream.
  // -------------------------------------------------------------------------

  function fetchChunkBlob(chunk: string, signal: AbortSignal): Promise<Blob> {
    return fetch(
      `/api/tts?text=${encodeURIComponent(chunk)}&voice=${NEURAL_VOICE}`,
      { signal },
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`TTS ${response.status}`);
      }
      return response.blob();
    });
  }

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  }

  async function playNeuralChunk(
    chunks: string[],
    index: number,
    session: number,
  ): Promise<void> {
    if (session !== sessionRef.current || stoppedRef.current) {
      return;
    }
    if (index >= chunks.length) {
      finishPlayback();
      return;
    }

    const signal = abortRef.current?.signal as AbortSignal;
    const blob = await (prefetchRef.current ?? fetchChunkBlob(chunks[index], signal));
    prefetchRef.current =
      index + 1 < chunks.length
        ? fetchChunkBlob(chunks[index + 1], signal).catch(() => {
            // Prefetch failures resurface when the chunk is actually needed.
            prefetchRef.current = null;
            return fetchChunkBlob(chunks[index + 1], signal);
          })
        : null;

    if (session !== sessionRef.current || stoppedRef.current) {
      return;
    }

    const audio = getAudio();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = URL.createObjectURL(blob);
    audio.src = objectUrlRef.current;
    audio.playbackRate = playbackRateRef.current;

    audio.onended = () => {
      void playNeuralChunk(chunks, index + 1, session).catch(() => {
        if (session === sessionRef.current) {
          finishPlayback();
        }
      });
    };
    audio.onerror = () => {
      if (session === sessionRef.current) {
        finishPlayback();
      }
    };

    await audio.play();
    if (session === sessionRef.current && !stoppedRef.current) {
      setPlayState("playing");
    }
  }

  // -------------------------------------------------------------------------
  // Fallback engine: on-device speechSynthesis (best available system voice).
  // -------------------------------------------------------------------------

  function speakChunk(chunks: string[], index: number) {
    if (stoppedRef.current) {
      return;
    }
    if (index >= chunks.length) {
      finishPlayback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current.lang;
    }
    utterance.rate = playbackRateRef.current;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (!stoppedRef.current) {
        speakChunk(chunks, index + 1);
      }
    };
    utterance.onerror = () => {
      if (!stoppedRef.current) {
        finishPlayback();
        window.speechSynthesis.cancel();
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function startSystemFallback(chunks: string[]) {
    if (!speechSupported) {
      finishPlayback();
      return;
    }
    engineRef.current = "system";
    setVoiceName(voiceRef.current?.name ?? "system default");
    window.speechSynthesis.cancel();
    setPlayState("playing");
    startKeepAlive();
    speakChunk(chunks, 0);
  }

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------

  function handlePlay() {
    const chunks = chunkText(toSpeechText(articleText));
    if (chunks.length === 0) {
      return;
    }

    sessionRef.current += 1;
    const session = sessionRef.current;
    stoppedRef.current = false;
    abortRef.current = new AbortController();
    prefetchRef.current = null;
    engineRef.current = "neural";
    setVoiceName(`neural:${NEURAL_VOICE}`);
    setPlayState("loading");

    // Unlock the audio element within this user gesture (Safari/iOS policy).
    const audio = getAudio();
    audio.src = SILENT_WAV;
    void audio.play().catch(() => {});

    playNeuralChunk(chunks, 0, session).catch(() => {
      // Server voice unreachable — fall back to the device's own engine.
      if (session === sessionRef.current && !stoppedRef.current) {
        startSystemFallback(chunks);
      }
    });
  }

  function handlePause() {
    if (engineRef.current === "neural") {
      audioRef.current?.pause();
    } else {
      clearKeepAlive();
      window.speechSynthesis.pause();
    }
    setPlayState("paused");
  }

  function handleResume() {
    if (engineRef.current === "neural") {
      void audioRef.current?.play();
    } else {
      window.speechSynthesis.resume();
      startKeepAlive();
    }
    setPlayState("playing");
  }

  function handleStop() {
    sessionRef.current += 1;
    stoppedRef.current = true;
    abortRef.current?.abort();
    prefetchRef.current = null;
    clearKeepAlive();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setPlayState("idle");
  }

  function handlePlaybackRate() {
    const currentIndex = PLAYBACK_RATES.indexOf(
      playbackRateRef.current as (typeof PLAYBACK_RATES)[number],
    );
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    playbackRateRef.current = nextRate;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  }

  function showCopyStatus(status: NonNullable<CopyStatus>) {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    setCopyStatus(status);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus(null);
      copyTimeoutRef.current = null;
    }, COPY_STATUS_MS);
  }

  function fallbackCopy(): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = articleText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
    return succeeded;
  }

  async function handleCopy() {
    let succeeded = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(articleText);
        succeeded = true;
      }
    } catch {
      succeeded = false;
    }
    if (!succeeded) {
      try {
        succeeded = fallbackCopy();
      } catch {
        succeeded = false;
      }
    }
    showCopyStatus(
      succeeded
        ? { kind: "success", message: "Article copied successfully." }
        : { kind: "error", message: "Copy failed" },
    );
  }

  return (
    <div
      data-voice={voiceName || undefined}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <div
        role="group"
        aria-label={`Audio controls for ${articleTitle}`}
        className={cn(
          "flex flex-wrap items-center gap-2",
          playState !== "idle" &&
            "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[70] rounded-xl border border-border bg-card/95 p-2 shadow-soft backdrop-blur sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2",
        )}
      >
        {playState === "idle" ? (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Read article aloud: ${articleTitle}`}
            className={cn(toolButtonClass, primaryToolClass)}
          >
            <Volume2 aria-hidden="true" className="h-4 w-4" />
            Read article
          </button>
        ) : null}
        {playState === "loading" ? (
          <button
            type="button"
            disabled
            aria-label="Preparing audio"
            className={cn(toolButtonClass, primaryToolClass, "opacity-70")}
          >
            <Volume2 aria-hidden="true" className="h-4 w-4 animate-pulse" />
            Preparing…
          </button>
        ) : null}
        {playState === "playing" ? (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause reading"
            className={cn(toolButtonClass, secondaryToolClass)}
          >
            <Pause aria-hidden="true" className="h-4 w-4" />
            Pause
          </button>
        ) : null}
        {playState === "paused" ? (
          <button
            type="button"
            onClick={handleResume}
            aria-label="Resume reading"
            className={cn(toolButtonClass, secondaryToolClass)}
          >
            <Play aria-hidden="true" className="h-4 w-4" />
            Resume
          </button>
        ) : null}
        {playState === "playing" || playState === "paused" ? (
          <>
            <button
              type="button"
              onClick={handlePlaybackRate}
              aria-label={`Playback speed ${playbackRate} times. Press to increase speed.`}
              className={cn(toolButtonClass, secondaryToolClass)}
            >
              {playbackRate}×
            </button>
            <button
              type="button"
              onClick={handleStop}
              aria-label="Stop reading"
              className={cn(toolButtonClass, secondaryToolClass)}
            >
              <Square aria-hidden="true" className="h-4 w-4" />
              Stop
            </button>
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy article: ${articleTitle}`}
          className={cn(toolButtonClass, secondaryToolClass)}
        >
          {copyStatus?.kind === "success" ? (
            <Check aria-hidden="true" className="h-4 w-4 text-accent" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          Copy article
        </button>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "text-sm font-medium",
          copyStatus?.kind === "error" ? "text-gold" : "text-accent",
          copyStatus ? "" : "sr-only",
        )}
      >
        {copyStatus?.message ?? ""}
      </p>
    </div>
  );
}
