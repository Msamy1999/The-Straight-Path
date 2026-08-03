"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Article, AudienceLevel, SiteCategory, TopicTag } from "@/types/content";

type ArticleSearchProps = {
  articles: Article[];
  categories: SiteCategory[];
  initialQuery?: string;
};

type SearchResult = {
  article: Article;
  matchedSection?: string;
  snippet?: string;
};

const allValue = "all";

export function ArticleSearch({ articles, categories, initialQuery = "" }: ArticleSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(allValue);
  const [audienceLevel, setAudienceLevel] = useState<typeof allValue | AudienceLevel>(
    allValue,
  );
  const [tag, setTag] = useState<typeof allValue | TopicTag>(allValue);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const categoryTitles = useMemo(
    () => new Map(categories.map((item) => [item.slug, item.title])),
    [categories],
  );
  const tags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))).sort(),
    [articles],
  );
  const audienceLevels = useMemo(
    () => Array.from(new Set(articles.map((article) => article.audienceLevel))).sort(),
    [articles],
  );

  const results = useMemo(() => {
    const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const appliesFilters = (article: Article) =>
      (category === allValue || article.category === category) &&
      (audienceLevel === allValue || article.audienceLevel === audienceLevel) &&
      (tag === allValue || article.tags.includes(tag));
    const eligible = articles.filter(appliesFilters);

    if (words.length === 0) {
      return {
        titleMatches: eligible.map((article) => ({ article })),
        contentMatches: [] as SearchResult[],
      };
    }

    const titleMatches = eligible
      .filter((article) => includesAllWords(article.title, words))
      .map((article) => ({ article }));
    const titleSlugs = new Set(titleMatches.map(({ article }) => article.slug));
    const contentMatches = eligible
      .filter((article) => !titleSlugs.has(article.slug))
      .map((article) => findContentMatch(article, words, categoryTitles))
      .filter((result): result is SearchResult => result !== null);

    return { titleMatches, contentMatches };
  }, [articles, audienceLevel, category, categoryTitles, query, tag]);

  const totalResults = results.titleMatches.length + results.contentMatches.length;
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search article titles and text"
            className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Article titles appear first. Results below them show where the search words occur in an article.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FilterSelect label="Category" value={category} onChange={setCategory}>
            <option value={allValue}>All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Audience"
            value={audienceLevel}
            onChange={(value) => setAudienceLevel(value as typeof allValue | AudienceLevel)}
          >
            <option value={allValue}>All levels</option>
            {audienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Tag"
            value={tag}
            onChange={(value) => setTag(value as typeof allValue | TopicTag)}
          >
            <option value={allValue}>All tags</option>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">
        {isSearching ? `Found ${totalResults} matching articles.` : `Showing all ${articles.length} articles.`}
      </p>

      {results.titleMatches.length > 0 ? (
        <SearchResultGroup
          title={isSearching ? "Title matches" : "All articles"}
          results={results.titleMatches}
          categoryTitles={categoryTitles}
        />
      ) : null}

      {results.contentMatches.length > 0 ? (
        <SearchResultGroup
          title="Mentioned in article text"
          results={results.contentMatches}
          categoryTitles={categoryTitles}
        />
      ) : null}

      {totalResults === 0 ? (
        <Card className="p-5 text-center sm:p-6">
          <h2 className="text-lg leading-snug sm:text-xl">No articles found</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:leading-7">
            Try fewer words or choose a broader category.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function SearchResultGroup({
  title,
  results,
  categoryTitles,
}: {
  title: string;
  results: SearchResult[];
  categoryTitles: Map<string, string>;
}) {
  return (
    <section aria-label={title}>
      <h2 className="text-lg leading-snug sm:text-xl">{title}</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {results.map((result) => (
          <SearchResultCard
            key={result.article.slug}
            result={result}
            categoryTitle={categoryTitles.get(result.article.category) ?? result.article.category}
          />
        ))}
      </div>
    </section>
  );
}

function SearchResultCard({
  result,
  categoryTitle,
}: {
  result: SearchResult;
  categoryTitle: string;
}) {
  const { article, matchedSection, snippet } = result;

  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase text-accent">{categoryTitle}</p>
      <h3 className="mt-2 text-lg leading-snug sm:mt-3 sm:text-xl">
        <Link
          href={`/articles/${article.slug}${matchedSection ? `#${matchedSection}` : ""}`}
          className="no-underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {article.title}
        </Link>
      </h3>
      {matchedSection && snippet ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">
          <span className="font-semibold text-foreground">Found in {matchedSection}: </span>
          {snippet}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">
          {article.summary}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {article.tags.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
        <Tag>{article.audienceLevel}</Tag>
      </div>
    </Card>
  );
}

function findContentMatch(
  article: Article,
  words: string[],
  categoryTitles: Map<string, string>,
): SearchResult | null {
  const articleText = [
    article.subtitle,
    article.summary,
    categoryTitles.get(article.category) ?? article.category,
    article.category,
    ...article.tags,
    ...article.sections.flatMap((section) => [section.title, section.body]),
  ].join(" ");

  if (!includesAllWords(articleText, words)) {
    return null;
  }

  const section = article.sections.find((item) =>
    words.some((word) => `${item.title} ${item.body}`.toLocaleLowerCase().includes(word)),
  );
  const text = section ? `${section.title}. ${section.body}` : `${article.subtitle}. ${article.summary}`;

  return {
    article,
    matchedSection: section?.id,
    snippet: excerptAroundMatch(text, words),
  };
}

function includesAllWords(value: string, words: string[]) {
  const normalized = value.toLocaleLowerCase();
  return words.every((word) => normalized.includes(word));
}

function excerptAroundMatch(value: string, words: string[]) {
  const normalized = value.toLocaleLowerCase();
  const index = words
    .map((word) => normalized.indexOf(word))
    .filter((position) => position >= 0)
    .sort((first, second) => first - second)[0] ?? 0;
  const start = Math.max(0, index - 72);
  const end = Math.min(value.length, index + 210);
  return `${start > 0 ? "…" : ""}${value.slice(start, end).replace(/\s+/g, " ").trim()}${end < value.length ? "…" : ""}`;
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </select>
    </label>
  );
}
