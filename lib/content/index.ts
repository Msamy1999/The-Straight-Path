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
import { articleRedirects } from "@/data/article-redirects";
import articleKeyScriptureData from "@/data/article-key-scripture.json";
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
import { cleanEditorialText } from "@/lib/reader-text";
import {
  islamChristianityCategorySlugs,
  learnIslamCategorySlugs,
  siteCategories,
} from "@/data/site";
import type {
  Article,
  ArticleKeyScripture,
  ArticlePlaybackLink,
  ArticlePlaybackNavigation,
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
  // this Next.js process's cache. Admin saves still invalidate immediately;
  // this bounded fallback makes external content-sync changes visible even
  // when the running web process had already warmed its cache.
  revalidate: process.env.NODE_ENV === "development" ? 1 : 300,
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
    title: cleanEditorialText(doc.title),
    subtitle: cleanEditorialText(doc.subtitle),
    category: doc.category,
    audienceLevel: doc.audienceLevel,
    summary: cleanEditorialText(doc.summary),
    tags: doc.tags ?? [],
    status: doc.status,
    lastUpdated: doc.lastUpdated.slice(0, 10),
    sections: (doc.sections ?? [])
      .filter(
        (section) =>
          section.sectionId !== "beginner-summary" &&
          section.title.trim().toLowerCase() !== "beginner summary",
      )
      .map((section) => ({
        id: section.sectionId,
        title: cleanEditorialText(section.title),
        kind: section.kind,
        body: cleanEditorialText(section.body),
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
    title: cleanEditorialText(doc.title),
    author: opt(doc.author),
    publisher: opt(doc.publisher),
    year: opt(doc.year),
    url: opt(doc.url),
    note: opt(doc.note ? cleanEditorialText(doc.note) : undefined),
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

function articleSlugFromHref(href?: string): string | undefined {
  return href?.match(/^\/articles\/([^/?#]+)$/)?.[1];
}

function filterUnavailableArticleLinks<T extends { href?: string }>(
  items: readonly T[],
  availableSlugs: ReadonlySet<string>,
): T[] {
  return items.filter((item) => {
    const slug = articleSlugFromHref(item.href);
    return !slug || availableSlugs.has(slug);
  });
}

function filterResearchTree(
  nodes: readonly ResearchTreeNode[],
  availableSlugs: ReadonlySet<string>,
): ResearchTreeNode[] {
  return nodes.flatMap((node) => {
    const slug = articleSlugFromHref(node.href);
    if (slug && !availableSlugs.has(slug)) return [];
    return [
      {
        ...node,
        children: node.children
          ? filterResearchTree(node.children, availableSlugs)
          : undefined,
      },
    ];
  });
}

export async function getHomeData() {
  const availableSlugs = new Set(await getArticleSlugs());
  return {
    mainPaths,
    christianLearningPath: filterUnavailableArticleLinks(
      christianLearningPath,
      availableSlugs,
    ),
    comparisonMethods,
    featuredResearchCards: filterUnavailableArticleLinks(
      featuredResearchCards,
      availableSlugs,
    ),
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
  let tree: ResearchTreeNode[];
  switch (section) {
    case "islam-overview":
      tree = islamOverviewTree;
      break;
    case "islam-christianity":
      tree = composeIslamChristianityTree();
      break;
    case "atheism-agnosticism":
      tree = atheismAgnosticismTree;
      break;
    case "people-of-palestine":
      tree = peopleOfPalestineTree;
      break;
  }
  return filterResearchTree(tree, new Set(await getArticleSlugs()));
}

/** Complete, navigable map shown on the landing page. */
export async function getFullLibraryTree(): Promise<ResearchTreeNode[]> {
  const tree: ResearchTreeNode[] = [
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
      description:
        "A guided path through Palestinian people, places, history, faith, justice, and responsible action.",
      href: "/people-of-palestine",
      tag: "History",
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
          description: "Standards for evidence, correction, and comparison.",
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
  return filterResearchTree(tree, new Set(await getArticleSlugs()));
}

export type ArticleTreeBreadcrumb = {
  label: string;
  href?: string;
};

function findTreePath(
  nodes: ResearchTreeNode[],
  href: string,
  ancestors: ResearchTreeNode[] = [],
): ResearchTreeNode[] | undefined {
  for (const node of nodes) {
    const path = [...ancestors, node];
    if (node.href === href) {
      return path;
    }

    const nestedPath = findTreePath(node.children ?? [], href, path);
    if (nestedPath) {
      return nestedPath;
    }
  }

  return undefined;
}

/**
 * Articles can be grouped for editorial purposes in one category while being
 * reached from a more specific learning path in the public research tree.
 * Prefer that visible tree path for breadcrumbs so a reader can return to the
 * exact branch they used to open the article.
 */
export async function getArticleTreeBreadcrumbs(
  slug: string,
): Promise<ArticleTreeBreadcrumb[]> {
  const path = findTreePath(await getFullLibraryTree(), `/articles/${slug}`);
  if (!path) {
    return [];
  }

  // The article itself is appended by its layout using its canonical title.
  return path.slice(0, -1).map((node) => ({
    label: node.title,
    ...(node.href ? { href: node.href } : {}),
  }));
}

function flattenArticlePlaybackLinks(
  nodes: ResearchTreeNode[],
  links: ArticlePlaybackLink[] = [],
  seen: Set<string> = new Set(),
): ArticlePlaybackLink[] {
  for (const node of nodes) {
    const match = node.href?.match(/^\/articles\/([^/?#]+)$/);
    if (match && !seen.has(match[1]) && isVisibleArticle(match[1])) {
      seen.add(match[1]);
      links.push({ slug: match[1], title: node.title, href: node.href! });
    }
    flattenArticlePlaybackLinks(node.children ?? [], links, seen);
  }
  return links;
}

/**
 * Previous/next playback follows the same ordered research tree readers see.
 * Articles not currently exposed in that tree fall back to their category's
 * card order so every public article still has predictable audio navigation.
 */
export async function getArticlePlaybackNavigation(
  slug: string,
  category: CategorySlug,
): Promise<ArticlePlaybackNavigation> {
  let links = flattenArticlePlaybackLinks(await getFullLibraryTree());
  let index = links.findIndex((link) => link.slug === slug);

  if (index < 0) {
    links = (await getArticleSummariesByCategory(category)).map((article) => ({
      slug: article.slug,
      title: article.title,
      href: `/articles/${article.slug}`,
    }));
    index = links.findIndex((link) => link.slug === slug);
  }

  if (index < 0) {
    return {};
  }

  return {
    ...(index > 0 ? { previous: links[index - 1] } : {}),
    ...(index + 1 < links.length ? { next: links[index + 1] } : {}),
    playlist: links,
  };
}

// ---------------------------------------------------------------------------
// Articles (Payload-backed)
// ---------------------------------------------------------------------------

export type GetArticlesOptions = {
  /**
   * Include non-published articles. Development defaults to true so editors
   * can review imported material locally; production defaults to false.
   */
  includeDrafts?: boolean;
};

function resolveIncludeDrafts(value?: boolean): boolean {
  return value ?? process.env.NODE_ENV === "development";
}

/**
 * Consolidated articles remain redirectable for existing links, but are not
 * shown as separate studies in cards, related reading, or the sitemap.
 */
export function getArticleRedirect(slug: string): string | undefined {
  return articleRedirects[slug];
}

function isVisibleArticle(slug: string): boolean {
  return !Object.hasOwn(articleRedirects, slug);
}

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
  const includeDrafts = resolveIncludeDrafts(options.includeDrafts);

  return (await getCachedArticleDocs(includeDrafts))
    .map((doc) => mapArticle(doc as unknown as ArticleDoc))
    .filter((article) => isVisibleArticle(article.slug));
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

/**
 * Category cards only need article metadata. Keeping this query separate from
 * `getArticlesByCategory` prevents every long section body from being read,
 * mapped, and retained just to render a title and two-line summary.
 */
const getCachedArticleSummaryDocsByCategory = unstable_cache(
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
      select: {
        slug: true,
        title: true,
        category: true,
        audienceLevel: true,
        summary: true,
        tags: true,
        status: true,
        lastUpdated: true,
      },
    });

    return result.docs;
  },
  ["article-summaries-by-category"],
  contentCacheOptions,
);

function mapArticleSummary(doc: {
  slug: string;
  title: string;
  category: CategorySlug;
  audienceLevel: Article["audienceLevel"];
  summary: string;
  tags?: TopicTag[] | null;
  status: Article["status"];
  lastUpdated: string;
}): Article {
  return {
    slug: doc.slug,
    title: cleanEditorialText(doc.title),
    subtitle: "",
    category: doc.category,
    audienceLevel: doc.audienceLevel,
    summary: cleanEditorialText(doc.summary),
    tags: doc.tags ?? [],
    status: doc.status,
    lastUpdated: doc.lastUpdated.slice(0, 10),
    sections: [],
    citations: [],
    relatedArticles: [],
  };
}

export async function getArticleSummariesByCategory(
  category: CategorySlug,
  options: GetArticlesOptions = {},
): Promise<Article[]> {
  const docs = await getCachedArticleSummaryDocsByCategory(
    category,
    resolveIncludeDrafts(options.includeDrafts),
  );

  return docs
    .map((doc) => mapArticleSummary(doc as unknown as Parameters<typeof mapArticleSummary>[0]))
    .filter((article) => isVisibleArticle(article.slug));
}

export async function getArticlesByCategory(
  category: CategorySlug,
  options: GetArticlesOptions = {},
): Promise<Article[]> {
  const includeDrafts = resolveIncludeDrafts(options.includeDrafts);

  return (await getCachedArticlesByCategory(category, includeDrafts))
    .map((doc) => mapArticle(doc as unknown as ArticleDoc))
    .filter((article) => isVisibleArticle(article.slug));
}

const getCachedArticleDocBySlug = unstable_cache(
  async (slug: string, includeDrafts: boolean) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "articles",
      where: includeDrafts
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { status: { equals: "published" } },
            ],
          },
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
  const doc = await getCachedArticleDocBySlug(
    slug,
    resolveIncludeDrafts(),
  );
  return doc ? mapArticle(doc as unknown as ArticleDoc) : undefined;
});

const getCachedRelatedArticleDocs = unstable_cache(
  async (references: string[], includeDrafts: boolean) => {
    const payload = await getClient();
    const ids = references.filter((reference) => /^\d+$/.test(reference));
    const slugs = references.filter((reference) => !/^\d+$/.test(reference));
    const clauses = [
      ...(ids.length > 0 ? [{ id: { in: ids } }] : []),
      ...(slugs.length > 0 ? [{ slug: { in: slugs } }] : []),
    ];
    const result = await payload.find({
      collection: "articles",
      where: {
        and: [
          (clauses.length === 1 ? clauses[0] : { or: clauses }) as never,
          ...(includeDrafts ? [] : [{ status: { equals: "published" } }]),
        ],
      },
      pagination: false,
      depth: 0,
      // Related cards never render article bodies. Some of those bodies are
      // tens of kilobytes, so selecting metadata avoids unrelated SQLite I/O
      // and mapping work on a cold article request.
      select: {
        slug: true,
        title: true,
        category: true,
        audienceLevel: true,
        summary: true,
        tags: true,
        status: true,
        lastUpdated: true,
      },
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
    resolveIncludeDrafts(),
  );

  const byReference = new Map<string, Article>();
  for (const doc of docs) {
    const mapped = mapArticleSummary(
      doc as unknown as Parameters<typeof mapArticleSummary>[0],
    );
    byReference.set(mapped.slug, mapped);
    if ("id" in doc) {
      byReference.set(String((doc as { id: unknown }).id), mapped);
    }
  }

  // Preserve the order defined on the article record.
  return article.relatedArticles
    .map((reference) => byReference.get(reference))
    .filter(
      (related): related is Article =>
        Boolean(related) && isVisibleArticle(related?.slug ?? ""),
    );
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
    .filter(
      (slug): slug is string =>
        typeof slug === "string" && isVisibleArticle(slug),
    );
});

export async function getArticleSlugs(
  options: GetArticlesOptions = {},
): Promise<string[]> {
  return getCachedArticleSlugs(resolveIncludeDrafts(options.includeDrafts));
}

// ---------------------------------------------------------------------------
// Citations (Payload-backed)
// ---------------------------------------------------------------------------

const getCachedCitationDocs = unstable_cache(
  async (ids: string[], includeDrafts: boolean) => {
    if (ids.length === 0) {
      return [];
    }

    const payload = await getClient();
    const result = await payload.find({
      collection: "citations",
      where: {
        and: [
          { or: [{ citationKey: { in: ids } }, { id: { in: ids } }] },
          ...(includeDrafts ? [] : [{ status: { equals: "verified" } }]),
        ],
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

  const docs = await getCachedCitationDocs(
    [...ids].sort(),
    resolveIncludeDrafts(),
  );

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

type ArticleKeyScriptureSelection = {
  quran?: string[];
  bible?: string[];
};

const articleKeyScriptureSelections = articleKeyScriptureData as Readonly<
  Record<string, ArticleKeyScriptureSelection>
>;

export function hasArticleKeyScriptureSelection(slug: string): boolean {
  return Object.hasOwn(articleKeyScriptureSelections, slug);
}

const getCachedArticleKeyScriptureDocs = unstable_cache(
  async (
    quranReferences: string[],
    bibleReferences: string[],
    includeDrafts: boolean,
  ) => {
    const payload = await getClient();
    const [quranResult, bibleResult] = await Promise.all([
      quranReferences.length > 0
        ? payload.find({
            collection: "quran-verses",
            where: {
              and: [
                { reference: { in: quranReferences } },
                ...(includeDrafts ? [] : [{ status: { equals: "verified" } }]),
              ],
            },
            pagination: false,
            depth: 0,
          })
        : Promise.resolve({ docs: [] }),
      bibleReferences.length > 0
        ? payload.find({
            collection: "bible-verses",
            where: {
              and: [
                { reference: { in: bibleReferences } },
                ...(includeDrafts ? [] : [{ status: { equals: "verified" } }]),
              ],
            },
            pagination: false,
            depth: 0,
          })
        : Promise.resolve({ docs: [] }),
    ]);

    return {
      quranDocs: quranResult.docs,
      bibleDocs: bibleResult.docs,
    };
  },
  ["article-key-scripture"],
  contentCacheOptions,
);

/**
 * Return only the passages an editor selected as foundational to an article.
 * The full verified text remains owned by the scripture collections, so an
 * article never carries a stale hand-copied quotation.
 */
export const getArticleKeyScripture = cache(
  async (slug: string): Promise<ArticleKeyScripture> => {
    const selection = articleKeyScriptureSelections[slug];
    const quranReferences = selection?.quran ?? [];
    const bibleReferences = selection?.bible ?? [];

    if (quranReferences.length === 0 && bibleReferences.length === 0) {
      return { quranVerses: [], bibleVerses: [] };
    }

    const { quranDocs, bibleDocs } = await getCachedArticleKeyScriptureDocs(
      quranReferences,
      bibleReferences,
      resolveIncludeDrafts(),
    );
    const quranByReference = new Map(
      quranDocs.map((doc) => {
        const verse = mapQuranVerse(doc as unknown as QuranVerseDoc);
        return [verse.reference, verse] as const;
      }),
    );
    const bibleByReference = new Map(
      bibleDocs.map((doc) => {
        const verse = mapBibleVerse(doc as unknown as BibleVerseDoc);
        return [verse.reference, verse] as const;
      }),
    );

    const missingQuran = quranReferences.filter(
      (reference) => !quranByReference.has(reference),
    );
    const missingBible = bibleReferences.filter(
      (reference) => !bibleByReference.has(reference),
    );
    if (missingQuran.length > 0 || missingBible.length > 0) {
      throw new Error(
        `Missing synced key scripture for ${slug}: ${[
          ...missingQuran,
          ...missingBible,
        ].join(", ")}`,
      );
    }

    return {
      quranVerses: quranReferences
        .map((reference) => quranByReference.get(reference))
        .filter((verse): verse is QuranDisplayVerse => Boolean(verse)),
      bibleVerses: bibleReferences
        .map((reference) => bibleByReference.get(reference))
        .filter((verse): verse is BibleDisplayVerse => Boolean(verse)),
    };
  },
);

const getCachedComparisonArticleSlugs = unstable_cache(
  async (includeDrafts: boolean) => {
    const payload = await getClient();
    const result = await payload.find({
      collection: "comparison-articles",
      where: includeDrafts ? {} : { status: { equals: "published" } },
      pagination: false,
      depth: 0,
      select: { slug: true },
    });

    return result.docs
      .map((doc) => (typeof doc.slug === "string" ? doc.slug : undefined))
      .filter((slug): slug is string => Boolean(slug));
  },
  ["comparison-article-slugs"],
  contentCacheOptions,
);

const getCachedComparisonArticleDoc = unstable_cache(
  async (slug: string, includeDrafts: boolean) => {
    const payload = await getClient();

    const result = await payload.find({
      collection: "comparison-articles",
      where: includeDrafts
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { status: { equals: "published" } },
            ],
          },
      limit: 1,
      depth: 1,
    });

    return result.docs[0] ?? null;
  },
  ["comparison-article-by-slug"],
  contentCacheOptions,
);

export const getComparisonArticleBySlug = cache(async (slug: string) => {
  // Most research articles use their long-form sections. Check the shared,
  // metadata-only index first so opening each of them does not issue its own
  // guaranteed-to-miss query against the comparison collection. The index is
  // invalidated by the same Payload content hooks as the full record.
  const includeDrafts = resolveIncludeDrafts();
  const comparisonSlugs = await getCachedComparisonArticleSlugs(includeDrafts);
  if (!comparisonSlugs.includes(slug)) {
    return undefined;
  }

  const doc = (await getCachedComparisonArticleDoc(slug, includeDrafts)) as
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
    mainQuestion: cleanEditorialText(doc.mainQuestion),
    beginnerSummary: cleanEditorialText(doc.beginnerSummary),
    quranicPerspective: cleanEditorialText(doc.quranicPerspective),
    biblicalPerspective: cleanEditorialText(doc.biblicalPerspective),
    historicalContext: cleanEditorialText(doc.historicalContext),
    christianInterpretation: cleanEditorialText(doc.christianInterpretation),
    islamicResponse: cleanEditorialText(doc.islamicResponse),
    keyDifferences: (doc.keyDifferences ?? []).map((item) => cleanEditorialText(item.difference)),
    commonObjections: (doc.commonObjections ?? []).map((item) => ({
      objection: cleanEditorialText(item.objection),
      response: cleanEditorialText(item.response),
    })),
    respectfulConclusion: cleanEditorialText(doc.respectfulConclusion),
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
    relatedTopics: (doc.relatedTopics ?? []).map((item) => cleanEditorialText(item.topic)),
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
  async (includeDrafts: boolean) => {
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
        where: includeDrafts ? {} : { status: { equals: "verified" } },
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
  // This route is public even in development. Pending source records remain
  // available in Payload's admin/API for editors, but never appear as
  // creator-facing scaffolding in the reader experience.
  const sourceLibrary = await getCachedSourceLibraryDocs(false);
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
