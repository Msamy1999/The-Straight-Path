"use client";

import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import type {
  ArticlePlaybackLink,
  ArticlePlaybackNavigation,
} from "@/types/domain";

export type SpeechChunk = {
  text: string;
  owner: HTMLElement | null;
};

export type ArticlePlaybackRegistration = ArticlePlaybackNavigation & {
  slug: string;
  title: string;
  subtitle?: string;
  href: string;
  getChunks: () => SpeechChunk[];
};

type PlayState = "idle" | "loading" | "playing" | "paused";

type ArticleAudioContextValue = {
  registerArticle: (registration: ArticlePlaybackRegistration) => () => void;
  startArticle: (registration: ArticlePlaybackRegistration) => void;
  activeSlug?: string;
  playState: PlayState;
};

type PersistedArticle = Omit<ArticlePlaybackRegistration, "getChunks">;

type PersistedPlayback = {
  article: PersistedArticle;
  chunkIndex: number;
  chunkFraction: number;
  playbackRate: number;
};

const MAX_RESTORE_AGE_MS = 7 * 24 * 60 * 60 * 1_000;
const STORAGE_KEY = "straight-path-article-playback-v1";
const KEEP_ALIVE_MS = 10_000;
const VOICE_RETRY_MS = 400;
const PREVIOUS_ARTICLE_WINDOW_MS = 4_000;
const NEURAL_VOICE = "en-US-GuyNeural";
const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const BASE_HIGHLIGHT_CLASSES = [
  "bg-accent/10",
  "outline",
  "outline-1",
  "outline-offset-1",
  "outline-accent/40",
  "rounded-sm",
  "transition-colors",
] as const;
const INLINE_HIGHLIGHT_CLASSES = [
  "box-decoration-clone",
  "px-1.5",
  "py-0.5",
] as const;

const toolButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40";
const primaryToolClass = "bg-accent text-accent-foreground hover:brightness-110";
const secondaryToolClass =
  "border border-border bg-card text-foreground hover:bg-muted";

const ArticleAudioContext = createContext<ArticleAudioContextValue | null>(null);

export function useArticleAudio(): ArticleAudioContextValue {
  const context = useContext(ArticleAudioContext);
  if (!context) {
    throw new Error("useArticleAudio must be used within ArticleAudioProvider");
  }
  return context;
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (name.includes("natural")) score += 100;
  if (name.includes("google")) score += 80;
  if (name.includes("online")) score += 60;
  if (!voice.localService) score += 40;
  if (name.includes("samantha") || name.includes("daniel")) score += 20;
  if (voice.default) score += 1;
  return score;
}

function pickBestEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  return (
    voices
      .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
      .sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] ?? null
  );
}

function articleWithoutChunks(
  article: ArticlePlaybackRegistration,
): PersistedArticle {
  return {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    href: article.href,
    previous: article.previous,
    next: article.next,
    playlist: article.playlist,
  };
}

function normalizedSpeech(text: string): string {
  return text
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function ArticleAudioProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentArticle, setCurrentArticle] =
    useState<PersistedArticle | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [backAtBeginning, setBackAtBeginning] = useState(false);
  const [activeReadAlongElement, setActiveReadAlongElement] =
    useState<HTMLElement | null>(null);

  const playStateRef = useRef<PlayState>("idle");
  const currentArticleRef = useRef<PersistedArticle | null>(null);
  const currentRegistrationRef = useRef<ArticlePlaybackRegistration | null>(null);
  const visibleRegistrationRef = useRef<ArticlePlaybackRegistration | null>(null);
  const currentChunksRef = useRef<SpeechChunk[]>([]);
  const currentChunkIndexRef = useRef(0);
  const chunkFractionRef = useRef(0);
  const articleHasStartedRef = useRef(false);
  const stoppedRef = useRef(true);
  const sessionRef = useRef(0);
  const keepAliveRef = useRef<number | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const engineRef = useRef<"neural" | "system">("neural");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<Promise<Blob> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playbackRateRef = useRef(1);
  const activeReadAlongElementRef = useRef<HTMLElement | null>(null);
  const activeHighlightClassesRef = useRef<readonly string[]>([]);
  const manualScrollUntilRef = useRef(0);
  const pendingSeekFractionRef = useRef(0);
  const restoredPlaybackRef = useRef<PersistedPlayback | null>(null);
  const pendingNavigationRef = useRef<{
    link: ArticlePlaybackLink;
    autoPlay: boolean;
  } | null>(null);
  const pendingNavigationTimeoutRef = useRef<number | null>(null);
  const systemStartedTimerRef = useRef<number | null>(null);
  const persistThrottleRef = useRef(0);
  const preloadTimerRef = useRef<number | null>(null);
  const prefetchedArticleHrefsRef = useRef(new Set<string>());
  const backAtBeginningRef = useRef(false);
  const backAtBeginningTimerRef = useRef<number | null>(null);

  const registerImplementationRef = useRef<
    (registration: ArticlePlaybackRegistration) => () => void
  >(() => () => {});
  const startImplementationRef = useRef<
    (registration: ArticlePlaybackRegistration) => void
  >(() => {});
  const playActionRef = useRef(() => {});
  const pauseActionRef = useRef(() => {});
  const previousActionRef = useRef(() => {});
  const nextActionRef = useRef(() => {});
  const stopActionRef = useRef(() => {});

  const registerArticle = useCallback(
    (registration: ArticlePlaybackRegistration) =>
      registerImplementationRef.current(registration),
    [],
  );
  const startArticle = useCallback(
    (registration: ArticlePlaybackRegistration) =>
      startImplementationRef.current(registration),
    [],
  );

  function updatePlayState(nextState: PlayState) {
    playStateRef.current = nextState;
    setPlayState(nextState);
  }

  function updateCurrentArticle(article: PersistedArticle | null) {
    currentArticleRef.current = article;
    setCurrentArticle(article);
  }

  function updateChunkIndex(index: number) {
    currentChunkIndexRef.current = index;
    setActiveChunkIndex(index);
  }

  function clearKeepAlive() {
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }

  function clearNavigationTimeout() {
    if (pendingNavigationTimeoutRef.current !== null) {
      window.clearTimeout(pendingNavigationTimeoutRef.current);
      pendingNavigationTimeoutRef.current = null;
    }
  }

  function clearSystemStartedTimer() {
    if (systemStartedTimerRef.current !== null) {
      window.clearTimeout(systemStartedTimerRef.current);
      systemStartedTimerRef.current = null;
    }
  }

  function clearPreloadSequence() {
    if (preloadTimerRef.current !== null) {
      window.clearTimeout(preloadTimerRef.current);
      preloadTimerRef.current = null;
    }
  }

  function clearBackAtBeginning() {
    if (backAtBeginningTimerRef.current !== null) {
      window.clearTimeout(backAtBeginningTimerRef.current);
      backAtBeginningTimerRef.current = null;
    }
    backAtBeginningRef.current = false;
    setBackAtBeginning(false);
  }

  function openPreviousArticleWindow() {
    clearBackAtBeginning();
    backAtBeginningRef.current = true;
    setBackAtBeginning(true);
    backAtBeginningTimerRef.current = window.setTimeout(() => {
      backAtBeginningRef.current = false;
      setBackAtBeginning(false);
      backAtBeginningTimerRef.current = null;
    }, PREVIOUS_ARTICLE_WINDOW_MS);
  }

  function preloadArticleSequence(article: PersistedArticle) {
    clearPreloadSequence();
    const playlist = article.playlist ?? [];
    const currentIndex = playlist.findIndex((item) => item.slug === article.slug);
    if (currentIndex < 0 || currentIndex + 1 >= playlist.length) return;
    let index = currentIndex + 1;

    const preloadNext = () => {
      if (index >= playlist.length || playStateRef.current === "idle") {
        preloadTimerRef.current = null;
        return;
      }
      const link = playlist[index];
      index += 1;
      if (!prefetchedArticleHrefsRef.current.has(link.href)) {
        prefetchedArticleHrefsRef.current.add(link.href);
        router.prefetch(link.href);
      }
      // Queue routes progressively instead of firing a large burst on mobile.
      // The immediate next route is already prefetched synchronously below.
      preloadTimerRef.current = window.setTimeout(preloadNext, 180);
    };

    preloadTimerRef.current = window.setTimeout(preloadNext, 80);
  }

  function startKeepAlive() {
    clearKeepAlive();
    keepAliveRef.current = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, KEEP_ALIVE_MS);
  }

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.setAttribute("playsinline", "true");
      audioRef.current = audio;
    }
    return audioRef.current;
  }

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function cancelTransport() {
    sessionRef.current += 1;
    stoppedRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    prefetchRef.current = null;
    clearKeepAlive();
    clearSystemStartedTimer();
    clearPreloadSequence();
    clearBackAtBeginning();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
      audio.onloadedmetadata = null;
      audio.removeAttribute("src");
      audio.load();
    }
    releaseObjectUrl();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveReadAlongElement(null);
  }

  function clearPersistedPlayback() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage is optional (private browsing can disable it).
    }
  }

  function persistPlayback(force = false) {
    const article = currentArticleRef.current;
    if (!article || playStateRef.current === "idle") return;
    const now = Date.now();
    if (!force && now - persistThrottleRef.current < 1_000) return;
    persistThrottleRef.current = now;
    const payload = {
      savedAt: now,
      article,
      chunkIndex: currentChunkIndexRef.current,
      chunkFraction: chunkFractionRef.current,
      playbackRate: playbackRateRef.current,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Playback still works when persistence is unavailable.
    }
  }

  function finishIdle(clearSavedState = true) {
    cancelTransport();
    pendingNavigationRef.current = null;
    clearNavigationTimeout();
    currentChunksRef.current = [];
    currentRegistrationRef.current = null;
    chunkFractionRef.current = 0;
    articleHasStartedRef.current = false;
    updateChunkIndex(0);
    setChunkCount(0);
    setProgress(0);
    updatePlayState("idle");
    updateCurrentArticle(null);
    if (clearSavedState) clearPersistedPlayback();
  }

  function fetchChunkBlob(chunk: string, signal: AbortSignal): Promise<Blob> {
    return fetch(
      `/api/tts?text=${encodeURIComponent(chunk)}&voice=${NEURAL_VOICE}`,
      { signal },
    ).then((response) => {
      if (!response.ok) throw new Error(`TTS ${response.status}`);
      return response.blob();
    });
  }

  function updateProgress(index: number, fraction: number) {
    const count = currentChunksRef.current.length;
    const safeFraction = Math.max(0, Math.min(1, fraction));
    chunkFractionRef.current = safeFraction;
    const nextProgress = count > 0 ? ((index + safeFraction) / count) * 100 : 0;
    setProgress(Math.max(0, Math.min(100, nextProgress)));
    if (index > 0 || safeFraction > 0.08) {
      articleHasStartedRef.current = true;
    }
    persistPlayback();

    if ("mediaSession" in navigator && count > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: count,
          playbackRate: playbackRateRef.current,
          position: Math.min(count - 0.001, index + safeFraction),
        });
      } catch {
        // Some Safari versions expose Media Session without position state.
      }
    }
  }

  async function playNeuralChunk(
    chunks: SpeechChunk[],
    index: number,
    session: number,
  ): Promise<void> {
    if (session !== sessionRef.current || stoppedRef.current) return;
    if (index >= chunks.length) {
      finishArticle(session);
      return;
    }

    const signal = abortRef.current?.signal as AbortSignal;
    const blob = await (
      prefetchRef.current ?? fetchChunkBlob(chunks[index].text, signal)
    );
    prefetchRef.current =
      index + 1 < chunks.length
        ? fetchChunkBlob(chunks[index + 1].text, signal).catch(() => {
            prefetchRef.current = null;
            return fetchChunkBlob(chunks[index + 1].text, signal);
          })
        : null;

    if (session !== sessionRef.current || stoppedRef.current) return;

    const audio = getAudio();
    releaseObjectUrl();
    objectUrlRef.current = URL.createObjectURL(blob);
    audio.src = objectUrlRef.current;
    audio.playbackRate = playbackRateRef.current;
    updateChunkIndex(index);
    setActiveReadAlongElement(chunks[index].owner);
    updateProgress(index, 0);

    audio.onloadedmetadata = () => {
      if (session !== sessionRef.current || !Number.isFinite(audio.duration)) return;
      const fraction = pendingSeekFractionRef.current;
      pendingSeekFractionRef.current = 0;
      if (fraction > 0) {
        audio.currentTime = Math.min(audio.duration * fraction, audio.duration - 0.05);
      }
    };
    audio.ontimeupdate = () => {
      const fraction =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.currentTime / audio.duration
          : 0;
      updateProgress(index, fraction);
    };
    audio.onended = () => {
      void playNeuralChunk(chunks, index + 1, session).catch(() => {
        if (session === sessionRef.current) finishIdle(false);
      });
    };
    audio.onerror = () => {
      if (session === sessionRef.current) finishIdle(false);
    };

    await audio.play();
    if (session === sessionRef.current && !stoppedRef.current) {
      updatePlayState("playing");
    }
  }

  function speakSystemChunk(
    chunks: SpeechChunk[],
    index: number,
    session: number,
  ) {
    if (session !== sessionRef.current || stoppedRef.current) return;
    if (index >= chunks.length) {
      finishArticle(session);
      return;
    }

    updateChunkIndex(index);
    setActiveReadAlongElement(chunks[index].owner);
    updateProgress(index, 0);
    clearSystemStartedTimer();
    systemStartedTimerRef.current = window.setTimeout(() => {
      if (session === sessionRef.current) articleHasStartedRef.current = true;
    }, 2_000);

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
        speakSystemChunk(chunks, index + 1, session);
      }
    };
    utterance.onerror = () => {
      if (session === sessionRef.current && !stoppedRef.current) finishIdle(false);
    };
    window.speechSynthesis.speak(utterance);
  }

  function startSystemFallback(
    chunks: SpeechChunk[],
    index: number,
    session: number,
  ) {
    if (!("speechSynthesis" in window)) {
      finishIdle(false);
      return;
    }
    engineRef.current = "system";
    updatePlayState("playing");
    window.speechSynthesis.cancel();
    startKeepAlive();
    speakSystemChunk(chunks, index, session);
  }

  function beginPlayback(
    registration: ArticlePlaybackRegistration,
    chunks: SpeechChunk[],
    options: { index?: number; fraction?: number; unlock?: boolean } = {},
  ) {
    if (chunks.length === 0) {
      finishIdle(false);
      return;
    }
    const index = Math.max(0, Math.min(options.index ?? 0, chunks.length - 1));
    cancelTransport();
    currentRegistrationRef.current = registration;
    currentChunksRef.current = chunks;
    updateCurrentArticle(articleWithoutChunks(registration));
    setChunkCount(chunks.length);
    updateChunkIndex(index);
    setProgress((index / chunks.length) * 100);
    chunkFractionRef.current = options.fraction ?? 0;
    pendingSeekFractionRef.current = options.fraction ?? 0;
    articleHasStartedRef.current = index > 0 || (options.fraction ?? 0) > 0.08;
    stoppedRef.current = false;
    abortRef.current = new AbortController();
    prefetchRef.current = null;
    engineRef.current = "neural";
    updatePlayState("loading");

    if (registration.next) router.prefetch(registration.next.href);
    if (registration.previous) router.prefetch(registration.previous.href);
    preloadArticleSequence(articleWithoutChunks(registration));

    const session = sessionRef.current;
    if (options.unlock) {
      const audio = getAudio();
      audio.src = SILENT_WAV;
      void audio.play().catch(() => {});
    }
    void playNeuralChunk(chunks, index, session).catch(() => {
      if (session === sessionRef.current && !stoppedRef.current) {
        startSystemFallback(chunks, index, session);
      }
    });
    persistPlayback(true);
  }

  function navigateToArticle(link: ArticlePlaybackLink, autoPlay: boolean) {
    cancelTransport();
    clearNavigationTimeout();
    pendingNavigationRef.current = { link, autoPlay };
    currentChunksRef.current = [];
    currentRegistrationRef.current = null;
    updateCurrentArticle({ slug: link.slug, title: link.title, href: link.href });
    updateChunkIndex(0);
    setChunkCount(0);
    setProgress(0);
    chunkFractionRef.current = 0;
    articleHasStartedRef.current = false;
    updatePlayState(autoPlay ? "loading" : "paused");
    router.prefetch(link.href);
    router.push(link.href);
    pendingNavigationTimeoutRef.current = window.setTimeout(() => {
      if (pendingNavigationRef.current?.link.slug === link.slug) {
        pendingNavigationRef.current = null;
        finishIdle(false);
      }
    }, 20_000);
  }

  function finishArticle(session: number) {
    if (session !== sessionRef.current) return;
    const next = currentArticleRef.current?.next;
    if (next) {
      navigateToArticle(next, true);
      return;
    }
    finishIdle(false);
  }

  function handlePause() {
    if (playStateRef.current !== "playing") return;
    if (engineRef.current === "neural") {
      audioRef.current?.pause();
    } else {
      clearKeepAlive();
      window.speechSynthesis.pause();
    }
    updatePlayState("paused");
    persistPlayback(true);
  }

  function handleResume() {
    if (playStateRef.current !== "paused") return;
    const audio = audioRef.current;
    if (engineRef.current === "neural" && audio?.src) {
      void audio.play();
      updatePlayState("playing");
      return;
    }
    if (engineRef.current === "system" && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      startKeepAlive();
      updatePlayState("playing");
      return;
    }
    const registration = currentRegistrationRef.current;
    if (registration && currentChunksRef.current.length > 0) {
      beginPlayback(registration, currentChunksRef.current, {
        index: currentChunkIndexRef.current,
        fraction: chunkFractionRef.current,
        unlock: true,
      });
      return;
    }
    const article = currentArticleRef.current;
    if (article) navigateToArticle(article, true);
  }

  function handlePrevious() {
    const registration = currentRegistrationRef.current;
    const chunks = currentChunksRef.current;
    const previous = currentArticleRef.current?.previous;
    if (backAtBeginningRef.current) {
      if (previous) navigateToArticle(previous, true);
      return;
    }
    if (
      registration &&
      chunks.length > 0 &&
      (articleHasStartedRef.current || currentChunkIndexRef.current > 0)
    ) {
      beginPlayback(registration, chunks, { index: 0, unlock: true });
      openPreviousArticleWindow();
      return;
    }
    if (previous) navigateToArticle(previous, true);
  }

  function handleNext() {
    const next = currentArticleRef.current?.next;
    if (next) navigateToArticle(next, true);
  }

  function handleStop() {
    finishIdle(true);
  }

  function handlePlaybackRate() {
    const currentIndex = PLAYBACK_RATES.indexOf(
      playbackRateRef.current as (typeof PLAYBACK_RATES)[number],
    );
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    playbackRateRef.current = nextRate;
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    persistPlayback(true);
    updateProgress(currentChunkIndexRef.current, chunkFractionRef.current);
  }

  registerImplementationRef.current = (registration) => {
    visibleRegistrationRef.current = registration;
    const pending = pendingNavigationRef.current;
    if (pending?.link.slug === registration.slug) {
      pendingNavigationRef.current = null;
      clearNavigationTimeout();
      if (pending.autoPlay) {
        beginPlayback(registration, registration.getChunks());
      } else {
        currentRegistrationRef.current = registration;
        currentChunksRef.current = registration.getChunks();
        updateCurrentArticle(articleWithoutChunks(registration));
      }
    } else if (currentArticleRef.current?.slug === registration.slug) {
      const localChunks = registration.getChunks();
      currentRegistrationRef.current = registration;
      updateCurrentArticle(articleWithoutChunks(registration));

      const restored = restoredPlaybackRef.current;
      if (restored?.article.slug === registration.slug && playStateRef.current === "paused") {
        restoredPlaybackRef.current = null;
        currentChunksRef.current = localChunks;
        const index = Math.min(restored.chunkIndex, Math.max(0, localChunks.length - 1));
        updateChunkIndex(index);
        setChunkCount(localChunks.length);
        chunkFractionRef.current = restored.chunkFraction;
        setProgress(
          localChunks.length > 0
            ? ((index + restored.chunkFraction) / localChunks.length) * 100
            : 0,
        );
        setActiveReadAlongElement(localChunks[index]?.owner ?? null);
      } else if (currentChunksRef.current.length > 0) {
        const activeText = normalizedSpeech(
          currentChunksRef.current[currentChunkIndexRef.current]?.text ?? "",
        );
        const localIndex = localChunks.findIndex(
          (chunk) => normalizedSpeech(chunk.text) === activeText,
        );
        if (localIndex >= 0) {
          currentChunksRef.current = localChunks;
          updateChunkIndex(localIndex);
          setChunkCount(localChunks.length);
          setActiveReadAlongElement(localChunks[localIndex].owner);
        }
      } else {
        currentChunksRef.current = localChunks;
      }
    }

    return () => {
      if (visibleRegistrationRef.current === registration) {
        visibleRegistrationRef.current = null;
      }
    };
  };

  startImplementationRef.current = (registration) => {
    visibleRegistrationRef.current = registration;
    beginPlayback(registration, registration.getChunks(), { unlock: true });
  };

  playActionRef.current = handleResume;
  pauseActionRef.current = handlePause;
  previousActionRef.current = handlePrevious;
  nextActionRef.current = handleNext;
  stopActionRef.current = handleStop;

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      voiceRef.current = pickBestEnglishVoice(window.speechSynthesis.getVoices());
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    const timeout = window.setTimeout(pickVoice, VOICE_RETRY_MS);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedPlayback & { savedAt?: number };
      if (
        !parsed.article?.slug ||
        !parsed.article?.href ||
        !parsed.savedAt ||
        Date.now() - parsed.savedAt > MAX_RESTORE_AGE_MS
      ) {
        clearPersistedPlayback();
        return;
      }
      restoredPlaybackRef.current = parsed;
      playbackRateRef.current = PLAYBACK_RATES.includes(
        parsed.playbackRate as (typeof PLAYBACK_RATES)[number],
      )
        ? parsed.playbackRate
        : 1;
      setPlaybackRate(playbackRateRef.current);
      updateCurrentArticle(parsed.article);
      updateChunkIndex(parsed.chunkIndex ?? 0);
      chunkFractionRef.current = parsed.chunkFraction ?? 0;
      setProgress(0);
      updatePlayState("paused");
    } catch {
      clearPersistedPlayback();
    }
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const handlers: Array<[MediaSessionAction, () => void]> = [
      ["play", () => playActionRef.current()],
      ["pause", () => pauseActionRef.current()],
      ["previoustrack", () => previousActionRef.current()],
      ["nexttrack", () => nextActionRef.current()],
      ["stop", () => stopActionRef.current()],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Ignore actions unsupported by a specific browser version.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore unsupported action cleanup.
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      playState === "playing"
        ? "playing"
        : playState === "paused"
          ? "paused"
          : "none";
    if (currentArticle && "MediaMetadata" in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentArticle.title,
        artist: "The Straight Path",
        album: "Article reading",
        artwork: [
          { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
          { src: "/og-image.png", sizes: "1200x630", type: "image/png" },
        ],
      });
    }
  }, [currentArticle, playState]);

  useEffect(() => {
    const persist = () => persistPlayback(true);
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, []);

  useEffect(() => {
    const clearHighlight = () => {
      const element = activeReadAlongElementRef.current;
      if (!element) return;
      element.classList.remove(...activeHighlightClassesRef.current);
      element.removeAttribute("data-read-aloud-active");
      activeReadAlongElementRef.current = null;
      activeHighlightClassesRef.current = [];
    };
    clearHighlight();
    if (!activeReadAlongElement || playState === "idle") return;

    const target = activeReadAlongElement;
    const collapsedParent = target.closest("details");
    if (collapsedParent && !collapsedParent.open) collapsedParent.open = true;
    const highlightClasses = [
      ...BASE_HIGHLIGHT_CLASSES,
      ...(target.tagName === "SPAN" ? INLINE_HIGHLIGHT_CLASSES : []),
    ];
    target.classList.add(...highlightClasses);
    target.setAttribute("data-read-aloud-active", "true");
    activeReadAlongElementRef.current = target;
    activeHighlightClassesRef.current = highlightClasses;

    window.requestAnimationFrame(() => {
      if (Date.now() < manualScrollUntilRef.current || !target.isConnected) return;
      const rect = target.getBoundingClientRect();
      const safeTop = 88;
      const safeBottom = window.innerHeight - 165;
      if (rect.top >= safeTop && rect.bottom <= safeBottom) return;
      target.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return clearHighlight;
  }, [activeReadAlongElement, playState]);

  useEffect(() => {
    if (playState === "idle") return;
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
    if (playState === "idle") return;
    const previousPadding = document.body.style.paddingBottom;
    document.body.style.paddingBottom =
      "calc(8.5rem + env(safe-area-inset-bottom))";
    return () => {
      document.body.style.paddingBottom = previousPadding;
    };
  }, [playState]);

  useEffect(() => {
    return () => {
      cancelTransport();
      clearNavigationTimeout();
      clearPreloadSequence();
    };
    // The provider owns one persistent transport for its entire mounted life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo<ArticleAudioContextValue>(
    () => ({
      registerArticle,
      startArticle,
      activeSlug: currentArticle?.slug,
      playState,
    }),
    [currentArticle?.slug, playState, registerArticle, startArticle],
  );

  const atBeginning =
    backAtBeginning ||
    (!articleHasStartedRef.current && activeChunkIndex === 0 && progress < 2);

  return (
    <ArticleAudioContext.Provider value={contextValue}>
      {children}
      {playState !== "idle" && currentArticle ? (
        <div
          role="group"
          aria-label={`Audio controls for ${currentArticle.title}`}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[70] mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-2xl border border-border/80 bg-card/95 p-2.5 shadow-[0_16px_48px_hsl(var(--background)/0.45)] ring-1 ring-foreground/5 backdrop-blur-xl sm:left-1/2 sm:right-auto sm:w-[min(38rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:p-3"
        >
          <div className="px-1 pb-1" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
                <span className="shrink-0 text-accent">
                  {playState === "loading" ? "Preparing" : "Now reading"}
                </span>
                <span className="truncate font-medium text-muted-foreground">
                  {currentArticle.title}
                </span>
              </span>
              {chunkCount > 0 ? (
                <span className="shrink-0 text-[0.68rem] tabular-nums text-muted-foreground sm:text-xs">
                  {Math.min(activeChunkIndex + 1, chunkCount)} / {chunkCount}
                </span>
              ) : null}
            </div>
            <div
              role="progressbar"
              aria-label={`Playback progress for ${currentArticle.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-1.5 flex w-full items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={atBeginning && !currentArticle.previous}
              aria-label={
                atBeginning
                  ? `Previous article${currentArticle.previous ? `: ${currentArticle.previous.title}` : ""}`
                  : "Restart current article"
              }
              title={atBeginning ? "Previous article" : "Restart article"}
              className={cn(toolButtonClass, secondaryToolClass, "min-w-11 px-3")}
            >
              {atBeginning ? (
                <SkipBack aria-hidden="true" className="h-4 w-4" />
              ) : (
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              )}
              <span className="hidden md:inline">
                {atBeginning ? "Back" : "Restart"}
              </span>
            </button>

            {playState === "loading" ? (
              <div
                role="status"
                className={cn(
                  toolButtonClass,
                  primaryToolClass,
                  "min-w-0 flex-1 opacity-70",
                )}
              >
                <Volume2 aria-hidden="true" className="h-4 w-4 animate-pulse" />
                <span className="truncate">Preparing…</span>
              </div>
            ) : playState === "playing" ? (
              <button
                type="button"
                onClick={handlePause}
                aria-label="Pause reading"
                className={cn(toolButtonClass, primaryToolClass, "min-w-0 flex-1")}
              >
                <Pause aria-hidden="true" className="h-4 w-4" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                aria-label="Resume reading"
                className={cn(toolButtonClass, primaryToolClass, "min-w-0 flex-1")}
              >
                <Play aria-hidden="true" className="h-4 w-4" />
                Resume
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!currentArticle.next}
              aria-label={`Next article${currentArticle.next ? `: ${currentArticle.next.title}` : ""}`}
              title="Next article"
              className={cn(toolButtonClass, secondaryToolClass, "min-w-11 px-3")}
            >
              <SkipForward aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">Next</span>
            </button>

            <button
              type="button"
              onClick={handlePlaybackRate}
              aria-label={`Playback speed ${playbackRate} times. Press to increase speed.`}
              className={cn(
                toolButtonClass,
                secondaryToolClass,
                "min-w-[3.75rem] px-2.5 tabular-nums sm:min-w-[4.25rem]",
              )}
            >
              {playbackRate}×
            </button>

            <button
              type="button"
              onClick={handleStop}
              aria-label={playState === "loading" ? "Cancel audio preparation" : "Stop reading"}
              title="Stop reading"
              className={cn(toolButtonClass, secondaryToolClass, "min-w-11 px-3")}
            >
              <Square aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">Stop</span>
            </button>
          </div>
        </div>
      ) : null}
    </ArticleAudioContext.Provider>
  );
}
