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
      <Card data-read-aloud-block className={cn("p-4 sm:p-5", className)}>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
          Quran
        </p>
        <p
          lang="ar"
          dir="rtl"
          className="mt-2 text-right text-[1.45rem] leading-[1.65] text-accent sm:mt-4 sm:text-3xl sm:leading-loose"
        >
          {verse.arabic.normalize("NFC")}
        </p>
        {arabicReference ? (
          <p
            lang="ar"
            dir="rtl"
            className="mt-1 text-right text-xs font-semibold leading-6 text-accent sm:mt-2 sm:text-sm"
          >
            {arabicReference}
          </p>
        ) : null}
        <p className="mt-3 text-[0.95rem] leading-7 text-accent sm:mt-4 sm:text-base sm:leading-8">
          {verse.translation}
        </p>
        <div className="mt-3 border-t border-border/70 pt-3 sm:mt-4 sm:border-0 sm:pt-0">
          <p className="text-xs font-semibold leading-5 text-foreground sm:text-sm">
            {verse.reference}
          </p>
          <Citation
            source={verse.translator}
            prefix="Translation"
            className="mt-0.5 leading-5 sm:mt-1 sm:leading-6"
          />
        </div>
        {verse.arabicTafsirNote ? (
          <div
            lang="ar"
            dir="rtl"
            className="mt-3 rounded-md bg-muted p-2.5 text-right text-base leading-8 text-muted-foreground sm:mt-4 sm:p-3 sm:text-lg sm:leading-loose"
          >
            {verse.arabicTafsirNote}
          </div>
        ) : null}
        {verse.notes ? (
          <div className="mt-3 rounded-md bg-muted p-2.5 text-sm leading-6 text-muted-foreground sm:mt-4 sm:p-3 sm:leading-7">
            {verse.notes}
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card data-read-aloud-block className={cn("p-4 sm:p-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
        Bible
      </p>
      <blockquote className="mt-2 border-l-2 border-accent pl-3 text-[0.95rem] leading-7 text-accent sm:mt-4 sm:pl-4 sm:text-base sm:leading-8">
        {verse.text}
      </blockquote>
      {verse.arabicText ? (
        <p
          lang="ar"
          dir="rtl"
          className="mt-3 text-right text-lg leading-8 text-accent sm:mt-4 sm:text-xl sm:leading-loose"
        >
          {verse.arabicText}
        </p>
      ) : null}
      <div className="mt-3 border-t border-border/70 pt-3 sm:mt-4 sm:border-0 sm:pt-0">
        <p className="text-xs font-semibold leading-5 text-foreground sm:text-sm">
          {verse.reference}
        </p>
        <Citation
          source={verse.version}
          prefix="Version"
          className="mt-0.5 leading-5 sm:mt-1 sm:leading-6"
        />
        {verse.arabicSource ? (
          <Citation
            source={verse.arabicSource}
            prefix="Arabic source"
            className="mt-0.5 leading-5 sm:mt-1 sm:leading-6"
          />
        ) : null}
      </div>
      {verse.notes ? (
        <div className="mt-3 rounded-md bg-muted p-2.5 text-sm leading-6 text-muted-foreground sm:mt-4 sm:p-3 sm:leading-7">
          {verse.notes}
        </div>
      ) : null}
    </Card>
  );
}
