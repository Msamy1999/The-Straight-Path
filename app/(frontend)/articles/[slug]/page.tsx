import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { ComparisonArticleLayout } from "@/components/content/ComparisonArticleLayout";
import {
  getArticleBySlug,
  getArticleKeyScripture,
  getArticlePlaybackNavigation,
  getArticleRedirect,
  getArticleTreeBreadcrumbs,
  getCategoryBySlug,
  getCitationsByIds,
  getComparisonArticleBySlug,
  hasArticleKeyScriptureSelection,
  getRelatedArticles,
} from "@/lib/content";

// Resolve published availability from the runtime CMS. Tagged content reads
// remain cached, but build-time drafts must not freeze article HTML or 404s.
export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * Legacy template records must never replace a researched article. A genuine
 * comparison needs at least one complete scripture passage before its custom
 * comparison layout is shown.
 */
function hasRenderableComparison(
  comparison: Awaited<ReturnType<typeof getComparisonArticleBySlug>>,
) {
  return Boolean(
    comparison?.quranVerses.some(
      (verse) =>
        verse.surahNumber > 0 &&
        verse.ayahNumber > 0 &&
        !verse.arabic.includes("[VERIFIED"),
    ) ||
      comparison?.bibleVerses.some(
        (verse) =>
          verse.chapter > 0 &&
          verse.verse !== 0 &&
          !verse.text.includes("[VERIFIED"),
      ),
  );
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const redirectSlug = getArticleRedirect(slug);
  const article = await getArticleBySlug(redirectSlug ?? slug);

  if (!article) {
    // Prevent a missing or unpublished article from inheriting the site's
    // normal indexable metadata. Next adds noindex to this not-found response.
    notFound();
  }

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      modifiedTime: article.lastUpdated,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const redirectSlug = getArticleRedirect(slug);
  if (redirectSlug) {
    permanentRedirect(`/articles/${redirectSlug}`);
  }
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const baseCitationIds = Array.from(new Set(article.citations));
  const [
    comparison,
    relatedArticles,
    category,
    treeBreadcrumbs,
    keyScripture,
    baseCitations,
    playbackNavigation,
  ] = await Promise.all([
    getComparisonArticleBySlug(article.slug),
    getRelatedArticles(article),
    getCategoryBySlug(article.category),
    getArticleTreeBreadcrumbs(article.slug),
    getArticleKeyScripture(article.slug),
    // Citation records do not depend on the optional comparison layout. Start
    // the normal article query immediately instead of adding another serial
    // database/cache round trip after all other page data has resolved.
    getCitationsByIds(baseCitationIds),
    getArticlePlaybackNavigation(article.slug, article.category),
  ]);
  // This is a focused catalog, not a two-scripture comparison. Its researched
  // article sections use the same accordion presentation as Claims Against Islam.
  const renderableComparison =
    article.slug === "contradictions-in-the-bible" || !hasRenderableComparison(comparison)
      ? undefined
      : comparison;
  const baseCitationIdSet = new Set(baseCitationIds);
  const comparisonCitationIds = Array.from(
    new Set(renderableComparison?.sources ?? []),
  ).filter((citationId) => !baseCitationIdSet.has(citationId));
  const citations = comparisonCitationIds.length
    ? [...baseCitations, ...(await getCitationsByIds(comparisonCitationIds))]
    : baseCitations;

  if (renderableComparison) {
    const hasSelectedScripture = hasArticleKeyScriptureSelection(article.slug);
    const selectedComparison = {
      ...renderableComparison,
      quranVerses:
        hasSelectedScripture
          ? keyScripture.quranVerses
          : renderableComparison.quranVerses,
      bibleVerses:
        hasSelectedScripture
          ? keyScripture.bibleVerses
          : renderableComparison.bibleVerses,
    };
    return (
      <ComparisonArticleLayout
        article={article}
        category={category}
        comparison={selectedComparison}
        citations={citations}
        relatedArticles={relatedArticles}
        treeBreadcrumbs={treeBreadcrumbs}
        playbackNavigation={playbackNavigation}
      />
    );
  }

  return (
    <ArticleLayout
      article={article}
      category={category}
      citations={citations}
      relatedArticles={relatedArticles}
      treeBreadcrumbs={treeBreadcrumbs}
      playbackNavigation={playbackNavigation}
      keyScripture={keyScripture}
      collapsibleSections={article.slug === "contradictions-in-the-bible"}
    />
  );
}
