"use client";

import { Check, Copy, Pause, Play, Square, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ArticleToolsProps = {
  articleTitle: string;
  articleSubtitle?: string;
  className?: string;
};

type PlayState = "idle" | "loading" | "playing" | "paused";

type CopyStatus = { kind: "success" | "error"; message: string } | null;

type SpeechChunk = {
  text: string;
  owner: HTMLElement | null;
};

const MAX_CHUNK_LENGTH = 360;
const KEEP_ALIVE_MS = 10_000;
const COPY_STATUS_MS = 2_500;
const VOICE_RETRY_MS = 400;
const NEURAL_VOICE = "en-US-GuyNeural";
const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;
const ACTIVE_HIGHLIGHT_CLASSES = [
  "bg-accent/10",
  "ring-1",
  "ring-inset",
  "ring-accent/35",
  "rounded-md",
  "transition-colors",
] as const;

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
  articleTitle,
  articleSubtitle,
  className,
}: ArticleToolsProps) {
  const pathname = usePathname();
  const [speechSupported, setSpeechSupported] = useState(false);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [voiceName, setVoiceName] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [activeReadAlongElement, setActiveReadAlongElement] =
    useState<HTMLElement | null>(null);

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
  const activeReadAlongElementRef = useRef<HTMLElement | null>(null);
  const manualScrollUntilRef = useRef(0);

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

  useEffect(() => {
    const clearHighlight = () => {
      if (!activeReadAlongElementRef.current) {
        return;
      }
      activeReadAlongElementRef.current.classList.remove(
        ...ACTIVE_HIGHLIGHT_CLASSES,
      );
      activeReadAlongElementRef.current.removeAttribute(
        "data-read-aloud-active",
      );
      activeReadAlongElementRef.current = null;
    };

    clearHighlight();
    if (!activeReadAlongElement || playState === "idle") {
      return;
    }

    const target = activeReadAlongElement;

    const collapsedParent = target.closest("details");
    if (collapsedParent && !collapsedParent.open) {
      collapsedParent.open = true;
    }
    target.classList.add(...ACTIVE_HIGHLIGHT_CLASSES);
    target.setAttribute("data-read-aloud-active", "true");
    activeReadAlongElementRef.current = target;

    const scrollToTargetIfNeeded = () => {
      if (Date.now() < manualScrollUntilRef.current) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const safeTop = 88;
      const playerClearance = window.matchMedia("(max-width: 639px)").matches
        ? 150
        : 80;
      const safeBottom = window.innerHeight - playerClearance;
      if (rect.top >= safeTop && rect.bottom <= safeBottom) {
        return;
      }
      target.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    };
    window.requestAnimationFrame(scrollToTargetIfNeeded);

    return clearHighlight;
  }, [activeReadAlongElement, playState]);

  useEffect(() => {
    if (playState === "idle") {
      return;
    }
    const noteManualNavigation = () => {
      manualScrollUntilRef.current = Date.now() + 5_000;
    };
    window.addEventListener("wheel", noteManualNavigation, { passive: true });
    window.addEventListener("touchmove", noteManualNavigation, { passive: true });
    return () => {
      window.removeEventListener("wheel", noteManualNavigation);
      window.removeEventListener("touchmove", noteManualNavigation);
    };
  }, [playState]);

  useEffect(() => {
    if (playState === "idle" || !window.matchMedia("(max-width: 639px)").matches) {
      return;
    }
    const previousPadding = document.body.style.paddingBottom;
    document.body.style.paddingBottom =
      "calc(7.5rem + env(safe-area-inset-bottom))";
    return () => {
      document.body.style.paddingBottom = previousPadding;
    };
  }, [playState]);

  function getRenderedArticleText(includeArabic: boolean): string {
    const content = document.querySelector<HTMLElement>(
      "[data-article-readable-content]",
    );
    let renderedText = "";
    if (content) {
      const readableClone = content.cloneNode(true) as HTMLElement;
      readableClone
        .querySelectorAll("[data-read-aloud-exclude]")
        .forEach((element) => element.remove());
      if (!includeArabic) {
        readableClone
          .querySelectorAll('[lang="ar"]')
          .forEach((element) => element.remove());
      }
      readableClone.querySelectorAll("details").forEach((details) => {
        details.open = true;
      });
      readableClone.setAttribute("aria-hidden", "true");
      Object.assign(readableClone.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: "48rem",
        opacity: "0",
        pointerEvents: "none",
      });
      document.body.appendChild(readableClone);
      try {
        renderedText = readableClone.innerText;
      } finally {
        readableClone.remove();
      }
    }
    return [articleTitle, articleSubtitle, renderedText]
      .filter((value): value is string => Boolean(value?.trim()))
      .join("\n\n")
      .trim();
  }

  function getElementText(element: HTMLElement, includeArabic: boolean): string {
    const readableClone = element.cloneNode(true) as HTMLElement;
    readableClone
      .querySelectorAll("[data-read-aloud-exclude]")
      .forEach((child) => child.remove());
    if (!includeArabic) {
      readableClone.querySelectorAll('[lang="ar"]').forEach((child) => child.remove());
    }
    // Speech owners are already small, ordered blocks. textContent avoids a
    // forced layout for every block when a long article starts reading.
    return (readableClone.textContent ?? "").trim();
  }

  function getSpeechChunks(): SpeechChunk[] {
    const content = document.querySelector<HTMLElement>(
      "[data-article-readable-content]",
    );
    const titleOwner = document.querySelector<HTMLElement>("main h1");
    const subtitleOwner =
      titleOwner?.nextElementSibling instanceof HTMLElement
        ? titleOwner.nextElementSibling
        : titleOwner;
    const blocks: Array<{ text: string; owner: HTMLElement | null }> = [
      { text: articleTitle, owner: titleOwner },
      ...(articleSubtitle
        ? [{ text: articleSubtitle, owner: subtitleOwner ?? titleOwner }]
        : []),
    ];

    if (content) {
      const candidates = Array.from(
        content.querySelectorAll<HTMLElement>(
          "[data-read-aloud-block], [data-read-aloud-container] > span, [data-read-aloud-container] > h3",
        ),
      );
      for (const owner of candidates) {
        if (owner.closest("[data-read-aloud-exclude]")) {
          continue;
        }
        const parentBlock = owner.parentElement?.closest("[data-read-aloud-block]");
        if (parentBlock && content.contains(parentBlock)) {
          continue;
        }
        const text = toSpeechText(getElementText(owner, false));
        if (text) {
          blocks.push({ text, owner });
        }
      }
    }

    return blocks.flatMap(({ text, owner }) =>
      chunkText(text).map((chunk) => ({ text: chunk, owner })),
    );
  }

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
    setActiveReadAlongElement(null);
    setActiveChunkIndex(0);
    setChunkCount(0);
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
    chunks: SpeechChunk[],
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
    const blob = await (
      prefetchRef.current ?? fetchChunkBlob(chunks[index].text, signal)
    );
    prefetchRef.current =
      index + 1 < chunks.length
        ? fetchChunkBlob(chunks[index + 1].text, signal).catch(() => {
            // Prefetch failures resurface when the chunk is actually needed.
            prefetchRef.current = null;
            return fetchChunkBlob(chunks[index + 1].text, signal);
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
    setActiveReadAlongElement(chunks[index].owner);
    setActiveChunkIndex(index);

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

  function speakChunk(chunks: SpeechChunk[], index: number, session: number) {
    if (session !== sessionRef.current || stoppedRef.current) {
      return;
    }
    if (index >= chunks.length) {
      finishPlayback();
      return;
    }

    setActiveReadAlongElement(chunks[index].owner);
    setActiveChunkIndex(index);

    const utterance = new SpeechSynthesisUtterance(chunks[index].text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current.lang;
    }
    utterance.rate = playbackRateRef.current;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (session === sessionRef.current && !stoppedRef.current) {
        speakChunk(chunks, index + 1, session);
      }
    };
    utterance.onerror = () => {
      if (session === sessionRef.current && !stoppedRef.current) {
        finishPlayback();
        window.speechSynthesis.cancel();
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function startSystemFallback(chunks: SpeechChunk[], session: number) {
    if (session !== sessionRef.current || stoppedRef.current) {
      return;
    }
    if (!speechSupported) {
      finishPlayback();
      return;
    }
    engineRef.current = "system";
    setVoiceName(voiceRef.current?.name ?? "system default");
    window.speechSynthesis.cancel();
    setPlayState("playing");
    startKeepAlive();
    speakChunk(chunks, 0, session);
  }

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------

  function handlePlay() {
    const chunks = getSpeechChunks();
    if (chunks.length === 0) {
      return;
    }

    setChunkCount(chunks.length);
    setActiveChunkIndex(0);
    setActiveReadAlongElement(null);

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
        startSystemFallback(chunks, session);
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
    setActiveReadAlongElement(null);
    setActiveChunkIndex(0);
    setChunkCount(0);
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

  function fallbackCopy(articleText: string): boolean {
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
    const articleText = getRenderedArticleText(true);
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
        succeeded = fallbackCopy(articleText);
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
            "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[70] mx-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-border/80 bg-card/95 p-2.5 shadow-[0_16px_48px_hsl(var(--background)/0.45)] ring-1 ring-foreground/5 backdrop-blur-xl sm:left-1/2 sm:right-auto sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:rounded-xl sm:p-2",
        )}
      >
        {playState !== "idle" ? (
          <div className="w-full px-1 pb-0.5 sm:hidden" aria-hidden="true">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="shrink-0 text-accent">
                  {playState === "loading" ? "Preparing" : "Now reading"}
                </span>
                <span className="truncate font-medium text-muted-foreground">
                  {articleTitle}
                </span>
              </span>
              {chunkCount > 0 ? (
                <span className="text-[0.68rem] tabular-nums text-muted-foreground">
                  {Math.min(activeChunkIndex + 1, chunkCount)} / {chunkCount}
                </span>
              ) : null}
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-300"
                style={{
                  width: `${chunkCount > 0 ? ((activeChunkIndex + 1) / chunkCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ) : null}
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
          <>
            <div
              role="status"
              aria-label="Preparing audio"
              className={cn(
                toolButtonClass,
                primaryToolClass,
                "flex-1 rounded-xl opacity-70 sm:flex-none sm:rounded-md",
              )}
            >
              <Volume2 aria-hidden="true" className="h-4 w-4 animate-pulse" />
              Preparing…
            </div>
            <button
              type="button"
              onClick={handleStop}
              aria-label="Cancel audio preparation"
              className={cn(
                toolButtonClass,
                secondaryToolClass,
                "rounded-xl px-3 sm:rounded-md sm:px-4",
              )}
            >
              <Square aria-hidden="true" className="h-4 w-4" />
              Cancel
            </button>
          </>
        ) : null}
        {playState === "playing" ? (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause reading"
            className={cn(
              toolButtonClass,
              primaryToolClass,
              "flex-1 rounded-xl px-3 sm:flex-none sm:rounded-md sm:px-4",
            )}
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
            className={cn(
              toolButtonClass,
              primaryToolClass,
              "flex-1 rounded-xl px-3 sm:flex-none sm:rounded-md sm:px-4",
            )}
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
              className={cn(
                toolButtonClass,
                secondaryToolClass,
                "min-w-[4.5rem] rounded-xl px-3 tabular-nums sm:rounded-md sm:px-4",
              )}
            >
              {playbackRate}×
            </button>
            <button
              type="button"
              onClick={handleStop}
              aria-label="Stop reading"
              className={cn(
                toolButtonClass,
                secondaryToolClass,
                "flex-1 rounded-xl px-3 sm:flex-none sm:rounded-md sm:px-4",
              )}
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
