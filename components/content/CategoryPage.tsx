import { TopicCard } from "@/components/content/TopicCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Tag } from "@/components/ui/Tag";
import { categoryIconMap, fallbackCategoryIcon } from "@/lib/category-icons";
import {
  getArticleSummariesByCategory,
  getRelatedCategories,
  isIslamChristianityCategorySlug,
} from "@/lib/content";
import { readerDescription } from "@/lib/reader-text";
import type { SiteCategory } from "@/types/content";

type CategoryPageProps = {
  category: SiteCategory;
};

export async function CategoryPage({ category }: CategoryPageProps) {
  const Icon = categoryIconMap[category.icon] ?? fallbackCategoryIcon;
  const relatedCategories = await getRelatedCategories(category);
  const draftArticles = await getArticleSummariesByCategory(category.slug);
  const isIslamChristianityBranch = isIslamChristianityCategorySlug(
    category.slug,
  );

  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              ...(isIslamChristianityBranch
                ? [{ label: "Islam & Christianity", href: "/islam-christianity" }]
                : []),
              { label: category.title },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-11 sm:w-11">
                <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <PageHeader
                eyebrow={
                  isIslamChristianityBranch
                    ? "Islam & Christianity branch"
                    : "Research category"
                }
                title={category.title}
                subtitle={readerDescription(category.description)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {category.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="articles" tone="muted">
        <Container>
          {draftArticles.length > 0 ? (
            <div className="mb-10">
              <PageHeader
                titleAs="h2"
                eyebrow="Articles"
                title="Explore this category"
                subtitle="Articles that examine this category's central questions."
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {draftArticles.map((article) => (
                  <TopicCard
                    key={article.slug}
                    title={article.title}
                    description={article.summary}
                    href={`/articles/${article.slug}`}
                    icon={Icon}
                    meta="Article"
                  />
                ))}
              </div>
            </div>
          ) : null}
          {category.futureTopics.length > 0 ? (
            <>
              <PageHeader
                titleAs="h2"
                eyebrow="Topics"
                title="Explore related topics"
                subtitle="Questions and themes connected to this category."
              />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {category.futureTopics.map((topic) => (
                  <TopicCard
                    key={topic.title}
                    title={topic.title}
                    description={readerDescription(topic.description)}
                    href={topic.href ?? `${category.href}#articles`}
                    icon={Icon}
                    label={topic.href?.startsWith("/articles/") ? "Article" : "Topic"}
                    meta={topic.href?.startsWith("/articles/") ? "Article" : "Study topic"}
                  />
                ))}
              </div>
            </>
          ) : null}
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
              <PageHeader
                titleAs="h2"
                eyebrow="Related categories"
                title="Continue through the library"
                subtitle="Related sections connect evidence, definitions, and source notes across the wider study."
              />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCategories.map((related) => {
              const RelatedIcon =
                categoryIconMap[related.icon] ?? fallbackCategoryIcon;

              return (
                <TopicCard
                  key={related.slug}
                  title={related.title}
                  description={readerDescription(related.description)}
                  href={related.href}
                  icon={RelatedIcon}
                  label="Related"
                  meta="Category"
                />
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
