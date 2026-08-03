import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { ResearchTree } from "@/components/content/ResearchTree";
import { TopicCard } from "@/components/content/TopicCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { categoryIconMap, fallbackCategoryIcon } from "@/lib/category-icons";
import { getLearnIslamCategories, getResearchTree } from "@/lib/content";
import { readerDescription } from "@/lib/reader-text";

export const metadata: Metadata = {
  title: "Islam Overview",
  description:
    "A gentle starting point for studying Islam through foundations, scripture, and respectful questions.",
  alternates: {
    canonical: "/islam-overview",
  },
  openGraph: {
    title: "Islam Overview",
    description:
      "Study Islam through careful definitions, clear notes, and beginner-friendly paths.",
  },
};

const startingArticles = [
  {
    title: "What is Tawhid?",
    description: "An introduction to Islam’s belief in the oneness of God.",
    href: "/articles/what-is-tawhid",
  },
  {
    title: "Was the Quran preserved?",
    description: "An introduction to the Muslim understanding of Quranic preservation.",
    href: "/articles/how-was-the-quran-preserved",
  },
];

export default async function IslamOverviewPage() {
  const categories = await getLearnIslamCategories();
  const islamOverviewTree = await getResearchTree("islam-overview");

  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              { label: "Islam Overview" },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-11 sm:w-11">
                <BookOpenCheck aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <PageHeader
                eyebrow="Start here"
                title="Islam Overview"
                subtitle="A broad starting point for Islamic learning paths: foundations, scripture, purpose, questions, and glossary terms."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>Foundations</Tag>
                <Tag>Questions</Tag>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Foundations of Islam"
            title="A beginner outline, one topic at a time"
            subtitle="Start wherever feels natural. Each foundational topic introduces one question clearly and separates evidence from interpretation."
          />
          <div className="mt-6">
            <ResearchTree
              title="Islam Overview"
              description="Foundations, worship, and the question every path eventually leads to: why Islam?"
              nodes={islamOverviewTree}
            />
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Study folders"
            title="Continue into deeper library sections"
            subtitle="Continue through connected topics in the library."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = categoryIconMap[category.icon] ?? fallbackCategoryIcon;

              return (
                <TopicCard
                  key={category.slug}
                  title={category.title}
                  description={readerDescription(category.description)}
                  href={category.href}
                  icon={Icon}
                  label={category.tags[0]}
                  meta="Study folder"
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <PageHeader
              titleAs="h2"
              eyebrow="Starting points"
              title="A few places to begin"
              subtitle="Begin with a foundational question, then follow the related articles at your own pace."
            />
            <div className="grid gap-3">
              {startingArticles.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group rounded-md border border-border bg-card px-4 py-4 text-foreground no-underline shadow-soft transition hover:border-accent/60 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="text-base font-semibold">
                        {article.title}
                      </span>
                      <span className="mt-1 block text-sm leading-7 text-muted-foreground">
                        {article.description}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-accent transition group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
              <div className="pt-2">
                <ButtonLink href="/islam-christianity" variant="secondary">
                  Open Islam & Christianity
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
