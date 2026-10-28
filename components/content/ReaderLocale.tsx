"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { LANGUAGE_EVENT } from "@/lib/translation";
import { arabicReferenceLabel } from "@/lib/reader-reference-label";
import { cn } from "@/lib/utils";

const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
const notify = () => listeners.forEach(listener => listener());
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    observer = new MutationObserver(notify);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    window.addEventListener(LANGUAGE_EVENT, notify);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      window.removeEventListener(LANGUAGE_EVENT, notify);
    }
  };
}
const snapshot = () => document.documentElement.lang === "ar" ? "ar" : "en";
const serverSnapshot = () => "en" as const;
export function useReaderLanguage() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function ReaderLabel({ en, ar, className }: { en: string; ar: string; className?: string }) {
  const language = useReaderLanguage();
  return <span translate="no" className={cn("notranslate", className)}>{language === "ar" ? ar : en}</span>;
}

export function ReaderReference({ reference, arabic }: { reference: string; arabic?: string }) {
  const language = useReaderLanguage();
  return (
    <bdi dir={language === "ar" ? "rtl" : "ltr"} translate="no" data-scripture-reference className="notranslate mx-0.5 inline-block">
      {language === "ar" ? arabic ?? arabicReferenceLabel(reference) : reference}
    </bdi>
  );
}

export function ReaderFaqMarker({ question }: { question: boolean }) {
  return <span data-faq-marker className={cn("inline-flex min-h-7 min-w-8 shrink-0 items-center justify-center rounded-md border px-1.5 text-xs font-bold", question ? "border-accent/25 bg-accent/10 text-accent" : "border-secondary/25 bg-secondary/10 text-secondary")}><ReaderLabel en={question ? "Q:" : "A:"} ar={question ? "س:" : "ج:"} /></span>;
}

/** Keep the approved English exact; never machine-translate a scripture quote. */
export function ReaderEnglishExcerpt({ children, arabicText, hasQuranOriginal = false }: { children: ReactNode; arabicText?: string; hasQuranOriginal?: boolean }) {
  const language = useReaderLanguage();
  if (language === "ar") {
    if (hasQuranOriginal) return null;
    return <span translate="no" dir="rtl" className="notranslate text-accent">{arabicText ?? "النص العربي لهذا الاقتباس غير متاح."}</span>;
  }
  return <span lang="en" dir="ltr" translate="no" data-scripture-translation className="notranslate text-accent">{children}</span>;
}
