import { ArrowRight, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { ArticleHashOpener } from "@/components/content/ArticleHashOpener";
import { ArticleTools } from "@/components/content/ArticleTools";
import { CitationList } from "@/components/content/CitationList";
import { TopicCard } from "@/components/content/TopicCard";
import { VerseCard } from "@/components/content/VerseCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { categoryIconMap, fallbackCategoryIcon } from "@/lib/category-icons";
import {
  formatArabicQuranReference,
  quranQuoteSegmentsInLine,
  quranReferenceForQuoteSegment,
} from "@/lib/quran";
import type { ArticleTreeBreadcrumb } from "@/lib/content";
import type {
  Article,
  ArticleKeyScripture,
  BibleDisplayVerse,
  Citation,
  QuranDisplayVerse,
  SiteCategory,
} from "@/types/content";
import type { ArticlePlaybackNavigation } from "@/types/domain";

type ArticleLayoutProps = {
  article: Article;
  category: SiteCategory;
  citations: Citation[];
  relatedArticles: Article[];
  tocItems?: Array<{
    id: string;
    title: string;
  }>;
  /** Use the claims-style accordion presentation for selected long-form articles. */
  collapsibleSections?: boolean;
  /** Public navigation path when the article is opened from a research tree. */
  treeBreadcrumbs?: ArticleTreeBreadcrumb[];
  /** Foundational passages selected for this article and quoted in full. */
  keyScripture?: ArticleKeyScripture;
  playbackNavigation?: ArticlePlaybackNavigation;
  children?: ReactNode;
};

export function ArticleLayout({
  article,
  category,
  citations,
  relatedArticles,
  tocItems,
  collapsibleSections = false,
  treeBreadcrumbs = [],
  keyScripture = { quranVerses: [], bibleVerses: [] },
  playbackNavigation = {},
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
  const scriptureBySection = assignKeyScriptureToSections(
    visibleSections,
    keyScripture,
  );

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
              <ArticleTools
                articleSlug={article.slug}
                articleTitle={article.title}
                articleSubtitle={article.subtitle}
                previous={playbackNavigation.previous}
                next={playbackNavigation.next}
                playlist={playbackNavigation.playlist}
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <article className="min-w-0">
              <div
                data-article-readable-content
                className={collapsibleSections ? "mt-2 space-y-3" : "mt-8 space-y-10"}
              >
                {children ??
                  visibleSections.map((section) => (
                    <ArticleSectionBlock
                      key={section.id}
                      article={article}
                      sectionId={section.id}
                      collapsible={collapsibleSections}
                      sectionScripture={scriptureBySection.get(section.id)}
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
  sectionScripture,
}: {
  article: Article;
  sectionId: string;
  collapsible: boolean;
  sectionScripture?: SectionScripture;
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
        <h2
          data-read-aloud-block
          className="mt-2 select-text text-lg leading-snug sm:mt-3 sm:text-xl"
        >
          {section.title}
        </h2>
        <ArticleSectionBody body={section.body} keyScripture={sectionScripture?.all} />
        <KeyScripturePassages keyScripture={sectionScripture?.cards} />
      </section>
    );
  }

  return (
    <details
      id={section.id}
      className="group scroll-mt-24 rounded-lg border border-border bg-card shadow-soft"
      open={section.kind === "summary"}
    >
      <summary
        data-read-aloud-block
        className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 [&::-webkit-details-marker]:hidden"
      >
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
        <ArticleSectionBody body={section.body} keyScripture={sectionScripture?.all} />
        <KeyScripturePassages keyScripture={sectionScripture?.cards} />
      </div>
    </details>
  );
}

function ArticleSectionBody({
  body,
  keyScripture,
}: {
  body: string;
  keyScripture?: ArticleKeyScripture;
}) {
  const lines = body.split(/\r?\n/);

  return (
    <div
      data-read-aloud-container
      className="mt-3 select-text whitespace-pre-wrap text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7"
    >
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
                        className="block text-right text-xl leading-loose text-accent sm:text-2xl"
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
            <span
              key={`bullet-${index}`}
              className="flex gap-2 pl-1"
            >
              <span aria-hidden="true" className="text-accent">•</span>
              <span>{renderLineWithScripture(item, `${index}-bullet`, keyScripture)}</span>
            </span>
          );
        }

        if (isBodySubheading(lines, index)) {
          return (
            <h3
              key={`subheading-${index}`}
              className="mt-5 block font-semibold leading-snug text-foreground first:mt-0 sm:text-lg"
            >
              {renderInlineMarkdown(line.trim(), `${index}-subheading`)}
            </h3>
          );
        }

        return (
          <span key={`line-${index}`}>
            {renderLineWithScripture(line, `${index}-line`, keyScripture)}
            {index < lines.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </div>
  );
}

function renderLineWithScripture(
  line: string,
  keyPrefix: string,
  keyScripture?: ArticleKeyScripture,
): ReactNode {
  const passages = [
    ...(keyScripture?.quranVerses.map((verse) => verse.translation) ?? []),
    ...(keyScripture?.bibleVerses.map((verse) => verse.text) ?? []),
  ]
    .filter((passage) => passage.length >= 30)
    .map((passage) => ({ passage, start: line.indexOf(passage) }))
    .filter((match) => match.start >= 0)
    .sort((left, right) => left.start - right.start);

  if (passages.length === 0) {
    return renderInlineMarkdown(line, keyPrefix);
  }

  const output: ReactNode[] = [];
  let cursor = 0;
  passages.forEach(({ passage, start }, index) => {
    if (start < cursor) {
      return;
    }
    output.push(
      ...([] as ReactNode[]).concat(
        renderInlineMarkdown(line.slice(cursor, start), `${keyPrefix}-${index}-before`),
      ),
    );
    output.push(
      <span key={`${keyPrefix}-${index}-scripture`} className="text-accent">
        {renderInlineMarkdown(passage, `${keyPrefix}-${index}-passage`)}
      </span>,
    );
    cursor = start + passage.length;
  });
  output.push(
    ...([] as ReactNode[]).concat(
      renderInlineMarkdown(line.slice(cursor), `${keyPrefix}-after`),
    ),
  );
  return output;
}

function isBodySubheading(lines: string[], index: number): boolean {
  const line = lines[index]?.trim() ?? "";
  if (/^(?:\*\*[^*]+\*\*|__[^_]+__)$/.test(line)) {
    return true;
  }
  if (!line || line.length > 100 || /[.!?:;,]$/.test(line)) {
    return false;
  }
  if (/^(?:[-*#>]|Qur(?:an|'an)|Surah|Bible|Hadith|Matthew|Mark|Luke|John|Acts|Romans|Genesis|Exodus|Deuteronomy|Psalm|Isaiah|Jeremiah)\b/i.test(line)) {
    return false;
  }
  if (/^["'“‘(\d]|[\u0600-\u06ff]/u.test(line)) {
    return false;
  }
  const words = line.replace(/\*\*|__/g, "").split(/\s+/);
  if (words.length < 2 || words.length > 12 || !/^[A-Z]/.test(words[0] ?? "")) {
    return false;
  }
  const previousIsBlank = index === 0 || (lines[index - 1]?.trim().length ?? 0) === 0;
  const nextHasBody = (lines[index + 1]?.trim().length ?? 0) > 0;
  return previousIsBlank && nextHasBody;
}

function KeyScripturePassages({
  keyScripture,
}: {
  keyScripture?: ArticleKeyScripture;
}) {
  const verses = [
    ...(keyScripture?.quranVerses ?? []),
    ...(keyScripture?.bibleVerses ?? []),
  ];

  if (verses.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase text-accent sm:text-sm">
        Key passage{verses.length === 1 ? "" : "s"}
      </p>
      <div className="mt-3 grid gap-4 xl:grid-cols-2">
        {verses.map((verse) => (
          <VerseCard
            key={`${verse.scripture}-${verse.reference}`}
            verse={verse}
            className="shadow-none"
          />
        ))}
      </div>
    </div>
  );
}

function assignKeyScriptureToSections(
  sections: Article["sections"],
  keyScripture: ArticleKeyScripture,
): Map<string, SectionScripture> {
  const assignments = new Map<string, SectionScripture>();
  const fallbackSection =
    sections.find((section) => section.kind === "scripture") ??
    sections.find((section) => section.kind !== "summary") ??
    sections[0];

  const assign = (
    verse: QuranDisplayVerse | BibleDisplayVerse,
    scripture: "quran" | "bible",
  ) => {
    const target =
      sections.find((section) =>
        textMentionsScriptureReference(
          `${section.title}\n${section.body}`,
          verse.reference,
        ),
      ) ?? fallbackSection;
    if (!target) {
      return;
    }
    const current = assignments.get(target.id) ?? {
      all: { quranVerses: [], bibleVerses: [] },
      cards: { quranVerses: [], bibleVerses: [] },
    };
    if (scripture === "quran") {
      current.all.quranVerses.push(verse as QuranDisplayVerse);
      if (!passageAlreadyQuoted(target.body, verse)) {
        current.cards.quranVerses.push(verse as QuranDisplayVerse);
      }
    } else {
      current.all.bibleVerses.push(verse as BibleDisplayVerse);
      if (!passageAlreadyQuoted(target.body, verse)) {
        current.cards.bibleVerses.push(verse as BibleDisplayVerse);
      }
    }
    assignments.set(target.id, current);
  };

  keyScripture.quranVerses.forEach((verse) => assign(verse, "quran"));
  keyScripture.bibleVerses.forEach((verse) => assign(verse, "bible"));
  return assignments;
}

type SectionScripture = {
  all: ArticleKeyScripture;
  cards: ArticleKeyScripture;
};

function textMentionsScriptureReference(
  text: string,
  reference: string,
): boolean {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ");
  const normalizedText = normalize(text);
  const normalizedReference = normalize(reference);
  if (normalizedText.includes(normalizedReference)) {
    return true;
  }

  const quranMatch = normalizedReference.match(/^quran (\d+):(\d+)(?:-(\d+))?$/);
  if (quranMatch) {
    const [, surah, selectedStart, selectedEnd = selectedStart] = quranMatch;
    for (const cited of normalizedText.matchAll(
      new RegExp(`\\b${surah}:(\\d+)(?:-(\\d+))?\\b`, "g"),
    )) {
      const citedStart = Number(cited[1]);
      const citedEnd = Number(cited[2] ?? cited[1]);
      if (
        citedStart <= Number(selectedStart) &&
        citedEnd >= Number(selectedEnd)
      ) {
        return true;
      }
    }
    return false;
  }

  const bibleMatch = normalizedReference.match(
    /^(.+?) (\d+):(\d+)(?:-(\d+))?$/,
  );
  if (!bibleMatch) {
    return false;
  }
  const [, book, chapter, selectedStart, selectedEnd = selectedStart] =
    bibleMatch;
  const escapedBook = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const cited of normalizedText.matchAll(
    new RegExp(
      `\\b${escapedBook} ${chapter}:(\\d+)(?:-(\\d+))?\\b`,
      "g",
    ),
  )) {
    const citedStart = Number(cited[1]);
    const citedEnd = Number(cited[2] ?? cited[1]);
    if (citedStart <= Number(selectedStart) && citedEnd >= Number(selectedEnd)) {
      return true;
    }
  }
  return false;
}

function passageAlreadyQuoted(
  body: string,
  verse: QuranDisplayVerse | BibleDisplayVerse,
): boolean {
  const normalize = (value: string) =>
    value.normalize("NFC").replace(/[\s“”‘’"']/g, "").toLowerCase();
  const normalizedBody = normalize(body);
  if (verse.scripture === "quran") {
    return (
      normalize(verse.arabic).length > 20 &&
      normalizedBody.includes(normalize(verse.arabic)) &&
      normalizedBody.includes(normalize(verse.translation))
    );
  }
  return normalize(verse.text).length > 30 && normalizedBody.includes(normalize(verse.text));
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|__[\s\S]+?__|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={`${keyPrefix}-${index}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          {linkMatch[1]}
        </a>
      );
    }

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
