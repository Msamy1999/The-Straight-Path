"use client";

import { Languages } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "ar" || storedLanguage === "en") {
    return storedLanguage;
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

  if (language === "ar") {
    document.cookie = "googtrans=/en/ar; path=/; max-age=31536000; SameSite=Lax";
  } else {
    // Google Translate may set this cookie for either the exact host or its
    // dotted parent. Mark both variants as the source language so a reload
    // cannot immediately re-translate the page after the user switches back.
    const hosts = new Set([
      "",
      `domain=${window.location.hostname}`,
      `domain=.${window.location.hostname}`,
      "domain=localhost",
      "domain=.localhost",
    ]);
    for (const host of hosts) {
      document.cookie = `googtrans=/en/en; path=/; max-age=31536000; SameSite=Lax${host ? `; ${host}` : ""}`;
    }
  }
}

function loadGoogleTranslate() {
  if (window.google?.translate?.TranslateElement) {
    return Promise.resolve();
  }

  if (translateLoader) {
    return translateLoader;
  }

  translateLoader = new Promise<void>((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            autoDisplay: false,
            includedLanguages: "ar,en",
            pageLanguage: "en",
          },
          "google_translate_element",
        );
      }
      resolve();
    };

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      translateLoader = null;
      reject(new Error("Arabic translation could not be loaded"));
    };
    document.head.appendChild(script);
  });

  return translateLoader;
}

function applyGoogleLanguage(language: SupportedLanguage) {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select) {
    return false;
  }

  const targetValue = language === "ar" ? "ar" : "en";
  const option = Array.from(select.options).find((item) => item.value === targetValue);
  if (!option) {
    return false;
  }

  select.selectedIndex = option.index;
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export function LanguageToggle({ className }: { className?: string }) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLanguage = readSavedLanguage();
    setLanguage(savedLanguage);
    setDirection(savedLanguage);

    if (savedLanguage === "ar") {
      void loadGoogleTranslate().then(() => {
        let attempts = 0;
        const apply = () => {
          if (applyGoogleLanguage("ar") || attempts >= 12) {
            return;
          }
          attempts += 1;
          window.setTimeout(apply, 150);
        };
        apply();
      });
    } else if (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en") {
      // If Google left its translation cookie behind, restore the English
      // source DOM when the next page mounts. This keeps the preference stable
      // without duplicating or pre-translating article content.
      void loadGoogleTranslate().then(() => {
        let attempts = 0;
        const apply = () => {
          if (applyGoogleLanguage("en") || attempts >= 12) {
            setDirection("en");
            return;
          }
          attempts += 1;
          window.setTimeout(apply, 150);
        };
        apply();
      });
    }

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, []);

  const toggleLanguage = useCallback(async () => {
    const nextLanguage: SupportedLanguage = language === "en" ? "ar" : "en";
    setLanguage(nextLanguage);
    setDirection(nextLanguage);
    saveLanguage(nextLanguage);

    if (nextLanguage === "en") {
      // Ask the widget to restore the current DOM. Google applies the select
      // change asynchronously, so keep retrying briefly until its hidden
      // control is ready; the next page mount repeats this if needed.
      setIsLoading(true);
      let attempts = 0;
      const apply = () => {
        if (applyGoogleLanguage("en") || attempts >= 12) {
          setDirection("en");
          setIsLoading(false);
          return;
        }
        attempts += 1;
        window.setTimeout(apply, 150);
      };
      apply();
      return;
    }

    setIsLoading(true);
    try {
      await loadGoogleTranslate();
      let attempts = 0;
      const apply = () => {
        if (applyGoogleLanguage("ar") || attempts >= 12) {
          setIsLoading(false);
          return;
        }
        attempts += 1;
        window.setTimeout(apply, 150);
      };
      apply();
    } catch {
      setIsLoading(false);
      saveLanguage("en");
      setLanguage("en");
      setDirection("en");
    }
  }, [language]);

  useEffect(() => {
    // Google Translate can rewrite the control nodes themselves. Bind at the
    // button in capture phase and re-bind when the widget mutates the DOM.
    const handleButtonClick = (event: MouseEvent) => {
      const handledEvent = event as MouseEvent & {
        theStraightPathLanguageHandled?: boolean;
      };
      if (handledEvent.theStraightPathLanguageHandled) {
        return;
      }

      const button = event.currentTarget;
      if (!(button instanceof HTMLButtonElement) || button.disabled) {
        return;
      }

      handledEvent.theStraightPathLanguageHandled = true;
      event.preventDefault();
      event.stopPropagation();
      void toggleLanguage();
    };

    const boundButtons = new Set<HTMLButtonElement>();
    const hideGoogleOverlays = () => {
      document
        .querySelectorAll<HTMLElement>("iframe.skiptranslate, .goog-te-banner-frame, body > .skiptranslate")
        .forEach((element) => {
          element.style.setProperty("display", "none", "important");
          element.style.setProperty("visibility", "hidden", "important");
          element.style.setProperty("pointer-events", "none", "important");
        });
    };

    const bindButtons = () => {
      hideGoogleOverlays();
      document.querySelectorAll<HTMLButtonElement>("button[data-language-toggle]").forEach((button) => {
        if (boundButtons.has(button)) {
          return;
        }
        boundButtons.add(button);
        button.addEventListener("click", handleButtonClick, true);
      });
    };

    const observer = new MutationObserver(bindButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    bindButtons();

    return () => {
      observer.disconnect();
      boundButtons.forEach((button) => button.removeEventListener("click", handleButtonClick, true));
    };
  }, [isLoading, language, toggleLanguage]);

  return (
    <>
      <button
        type="button"
        translate="no"
        data-language-toggle="true"
        disabled={isLoading}
        aria-label={language === "en" ? "Translate site to Arabic" : "Return site to English"}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          className,
        )}
      >
        <Languages aria-hidden="true" className="h-4 w-4" />
        <span lang={language === "en" ? "ar" : "en"}>
          {isLoading ? "…" : language === "en" ? "العربية" : "English"}
        </span>
      </button>
      <span
        id="google_translate_element"
        className="sr-only"
        aria-hidden="true"
        translate="no"
      />
    </>
  );
}
