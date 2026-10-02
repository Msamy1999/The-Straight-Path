import type { PayloadRequest } from "payload";
import { articleStateHash, releaseHash, type ArticleState, type Fields, type ReleasePlan, type ReleaseSnapshot, type SourceCollection, type SourceState } from "./approved-release-plan";

interface ReadOptions {
  collection: string;
  req: Partial<PayloadRequest>;
  overrideAccess: false;
  depth: 0;
  locale: "en";
  fallbackLocale: false;
  draft?: true;
  pagination?: false;
  limit?: number;
  where?: Fields;
}
export interface TransactionReader {
  findByID(options: ReadOptions & { id: number | string }): Promise<Fields>;
  find(options: ReadOptions): Promise<{ docs: Fields[] }>;
}

export function requireRealReleaseTransaction(value: unknown): number | string {
  if ((typeof value !== "number" || !Number.isFinite(value)) && (typeof value !== "string" || !value.trim())) throw new Error("A real release transaction is required before reads or mutations.");
  return value as number | string;
}
export interface ReleaseTransactionRegistry {
  sessions?: Record<string, { db?: unknown }>;
}
/** Fails closed when a nested operation drops or replaces the active session. */
export function assertRegisteredReleaseTransaction(req: Partial<PayloadRequest>, registry: ReleaseTransactionRegistry, expected: number | string): void {
  if (requireRealReleaseTransaction(req.transactionID) !== expected) throw new Error("The active release request transaction changed during an operation.");
  if (!registry.sessions?.[String(expected)]?.db) throw new Error("The active release transaction is no longer registered in the database adapter.");
}
const nullable = (value: unknown) => value === null ? undefined : value;
const docID = (value: unknown): number | string => {
  if (typeof value === "object" && value !== null && "id" in value) return docID(value.id);
  if (typeof value !== "number" && typeof value !== "string") throw new Error("A document relationship has no valid ID.");
  return value;
};
const relations = (value: unknown): (number | string)[] => Array.isArray(value) ? value.map(docID) : [];
function sourceState(collection: SourceCollection, doc: Fields): SourceState {
  const record = collection === "citations" ? { citationKey: doc.citationKey, type: doc.type, title: doc.title, author: nullable(doc.author), publisher: nullable(doc.publisher), year: nullable(doc.year), url: nullable(doc.url), note: nullable(doc.note) } : collection === "quran-verses" ? { surahName: doc.surahName, surahNumber: doc.surahNumber, ayahNumber: doc.ayahNumber, reference: doc.reference, arabic: doc.arabic, translation: doc.translation, translator: doc.translator, sourceAttribution: nullable(doc.sourceAttribution) } : { book: doc.book, chapter: doc.chapter, verse: doc.verse, reference: doc.reference, text: doc.text, version: doc.version, sourceAttribution: nullable(doc.sourceAttribution) };
  return { id: docID(doc.id), collection, key: String(collection === "citations" ? doc.citationKey : doc.reference), status: doc.status as SourceState["status"], record };
}

/**
 * The first owner read establishes the transaction's snapshot. Every later
 * content read uses the exact same req/transactionID and normal access rules.
 * The CLI's real SQLite BEGIN IMMEDIATE additionally holds a writer lock.
 */
export async function readTransactionReleaseSnapshot(reader: TransactionReader, req: Partial<PayloadRequest>, expected: ReleaseSnapshot, plan: ReleasePlan): Promise<ReleaseSnapshot> {
  requireRealReleaseTransaction(req.transactionID);
  const base = { req, overrideAccess: false as const, depth: 0 as const, locale: "en" as const, fallbackLocale: false as const };
  const owner = await reader.findByID({ ...base, collection: "users", id: expected.owner.id });
  if (owner.role !== "owner") throw new Error("Stored owner authority changed inside the release transaction.");
  const sources: SourceState[] = [];
  for (const collection of ["citations", "quran-verses", "bible-verses"] as const) {
    const keys = plan.sourcePreconditions.filter(p => p.collection === collection).map(p => p.key);
    if (!keys.length) continue;
    const result = await reader.find({ ...base, collection, where: { [collection === "citations" ? "citationKey" : "reference"]: { in: keys } }, pagination: false, limit: keys.length + 1 });
    sources.push(...result.docs.map(doc => sourceState(collection, doc)));
  }
  if (new Set(sources.map(s => `${s.collection}:${s.key}`)).size !== sources.length) throw new Error("Duplicate source records appeared inside the release transaction.");
  const citationKeys = new Map(expected.sources.filter(s => s.collection === "citations").map(s => [String(s.id), s.key]));
  for (const source of sources) if (source.collection === "citations") citationKeys.set(String(source.id), source.key);
  const result = await reader.find({ ...base, collection: "articles", draft: true, where: { slug: { in: plan.articlePreconditions.map(p => p.slug) } }, pagination: false, limit: plan.articlePreconditions.length + 1 });
  const slugByID = new Map(expected.articles.map(a => [String(a.id), a.slug]));
  for (const doc of result.docs) slugByID.set(String(doc.id), String(doc.slug));
  const keysFor = (ids: unknown) => relations(ids).map(value => {
    const key = citationKeys.get(String(value)); if (!key) throw new Error("An article now links a citation outside its approved state."); return key;
  });
  const articles: ArticleState[] = result.docs.map(doc => {
    const sections = (Array.isArray(doc.sections) ? doc.sections : []) as Fields[];
    return {
      id: docID(doc.id), slug: String(doc.slug), status: doc.status as ArticleState["status"], payloadStatus: doc._status as ArticleState["payloadStatus"],
      data: { title: doc.title, subtitle: doc.subtitle, category: doc.category, audienceLevel: doc.audienceLevel, summary: doc.summary, tags: doc.tags ?? [], sections: sections.map(s => ({ sectionId: s.sectionId, title: s.title, kind: s.kind, body: s.body })) },
      citationKeys: keysFor(doc.citations), sectionCitationKeys: Object.fromEntries(sections.map(s => [String(s.sectionId), keysFor(s.citations)])),
      relatedSlugs: relations(doc.relatedArticles).map(value => { const slug = slugByID.get(String(value)); if (!slug) throw new Error("An article now links a related record outside its approved state."); return slug; }),
    };
  });
  if (new Set(articles.map(a => a.slug)).size !== articles.length) throw new Error("Duplicate articles appeared inside the release transaction.");
  return { owner: { id: docID(owner.id), role: String(owner.role) }, articles, sources };
}

export function assertTransactionReleasePreconditions(plan: ReleasePlan, actual: ReleaseSnapshot, phase: "sources" | "articles"): void {
  if (releaseHash(actual.owner) !== plan.principalSha256) throw new Error("The actual owner changed since approved preflight.");
  const articleBySlug = new Map(actual.articles.map(a => [a.slug, a]));
  for (const condition of plan.articlePreconditions) {
    const article = articleBySlug.get(condition.slug);
    if ((article ? articleStateHash(article) : releaseHash("absent")) !== condition.stateSha256) throw new Error(`Transaction-bound article precondition changed: ${condition.slug}.`);
  }
  const sourceByKey = new Map(actual.sources.map(s => [`${s.collection}:${s.key}`, s]));
  const staged = new Map(plan.sourceActions.map(s => [`${s.collection}:${s.key}`, s]));
  for (const condition of plan.sourcePreconditions) {
    const key = `${condition.collection}:${condition.key}`, source = sourceByKey.get(key), action = staged.get(key);
    if (phase === "articles" && action) {
      if (!source || source.status !== "verified" || releaseHash(source.record) !== action.recordSha256) throw new Error(`Transaction-bound verified source changed: ${key}.`);
    } else {
      const stateSha256 = source ? releaseHash({ id: source.id, status: source.status, record: source.record }) : releaseHash("absent");
      if (stateSha256 !== condition.stateSha256) throw new Error(`Transaction-bound source precondition changed: ${key}.`);
    }
  }
}

/** Detect a silently rolled-back adapter COMMIT before reporting success. */
export function assertCommittedRelease(plan: ReleasePlan, actual: ReleaseSnapshot, settledPlan: ReleasePlan): void {
  if (releaseHash(actual.owner) !== plan.principalSha256) throw new Error("Owner authority changed after publication commit; success cannot be reported.");
  const publishedCount = actual.articles.filter(article => article.status === "published" && article.payloadStatus === "published").length;
  if (settledPlan.issues.length || settledPlan.articleActions.length || settledPlan.summary.publishedAfter !== plan.summary.publishedAfter || publishedCount !== plan.summary.publishedAfter) throw new Error("Publication commit did not match the approved complete article state; success cannot be reported.");
  const sourceByKey = new Map(actual.sources.map(source => [`${source.collection}:${source.key}`, source]));
  const staged = new Set(plan.sourceActions.map(source => `${source.collection}:${source.key}`));
  for (const action of plan.sourceActions) {
    const actualSource = sourceByKey.get(`${action.collection}:${action.key}`);
    if (!actualSource || actualSource.status !== "verified" || releaseHash(actualSource.record) !== action.recordSha256 || (action.id !== undefined && actualSource.id !== action.id)) throw new Error(`Approved source did not remain committed and verified: ${action.collection}:${action.key}.`);
  }
  for (const condition of plan.sourcePreconditions) {
    const key = `${condition.collection}:${condition.key}`;
    if (staged.has(key)) continue;
    const source = sourceByKey.get(key);
    const stateSha256 = source ? releaseHash({ id: source.id, status: source.status, record: source.record }) : releaseHash("absent");
    if (stateSha256 !== condition.stateSha256) throw new Error(`A preserved source changed after publication commit: ${key}.`);
  }
}
