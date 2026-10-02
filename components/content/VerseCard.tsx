import { Card } from "@/components/ui/Card";
import { Citation } from "@/components/content/Citation";
import { formatArabicQuranReference } from "@/lib/quran";
import type { VerseCardProps } from "@/types/content";
import { cn } from "@/lib/utils";

export function VerseCard({ verse, className }: VerseCardProps) {
  if (verse.scripture === "quran") {
    const arabicReference = formatArabicQuranReference({
      surahNumber: verse.surahNumber,
      firstAyahNumber: verse.ayahNumber,
    });

    return (
      <Card
        data-read-aloud-block
        data-print-keep-together
        className={cn("border-accent/25 p-3 sm:p-3.5", className)}
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-accent sm:text-xs">
          Quran
        </p>
        <p
          lang="ar"
          dir="rtl"
          translate="no"
          data-quran-original
          className="notranslate mt-1.5 text-right text-[13px] leading-6 text-accent sm:mt-2 sm:text-[15px] sm:leading-7"
        >
          {verse.arabic.normalize("NFC")}
        </p>
        {arabicReference ? (
          <p
            lang="ar"
            dir="rtl"
            translate="no"
            data-quran-original
            className="notranslate mt-0.5 text-right text-[0.65rem] font-semibold leading-4 text-accent sm:text-[0.7rem]"
          >
            {arabicReference}
          </p>
        ) : null}
        <p lang="en" dir="ltr" translate="no" data-scripture-translation className="notranslate mt-2 text-sm leading-6 text-accent sm:text-base sm:leading-7">
          {verse.translation}
        </p>
        <div className="mt-2 border-t border-border/70 pt-2">
          <p lang="en" dir="ltr" translate="no" data-scripture-reference className="notranslate text-[0.7rem] font-semibold leading-4 text-foreground sm:text-xs">
            {verse.reference}
          </p>
          <Citation
            source={verse.translator}
            prefix="Translation"
            className="mt-0.5 text-[0.68rem] leading-4 sm:text-xs sm:leading-5"
          />
        </div>
        {verse.arabicTafsirNote ? (
          <div
            lang="ar"
            dir="rtl"
            className="mt-2.5 rounded-md bg-muted p-2 text-right text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
          >
            {verse.arabicTafsirNote}
          </div>
        ) : null}
        {verse.notes ? (
          <div className="mt-2.5 rounded-md bg-muted p-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            {verse.notes}
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card
      data-read-aloud-block
      data-print-keep-together
      className={cn("p-3 sm:p-3.5", className)}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-accent sm:text-xs">
        Bible
      </p>
      <blockquote lang="en" dir="ltr" translate="no" data-scripture-translation className="notranslate mt-1.5 border-l-2 border-accent pl-2.5 text-sm leading-6 text-accent sm:mt-2 sm:pl-3 sm:text-base sm:leading-7">
        {verse.text}
      </blockquote>
      {verse.arabicText ? (
        <p
          lang="ar"
          dir="rtl"
          className="mt-2 text-right text-sm leading-6 text-accent sm:text-base sm:leading-7"
        >
          {verse.arabicText}
        </p>
      ) : null}
      <div className="mt-2 border-t border-border/70 pt-2 sm:border-0 sm:pt-0">
        <p lang="en" dir="ltr" translate="no" data-scripture-reference className="notranslate text-[0.7rem] font-semibold leading-4 text-foreground sm:text-xs">
          {verse.reference}
        </p>
        <Citation
          source={verse.version}
          prefix="Version"
          className="mt-0.5 text-[0.68rem] leading-4 sm:text-xs sm:leading-5"
        />
        {verse.arabicSource ? (
          <Citation
            source={verse.arabicSource}
            prefix="Arabic source"
            className="mt-0.5 text-[0.68rem] leading-4 sm:text-xs sm:leading-5"
          />
        ) : null}
      </div>
      {verse.notes ? (
        <div className="mt-2.5 rounded-md bg-muted p-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
          {verse.notes}
        </div>
      ) : null}
    </Card>
  );
}
