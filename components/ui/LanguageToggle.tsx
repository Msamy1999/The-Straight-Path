"use client";

import { Languages } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SupportedLanguage = "en" | "ar";

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

const LANGUAGE_STORAGE_KEY = "the-straight-path-language";
const LANGUAGE_EVENT = "the-straight-path-language-change";
const GOOGLE_TARGET_ID = "the-straight-path-google-translate";

declare global {
  interface Window {
    google?: GoogleTranslateApi;
    googleTranslateElementInit?: () => void;
  }
}

let translateLoader: Promise<void> | null = null;

function readSavedLanguage(): SupportedLanguage {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "ar" || saved === "en") {
    return saved;
  }

  return document.cookie.includes("googtrans=/en/ar") ? "ar" : "en";
}

function setDirection(language: SupportedLanguage) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = language;
}

function saveLanguage(language: SupportedLanguage) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  const target = language === "ar" ? "/en/ar" : "/en/en";
  document.cookie = `googtrans=${target}; path=/; max-age=31536000; SameSite=Lax`;
}

function ensureGoogleTranslateTarget() {
  let target = document.getElementById(GOOGLE_TARGET_ID);
  if (!target) {
    target = document.createElement("div");
    target.id = GOOGLE_TARGET_ID;
    target.className = "sr-only";
    target.setAttribute("aria-hidden", "true");
    target.setAttribute("translate", "no");
    document.body.appendChild(target);
  }
}

function loadGoogleTranslate() {
  if (window.google?.translate?.TranslateElement) {
    return Promise.resolve();
  }
  if (translateLoader) {
    return translateLoader;
  }

  ensureGoogleTranslateTarget();
  translateLoader = new Promise<void>((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { autoDisplay: false, includedLanguages: "ar,en", pageLanguage: "en" },
            GOOGLE_TARGET_ID,
          );
        }
        resolve();
      } catch (error) {
        translateLoader = null;
        reject(error);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="translate.google.com/translate_a/element.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("error", () => reject(new Error("Translation could not be loaded")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      translateLoader = null;
      reject(new Error("Translation could not be loaded"));
    };
    document.head.appendChild(script);
  });

  return translateLoader;
}

function applyGoogleLanguage(language: SupportedLanguage) {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  const value = language === "ar" ? "ar" : "en";
  const option = select ? Array.from(select.options).find((item) => item.value === value) : undefined;
  if (!select || !option) {
    return false;
  }

  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function applyGoogleLanguageWhenReady(language: SupportedLanguage) {
  return new Promise<boolean>((resolve) => {
    let attempts = 0;
    let timer = 0;
    let finished = false;
    const finish = (applied: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      observer.disconnect();
      resolve(applied);
    };
    const tryApply = () => {
      if (applyGoogleLanguage(language)) {
        finish(true);
      } else if (attempts++ >= 80) {
        finish(false);
      } else {
        timer = window.setTimeout(tryApply, 125);
      }
    };
    const observer = new MutationObserver(tryApply);
    observer.observe(document.body, { childList: true, subtree: true });
    tryApply();
  });
}

function hideGoogleOverlays() {
  document
    .querySelectorAll<HTMLElement>("iframe.skiptranslate, .goog-te-banner-frame, body > .skiptranslate")
    .forEach((element) => {
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("visibility", "hidden", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });
}

function broadcastLanguage(language: SupportedLanguage) {
  window.dispatchEvent(new CustomEvent<SupportedLanguage>(LANGUAGE_EVENT, { detail: language }));
}

export function LanguageToggle({ className }: { className?: string }) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);
  const languageRef = useRef<SupportedLanguage>("en");

  useEffect(() => {
    const saved = readSavedLanguage();
    languageRef.current = saved;
    setLanguage(saved);
    setDirection(saved);

    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<SupportedLanguage>).detail;
      if (next !== "en" && next !== "ar") return;
      languageRef.current = next;
      setLanguage(next);
      setDirection(next);
    };
    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange);

    if (saved === "ar") {
      void loadGoogleTranslate().then(() => applyGoogleLanguageWhenReady("ar").then(hideGoogleOverlays));
    }

    return () => window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  const toggleLanguage = useCallback(async () => {
    if (isLoading) return;
    const next: SupportedLanguage = languageRef.current === "en" ? "ar" : "en";
    languageRef.current = next;
    setLanguage(next);
    setDirection(next);
    saveLanguage(next);
    broadcastLanguage(next);
    setIsLoading(true);

    try {
      await loadGoogleTranslate();
      const applied = await applyGoogleLanguageWhenReady(next);
      hideGoogleOverlays();
      if (!applied) {
        window.location.reload();
      }
    } catch {
      // The preference remains saved. Retrying the button will load the provider again.
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <button
      type="button"
      translate="no"
      dir={language === "ar" ? "rtl" : "ltr"}
      disabled={isLoading}
      onClick={() => void toggleLanguage()}
      aria-label={language === "en" ? "Translate site to Arabic" : "Return site to English"}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <Languages aria-hidden="true" className="h-4 w-4" />
      <span lang={language === "en" ? "ar" : "en"}>{isLoading ? "…" : language === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
