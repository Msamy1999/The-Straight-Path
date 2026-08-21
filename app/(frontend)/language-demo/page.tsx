import type { Metadata } from "next";
import { VerseCard } from "@/components/content/VerseCard";
import { Callout } from "@/components/content/Callout";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import type { BibleDisplayVerse, QuranDisplayVerse } from "@/types/content";

export const metadata: Metadata = {
  title: "Language Demo",
  description:
    "English-first and Arabic-ready verse layout demo using source-pending placeholders.",
  alternates: {
    canonical: "/language-demo",
  },
  // Internal layout scaffolding: every verse on it is a "source pending"
  // placeholder, so it must never be indexed or listed in the sitemap.
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Language Demo",
    description:
      "English-first and Arabic-ready verse layout demo using source-pending placeholders.",
  },
};

const quranPlaceholder: QuranDisplayVerse = {
  scripture: "quran",
  surahName: "Source pending",
  surahNumber: 0,
  ayahNumber: 0,
  arabic: "[VERIFIED ARABIC QURAN TEXT PENDING]",
  translation: "[Verified English Quran translation pending.]",
  translator: "Source pending",
  reference: "Quran reference pending",
  arabicTafsirNote: "[OPTIONAL VERIFIED ARABIC TAFSIR NOTE PENDING]",
  notes:
    "Layout placeholder only. Replace with exact Arabic, translation, reference, and translator attribution before publication.",
};

const biblePlaceholder: BibleDisplayVerse = {
  scripture: "bible",
  book: "Source pending",
  chapter: 0,
  verse: 0,
  text: "[Verified Bible verse text pending.]",
  arabicText: "[OPTIONAL VERIFIED ARABIC BIBLE TEXT PENDING]",
  arabicSource: "Arabic Bible source pending",
  version: "Source pending",
  reference: "Bible reference pending",
  notes:
    "Layout placeholder only. Replace with exact passage, version/source, and optional Arabic source before publication.",
};

export default function LanguageDemoPage() {
  return (
    <>
      <Section className="border-b border-border" spacing="lg">
        <Container>
          <PageHeader
            eyebrow="Language foundation"
            title="English-first, Arabic-ready verse layouts"
            subtitle="The site keeps English routes for now and prepares content fields for Arabic text where it matters most: Quran Arabic, future tafsir notes, and optional Arabic Bible support."
          />
          <div className="mt-6">
            <Callout type="note" title="Routing choice">
              The simplest scalable path is to keep the current English routes
              and add language-aware content fields now. Full `/ar` routes can
              come later after Arabic article content and navigation are ready.
            </Callout>
          </div>
        </Container>
      </Section>
      <Section tone="muted">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            <VerseCard verse={quranPlaceholder} />
            <VerseCard verse={biblePlaceholder} />
          </div>
        </Container>
      </Section>
    </>
  );
}
