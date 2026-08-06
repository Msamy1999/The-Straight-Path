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
      <Card className={cn("p-5", className)}>
        <p className="text-sm font-semibold uppercase text-accent">Quran</p>
        <p
          lang="ar"
          dir="rtl"
          className="mt-4 text-right text-2xl leading-loose text-accent sm:text-3xl"
        >
          {verse.arabic.normalize("NFC")}
        </p>
        {arabicReference ? (
          <p
            lang="ar"
            dir="rtl"
            className="mt-2 text-right text-sm font-semibold text-accent"
          >
            {arabicReference}
          </p>
        ) : null}
        <p className="mt-4 text-base leading-8 text-accent">
          {verse.translation}
        </p>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {verse.reference}
        </p>
        <Citation
          source={verse.translator}
          prefix="Translation"
          className="mt-1"
        />
        {verse.arabicTafsirNote ? (
          <div
            lang="ar"
            dir="rtl"
            className="mt-4 rounded-md bg-muted p-3 text-right text-lg leading-loose text-muted-foreground"
          >
            {verse.arabicTafsirNote}
          </div>
        ) : null}
        {verse.notes ? (
          <div className="mt-4 rounded-md bg-muted p-3 text-sm leading-7 text-muted-foreground">
            {verse.notes}
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm font-semibold uppercase text-accent">Bible</p>
      <blockquote className="mt-4 border-l-2 border-accent pl-4 text-base leading-8 text-accent">
        {verse.text}
      </blockquote>
      {verse.arabicText ? (
        <p
          lang="ar"
          dir="rtl"
          className="mt-4 text-right text-xl leading-loose text-accent"
        >
          {verse.arabicText}
        </p>
      ) : null}
      <p className="mt-4 text-sm font-semibold text-foreground">{verse.reference}</p>
      <Citation
        source={verse.version}
        prefix="Version"
        className="mt-1"
      />
      {verse.arabicSource ? (
        <Citation source={verse.arabicSource} prefix="Arabic source" className="mt-1" />
      ) : null}
      {verse.notes ? (
        <div className="mt-4 rounded-md bg-muted p-3 text-sm leading-7 text-muted-foreground">
          {verse.notes}
        </div>
      ) : null}
    </Card>
  );
}
