import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { ComparisonArticleLayout } from "@/components/content/ComparisonArticleLayout";
import {
  getArticleBySlug,
  getArticleSlugs,
  getCategoryBySlug,
  getCitationsByIds,
  getComparisonArticleBySlug,
  getRelatedArticles,
} from "@/lib/content";

// ISR lets long articles be served from the generated cache instead of
// rebuilding the full Payload response on every tree click. Next development
// mode still renders route data dynamically while draft imports are active.
export const revalidate = 300;

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

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found",
    };
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
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [comparison, relatedArticles, category] = await Promise.all([
    getComparisonArticleBySlug(article.slug),
    getRelatedArticles(article),
    getCategoryBySlug(article.category),
  ]);
  const renderableComparison = hasRenderableComparison(comparison)
    ? comparison
    : undefined;
  const citationIds = Array.from(
    new Set([...article.citations, ...(renderableComparison?.sources ?? [])]),
  );
  const citations = await getCitationsByIds(citationIds);

  if (renderableComparison) {
    return (
      <ComparisonArticleLayout
        article={article}
        category={category}
        comparison={renderableComparison}
        citations={citations}
        relatedArticles={relatedArticles}
      />
    );
  }

  return (
    <ArticleLayout
      article={article}
      category={category}
      citations={citations}
      relatedArticles={relatedArticles}
      collapsibleSections={article.slug === "contradictions-in-the-bible"}
    />
  );
}
