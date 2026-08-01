/**
 * The content seam. Every page and server component reads content through
 * these helpers — never from data files or the database directly.
 *
 * Backend today: Payload CMS via its Local API (in-process, no HTTP), with
 * documents mapped back to the React-free domain types in types/domain.ts.
 * Site structure (categories, navigation, home content, research trees)
 * deliberately stays code-defined in data/ — see CONTENT-EDITING.md.
 */
import { getPayload, type Payload } from "payload";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import config from "@payload-config";
import { atheismAgnosticismTree } from "@/data/atheism-agnosticism-tree";
import { claimsAgainstIslamTree } from "@/data/claims-against-islam";
import {
  christianLearningPath,
  comparisonMethods,
  featuredResearchCards,
  mainPaths,
} from "@/data/home";
import { islamChristianityBranches } from "@/data/islam-christianity-tree";
import { islamOverviewTree } from "@/data/islam-overview-tree";
import { peopleOfPalestineTree } from "@/data/people-of-palestine-tree";
import {
  islamChristianityCategorySlugs,
  learnIslamCategorySlugs,
  siteCategories,
} from "@/data/site";
import type {
  Article,
  ArticleSection,
  BibleDisplayVerse,
  CategorySlug,
  Citation,
  GlossaryTerm,
  QuranDisplayVerse,
  ResearchTreeNode,
  SiteCategory,
  SourceLibraryCategory,
  TopicTag,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Payload client (module-level singleton; Payload caches instances globally)
// ---------------------------------------------------------------------------

let payloadPromise: Promise<Payload> | null = null;

/**
 * Every public page reads the same editorial records. Cache those database
 * reads across requests; Payload's content hooks invalidate this tag whenever
 * an editor saves or deletes content.
 */
export const CONTENT_CACHE_TAG = "library-content";

const contentCacheOptions: { tags: string[]; revalidate: false | number } = {
  tags: [CONTENT_CACHE_TAG],
  // Draft imports run in a separate CLI process, so they cannot invalidate
  // this Next.js process's cache. Do not keep stale content in local dev.
  // Production keeps the tag-based permanent cache for fast page loads.
  revalidate: process.env.NODE_ENV === "development" ? 1 : false,
};

function getClient(): Promise<Payload> {
  payloadPromise ??= getPayload({ config });
  return payloadPromise;
}

// ---------------------------------------------------------------------------
// Document → domain mappers (Payload returns null for empty optional fields;
// domain types use undefined)
// ---------------------------------------------------------------------------

function opt<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function citationKeys(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      typeof item === "object" && item !== null && "citationKey" in item
        ? String((item as { citationKey: unknown }).citationKey)
        : typeof item === "string" || typeof item === "number"
          ? String(item)
          : undefined,
    )
    .filter((key): key is string => Boolean(key));
}

type ArticleDoc = {
  slug: string;
  title: string;
  subtitle: string;
  category: CategorySlug;
  audienceLevel: Article["audienceLevel"];
  summary: string;
  tags?: TopicTag[] | null;
  status: Article["status"];
  lastUpdated: string;
  sections?:
    | {
        sectionId: string;
        title: string;
        kind: ArticleSection["kind"];
        body: string;
        citations?: unknown;
      }[]
    | null;
  citations?: unknown;
  relatedArticles?: unknown;
};

function mapArticle(doc: ArticleDoc): Article {
  return {
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.subtitle,
    category: doc.category,
    audienceLevel: doc.audienceLevel,
    summary: doc.summary,
    tags: doc.tags ?? [],
    status: doc.status,
    lastUpdated: doc.lastUpdated.slice(0, 10),
    sections: (doc.sections ?? []).map((section) => ({
      id: section.sectionId,
      title: section.title,
      kind: section.kind,
      body: section.body,
      citationIds: citationKeys(section.citations),
    })),
    citations: citationKeys(doc.citations),
    relatedArticles: Array.isArray(doc.relatedArticles)
      ? doc.relatedArticles
          .map((related) =>
            typeof related === "object" && related !== null && "slug" in related
              ? String((related as { slug: unknown }).slug)
              : typeof related === "string" || typeof related === "number"
                ? String(related)
              : undefined,
          )
          .filter((slug): slug is string => Boolean(slug))
      : [],
  };
}

type CitationDoc = {
  id?: string | number;
  citationKey: string;
  type: Citation["type"];
  title: string;
  author?: string | null;
  publisher?: string | null;
  year?: number | null;
  url?: string | null;
  note?: string | null;
};

function mapCitation(doc: CitationDoc): Citation {
  return {
    id: doc.citationKey,
    type: doc.type,
    title: doc.title,
    author: opt(doc.author),
    publisher: opt(doc.publisher),
    year: opt(doc.year),
    url: opt(doc.url),
    note: opt(doc.note),
  };
}

// ---------------------------------------------------------------------------
// Categories and site structure (code-defined)
// ---------------------------------------------------------------------------

function findCategory(slug: CategorySlug): SiteCategory {
  return (
    siteCategories.find((category) => category.slug === slug) ??
    siteCategories[0]
  );
}

export async function getSiteCategories(): Promise<SiteCategory[]> {
  return siteCategories;
}

export async function getCategoryBySlug(
  slug: CategorySlug,
): Promise<SiteCategory> {
  return findCategory(slug);
}

export async function getRelatedCategories(
  category: SiteCategory,
): Promise<SiteCategory[]> {
  return category.relatedSlugs.map(findCategory);
}

export async function getLearnIslamCategories(): Promise<SiteCategory[]> {
  return learnIslamCategorySlugs.map(findCategory);
}

export function isIslamChristianityCategorySlug(slug: CategorySlug): boolean {
  return (islamChristianityCategorySlugs as readonly CategorySlug[]).includes(
    slug,
  );
}

// ---------------------------------------------------------------------------
// Homepage data (code-defined)
// ---------------------------------------------------------------------------

export async function getHomeData() {
  return {
    mainPaths,
    christianLearningPath,
    comparisonMethods,
    featuredResearchCards,
  };
}

// ---------------------------------------------------------------------------
// Research trees (code-defined, composed with categories)
// ---------------------------------------------------------------------------

export type ResearchTreeSection =
  | "islam-overview"
  | "islam-christianity"
  | "atheism-agnosticism"
  | "people-of-palestine";

function composeIslamChristianityTree(): ResearchTreeNode[] {
  const branchBySlug = new Map(
    islamChristianityBranches.map((branch) => [branch.slug, branch]),
  );

  const topicsFor = (slug: CategorySlug): ResearchTreeNode[] =>
    branchBySlug.get(slug)?.children ?? [];

  const withoutArticle = (nodes: ResearchTreeNode[], href: string) =>
    nodes.filter((node) => node.href !== href);

  const folder = (
    id: string,
    title: string,
    description: string,
    children: ResearchTreeNode[],
    href?: string,
    defaultOpen = false,
  ): ResearchTreeNode => ({
    id,
    title,
    description,
    href,
    children,
    defaultOpen,
  });

  const jesusTopics = withoutArticle(
    withoutArticle(topicsFor("jesus-in-islam-and-christianity"), "/articles/who-is-jesus"),
    "/articles/incarnation-explained",
  );
  const theologyTopics = withoutArticle(
    topicsFor("tawhid-and-the-trinity"),
    "/articles/did-jesus-worship-god",
  );
  const scriptureTopics = withoutArticle(
    topicsFor("preservation"),
    "/articles/gospel-authorship-and-dating",
  );
  const difficultQuestionTopics = withoutArticle(
    topicsFor("difficult-questions"),
    "/articles/original-sin-vs-personal-responsibility",
  );

  return [
    folder(
      "comparison-start",
      "Start with the main questions",
      "The core questions readers usually need before moving into deeper comparison.",
      topicsFor("the-quran-and-the-bible"),
      "/the-quran-and-the-bible",
      true,
    ),
    folder(
      "jesus-and-god",
      "Jesus and the nature of God",
      "Study Jesus, Tawhid, the Trinity, worship, and the Incarnation in one connected path.",
      [...jesusTopics, ...theologyTopics],
      "/jesus-in-islam-and-christianity",
    ),
    folder(
      "scripture-and-preservation",
      "Scripture, transmission, and preservation",
      "Questions about revelation, manuscripts, compilation, canon, and textual history.",
      scriptureTopics,
      "/preservation",
    ),
    folder(
      "history-and-evidence",
      "History and historical evidence",
      "Early Christianity and Islam alongside historical and archaeological study.",
      [
        ...topicsFor("religious-history"),
        ...topicsFor("historical-evidence"),
      ],
      "/religious-history",
    ),
    folder(
      "salvation-ethics-and-society",
      "Salvation, ethics, and society",
      "Purpose, sin, forgiveness, final judgment, conflict, justice, and social responsibility.",
      [
        ...topicsFor("salvation-and-purpose-of-life"),
        ...topicsFor("war-and-violence"),
      ],
    ),
    folder(
      "women",
      "Women",
      "A dedicated study branch for women, family, dignity, and religious interpretation.",
      topicsFor("women"),
      "/women",
    ),
    folder(
      "prophecy-and-natural-world",
      "Prophecy, science, and the natural world",
      "Evidence claims that need especially careful interpretation and sourcing.",
      [...topicsFor("prophecies"), ...topicsFor("scientific-signs")],
    ),
    folder(
      "contradictions-and-difficult-questions",
      "Contradictions and difficult questions",
      "A separate space for hard passages, apparent contradictions, and theological objections.",
      difficultQuestionTopics,
      "/difficult-questions",
    ),
  ];
}

export async function getResearchTree(
  section: ResearchTreeSection,
): Promise<ResearchTreeNode[]> {
  switch (section) {
    case "islam-overview":
      return islamOverviewTree;
    case "islam-christianity":
      return composeIslamChristianityTree();
    case "atheism-agnosticism":
      return atheismAgnosticismTree;
    case "people-of-palestine":
      return peopleOfPalestineTree;
  }
}

/** Complete, navigable map shown on the landing page. */
export async function getFullLibraryTree(): Promise<ResearchTreeNode[]> {
  return [
    {
      id: "learn-islam",
      title: "Learn Islam",
      description: "Foundations, belief, worship, and why Islam.",
      href: "/islam-overview",
      tag: "Start here",
      defaultOpen: true,
      children: islamOverviewTree,
    },
    {
      id: "islam-christianity",
      title: "Islam & Christianity",
      description:
        "Jesus, scripture, preservation, theology, history, and difficult questions.",
      href: "/islam-christianity",
      tag: "Compare",
      defaultOpen: true,
      // Keep the complete map available without opening 92 study topics at once.
      children: composeIslamChristianityTree().map((branch) => ({
        ...branch,
        defaultOpen: false,
      })),
    },
    {
      id: "atheism-agnosticism",
      title: "Atheism & Agnosticism",
      description: "A guided sequence on belief, doubt, meaning, and revelation.",
      href: "/atheism-agnosticism",
      tag: "Questions",
      defaultOpen: true,
      children: atheismAgnosticismTree,
    },
    {
      id: "claims-against-islam",
      title: "Claims Against Islam",
      description:
        "Common criticisms, careful responses, and links for deeper study.",
      href: "/claims-against-islam",
      tag: "Responses",
      defaultOpen: true,
      children: claimsAgainstIslamTree,
    },
    {
      id: "people-of-palestine",
      title: "People of Palestine",
      description: "Human-centred, source-aware draft study topics.",
      href: "/people-of-palestine",
      tag: "Drafts",
      status: "draft",
      defaultOpen: true,
      children: peopleOfPalestineTree,
    },
    {
      id: "research-tools",
      title: "Research tools",
      description: "Definitions, source standards, and beginner questions.",
      defaultOpen: true,
      children: [
        {
          id: "method",
          title: "How we study",
          description: "The library's source, correction, and comparison standards.",
          href: "/method",
        },
        {
          id: "common-questions",
          title: "Common Questions",
          description: "Short answers and links to deeper study.",
          href: "/questions",
        },
        {
          id: "glossary",
          title: "Glossary",
          description: "Definitions for Arabic, theological, and historical terms.",
          href: "/glossary",
        },
        {
          id: "sources",
          title: "Source Library",
          description: "Translations, primary texts, and citation status.",
          href: "/sources",
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Articles (Payload-backed)
// ---------------------------------------------------------------------------

export type GetArticlesOptions = {
  /**
   * Include non-published articles. Defaults to true while the entire
   * library is placeholder drafts; flip the default (or pass false at call
   * sites) once real verified content starts publishing.
   */
  includeDrafts?: boolean;
};

// Full article bodies can exceed Next.js' 2 MB persistent data-cache limit.
// Request-level memoisation still prevents duplicate reads during a render
// without attempting to serialize the complete library into the data cache.
const getCachedArticleDocs = cache(
  async (includeDrafts: boolean) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "articles",
      where: includeDrafts ? {} : { status: { equals: "published" } },
      sort: "createdAt",
      pagination: false,
      depth: 0,
    });

    return result.docs;
  },
);

export async function getArticles(
  options: GetArticlesOptions = {},
): Promise<Article[]> {
  const { includeDrafts = true } = options;

  return (await getCachedArticleDocs(includeDrafts)).map((doc) =>
    mapArticle(doc as unknown as ArticleDoc),
  );
}

const getCachedArticlesByCategory = cache(
  async (category: CategorySlug, includeDrafts: boolean) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "articles",
      where: {
        and: [
          { category: { equals: category } },
          ...(includeDrafts ? [] : [{ status: { equals: "published" } }]),
        ],
      },
      sort: "createdAt",
      pagination: false,
      depth: 0,
    });

    return result.docs;
  },
);

export async function getArticlesByCategory(
  category: CategorySlug,
  options: GetArticlesOptions = {},
): Promise<Article[]> {
  const { includeDrafts = true } = options;

  return (await getCachedArticlesByCategory(category, includeDrafts)).map((doc) =>
    mapArticle(doc as unknown as ArticleDoc),
  );
}

const getCachedArticleDocBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "articles",
      where: { slug: { equals: slug } },
      limit: 1,
      // Related articles and citations are fetched separately. Avoid
      // expanding their full bodies while opening one long article.
      depth: 0,
    });

    return result.docs[0] ?? null;
  },
  ["article-by-slug"],
  contentCacheOptions,
);

// React memoisation also avoids fetching an article twice for its page and metadata.
export const getArticleBySlug = cache(async (slug: string) => {
  const doc = await getCachedArticleDocBySlug(slug);
  return doc ? mapArticle(doc as unknown as ArticleDoc) : undefined;
});

const getCachedRelatedArticleDocs = unstable_cache(
  async (references: string[]) => {
    const payload = await getClient();
    const ids = references.filter((reference) => /^\d+$/.test(reference));
    const slugs = references.filter((reference) => !/^\d+$/.test(reference));
    const clauses = [
      ...(ids.length > 0 ? [{ id: { in: ids } }] : []),
      ...(slugs.length > 0 ? [{ slug: { in: slugs } }] : []),
    ];
    const result = await payload.find({
      collection: "articles",
      where: (clauses.length === 1 ? clauses[0] : { or: clauses }) as never,
      pagination: false,
      depth: 0,
    });

    return result.docs;
  },
  ["related-articles"],
  contentCacheOptions,
);

export async function getRelatedArticles(
  articleOrSlug: Article | string,
): Promise<Article[]> {
  const article =
    typeof articleOrSlug === "string"
      ? await getArticleBySlug(articleOrSlug)
      : articleOrSlug;

  if (!article || article.relatedArticles.length === 0) {
    return [];
  }

  const docs = await getCachedRelatedArticleDocs(
    [...article.relatedArticles].sort(),
  );

  const byReference = new Map<string, Article>();
  for (const doc of docs) {
    const mapped = mapArticle(doc as unknown as ArticleDoc);
    byReference.set(mapped.slug, mapped);
    if ("id" in doc) {
      byReference.set(String((doc as { id: unknown }).id), mapped);
    }
  }

  // Preserve the order defined on the article record.
  return article.relatedArticles
    .map((reference) => byReference.get(reference))
    .filter((related): related is Article => Boolean(related));
}

const getCachedArticleSlugs = cache(async (includeDrafts: boolean) => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "articles",
    where: includeDrafts ? {} : { status: { equals: "published" } },
    sort: "createdAt",
    pagination: false,
    depth: 0,
    select: { slug: true },
  });

  return result.docs
    .map((doc) => (typeof doc.slug === "string" ? doc.slug : undefined))
    .filter((slug): slug is string => Boolean(slug));
});

export async function getArticleSlugs(
  options: GetArticlesOptions = {},
): Promise<string[]> {
  return getCachedArticleSlugs(options.includeDrafts ?? true);
}

// ---------------------------------------------------------------------------
// Citations (Payload-backed)
// ---------------------------------------------------------------------------

const getCachedCitationDocs = unstable_cache(
  async (ids: string[]) => {
    if (ids.length === 0) {
      return [];
    }

    const payload = await getClient();
    const result = await payload.find({
      collection: "citations",
      where: {
        or: [{ citationKey: { in: ids } }, { id: { in: ids } }],
      },
      pagination: false,
      depth: 0,
    });

    return result.docs;
  },
  ["citations-by-key"],
  contentCacheOptions,
);

export async function getCitationsByIds(ids: string[]): Promise<Citation[]> {
  if (ids.length === 0) {
    return [];
  }

  const docs = await getCachedCitationDocs([...ids].sort());

  const byKey = new Map(
    docs.map((doc) => {
      const mapped = mapCitation(doc as unknown as CitationDoc);
      return [mapped.id, mapped] as const;
    }),
  );
  const byDatabaseId = new Map(
    docs.map((doc) => {
      const mapped = mapCitation(doc as unknown as CitationDoc);
      const databaseId =
        "id" in doc ? String((doc as { id: unknown }).id) : undefined;
      return databaseId ? ([databaseId, mapped] as const) : undefined;
    }).filter((entry): entry is readonly [string, Citation] => Boolean(entry)),
  );

  return ids
    .map((id) => byKey.get(id) ?? byDatabaseId.get(id))
    .filter((citation): citation is Citation => Boolean(citation));
}

// ---------------------------------------------------------------------------
// Comparison articles (Payload-backed)
// ---------------------------------------------------------------------------

type VerseDocBase = {
  reference: string;
  notes?: string | null;
};

type QuranVerseDoc = VerseDocBase & {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  translation: string;
  translator: string;
  arabicTafsirNote?: string | null;
};

type BibleVerseDoc = VerseDocBase & {
  book: string;
  chapter: number;
  verse: string;
  text: string;
  arabicText?: string | null;
  arabicSource?: string | null;
  version: string;
};

function mapQuranVerse(doc: QuranVerseDoc): QuranDisplayVerse {
  return {
    scripture: "quran",
    surahName: doc.surahName,
    surahNumber: doc.surahNumber,
    ayahNumber: doc.ayahNumber,
    arabic: doc.arabic,
    translation: doc.translation,
    translator: doc.translator,
    reference: doc.reference,
    arabicTafsirNote: opt(doc.arabicTafsirNote),
    notes: opt(doc.notes),
  };
}

function mapBibleVerse(doc: BibleVerseDoc): BibleDisplayVerse {
  return {
    scripture: "bible",
    book: doc.book,
    chapter: doc.chapter,
    verse: doc.verse,
    text: doc.text,
    arabicText: opt(doc.arabicText),
    arabicSource: opt(doc.arabicSource),
    version: doc.version,
    reference: doc.reference,
    notes: opt(doc.notes),
  };
}

const getCachedComparisonArticleDoc = unstable_cache(
  async (slug: string) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "comparison-articles",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });

    return result.docs[0] ?? null;
  },
  ["comparison-article-by-slug"],
  contentCacheOptions,
);

export const getComparisonArticleBySlug = cache(async (slug: string) => {
  const doc = (await getCachedComparisonArticleDoc(slug)) as
    | undefined
    | {
        slug: string;
        mainQuestion: string;
        beginnerSummary: string;
        quranicPerspective: string;
        biblicalPerspective: string;
        historicalContext: string;
        christianInterpretation: string;
        islamicResponse: string;
        keyDifferences?: { difference: string }[] | null;
        commonObjections?: { objection: string; response: string }[] | null;
        respectfulConclusion: string;
        quranVerses?: unknown;
        bibleVerses?: unknown;
        sources?: unknown;
        relatedTopics?: { topic: string }[] | null;
      };

  if (!doc) {
    return undefined;
  }

  return {
    slug: doc.slug,
    mainQuestion: doc.mainQuestion,
    beginnerSummary: doc.beginnerSummary,
    quranicPerspective: doc.quranicPerspective,
    biblicalPerspective: doc.biblicalPerspective,
    historicalContext: doc.historicalContext,
    christianInterpretation: doc.christianInterpretation,
    islamicResponse: doc.islamicResponse,
    keyDifferences: (doc.keyDifferences ?? []).map((item) => item.difference),
    commonObjections: (doc.commonObjections ?? []).map((item) => ({
      objection: item.objection,
      response: item.response,
    })),
    respectfulConclusion: doc.respectfulConclusion,
    quranVerses: Array.isArray(doc.quranVerses)
      ? (doc.quranVerses as QuranVerseDoc[])
          .filter((verse) => typeof verse === "object" && verse !== null)
          .map(mapQuranVerse)
      : [],
    bibleVerses: Array.isArray(doc.bibleVerses)
      ? (doc.bibleVerses as BibleVerseDoc[])
          .filter((verse) => typeof verse === "object" && verse !== null)
          .map(mapBibleVerse)
      : [],
    sources: citationKeys(doc.sources),
    relatedTopics: (doc.relatedTopics ?? []).map((item) => item.topic),
  };
});

// ---------------------------------------------------------------------------
// Glossary (Payload-backed)
// ---------------------------------------------------------------------------

const getCachedGlossaryDocs = unstable_cache(
  async (category: TopicTag | null) => {
    const payload = await getClient();
    const result = await payload.find({
      collection: "glossary-terms",
      where: category ? { category: { equals: category } } : {},
      sort: "createdAt",
      pagination: false,
      depth: 1,
    });

    return result.docs;
  },
  ["glossary-terms"],
  contentCacheOptions,
);

export async function getGlossaryTerms(
  category?: TopicTag,
): Promise<GlossaryTerm[]> {
  const docs = await getCachedGlossaryDocs(category ?? null);

  return docs.map((doc) => {
    const record = doc as unknown as {
      term: string;
      pronunciation?: string | null;
      definition: string;
      category: TopicTag;
      relatedTerms?: unknown;
      citations?: unknown;
    };

    return {
      term: record.term,
      pronunciation: opt(record.pronunciation),
      definition: record.definition,
      category: record.category,
      relatedTerms: Array.isArray(record.relatedTerms)
        ? record.relatedTerms
            .map((related) =>
              typeof related === "object" && related !== null && "term" in related
                ? String((related as { term: unknown }).term)
                : undefined,
            )
            .filter((term): term is string => Boolean(term))
        : [],
      citations: citationKeys(record.citations),
    };
  });
}

// ---------------------------------------------------------------------------
// Source library (Payload-backed)
// ---------------------------------------------------------------------------

const getCachedSourceLibraryDocs = unstable_cache(
  async () => {
    const payload = await getClient();
    const [categoriesResult, itemsResult] = await Promise.all([
      payload.find({
        collection: "source-library-categories",
        sort: "order",
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: "source-library-items",
        sort: "createdAt",
        pagination: false,
        depth: 0,
      }),
    ]);

    return { categories: categoriesResult.docs, items: itemsResult.docs };
  },
  ["source-library"],
  contentCacheOptions,
);

export async function getSourceLibraryCategories(): Promise<
  SourceLibraryCategory[]
> {
  const sourceLibrary = await getCachedSourceLibraryDocs();
  const categories = sourceLibrary.categories as unknown as {
    id: string | number;
    title: string;
    description: string;
  }[];

  const items = sourceLibrary.items as unknown as {
    id: string | number;
    title: string;
    type: Citation["type"];
    category: string | number | { id: string | number };
    authorOrPublisher?: string | null;
    year?: number | null;
    url?: string | null;
    notes: string;
    status: "pending" | "verified";
  }[];

  return categories.map((category) => ({
    title: category.title,
    description: category.description,
    items: items
      .filter((item) => {
        const categoryId =
          typeof item.category === "object" && item.category !== null
            ? item.category.id
            : item.category;
        return String(categoryId) === String(category.id);
      })
      .map((item) => ({
        id: String(item.id),
        title: item.title,
        type: item.type,
        category: category.title,
        authorOrPublisher: opt(item.authorOrPublisher),
        year: opt(item.year),
        url: opt(item.url),
        notes: item.notes,
        status: item.status,
      })),
  }));
}
