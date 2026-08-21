"use client";

import { useSyncExternalStore } from "react";
import { Spinner } from "@/components/ui/Spinner";
import {
  getServerTranslationRun,
  getTranslationRun,
  subscribeToTranslationRun,
  type SupportedLanguage,
  type TranslationStage,
} from "@/lib/translation";

/**
 * Bilingual copy. The reader is mid-way between two languages at this moment,
 * so naming the destination in its own script — and the origin underneath —
 * is clearer than picking one side.
 */
const COPY = {
  ar: {
    title: "جارٍ التبديل إلى العربية",
    subtitle: "Switching to Arabic",
    stages: {
      connecting: "تجهيز الترجمة · Preparing translation",
      translating: "ترجمة الصفحة · Translating the page",
      finishing: "اللمسات الأخيرة · Almost there",
    },
  },
  en: {
    title: "Switching to English",
    subtitle: "العودة إلى النص الإنجليزي",
    stages: {
      connecting: "Preparing translation · تجهيز الترجمة",
      translating: "Restoring the page · استعادة الصفحة",
      finishing: "Almost there · اللمسات الأخيرة",
    },
  },
} satisfies Record<SupportedLanguage, { title: string; subtitle: string; stages: Record<TranslationStage, string> }>;

/**
 * The bar advances on real milestones rather than a timer, so it never sits at
 * 90% pretending to work. It stops short of 100 because the last step — the
 * page settling — ends by dismissing the card.
 */
const STAGE_PROGRESS: Record<TranslationStage, number> = {
  connecting: 25,
  translating: 65,
  finishing: 92,
};

/**
 * Mounted once, near the root, and driven by the shared translation run.
 *
 * Two presentations of the same state:
 *
 * - `switch` — the reader just asked for this, so a centred card owns the
 *   screen and keeps them out of half-translated content.
 * - `restore` — the reader only asked for a page. Re-applying their saved
 *   language must not block reading, so it degrades to a slim top bar.
 */
export function TranslationProgress() {
  const run = useSyncExternalStore(
    subscribeToTranslationRun,
    getTranslationRun,
    getServerTranslationRun,
  );

  if (!run) return null;

  const copy = COPY[run.target];
  const percent = STAGE_PROGRESS[run.stage];

  if (run.mode === "restore") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={copy.subtitle}
        translate="no"
        className="notranslate pointer-events-none fixed inset-x-0 top-0 z-[110]"
      >
        <div className="h-0.5 w-full bg-accent/15">
          <div
            className="h-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={copy.subtitle}
      translate="no"
      className="notranslate fixed inset-0 z-[110] grid place-items-center bg-background/75 px-6 backdrop-blur-md motion-safe:animate-[sp-fade-in_150ms_ease-out]"
    >
      <div
        dir={run.target === "ar" ? "rtl" : "ltr"}
        className="w-full max-w-xs rounded-2xl border border-border bg-card p-6 shadow-soft motion-safe:animate-[sp-rise-in_200ms_ease-out]"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
            <Spinner className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p lang={run.target} className="truncate text-sm font-semibold leading-tight text-foreground">
              {copy.title}
            </p>
            <p
              lang={run.target === "ar" ? "en" : "ar"}
              className="truncate text-xs leading-tight text-muted-foreground"
            >
              {copy.subtitle}
            </p>
          </div>
        </div>

        <div
          className="mt-5 h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-muted-foreground">
          {copy.stages[run.stage]}
        </p>
      </div>
    </div>
  );
}
