/**
 * Plain-text builders for the article tools (read aloud / copy).
 * React-free so they can run on the server inside layout components.
 */
import type {
  Article,
  ArticleKeyScripture,
  ComparisonArticle,
} from "@/types/domain";

/** Strip common markdown artifacts so speech and copied text read cleanly. */
export function stripMarkdownArtifacts(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Title, subtitle, summary, then each section title + body. */
export function buildArticlePlainText(
  article: Article,
  keyScripture: ArticleKeyScripture = { quranVerses: [], bibleVerses: [] },
): string {
  const parts: string[] = [article.title];

  if (article.subtitle) {
    parts.push(article.subtitle);
  }
  if (article.summary) {
    parts.push(article.summary);
  }
  for (const section of article.sections) {
    if (
      section.id === "beginner-summary" ||
      section.title.trim().toLowerCase() === "beginner summary"
    ) {
      continue;
    }
    parts.push(section.title, section.body);
  }
  appendScripturePlainText(parts, keyScripture);

  return stripMarkdownArtifacts(parts.join("\n\n"));
}

/**
 * Comparison articles render their own blocks instead of article.sections,
 * so their plain text is built from the comparison fields — including the
 * common objections, which act as the article's question-and-answer list.
 */
export function buildComparisonPlainText(
  article: Article,
  comparison: ComparisonArticle,
): string {
  const parts: string[] = [article.title];

  if (article.subtitle) {
    parts.push(article.subtitle);
  }

  parts.push(
    comparison.mainQuestion,
    "Quranic perspective.",
    comparison.quranicPerspective,
    "Biblical perspective.",
    comparison.biblicalPerspective,
    "Historical context.",
    comparison.historicalContext,
    "Christian interpretation.",
    comparison.christianInterpretation,
    "Islamic response.",
    comparison.islamicResponse,
  );

  if (comparison.keyDifferences.length > 0) {
    parts.push("Key differences.", ...comparison.keyDifferences);
  }

  if (comparison.commonObjections.length > 0) {
    parts.push("Common objections.");
    for (const item of comparison.commonObjections) {
      parts.push(item.objection, item.response);
    }
  }

  appendScripturePlainText(parts, {
    quranVerses: comparison.quranVerses,
    bibleVerses: comparison.bibleVerses,
  });

  parts.push("Respectful conclusion.", comparison.respectfulConclusion);

  return stripMarkdownArtifacts(parts.join("\n\n"));
}

function appendScripturePlainText(
  parts: string[],
  scripture: ArticleKeyScripture,
): void {
  if (scripture.quranVerses.length + scripture.bibleVerses.length === 0) {
    return;
  }
  parts.push("Key scripture passages.");
  for (const verse of scripture.quranVerses) {
    parts.push(
      `${verse.reference}. ${verse.translation} Translation: ${verse.translator}.`,
    );
  }
  for (const verse of scripture.bibleVerses) {
    parts.push(`${verse.reference}. ${verse.text} Version: ${verse.version}.`);
  }
}
