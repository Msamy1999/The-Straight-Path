/**
 * Domain content types — deliberately free of React imports so they can be
 * shared verbatim with the future mobile app and the CMS schema layer.
 * UI component prop types live in types/ui.ts.
 */

export type LanguageCode = "en" | "ar";

export type LocalizedText = {
  en: string;
  ar?: string;
};

export type QuranVerse = {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  translation: string;
  translator: string;
  reference: string;
  arabicTafsirNote?: string;
  notes?: string;
};

export type BibleVerse = {
  book: string;
  chapter: number;
  verse: number | string;
  text: string;
  arabicText?: string;
  arabicSource?: string;
  version: string;
  reference: string;
  notes?: string;
};

export type DisplayVerse =
  | ({ scripture: "quran" } & QuranVerse)
  | ({ scripture: "bible" } & BibleVerse);

export type QuranDisplayVerse = { scripture: "quran" } & QuranVerse;

export type BibleDisplayVerse = { scripture: "bible" } & BibleVerse;

export type ArticleKeyScripture = {
  quranVerses: QuranDisplayVerse[];
  bibleVerses: BibleDisplayVerse[];
};

export type CitationType =
  | "quran"
  | "bible"
  | "hadith"
  | "tafsir"
  | "christian-commentary"
  | "academic"
  | "book"
  | "article"
  | "manuscript"
  | "other";

export type Citation = {
  id: string;
  type: CitationType;
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  url?: string;
  note?: string;
};

export type AudienceLevel = "beginner" | "intermediate" | "deep-study";

export type ArticleStatus = "draft" | "reviewed" | "published";

export type ArticleSectionKind =
  | "summary"
  | "scripture"
  | "interpretation"
  | "history"
  | "argument"
  | "sources"
  | "notes";

export type ArticleSection = {
  id: string;
  title: string;
  kind: ArticleSectionKind;
  body: string;
  citationIds?: string[];
};

export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  category: CategorySlug;
  audienceLevel: AudienceLevel;
  summary: string;
  tags: TopicTag[];
  status: ArticleStatus;
  lastUpdated: string;
  sections: ArticleSection[];
  citations: string[];
  relatedArticles: string[];
};

export type ComparisonTopic = {
  title: string;
  question: string;
  quranicPerspective: string;
  biblicalPerspective: string;
  islamicResponse: string;
  christianInterpretation: string;
  historicalContext: string;
  keyTakeaway: string;
  citations: string[];
};

export type CommonObjection = {
  objection: string;
  response: string;
};

export type ComparisonArticle = {
  slug: string;
  mainQuestion: string;
  beginnerSummary: string;
  quranicPerspective: string;
  biblicalPerspective: string;
  historicalContext: string;
  christianInterpretation: string;
  islamicResponse: string;
  keyDifferences: string[];
  commonObjections: CommonObjection[];
  respectfulConclusion: string;
  quranVerses: QuranDisplayVerse[];
  bibleVerses: BibleDisplayVerse[];
  sources: string[];
  relatedTopics: string[];
};

export type GlossaryTerm = {
  term: string;
  pronunciation?: string;
  definition: string;
  category: TopicTag;
  relatedTerms: string[];
  citations: string[];
};

export type SourceStatus = "pending" | "verified";

export type SourceLibraryItem = {
  id: string;
  title: string;
  type: CitationType;
  category: string;
  authorOrPublisher?: string;
  year?: number;
  url?: string;
  notes: string;
  status: SourceStatus;
};

export type SourceLibraryCategory = {
  title: string;
  description: string;
  items: SourceLibraryItem[];
};

export type TopicTag =
  | "Jesus"
  | "Preservation"
  | "Theology"
  | "History"
  | "Scripture"
  | "Questions"
  | "Science"
  | "Sources"
  | "Purpose"
  | "Prophecy";

export type CategoryIcon =
  | "scripture"
  | "jesus"
  | "preservation"
  | "questions"
  | "science"
  | "history"
  | "theology"
  | "salvation"
  | "prophecies"
  | "glossary"
  | "sources"
  | "warAndViolence"
  | "women";

export type CategorySlug =
  | "the-quran-and-the-bible"
  | "jesus-in-islam-and-christianity"
  | "preservation"
  | "difficult-questions"
  | "scientific-signs"
  | "religious-history"
  | "historical-evidence"
  | "tawhid-and-the-trinity"
  | "salvation-and-purpose-of-life"
  | "prophecies"
  | "war-and-violence"
  | "women"
  | "questions"
  | "glossary"
  | "sources";

export type FutureTopic = {
  title: string;
  description: string;
  href?: string;
};

export type SiteCategory = {
  slug: CategorySlug;
  title: string;
  href: string;
  description: string;
  icon: CategoryIcon;
  tags: TopicTag[];
  futureTopics: FutureTopic[];
  relatedSlugs: CategorySlug[];
};

export type HomeTopic = {
  title: string;
  description: string;
  href: string;
  icon: CategoryIcon;
  label?: string;
};

export type ResearchTreeStatus = "draft" | "under-review" | "published";

export type ResearchTreeNode = {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  children?: ResearchTreeNode[];
  status?: ResearchTreeStatus;
  tag?: string;
  defaultOpen?: boolean;
};
