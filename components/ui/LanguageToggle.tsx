"use client";

import { Languages } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import {
  getServerTranslationRun,
  getTranslationRun,
  guardReactAgainstTranslation,
  LANGUAGE_EVENT,
  persistLanguage,
  protectOriginalScripture,
  readSavedLanguage,
  requestLanguage,
  setDocumentLanguage,
  subscribeToTranslationRun,
  warmUpTranslation,
  type SupportedLanguage,
} from "@/lib/translation";

export function LanguageToggle({ className }: { className?: string }) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const run = useSyncExternalStore(
    subscribeToTranslationRun,
    getTranslationRun,
    getServerTranslationRun,
  );

  useEffect(() => {
    const saved = readSavedLanguage();
    setLanguage(saved);
    setDocumentLanguage(saved);
    protectOriginalScripture();

    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<SupportedLanguage>).detail;
      if (next !== "en" && next !== "ar") return;
      setLanguage(next);
      setDocumentLanguage(next);
    };
    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange);

    if (saved === "ar") {
      // The widget re-applies the saved language from its own cookie on every
      // page load. Guard React first, then let the shared run drive it; the
      // request is a no-op for whichever toggle instance gets here second.
      guardReactAgainstTranslation();
      void requestLanguage("ar", "restore");
    } else {
      // Keep the widget's cookie in step with our own store, otherwise a stale
      // cookie from an interrupted switch silently translates an "English" page.
      persistLanguage("en");
    }

    return () => window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  const toggleLanguage = useCallback(() => {
    void requestLanguage(language === "en" ? "ar" : "en", "switch");
  }, [language]);

  const isBusy = run !== null;

  return (
    <button
      type="button"
      translate="no"
      dir={language === "ar" ? "rtl" : "ltr"}
      disabled={isBusy}
      onClick={toggleLanguage}
      onPointerEnter={warmUpTranslation}
      onPointerDown={warmUpTranslation}
      onFocus={warmUpTranslation}
      aria-label={language === "en" ? "Translate site to Arabic" : "Return site to English"}
      aria-busy={isBusy}
      className={cn(
        "notranslate inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {isBusy ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <Languages aria-hidden="true" className="h-4 w-4" />
      )}
      <span lang={language === "en" ? "ar" : "en"}>
        {language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
}
