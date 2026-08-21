/**
 * Client-side translation engine for the Arabic/English site toggle.
 *
 * The site ships in English and renders Arabic through the on-demand Google
 * Translate element. That widget rewrites text nodes underneath React, so this
 * module owns three responsibilities that used to be scattered through the
 * toggle component:
 *
 *   1. Loading the widget as late as possible, but as early as intent appears.
 *   2. Keeping React alive once the widget has rewritten the DOM.
 *   3. Reporting honest progress with hard deadlines, so the UI can never hang.
 *
 * Nothing here depends on `requestAnimationFrame`: a backgrounded tab (phone
 * locked mid-switch) must still finish the flow rather than freeze behind the
 * loading overlay.
 */

export type SupportedLanguage = "en" | "ar";

export type TranslationStage = "connecting" | "translating" | "finishing";

export const LANGUAGE_STORAGE_KEY = "the-straight-path-language";
export const LANGUAGE_EVENT = "the-straight-path-language-change";

const GOOGLE_TARGET_ID = "the-straight-path-google-translate";
const GOOGLE_SCRIPT_SRC =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

/** Origins the widget fans out to; warmed up before the request is made. */
const TRANSLATE_ORIGINS = [
  "https://translate.google.com",
  "https://translate.googleapis.com",
  "https://www.gstatic.com",
  "https://fonts.gstatic.com",
];

/** Wall-clock budgets. Every await below is bounded by one of these. */
const SCRIPT_TIMEOUT_MS = 8_000;
const CONTROL_TIMEOUT_MS = 6_000;
const CONTROL_POLL_MS = 40;
const APPLIED_TIMEOUT_MS = 5_000;
const SETTLE_QUIET_MS = 140;
const SETTLE_TIMEOUT_MS = 1_500;

type GoogleTranslateApi = {
  translate?: {
    TranslateElement: new (
      options: {
        autoDisplay: boolean;
        includedLanguages: string;
        pageLanguage: string;
      },
      elementId: string,
    ) => unknown;
  };
};

declare global {
  interface Window {
    google?: GoogleTranslateApi;
    googleTranslateElementInit?: () => void;
    /** Set once the React/DOM compatibility guards are installed. */
    __straightPathTranslationGuard?: boolean;
  }
}

let translateLoader: Promise<void> | null = null;
let warmed = false;

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

function readCookieLanguage(): SupportedLanguage | null {
  if (document.cookie.includes("googtrans=/en/ar")) return "ar";
  if (document.cookie.includes("googtrans=/en/en")) return "en";
  return null;
}

export function readSavedLanguage(): SupportedLanguage {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "en";
  }

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "ar" || saved === "en") {
      return saved;
    }
  } catch {
    // Private browsing modes can throw on access; fall through to the cookie.
  }

  return readCookieLanguage() ?? "en";
}

/**
 * Writes both stores so the widget and this app never disagree. A stale
 * `googtrans` cookie left behind by an interrupted switch would otherwise make
 * Google auto-translate a page whose toggle still reads "English".
 */
export function persistLanguage(language: SupportedLanguage) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage is best-effort; the cookie below is what the widget reads.
  }
  const target = language === "ar" ? "/en/ar" : "/en/en";
  document.cookie = `googtrans=${target}; path=/; max-age=31536000; SameSite=Lax`;
}

export function setDocumentLanguage(language: SupportedLanguage) {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";
  root.dataset.language = language;
}

export function broadcastLanguage(language: SupportedLanguage) {
  window.dispatchEvent(new CustomEvent<SupportedLanguage>(LANGUAGE_EVENT, { detail: language }));
}

/* -------------------------------------------------------------------------- */
/* React compatibility                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Google Translate swaps React-owned text nodes for its own `<font>` wrappers.
 * The next React commit then tries to remove or insert against nodes that have
 * been re-parented and throws `NotFoundError`, which takes the whole client
 * tree down: the navigation menu stops opening and no further page reacts to
 * clicks. Making the two DOM methods tolerant of a foreign parent keeps React
 * running; the worst case is a dropped update inside translated text, which the
 * widget re-translates anyway.
 */
export function guardReactAgainstTranslation() {
  if (typeof Node !== "function" || !Node.prototype) return;
  if (window.__straightPathTranslationGuard) return;
  window.__straightPathTranslationGuard = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    child: Node | null,
  ): T {
    if (child && child.parentNode !== this) {
      return node;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function ensureResourceHints() {
  for (const origin of TRANSLATE_ORIGINS) {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "";
    document.head.appendChild(link);
  }
}

function ensureGoogleTranslateTarget() {
  if (document.getElementById(GOOGLE_TARGET_ID)) return;
  const target = document.createElement("div");
  target.id = GOOGLE_TARGET_ID;
  target.className = "sr-only";
  target.setAttribute("aria-hidden", "true");
  target.setAttribute("translate", "no");
  document.body.appendChild(target);
}

function loadGoogleTranslate(): Promise<void> {
  if (window.google?.translate?.TranslateElement) {
    return Promise.resolve();
  }
  if (translateLoader) {
    return translateLoader;
  }

  ensureResourceHints();
  ensureGoogleTranslateTarget();

  translateLoader = new Promise<void>((resolve, reject) => {
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      translateLoader = null;
      reject(error);
    };
    const succeed = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };

    const timer = window.setTimeout(
      () => fail(new Error("Translation service timed out")),
      SCRIPT_TIMEOUT_MS,
    );

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { autoDisplay: false, includedLanguages: "ar,en", pageLanguage: "en" },
            GOOGLE_TARGET_ID,
          );
        }
        succeed();
      } catch (error) {
        fail(error instanceof Error ? error : new Error("Translation could not be started"));
      }
    };

    // A warm-up may have injected the tag already; the callback above replaces
    // whatever the earlier attempt registered, so it still resolves this promise.
    if (document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.onerror = () => fail(new Error("Translation could not be loaded"));
    document.head.appendChild(script);
  });

  return translateLoader;
}

/**
 * Opens the connections and downloads the widget ahead of the click.
 *
 * The widget costs a few hundred kilobytes, so it must never load for the
 * majority of readers who stay in English. Call this on the first genuine
 * signal of intent — the language button gaining hover/focus, or the mobile
 * menu that contains it opening — and the network cost is already paid by the
 * time the button is actually pressed.
 */
export function warmUpTranslation() {
  if (typeof window === "undefined" || warmed) return;
  warmed = true;
  ensureResourceHints();
  void loadGoogleTranslate().catch(() => {
    // A failed warm-up is silent; the click path reports errors itself.
  });
}

/* -------------------------------------------------------------------------- */
/* Applying a language                                                         */
/* -------------------------------------------------------------------------- */

function selectGoogleLanguage(language: SupportedLanguage) {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select) return false;
  const option = Array.from(select.options).find((item) => item.value === language);
  if (!option) return false;

  if (select.value === language && isTranslated(language)) {
    return true;
  }

  select.value = language;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/**
 * True once the requested language is actually on screen.
 *
 * Two markers are needed, because they land ~400ms apart. The widget sets
 * `translated-rtl` on `<html>` as soon as it accepts the request, but the text
 * itself only changes when it wraps each rewritten phrase in a `<font>` tag.
 * Watching the class alone dismissed the overlay over an English page.
 */
function isTranslated(language: SupportedLanguage) {
  const classList = document.documentElement.classList;

  if (language === "ar") {
    // Both markers, ~400ms apart: the class means "request accepted", the
    // `<font>` wrappers mean the words on screen have actually changed.
    return classList.contains("translated-rtl") && document.body.querySelector("font") !== null;
  }

  // Going back only needs the right-to-left marker to be gone. The widget keeps
  // a `translated-ltr` class and a handful of stray `<font>` wrappers behind
  // even when every visible string has reverted, so neither can be a condition.
  return !classList.contains("translated-rtl");
}

/**
 * Resolves when `isTranslated` turns true, or when the budget runs out.
 *
 * Polling is nudged by a `MutationObserver` so the common case resolves within
 * one frame of the text appearing, without a busy loop.
 */
function waitForTranslationApplied(language: SupportedLanguage) {
  return new Promise<void>((resolve) => {
    if (isTranslated(language)) {
      resolve();
      return;
    }

    const deadline = Date.now() + APPLIED_TIMEOUT_MS;
    let timer = 0;
    let finished = false;

    const observer = new MutationObserver(() => schedule());

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      observer.disconnect();
      resolve();
    };

    const attempt = () => {
      timer = 0;
      if (finished) return;
      if (isTranslated(language) || Date.now() >= deadline) {
        finish();
      } else {
        schedule();
      }
    };

    const schedule = () => {
      if (finished || timer) return;
      timer = window.setTimeout(attempt, CONTROL_POLL_MS);
    };

    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
  });
}

/**
 * Waits for the widget's language control to exist, then drives it.
 *
 * The control is injected asynchronously, so it has to be polled. The previous
 * implementation restarted its own timer from inside a `MutationObserver`
 * callback, which spawned a fresh polling chain for every DOM mutation the
 * widget made — hundreds of overlapping chains that burned through a fixed
 * attempt budget in a few hundred milliseconds and then gave up, forcing a full
 * page reload. Here the observer only nudges a single pending timer, and the
 * budget is wall-clock rather than attempt-count.
 */
function driveLanguageControl(language: SupportedLanguage) {
  return new Promise<boolean>((resolve) => {
    const deadline = Date.now() + CONTROL_TIMEOUT_MS;
    let timer = 0;
    let finished = false;

    const observer = new MutationObserver(() => schedule());

    const finish = (applied: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      observer.disconnect();
      resolve(applied);
    };

    const attempt = () => {
      timer = 0;
      if (finished) return;
      if (selectGoogleLanguage(language)) {
        finish(true);
      } else if (Date.now() >= deadline) {
        finish(false);
      } else {
        schedule();
      }
    };

    const schedule = () => {
      if (finished || timer) return;
      timer = window.setTimeout(attempt, CONTROL_POLL_MS);
    };

    observer.observe(document.body, { childList: true, subtree: true });
    attempt();
  });
}

/**
 * Resolves once the page stops changing, or once the deadline passes.
 *
 * Paired with `waitForTranslationApplied`, this replaces a flat 450ms pause
 * that was simultaneously too long for a warm switch and too short for a cold
 * one. Together they track the work instead of guessing at it.
 */
function waitForTranslationToSettle() {
  return new Promise<void>((resolve) => {
    let quietTimer = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(quietTimer);
      window.clearTimeout(hardStop);
      observer.disconnect();
      resolve();
    };

    const hardStop = window.setTimeout(finish, SETTLE_TIMEOUT_MS);
    const observer = new MutationObserver(() => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(finish, SETTLE_QUIET_MS);
    });

    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    quietTimer = window.setTimeout(finish, SETTLE_QUIET_MS);
  });
}

function hideGoogleChrome() {
  document
    .querySelectorAll<HTMLElement>("iframe.skiptranslate, .goog-te-banner-frame, body > .skiptranslate")
    .forEach((element) => {
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("visibility", "hidden", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });
  document.body.style.setProperty("top", "0", "important");
}

/** Keeps the Uthmani Quran text out of machine translation. */
export function protectOriginalScripture() {
  document.querySelectorAll<HTMLElement>("[data-quran-original]").forEach((element) => {
    element.classList.add("notranslate");
    element.setAttribute("translate", "no");
  });
}

type ApplyLanguageOptions = {
  onStage?: (stage: TranslationStage) => void;
};

/**
 * Switches the page to `language`, reporting progress along the way.
 *
 * Resolves `false` when the widget never became drivable, which is the caller's
 * cue to fall back to a cookie-driven reload.
 */
async function applyLanguage(
  language: SupportedLanguage,
  { onStage }: ApplyLanguageOptions = {},
): Promise<boolean> {
  guardReactAgainstTranslation();
  protectOriginalScripture();

  onStage?.("connecting");
  await loadGoogleTranslate();

  onStage?.("translating");
  const applied = await driveLanguageControl(language);
  hideGoogleChrome();
  if (!applied) {
    return false;
  }

  onStage?.("finishing");
  await waitForTranslationApplied(language);
  await waitForTranslationToSettle();
  hideGoogleChrome();
  return true;
}

/* -------------------------------------------------------------------------- */
/* Shared run state                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The header renders two language buttons — one for the desktop bar, one inside
 * the mobile menu — and both mount on every page. Left to themselves they each
 * kicked off their own restore on load, so the widget was driven twice and two
 * identical overlays stacked their translucent backdrops into one much darker
 * one. A single module-level run keeps the work and the UI to one of each.
 */
export type TranslationMode = "switch" | "restore";

export type TranslationRun = {
  target: SupportedLanguage;
  mode: TranslationMode;
  stage: TranslationStage;
};

/**
 * Absolute ceiling on the loading state. Every step above has its own budget;
 * this is the backstop that guarantees a reader is never left staring at a
 * frozen overlay if something upstream misbehaves.
 */
const RUN_TIMEOUT_MS = 10_000;

let currentRun: TranslationRun | null = null;
let runInFlight = false;
const runListeners = new Set<() => void>();

function publishRun(next: TranslationRun | null) {
  currentRun = next;
  for (const listener of runListeners) listener();
}

export function subscribeToTranslationRun(listener: () => void) {
  runListeners.add(listener);
  return () => {
    runListeners.delete(listener);
  };
}

export function getTranslationRun(): TranslationRun | null {
  return currentRun;
}

/** Server render and hydration both start from "nothing in flight". */
export function getServerTranslationRun(): TranslationRun | null {
  return null;
}

/**
 * Entry point for both the toggle and the on-load restore.
 *
 * Resolves the language everywhere that matters — the widget, the document, the
 * cookie, local storage, and every mounted toggle — or restores the previous
 * one if the widget fails.
 */
export async function requestLanguage(target: SupportedLanguage, mode: TranslationMode) {
  if (runInFlight) return;
  runInFlight = true;

  const previous = readSavedLanguage();
  publishRun({ target, mode, stage: "connecting" });

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    runInFlight = false;
    publishRun(null);
  };
  const backstop = window.setTimeout(release, RUN_TIMEOUT_MS);

  try {
    const applied = await applyLanguage(target, {
      onStage: (stage) => {
        if (currentRun) publishRun({ ...currentRun, stage });
      },
    });

    if (!applied) {
      // The widget never exposed a drivable control. Its cookie is honoured on
      // a fresh document, so reload rather than stranding the reader.
      persistLanguage(target);
      if (mode === "switch") window.location.reload();
      return;
    }

    setDocumentLanguage(target);
    persistLanguage(target);
    broadcastLanguage(target);
  } catch {
    if (mode === "switch") {
      setDocumentLanguage(previous);
      persistLanguage(previous);
      broadcastLanguage(previous);
    }
  } finally {
    window.clearTimeout(backstop);
    release();
  }
}
