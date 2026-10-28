"use client";

import { Card } from "@/components/ui/Card";
import { Citation } from "@/components/content/Citation";
import { ReaderLabel, ReaderReference, useReaderLanguage } from "./ReaderLocale";
import { formatArabicQuranReference, quranReferencesInText } from "@/lib/quran";
import type { VerseCardProps } from "@/types/content";
import { cn } from "@/lib/utils";

export function VerseCard({ verse, className }: VerseCardProps) {
  const language = useReaderLanguage();
  const arabicMode = language === "ar";
  const notes = verse.notes && (!arabicMode || !/[a-z]/i.test(verse.notes)) ? verse.notes : undefined;
  if (verse.scripture === "quran") {
    const arabicReference = formatArabicQuranReference({
      surahNumber: verse.surahNumber,
      firstAyahNumber: verse.ayahNumber,
      lastAyahNumber: quranReferencesInText(verse.reference)[0]?.lastAyahNumber,
    });

    return (
      <Card
        data-read-aloud-block
        data-print-keep-together
        className={cn("border-accent/20 p-3 shadow-none", className)}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-5">
          <span className="font-semibold text-accent"><ReaderLabel en="Quran" ar="القرآن الكريم" /></span>
          <span className="text-muted-foreground"><ReaderReference reference={verse.reference} arabic={arabicReference || undefined} /></span>
        </div>
        <p
          lang="ar"
          dir="rtl"
          translate="no"
          data-quran-original
          className="notranslate mt-2 text-right text-sm leading-7 text-accent sm:text-[15px]"
        >
          {verse.arabic.normalize("NFC")}
        </p>
        {!arabicMode ? <p lang="en" dir="ltr" translate="no" data-scripture-translation className="notranslate mt-2 text-sm leading-6 text-foreground">
          {verse.translation}
        </p> : null}
        {!arabicMode ? <div className="mt-2 border-t border-border/60 pt-1.5">
          <Citation
            source={verse.translator}
            prefix="Translation"
            className="mt-0.5 text-[0.68rem] leading-4 sm:text-xs sm:leading-5"
          />
        </div> : null}
        {verse.arabicTafsirNote ? (
          <div
            lang="ar"
            dir="rtl"
            className="mt-2.5 rounded-md bg-muted p-2 text-right text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
          >
            {verse.arabicTafsirNote}
          </div>
        ) : null}
        {notes ? (
          <div className="mt-2.5 rounded-md bg-muted p-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            {notes}
          </div>
        ) : null}
        {arabicMode && verse.notes && !notes ? <p translate="no" className="notranslate mt-2 text-xs leading-6 text-muted-foreground">تتوفر ملاحظات إضافية في النسخة الإنجليزية.</p> : null}
      </Card>
    );
  }

  return (
    <Card
      data-read-aloud-block
      data-print-keep-together
      className={cn("p-3 shadow-none", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-5">
        <span className="font-semibold text-accent"><ReaderLabel en="Bible" ar="الكتاب المقدس" /></span>
        <span className="text-muted-foreground"><ReaderReference reference={verse.reference} /></span>
      </div>
      {!arabicMode ? <blockquote lang="en" dir="ltr" translate="no" data-scripture-translation className="notranslate mt-2 border-s-2 border-accent ps-2.5 text-sm leading-6 text-foreground">
        {verse.text}
      </blockquote> : null}
      {arabicMode && verse.arabicText ? (
        <p
          lang="ar"
          dir="rtl"
          translate="no"
          data-scripture-translation
          className="notranslate mt-2 text-right text-sm leading-7 text-accent sm:text-[15px]"
        >
          {verse.arabicText}
        </p>
      ) : null}
      {arabicMode && !verse.arabicText ? <p translate="no" dir="rtl" className="notranslate mt-2 text-xs leading-6 text-muted-foreground">لم تُضف ترجمة عربية موثقة لهذا المقطع.</p> : null}
      {!arabicMode ? <div className="mt-2 border-t border-border/60 pt-1.5">
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
      </div> : <a href="#sources" className="mt-2 inline-flex min-h-8 items-center text-xs text-accent underline"><ReaderLabel en="Source details" ar="تفاصيل المصدر" /></a>}
      {notes ? (
        <div className="mt-2.5 rounded-md bg-muted p-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
          {notes}
        </div>
      ) : null}
      {arabicMode && verse.notes && !notes ? <p translate="no" className="notranslate mt-2 text-xs leading-6 text-muted-foreground">تتوفر ملاحظات إضافية في النسخة الإنجليزية.</p> : null}
    </Card>
  );
}
