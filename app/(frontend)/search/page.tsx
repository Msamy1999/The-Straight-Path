import type { Metadata } from "next";
import { ArticleSearch } from "@/components/content/ArticleSearch";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { getArticles, getSiteCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles by title and by words found in their text.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Search the Library",
    description: "Search articles by title and by words found in their text.",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const articles = await getArticles();
  const categories = await getSiteCategories();
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? q[0] ?? "" : q ?? "";

  return (
    <>
      <Section className="border-b border-border" spacing="lg">
        <Container>
          <PageHeader
            eyebrow="Library search"
            title="Search the library"
            subtitle="Find articles by title first, then by words found in the article text."
          />
        </Container>
      </Section>
      <Section tone="muted">
        <Container>
          <ArticleSearch
            articles={articles}
            categories={categories}
            initialQuery={initialQuery}
          />
        </Container>
      </Section>
    </>
  );
}
