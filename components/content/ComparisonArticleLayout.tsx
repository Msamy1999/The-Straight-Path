import { Callout } from "@/components/content/Callout";
import { ComparisonBlock } from "@/components/content/ComparisonBlock";
import { TopicCard } from "@/components/content/TopicCard";
import { VerseCard } from "@/components/content/VerseCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { categoryIconMap, fallbackCategoryIcon } from "@/lib/category-icons";
import type {
  Article,
  Citation,
  ComparisonArticle,
  SiteCategory,
} from "@/types/content";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import type { ArticleTreeBreadcrumb } from "@/lib/content";
import type { ArticlePlaybackNavigation } from "@/types/domain";

type ComparisonArticleLayoutProps = {
  article: Article;
  category: SiteCategory;
  comparison: ComparisonArticle;
  citations: Citation[];
  relatedArticles: Article[];
  treeBreadcrumbs?: ArticleTreeBreadcrumb[];
  playbackNavigation?: ArticlePlaybackNavigation;
};

export function ComparisonArticleLayout({
  article,
  category,
  comparison,
  citations,
  relatedArticles,
  treeBreadcrumbs,
  playbackNavigation,
}: ComparisonArticleLayoutProps) {
  const CategoryIcon = categoryIconMap[category.icon] ?? fallbackCategoryIcon;
  return (
    <ArticleLayout
      article={article}
      category={category}
      citations={citations}
      relatedArticles={relatedArticles}
      treeBreadcrumbs={treeBreadcrumbs}
      playbackNavigation={playbackNavigation}
      tocItems={[
        { id: "main-question", title: "Main question" },
        { id: "scripture-preview", title: "Scripture preview" },
        { id: "comparison", title: "Perspectives" },
        { id: "historical-context", title: "Historical context" },
        { id: "interpretations", title: "Interpretation and response" },
        { id: "key-differences", title: "Key differences" },
        { id: "common-objections", title: "Common objections" },
        { id: "respectful-conclusion", title: "Respectful conclusion" },
        { id: "sources", title: "Sources" },
        { id: "related-topics", title: "Related topics" },
      ]}
    >
      <section id="main-question" className="scroll-mt-20">
        <div data-read-aloud-block>
        <PageHeader
          titleAs="h2"
          eyebrow="Main question"
          title={comparison.mainQuestion}
        />
        </div>
      </section>

      <section id="scripture-preview" className="scroll-mt-20">
        <div data-read-aloud-block>
        <PageHeader
          titleAs="h2"
          eyebrow="Scripture preview"
          title="Key passages"
          subtitle="Read the relevant passages before weighing the interpretations offered below."
        />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {comparison.quranVerses.map((verse) => (
            <VerseCard key={`${verse.reference}-${verse.translator}`} verse={verse} />
          ))}
          {comparison.bibleVerses.map((verse) => (
            <VerseCard key={`${verse.reference}-${verse.version}`} verse={verse} />
          ))}
        </div>
      </section>

      <section id="comparison" className="scroll-mt-20">
        <ComparisonBlock
          title="Quranic and Biblical perspectives"
          intro="The central passages and the main ways Muslims and Christians understand them."
          left={{
            label: "Quranic perspective",
            title: "The Quranic perspective",
            children: comparison.quranicPerspective,
          }}
          right={{
            label: "Biblical perspective",
            title: "The Biblical perspective",
            children: comparison.biblicalPerspective,
          }}
        />
      </section>

      <section id="historical-context" className="scroll-mt-20">
        <div data-read-aloud-block>
        <PageHeader
          titleAs="h2"
          eyebrow="Historical context"
          title="Context before conclusions"
          subtitle={comparison.historicalContext}
        />
        </div>
      </section>

      <section id="interpretations" className="scroll-mt-20">
        <ComparisonBlock
          title="Interpretation and response"
          left={{
            label: "Christian interpretation",
            title: "Christian interpretation",
            children: comparison.christianInterpretation,
          }}
          right={{
            label: "Islamic response",
            title: "Islamic response",
            children: comparison.islamicResponse,
          }}
        />
      </section>

      <section id="key-differences" className="scroll-mt-20">
        <div data-read-aloud-block>
        <PageHeader
          titleAs="h2"
          eyebrow="Key differences"
          title="Key differences"
          subtitle="The central differences between the two perspectives."
        />
        </div>
        <div className="mt-5 grid gap-3">
          {comparison.keyDifferences.map((difference) => (
            <Card
              key={difference}
              data-read-aloud-block
              className="p-4 text-sm leading-7 text-muted-foreground"
            >
              {difference}
            </Card>
          ))}
        </div>
      </section>

      <section id="common-objections" className="scroll-mt-20">
        <div data-read-aloud-block>
        <PageHeader
          titleAs="h2"
          eyebrow="Common objections"
          title="Common questions"
          subtitle="Questions readers often raise about this comparison."
        />
        </div>
        <div className="mt-5 space-y-4">
          {comparison.commonObjections.map((item) => (
            <Card key={item.objection} data-read-aloud-block className="p-4">
              <h3 className="select-text text-lg leading-snug">{item.objection}</h3>
              <p className="mt-2 select-text text-sm text-muted-foreground">{item.response}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="respectful-conclusion" className="scroll-mt-20" data-read-aloud-block>
        <Callout type="respectful-reminder" title="Respectful conclusion">
          {comparison.respectfulConclusion}
        </Callout>
      </section>

      <section
        id="related-topics"
        className="scroll-mt-20"
        data-read-aloud-block
        data-read-aloud-exclude
      >
        <PageHeader
          titleAs="h2"
          eyebrow="Related topics"
          title="Further study paths"
          subtitle="These topics connect the comparison with broader categories."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparison.relatedTopics.map((topic) => (
            <TopicCard
              key={topic}
              title={topic}
              description="Explore this related topic in the wider library."
              href={category.href}
              icon={CategoryIcon}
              label="Related topic"
              meta="Related topic"
            />
          ))}
        </div>
      </section>
    </ArticleLayout>
  );
}
