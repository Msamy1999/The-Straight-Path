/**
 * Imports researched article drafts (content-drafts/*.json) into Payload.
 *
 * - Articles land as status "reviewed" (under review) — NOT published. The
 *   publish gate stays the human checkpoint in /admin.
 * - Scripture records are created with full source attribution but stay
 *   "pending" until a human marks them verified after checking.
 * - Edition-level citation records (Quran edition, Bible translation) are
 *   created/updated and linked to the article.
 *
 * Run with the dev server stopped:
 *   env $(cat .env | xargs) npx tsx payload/import-drafts.ts
 *
 * To import only selected drafts, pass their slugs as positional arguments:
 *   npx tsx payload/import-drafts.ts what-is-tawhid why-islam
 * Keep selected articles at the draft stage with:
 *   npx tsx payload/import-drafts.ts --status=draft what-is-tawhid why-islam
 */
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "../payload.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = path.resolve(dirname, "../content-drafts");

type DraftVerseQuran = {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  reference: string;
  arabic: string;
  translation: string;
  translator: string;
  sourceAttribution: string;
};

type DraftVerseBible = {
  book: string;
  chapter: number;
  verse: string | number;
  reference: string;
  text: string;
  version: string;
  sourceAttribution: string;
};

// Reference-only locators are used by comparison articles that name many
// passages without quoting each verse in full. They are validated locally but
// deliberately are not imported as scripture records.
type DraftBibleReference = {
  reference: string;
};

type DraftFurtherReading = {
  title: string;
  author: string;
  note: string;
  type?: "book" | "journalArticle" | "primaryText";
  journal?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  isbn?: string;
};

type Draft = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  audienceLevel: string;
  summary: string;
  tags: string[];
  sections: { sectionId: string; title: string; kind: string; body: string }[];
  quranVerses: DraftVerseQuran[];
  bibleVerses: DraftVerseBible[];
  bibleReferences?: DraftBibleReference[];
  relatedSlugs?: string[];
  furtherReading?: DraftFurtherReading[];
};

function sourceCitationKey(source: DraftFurtherReading): string {
  const normalized = `${source.author}-${source.title}`
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 96);
  return `draft-source-${normalized}`;
}

function sourceCitationType(
  source: DraftFurtherReading,
): "book" | "article" | "other" {
  if (source.type === "journalArticle") return "article";
  if (source.type === "primaryText") return "other";
  return "book";
}

function sourceCitationNote(source: DraftFurtherReading): string {
  const metadata = [
    source.journal,
    source.volume ? `vol. ${source.volume}` : undefined,
    source.issue ? `no. ${source.issue}` : undefined,
    source.pages ? `pp. ${source.pages}` : undefined,
    source.doi ? `DOI ${source.doi}` : undefined,
    source.isbn ? `ISBN ${source.isbn}` : undefined,
  ].filter(Boolean);
  return [source.note, metadata.join(", ")].filter(Boolean).join(" ");
}

function citationMetadataChanged(
  current: Record<string, unknown>,
  next: Record<string, unknown>,
): boolean {
  return Object.entries(next).some(
    ([field, value]) => String(current[field] ?? "") !== String(value ?? ""),
  );
}

async function main() {
  const payload = await getPayload({ config });
  const allFiles = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith(".json"));
  const args = process.argv.slice(2);
  const statusArgument = args.find((value) => value.startsWith("--status="));
  const articleStatus = statusArgument?.slice("--status=".length) ?? "draft";
  if (!["draft", "reviewed"].includes(articleStatus)) {
    throw new Error(`Unsupported import status: ${articleStatus}`);
  }
  const requestedSlugs = new Set(
    args
      .filter((value) => !value.startsWith("--status="))
      .map((value) => value.replace(/\.json$/i, "")),
  );
  const files = requestedSlugs.size
    ? allFiles.filter((file) => requestedSlugs.has(file.replace(/\.json$/i, "")))
    : allFiles;
  const missingSlugs = [...requestedSlugs].filter(
    (slug) => !allFiles.includes(`${slug}.json`),
  );
  if (missingSlugs.length) {
    throw new Error(`Draft slug(s) not found: ${missingSlugs.join(", ")}`);
  }
  console.log(`drafts found: ${files.length}`);

  // Edition-level citations (real, checkable sources).
  const editionCitations = [
    {
      citationKey: "quran-tanzil-sahih-international",
      type: "quran",
      title:
        "The Quran — Tanzil Uthmani text with Saheeh International translation (served via api.alquran.cloud)",
      url: "https://alquran.cloud",
      note: "Arabic text and translation fetched programmatically per verse; verify spot-checks against a printed mushaf and the published Saheeh International edition before final publication.",
    },
    {
      citationKey: "bible-web-translation",
      type: "bible",
      title: "The Holy Bible, World English Bible (public domain)",
      url: "https://worldenglish.bible",
      note: "Verse text fetched programmatically via bible-api.com; public-domain translation suitable for quotation.",
    },
  ];

  const citationIds: Record<string, string | number> = {};
  for (const citation of editionCitations) {
    const existing = await payload.find({
      collection: "citations",
      where: { citationKey: { equals: citation.citationKey } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: "citations",
        id: existing.docs[0].id,
        data: citation as never,
        depth: 0,
      });
      citationIds[citation.citationKey] = updated.id;
    } else {
      const created = await payload.create({
        collection: "citations",
        data: { ...citation, status: "pending" } as never,
        depth: 0,
      });
      citationIds[citation.citationKey] = created.id;
    }
  }

  const articleIdBySlug = new Map<string, string | number>();

  for (const file of files) {
    const draft: Draft = JSON.parse(
      readFileSync(path.join(DRAFTS_DIR, file), "utf8"),
    );

    // Scripture records ----------------------------------------------------
    for (const verse of draft.quranVerses ?? []) {
      const existing = await payload.find({
        collection: "quran-verses",
        where: { reference: { equals: verse.reference } },
        limit: 1,
        depth: 0,
      });
      const data = {
        surahName: verse.surahName,
        surahNumber: verse.surahNumber,
        ayahNumber: verse.ayahNumber,
        arabic: verse.arabic,
        translation: verse.translation,
        translator: verse.translator,
        reference: verse.reference,
        sourceAttribution: verse.sourceAttribution,
        status: "pending",
      };
      if (existing.docs[0]) {
        await payload.update({
          collection: "quran-verses",
          id: existing.docs[0].id,
          data: data as never,
          depth: 0,
        });
      } else {
        await payload.create({
          collection: "quran-verses",
          data: data as never,
          depth: 0,
        });
      }
    }

    for (const verse of draft.bibleVerses ?? []) {
      const existing = await payload.find({
        collection: "bible-verses",
        where: { reference: { equals: verse.reference } },
        limit: 1,
        depth: 0,
      });
      const data = {
        book: verse.book,
        chapter: verse.chapter,
        verse: String(verse.verse),
        text: verse.text,
        version: verse.version,
        reference: verse.reference,
        sourceAttribution: verse.sourceAttribution,
        status: "pending",
      };
      if (existing.docs[0]) {
        await payload.update({
          collection: "bible-verses",
          id: existing.docs[0].id,
          data: data as never,
          depth: 0,
        });
      } else {
        await payload.create({
          collection: "bible-verses",
          data: data as never,
          depth: 0,
        });
      }
    }

    // Bibliography records -------------------------------------------------
    // Draft further-reading entries become real citation relationships so
    // the publish gate can require source verification for every one.
    const bibliographyCitationIds: (string | number)[] = [];
    for (const source of draft.furtherReading ?? []) {
      const citationKey = sourceCitationKey(source);
      const citationData = {
        citationKey,
        type: sourceCitationType(source),
        title: source.title,
        author: source.author,
        publisher: source.publisher ?? source.journal,
        year: source.year,
        url: source.url ?? (source.doi ? `https://doi.org/${source.doi}` : undefined),
        note: sourceCitationNote(source),
      };
      const existingCitation = await payload.find({
        collection: "citations",
        where: { citationKey: { equals: citationKey } },
        limit: 1,
        depth: 0,
      });
      if (existingCitation.docs[0]) {
        const mustReverify = citationMetadataChanged(
          existingCitation.docs[0] as unknown as Record<string, unknown>,
          citationData,
        );
        const updated = await payload.update({
          collection: "citations",
          id: existingCitation.docs[0].id,
          data: {
            ...citationData,
            ...(mustReverify
              ? { status: "pending", verifiedBy: null, verifiedDate: null }
              : {}),
          } as never,
          depth: 0,
        });
        bibliographyCitationIds.push(updated.id);
      } else {
        const created = await payload.create({
          collection: "citations",
          data: { ...citationData, status: "pending" } as never,
          depth: 0,
        });
        bibliographyCitationIds.push(created.id);
      }
    }

    // Article ---------------------------------------------------------------
    const existing = await payload.find({
      collection: "articles",
      where: { slug: { equals: draft.slug } },
      limit: 1,
      depth: 0,
    });

    const articleData = {
      slug: draft.slug,
      title: draft.title,
      subtitle: draft.subtitle,
      category: draft.category,
      audienceLevel: draft.audienceLevel ?? "beginner",
      summary: draft.summary,
      tags: draft.tags,
      status: articleStatus,
      lastUpdated: new Date().toISOString(),
      // Older drafts may retain an internal "beginner summary" while their
      // public overview has been revised. Do not import that duplicate block
      // into Payload or expose it through the public content API.
      sections: draft.sections
        .filter(
          (section) =>
            section.sectionId !== "beginner-summary" &&
            section.title.trim().toLowerCase() !== "beginner summary",
        )
        .map((section) => ({
          sectionId: section.sectionId,
          title: section.title,
          kind: section.kind,
          body: section.body,
          citations:
            section.kind === "scripture"
              ? [
                  citationIds["quran-tanzil-sahih-international"],
                  citationIds["bible-web-translation"],
                ]
              : [],
        })),
      citations: [
        citationIds["quran-tanzil-sahih-international"],
        citationIds["bible-web-translation"],
        ...bibliographyCitationIds,
      ],
    };

    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: "articles",
        id: existing.docs[0].id,
        data: articleData as never,
        depth: 0,
      });
      articleIdBySlug.set(draft.slug, updated.id);
      console.log(`updated article: ${draft.slug}`);
    } else {
      const created = await payload.create({
        collection: "articles",
        data: articleData as never,
        depth: 0,
      });
      articleIdBySlug.set(draft.slug, created.id);
      console.log(`created article: ${draft.slug}`);
    }
  }

  // Related articles (second pass; only among known slugs) -------------------
  for (const file of files) {
    const draft: Draft = JSON.parse(
      readFileSync(path.join(DRAFTS_DIR, file), "utf8"),
    );
    const related = (draft.relatedSlugs ?? [])
      .filter((slug) => slug !== draft.slug)
      .map(async (slug) => {
        if (articleIdBySlug.has(slug)) return articleIdBySlug.get(slug);
        const found = await payload.find({
          collection: "articles",
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 0,
        });
        return found.docs[0]?.id;
      });
    const ids = (await Promise.all(related)).filter(Boolean);
    if (ids.length > 0) {
      await payload.update({
        collection: "articles",
        id: articleIdBySlug.get(draft.slug)!,
        data: { relatedArticles: ids as number[] },
        depth: 0,
      });
    }
  }

  console.log(`Import complete. Articles are status=${articleStatus} (NOT published).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
