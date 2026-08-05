import { ArrowRight, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { ArticleHashOpener } from "@/components/content/ArticleHashOpener";
import { ArticleTools } from "@/components/content/ArticleTools";
import { CitationList } from "@/components/content/CitationList";
import { TopicCard } from "@/components/content/TopicCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { buildArticlePlainText } from "@/lib/article-text";
import { categoryIconMap, fallbackCategoryIcon } from "@/lib/category-icons";
import {
  formatArabicQuranReference,
  quranQuoteSegmentsInLine,
  quranReferenceForQuoteSegment,
} from "@/lib/quran";
import type { ArticleTreeBreadcrumb } from "@/lib/content";
import type { Article, Citation, SiteCategory } from "@/types/content";

type ArticleLayoutProps = {
  article: Article;
  category: SiteCategory;
  citations: Citation[];
  relatedArticles: Article[];
  tocItems?: Array<{
    id: string;
    title: string;
  }>;
  /**
   * Plain-text override for the read-aloud/copy tools. Layouts that render
   * custom children (e.g. comparison articles) pass their own text here;
   * otherwise it is built from the article sections.
   */
  plainText?: string;
  /** Use the claims-style accordion presentation for selected long-form articles. */
  collapsibleSections?: boolean;
  /** Public navigation path when the article is opened from a research tree. */
  treeBreadcrumbs?: ArticleTreeBreadcrumb[];
  children?: ReactNode;
};

export function ArticleLayout({
  article,
  category,
  citations,
  relatedArticles,
  tocItems,
  plainText,
  collapsibleSections = false,
  treeBreadcrumbs = [],
  children,
}: ArticleLayoutProps) {
  const CategoryIcon = categoryIconMap[category.icon] ?? fallbackCategoryIcon;
  const visibleSections = article.sections.filter(
    (section) =>
      section.id !== "beginner-summary" &&
      section.title.trim().toLowerCase() !== "beginner summary",
  );
  const tableOfContents =
    tocItems ?? visibleSections.map((section) => ({ id: section.id, title: section.title }));
  const articleText = plainText ?? buildArticlePlainText(article);

  return (
    <>
      {collapsibleSections ? <ArticleHashOpener /> : null}
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              ...(treeBreadcrumbs.length > 0
                ? treeBreadcrumbs
                : [{ label: category.title, href: category.href }]),
              { label: article.title },
            ]}
          />
          <div className="mt-4 max-w-4xl">
            <PageHeader
              eyebrow="Research article"
              title={article.title}
              subtitle={article.subtitle}
              titleClassName="text-2xl sm:text-3xl lg:text-3xl"
            />
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {article.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              <Tag>{article.audienceLevel}</Tag>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
              Last updated:{" "}
              <time dateTime={article.lastUpdated}>{article.lastUpdated}</time>
            </p>
            <div className="mt-3">
              <ArticleTools articleText={articleText} articleTitle={article.title} />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <article className="min-w-0">
              <div className={collapsibleSections ? "mt-2 space-y-3" : "mt-8 space-y-10"}>
                {children ??
                  visibleSections.map((section) => (
                    <ArticleSectionBlock
                      key={section.id}
                      article={article}
                      sectionId={section.id}
                      collapsible={collapsibleSections}
                    />
                  ))}
              </div>

              {collapsibleSections ? (
                <details
                  id="sources"
                  className="group mt-8 scroll-mt-20 rounded-lg border border-border bg-card shadow-soft"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="block text-xs font-semibold uppercase text-accent">Sources</span>
                      <span className="mt-1 block text-base font-semibold text-foreground sm:text-lg">
                        Sources and further reading
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        Primary texts and works cited in this article.
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="border-t border-border px-4 py-4 sm:px-5 sm:py-5">
                    <CitationList citations={citations} />
                  </div>
                </details>
              ) : (
                <section id="sources" className="mt-12 scroll-mt-20">
                  <PageHeader
                    titleAs="h2"
                    eyebrow="Sources"
                    title="Sources and further reading"
                    subtitle="Primary texts and works cited in this article."
                  />
                  <div className="mt-6">
                    <CitationList citations={citations} />
                  </div>
                </section>
              )}

              {relatedArticles.length > 0 ? (
                <section id="related-articles" className="mt-12 scroll-mt-20">
                  <PageHeader
                    titleAs="h2"
                    eyebrow="Related"
                    title="Related articles"
                    subtitle="Continue exploring related questions and evidence."
                  />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {relatedArticles.map((relatedArticle) => (
                      <TopicCard
                        key={relatedArticle.slug}
                        title={relatedArticle.title}
                        description={relatedArticle.summary}
                        href={`/articles/${relatedArticle.slug}`}
                        icon={CategoryIcon}
                        meta="Article"
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </article>

            <aside className="order-first lg:order-none lg:sticky lg:top-20">
              <Card className="p-4">
                <p className="text-sm font-semibold text-foreground">
                  On this page
                </p>
                <nav aria-label="Article table of contents" className="mt-3">
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {tableOfContents.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="inline-flex items-center gap-2 rounded-sm no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                          {item.title}
                        </a>
                      </li>
                    ))}
                    {tableOfContents.some((item) => item.id === "sources") ? null : (
                      <li>
                        <a
                          href="#sources"
                          className="inline-flex items-center gap-2 rounded-sm no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                          Sources
                        </a>
                      </li>
                    )}
                  </ol>
                </nav>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ArticleSectionBlock({
  article,
  sectionId,
  collapsible,
}: {
  article: Article;
  sectionId: string;
  collapsible: boolean;
}) {
  const section = article.sections.find((item) => item.id === sectionId);

  if (!section) {
    return null;
  }

  if (!collapsible) {
    return (
      <section id={section.id} className="scroll-mt-20">
        <p className="text-xs font-semibold uppercase text-accent sm:text-sm">
          {section.id === "seeker-guide" ? "Overview" : section.kind}
        </p>
        <h2 className="mt-2 select-text text-lg leading-snug sm:mt-3 sm:text-xl">{section.title}</h2>
        <ArticleSectionBody body={section.body} />
      </section>
    );
  }

  return (
    <details
      id={section.id}
      className="group scroll-mt-24 rounded-lg border border-border bg-card shadow-soft"
      open={section.kind === "summary"}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-semibold uppercase text-accent sm:text-sm">
            {section.id === "seeker-guide" ? "Overview" : section.kind}
          </span>
          <span className="mt-1 block select-text text-base font-semibold leading-snug text-foreground sm:text-lg">
            {section.title}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="mt-1 h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border px-4 py-4 sm:px-5 sm:py-5">
        <ArticleSectionBody body={section.body} />
      </div>
    </details>
  );
}

function ArticleSectionBody({ body }: { body: string }) {
  const lines = body.split(/\r?\n/);

  return (
    <div className="mt-3 select-text whitespace-pre-wrap text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
      {lines.map((line, index) => {
        const quotes = quranQuoteSegmentsInLine(line)
          .map((segment) => ({
            ...segment,
            label: formatArabicQuranReference(
              quranReferenceForQuoteSegment(lines, index, segment) ?? {
                surahNumber: 0,
                firstAyahNumber: 0,
              },
            ),
          }))
          .filter((segment): segment is typeof segment & { label: string } => Boolean(segment.label));

        if (line.trim().length === 0) {
          return <span key={`blank-${index}`} className="block h-1" aria-hidden="true" />;
        }

        if (quotes.length > 0) {
          let cursor = 0;
          return (
            <span key={`line-${index}`}>
              {quotes.map((quote) => {
                const before = line.slice(cursor, quote.start);
                cursor = quote.end;

                return (
                  <span key={`${quote.start}-${quote.end}`}>
                    {renderInlineMarkdown(before, `${index}-${quote.start}-before`)}
                    <span className="block py-1.5">
                      <span
                        lang="ar"
                        dir="rtl"
                        className="block text-right text-xl leading-loose text-foreground sm:text-2xl"
                      >
                        {quote.text.normalize("NFC")}
                      </span>
                      <span
                        lang="ar"
                        dir="rtl"
                        className="mt-1 block text-right text-xs font-semibold text-accent sm:text-sm"
                      >
                        {quote.label}
                      </span>
                    </span>
                  </span>
                );
              })}
              {renderInlineMarkdown(line.slice(cursor), `${index}-after`)}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          );
        }

        if (line.trimStart().startsWith("- ")) {
          const item = line.trimStart().slice(2);
          return (
            <span key={`bullet-${index}`} className="flex gap-2 pl-1">
              <span aria-hidden="true" className="text-accent">•</span>
              <span>{renderInlineMarkdown(item, `${index}-bullet`)}</span>
            </span>
          );
        }

        return (
          <span key={`line-${index}`}>
            {renderInlineMarkdown(line, `${index}-line`)}
            {index < lines.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|__[\s\S]+?__)/g);

  return parts.map((part, index) => {
    const match = part.match(/^\*\*([\s\S]+)\*\*$|^__([\s\S]+)__$/);
    if (!match) {
      return <span key={`${keyPrefix}-${index}`}>{part}</span>;
    }

    return (
      <strong key={`${keyPrefix}-${index}`} className="font-semibold text-foreground">
        {match[1] ?? match[2]}
      </strong>
    );
  });
}
