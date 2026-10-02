import { createHash } from "node:crypto";

export type SourceCollection = "citations" | "quran-verses" | "bible-verses";
export type Fields = Record<string, unknown>;
export type EditorialStatus = "draft" | "reviewed" | "published";

export interface ReleaseProof {
  id: string;
  kind: "editorial-review" | "canonical-quran" | "world-english-bible" | "bibliographic-source";
  status: "verified";
  reviewedBy: string;
  verifiedAt: string;
  sourceUrls: string[];
  artifactPath: string;
  artifactSha256: string;
}

export interface ApprovedReleaseManifest {
  schemaVersion: 1;
  release: string;
  mutationSlugs: string[];
  articleApprovals: { slug: string; draftSha256: string; publish: boolean; proofId: string }[];
  sourceApprovals: {
    collection: SourceCollection;
    key: string;
    recordSha256: string;
    record?: Fields;
    proofId: string;
  }[];
  requiredSourceUpdates?: { collection: SourceCollection; key: string; recordSha256: string }[];
  proofs: ReleaseProof[];
}

export interface ReleaseDraft {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  audienceLevel?: string;
  summary: string;
  tags: string[];
  sections: { sectionId: string; title: string; kind: string; body: string }[];
  quranVerses?: Fields[];
  bibleVerses?: Fields[];
  furtherReading?: Fields[];
  relatedSlugs?: string[];
}

export interface ArticleState {
  id: number | string;
  slug: string;
  status: EditorialStatus;
  payloadStatus: "draft" | "published";
  data: Fields;
  citationKeys: string[];
  sectionCitationKeys: Record<string, string[]>;
  relatedSlugs: string[];
}
export interface SourceState {
  id: number | string;
  collection: SourceCollection;
  key: string;
  status: "pending" | "verified";
  record: Fields;
}
export interface ReleaseSnapshot {
  owner: { id: number | string; role: string };
  articles: ArticleState[];
  sources: SourceState[];
}
export interface SourceAction {
  collection: SourceCollection;
  key: string;
  id?: number | string;
  beforeSha256?: string;
  record: Fields;
  recordSha256: string;
  proof: ReleaseProof;
}
export interface ArticleAction {
  slug: string;
  id?: number | string;
  beforeSha256?: string;
  data: Fields;
  status: EditorialStatus;
  payloadStatus: "draft" | "published";
  citationKeys: string[];
  sectionCitationKeys: Record<string, string[]>;
  relatedSlugs: string[];
}
export interface SourceRequirement {
  collection: SourceCollection;
  key: string;
  status: string;
  recordSha256: string;
  record: Fields;
}
export interface ReleasePlan {
  release: string;
  principalSha256: string;
  manifestSha256: string;
  planSha256: string;
  sourceActions: SourceAction[];
  sourcePreconditions: { collection: SourceCollection; key: string; stateSha256: string }[];
  articlePreconditions: { slug: string; stateSha256: string }[];
  articleActions: ArticleAction[];
  neededSourceApprovals: SourceRequirement[];
  issues: string[];
  warnings: string[];
  summary: { approvedArticles: number; draftMutations: number; sourceMutations: number; articleMutations: number; publishedAfter: number; preservedVerifiedSources: number };
}

function stable(value: unknown): unknown {
  if (typeof value === "string") return value.normalize("NFC").replace(/\r\n/g, "\n");
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stable(v)]));
  }
  return value;
}
export function releaseHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(stable(value)) ?? "null").digest("hex");
}
export function fileHash(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
const hashPattern = /^[a-f0-9]{64}$/;
const sourceKey = (collection: string, key: string) => `${collection}:${key}`;
const compact = (value: unknown) => String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
const english = (value: unknown) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const identity = (value: unknown) => String(value ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function bibliographyKey(source: Fields): string {
  return `draft-source-${`${source.author}-${source.title}`.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 96)}`;
}
export function bibliographyRecord(source: Fields): Fields {
  const extra = [source.journal, source.volume ? `vol. ${source.volume}` : undefined, source.issue ? `no. ${source.issue}` : undefined, source.pages ? `pp. ${source.pages}` : undefined, source.doi ? `DOI ${source.doi}` : undefined, source.isbn ? `ISBN ${source.isbn}` : undefined].filter(Boolean);
  return {
    citationKey: bibliographyKey(source),
    type: source.type === "journalArticle" ? "article" : source.type === "primaryText" ? "other" : "book",
    title: source.title, author: source.author, publisher: source.publisher ?? source.journal,
    year: source.year === undefined ? undefined : Number.parseInt(String(source.year), 10),
    url: source.url ?? (source.doi ? `https://doi.org/${source.doi}` : undefined),
    note: [source.note, extra.join(", ")].filter(Boolean).join(" "),
  };
}
export function scriptureRecord(collection: "quran-verses" | "bible-verses", source: Fields): Fields {
  const names = collection === "quran-verses" ? ["surahName", "surahNumber", "ayahNumber", "reference", "arabic", "translation", "translator", "sourceAttribution"] : ["book", "chapter", "verse", "reference", "text", "version", "sourceAttribution"];
  return Object.fromEntries(names.map(n => [n, n === "verse" ? String(source[n]) : source[n]]));
}
export function importedArticleData(draft: ReleaseDraft): Fields {
  return {
    title: draft.title, subtitle: draft.subtitle, category: draft.category, audienceLevel: draft.audienceLevel ?? "beginner", summary: draft.summary, tags: draft.tags,
    sections: draft.sections.filter(s => s.sectionId !== "beginner-summary" && s.title.trim().toLowerCase() !== "beginner summary").map(s => ({ sectionId: s.sectionId, title: s.title, kind: s.kind, body: s.body })),
  };
}
export function articleStateHash(article: ArticleState): string {
  return releaseHash({ id: article.id, slug: article.slug, status: article.status, payloadStatus: article.payloadStatus, data: article.data, citationKeys: article.citationKeys, sectionCitationKeys: article.sectionCitationKeys, relatedSlugs: article.relatedSlugs });
}

export function validateReleaseManifest(manifest: ApprovedReleaseManifest): string[] {
  const errors: string[] = [];
  if (manifest.schemaVersion !== 1 || !manifest.release?.trim()) errors.push("Unsupported manifest version or missing release.");
  for (const [name, rows, key] of [["article approvals", manifest.articleApprovals, (r: { slug: string }) => r.slug], ["source approvals", manifest.sourceApprovals, (r: { collection: string; key: string }) => sourceKey(r.collection, r.key)], ["proofs", manifest.proofs, (r: { id: string }) => r.id]] as const) {
    if (!Array.isArray(rows)) { errors.push(`Missing ${name}.`); continue; }
    const keys = rows.map(r => key(r as never));
    if (new Set(keys).size !== keys.length) errors.push(`Duplicate ${name}.`);
  }
  if (!Array.isArray(manifest.mutationSlugs) || new Set(manifest.mutationSlugs).size !== manifest.mutationSlugs.length) errors.push("Invalid mutation slug list.");
  for (const proof of manifest.proofs ?? []) {
    if (proof.status !== "verified" || !proof.reviewedBy?.trim() || !Number.isFinite(Date.parse(proof.verifiedAt)) || !hashPattern.test(proof.artifactSha256) || !proof.artifactPath?.trim()) errors.push(`Incomplete verified evidence: ${proof.id}.`);
    if (!Array.isArray(proof.sourceUrls) || proof.sourceUrls.length === 0 || proof.sourceUrls.some(url => { try { const u = new URL(url); return u.protocol !== "https:" || Boolean(u.username || u.password); } catch { return true; } })) errors.push(`Invalid evidence source URLs: ${proof.id}.`);
  }
  for (const a of manifest.articleApprovals ?? []) if (!hashPattern.test(a.draftSha256) || typeof a.publish !== "boolean") errors.push(`Invalid article approval: ${a.slug}.`);
  for (const a of manifest.sourceApprovals ?? []) if (!["citations", "quran-verses", "bible-verses"].includes(a.collection) || !hashPattern.test(a.recordSha256)) errors.push(`Invalid source approval: ${a.collection}:${a.key}.`);
  for (const a of manifest.sourceApprovals ?? []) if (a.record) {
    const fields = a.collection === "citations" ? ["citationKey", "type", "title", "author", "publisher", "year", "url", "note"] : a.collection === "quran-verses" ? ["surahName", "surahNumber", "ayahNumber", "reference", "arabic", "translation", "translator", "sourceAttribution"] : ["book", "chapter", "verse", "reference", "text", "version", "sourceAttribution"];
    if (Object.keys(a.record).some(key => !fields.includes(key))) errors.push(`Source approval contains non-content fields: ${a.collection}:${a.key}.`);
    const numeric = a.collection === "citations" ? ["year"] : a.collection === "quran-verses" ? ["surahNumber", "ayahNumber"] : ["chapter"];
    if (Object.entries(a.record).some(([key, value]) => numeric.includes(key) ? typeof value !== "number" || !Number.isInteger(value) : typeof value !== "string")) errors.push(`Source record fields must use canonical string/integer types and omit absent fields: ${a.collection}:${a.key}.`);
  }
  for (const a of manifest.requiredSourceUpdates ?? []) if (!hashPattern.test(a.recordSha256)) errors.push(`Invalid required source correction: ${a.collection}:${a.key}.`);
  return errors;
}

export function buildReleasePlan(input: {
  manifest: ApprovedReleaseManifest;
  drafts: Map<string, { draft: ReleaseDraft; sha256: string }>;
  snapshot: ReleaseSnapshot;
  keyScripture: Record<string, { quran?: string[]; bible?: string[] }>;
  redirects: Readonly<Record<string, string>>;
  verifyArtifact: (proof: ReleaseProof, subject: { collection: string; key: string; recordSha256: string }) => boolean;
}): ReleasePlan {
  const { manifest, drafts, snapshot, keyScripture, redirects } = input;
  const issues = validateReleaseManifest(manifest), warnings: string[] = [];
  const proofs = new Map((manifest.proofs ?? []).map(p => [p.id, p]));
  const approvalBySource = new Map((manifest.sourceApprovals ?? []).map(a => [sourceKey(a.collection, a.key), a]));
  const oldArticles = new Map(snapshot.articles.map(a => [a.slug, a]));
  const oldSources = new Map(snapshot.sources.map(s => [sourceKey(s.collection, s.key), s]));
  const mutationSlugs = new Set(manifest.mutationSlugs ?? []);
  if (snapshot.owner.role !== "owner" || snapshot.owner.id === undefined) issues.push("A real existing owner principal is required.");
  const validProof = (id: string, kind: ReleaseProof["kind"], subject: { collection: string; key: string; recordSha256: string }) => {
    const proof = proofs.get(id);
    if (!proof || proof.kind !== kind || proof.status !== "verified" || !input.verifyArtifact(proof, subject)) { issues.push(`Missing, wrong-kind, or changed proof artifact: ${id}.`); return undefined; }
    return proof;
  };
  const sourceCandidates = new Map<string, { collection: SourceCollection; key: string; record: Fields; aliases: Fields[] }>();
  const define = (collection: SourceCollection, key: string, record: Fields) => {
    const k = sourceKey(collection, key), entry = sourceCandidates.get(k);
    if (entry) entry.aliases.push(record); else sourceCandidates.set(k, { collection, key, record, aliases: [record] });
  };
  for (const { draft } of drafts.values()) {
    for (const q of draft.quranVerses ?? []) define("quran-verses", String(q.reference), scriptureRecord("quran-verses", q));
    for (const b of draft.bibleVerses ?? []) define("bible-verses", String(b.reference), scriptureRecord("bible-verses", b));
    for (const s of draft.furtherReading ?? []) define("citations", bibliographyKey(s), bibliographyRecord(s));
  }
  define("citations", "quran-tanzil-sahih-international", { citationKey: "quran-tanzil-sahih-international", type: "quran", title: "The Quran — Tanzil Uthmani text with Saheeh International translation", url: "https://alquran.cloud", note: "Uthmani-script Arabic text from Tanzil with the Saheeh International English translation." });
  define("citations", "bible-web-translation", { citationKey: "bible-web-translation", type: "bible", title: "The Holy Bible, World English Bible (public domain)", url: "https://worldenglish.bible", note: "Public-domain English translation from the World English Bible." });
  const required = new Set<string>(), referencedScope = new Set<string>(), candidates: ArticleAction[] = [], articlePreconditions: ReleasePlan["articlePreconditions"] = [];
  for (const a of manifest.articleApprovals ?? []) {
    const item = drafts.get(a.slug), old = oldArticles.get(a.slug);
    articlePreconditions.push({ slug: a.slug, stateSha256: old ? articleStateHash(old) : releaseHash("absent") });
    if (!item || item.sha256 !== a.draftSha256) { issues.push(`Draft is absent or changed since approval: ${a.slug}.`); continue; }
    validProof(a.proofId, "editorial-review", { collection: "articles", key: a.slug, recordSha256: a.draftSha256 });
    if (!old && !mutationSlugs.has(a.slug)) { issues.push(`New article is outside mutation scope: ${a.slug}.`); continue; }
    if (a.publish && redirects[a.slug] && old?.status !== "published") { issues.push(`Retired redirect cannot be newly published: ${a.slug}.`); continue; }
    const draft = item.draft, useDraft = mutationSlugs.has(a.slug) || !old;
    if (old && !useDraft && releaseHash(old.data) !== releaseHash(importedArticleData(draft))) {
      issues.push(`Status-only article prose differs from the approved current draft; expand mutation scope: ${a.slug}.`);
    }
    const data = useDraft ? importedArticleData(draft) : old.data;
    const citationKeys = useDraft ? ["quran-tanzil-sahih-international", "bible-web-translation", ...(draft.furtherReading ?? []).map(bibliographyKey)] : old.citationKeys;
    const sections = data.sections as ReleaseDraft["sections"];
    const sectionCitationKeys = useDraft ? Object.fromEntries(sections.map(s => [s.sectionId, s.kind === "scripture" ? ["quran-tanzil-sahih-international", "bible-web-translation"] : []])) : old.sectionCitationKeys;
    const status = old?.status === "published" || a.publish ? "published" : old?.status ?? "reviewed";
    const payloadStatus = status === "published" ? "published" : old?.payloadStatus ?? "draft";
    const relatedSlugs = useDraft ? (draft.relatedSlugs ?? []).filter(s => s !== draft.slug && (oldArticles.has(s) || manifest.articleApprovals.some(a => a.slug === s))) : old.relatedSlugs;
    const action: ArticleAction = { slug: a.slug, id: old?.id, beforeSha256: old ? articleStateHash(old) : undefined, data, status, payloadStatus, citationKeys, sectionCitationKeys, relatedSlugs };
    for (const key of new Set([...citationKeys, ...Object.values(sectionCitationKeys).flat()])) referencedScope.add(sourceKey("citations", key));
    for (const ref of draft.quranVerses ?? []) referencedScope.add(sourceKey("quran-verses", String(ref.reference)));
    for (const ref of draft.bibleVerses ?? []) referencedScope.add(sourceKey("bible-verses", String(ref.reference)));
    for (const ref of keyScripture[a.slug]?.quran ?? []) referencedScope.add(sourceKey("quran-verses", ref));
    for (const ref of keyScripture[a.slug]?.bible ?? []) referencedScope.add(sourceKey("bible-verses", ref));
    if (status === "published") {
      for (const key of new Set([...citationKeys, ...Object.values(sectionCitationKeys).flat()])) required.add(sourceKey("citations", key));
      for (const ref of keyScripture[a.slug]?.quran ?? []) required.add(sourceKey("quran-verses", ref));
      for (const ref of keyScripture[a.slug]?.bible ?? []) required.add(sourceKey("bible-verses", ref));
    } else {
      // A draft update still cannot link a record that would be absent at
      // apply time. Existing pending evidence stays pending and untouched.
      for (const key of new Set([...citationKeys, ...Object.values(sectionCitationKeys).flat()])) {
        if (!oldSources.has(sourceKey("citations", key))) required.add(sourceKey("citations", key));
      }
    }
    if (!old || articleStateHash({ ...old, data, status, payloadStatus, citationKeys, sectionCitationKeys, relatedSlugs }) !== articleStateHash(old)) candidates.push(action);
  }
  for (const slug of mutationSlugs) if (!manifest.articleApprovals?.some(a => a.slug === slug)) issues.push(`Mutation slug lacks article approval: ${slug}.`);
  for (const change of manifest.requiredSourceUpdates ?? []) {
    const key = sourceKey(change.collection, change.key);
    if (!referencedScope.has(key)) issues.push(`Required source correction is outside approved article references: ${key}.`);
    else required.add(key);
  }
  const sourceActions: SourceAction[] = [], neededSourceApprovals: SourceRequirement[] = [], sourcePreconditions: ReleasePlan["sourcePreconditions"] = [];
  let preservedVerifiedSources = 0;
  for (const k of [...required].sort()) {
    const old = oldSources.get(k), candidate = sourceCandidates.get(k), approval = approvalBySource.get(k);
    const split = k.indexOf(":"), collection = k.slice(0, split) as SourceCollection, key = k.slice(split + 1);
    sourcePreconditions.push({ collection, key, stateSha256: old ? releaseHash({ id: old.id, status: old.status, record: old.record }) : releaseHash("absent") });
    if (!old && !candidate && !approval?.record) { issues.push(`Referenced source has no current or approved record: ${k}.`); continue; }
    const record = approval?.record ?? old?.record ?? candidate!.record;
    if ((collection === "citations" ? record.citationKey : record.reference) !== key) { issues.push(`Approved source key does not match its record: ${k}.`); continue; }
    if (candidate && collection === "citations" && candidate.aliases.some(r => (compact(r.author) && identity(r.author) !== identity(record.author)) || identity(r.title) !== identity(record.title))) {
      issues.push(`Bibliography identity conflict: ${k}.`); continue;
    }
    if (candidate && collection !== "citations") {
      for (const alias of candidate.aliases) {
        const names = collection === "quran-verses" ? ["reference", "surahNumber", "ayahNumber", "arabic", "translation", "translator", "sourceAttribution"] : ["reference", "book", "chapter", "verse", "text", "version", "sourceAttribution"];
        const mismatch = names.filter(n => (n === "translation" ? english(alias[n]) !== english(record[n]) : compact(alias[n]) !== compact(record[n])));
        if (mismatch.length) issues.push(`Scripture differs from approved current drafts: ${k} (${mismatch.join(", ")}).`);
      }
    }
    const recordSha256 = releaseHash(record), changed = !old || releaseHash(old.record) !== recordSha256;
    const mandatory = manifest.requiredSourceUpdates?.find(s => sourceKey(s.collection, s.key) === k);
    if (mandatory && mandatory.recordSha256 !== recordSha256) issues.push(`Required source correction is missing or changed: ${k}.`);
    if (old?.status === "verified" && !changed && !mandatory) { preservedVerifiedSources++; continue; }
    if (!approval || approval.recordSha256 !== recordSha256) {
      neededSourceApprovals.push({ collection, key, status: old?.status ?? "new", recordSha256, record });
      issues.push(`Exact verified evidence approval required: ${k}.`); continue;
    }
    const proofKind = collection === "quran-verses" ? "canonical-quran" : collection === "bible-verses" ? "world-english-bible" : "bibliographic-source";
    const proof = validProof(approval.proofId, proofKind, { collection, key, recordSha256 });
    if (proof) sourceActions.push({ collection, key, id: old?.id, beforeSha256: old ? releaseHash({ id: old.id, status: old.status, record: old.record }) : undefined, record, recordSha256, proof });
    if (candidate && collection === "citations" && candidate.aliases.some(r => compact(r.note) !== compact(record.note))) warnings.push(`Shared bibliography context notes preserved for ${key}; no last-writer overwrite.`);
  }
  const body = { release: manifest.release, principalSha256: releaseHash(snapshot.owner), manifestSha256: releaseHash(manifest), sourceActions, sourcePreconditions, articlePreconditions, articleActions: candidates, neededSourceApprovals, issues: [...new Set(issues)], warnings: [...new Set(warnings)], summary: { approvedArticles: manifest.articleApprovals?.length ?? 0, draftMutations: mutationSlugs.size, sourceMutations: sourceActions.length, articleMutations: candidates.length, publishedAfter: snapshot.articles.filter(a => a.status === "published" && !manifest.articleApprovals.some(m => m.slug === a.slug)).length + manifest.articleApprovals.filter(a => a.publish || oldArticles.get(a.slug)?.status === "published").length, preservedVerifiedSources } };
  return { ...body, planSha256: releaseHash(body) };
}
