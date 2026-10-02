/** Builds a reviewable apply_patch artifact; never imports Payload or writes a database. */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { articleRedirects } from "../data/article-redirects";
import { readReleaseSnapshot } from "../payload/approved-release-snapshot";
import { bibliographyKey, bibliographyRecord, buildReleasePlan, fileHash, releaseHash, scriptureRecord, type ApprovedReleaseManifest, type Fields, type ReleaseDraft, type ReleaseProof, type ReleaseSnapshot, type SourceCollection } from "../payload/approved-release-plan";

type MetadataProof = {
  citationKey: string; decision: string; primarysourceURLs: string[]; reasons: string;
  reviewedMetadata: Fields; reviewComplete: boolean; verificationScope: string;
  correctionVerifiedAgainstPrimarySource?: boolean; proposedCorrection?: Fields;
  proposedReplacement?: Fields; replacementProof?: { decision: string; primarysourceURLs: string[]; scope: string };
};
type Correction = { filename: string; oldKey: string; newKey: string; correction: Fields; primarysourceURLs: string[] };
type Subject = { collection: string; key: string; recordSha256: string; status: "verified"; sourceUrls: string[]; scope: string; evidence?: Fields };
type Artifact = { kind: ReleaseProof["kind"]; status: "verified"; reviewedBy: string; verifiedAt: string; sourceUrls: string[]; method: Fields; subjects: Subject[] };
const root = process.cwd(), args = process.argv.slice(2);
const option = (name: string) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const outPath = option("output"), productionPath = option("production-snapshot");
if (!outPath) throw new Error("Use --output=<new patch artifact> [--production-snapshot=<read-only JSON snapshot>].");
const now = option("verified-at") ?? new Date().toISOString();
if (!Number.isFinite(Date.parse(now))) throw new Error("Invalid verification timestamp.");
const readJSON = <T,>(filename: string) => JSON.parse(readFileSync(path.join(root, filename), "utf8")) as T;
const clean = (value: Fields): Fields => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null));
const normalized = (value: unknown) => String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
const identity = (value: unknown) => String(value ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const english = (value: unknown) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const requiredURLs = (urls: string[]) => [...new Set(urls)].filter(url => { try { const u = new URL(url); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } });
const directory = "data/release-evidence/factual-review-20261002";
const artifacts = new Map<string, string>();
const failures: string[] = [], decisions: Fields[] = [];
const metadataReconciliations: Fields[] = [];
const proofRows = [...readJSON<MetadataProof[]>("outputs/release-20261002/source-proofs-a.json"), ...readJSON<MetadataProof[]>("outputs/release-20261002/source-proofs-b.json")];
const corrections = [...readJSON<Correction[]>("outputs/release-20261002/metadata-corrections.json"), ...readJSON<Correction[]>("outputs/release-20261002/metadata-corrections-b.json")];
const proofsByKey = new Map(proofRows.map(p => [p.citationKey, p]));
const correctionsByKey = new Map<string, Correction[]>();
for (const c of corrections) correctionsByKey.set(c.newKey, [...(correctionsByKey.get(c.newKey) ?? []), c]);
const drafts = new Map<string, { draft: ReleaseDraft; sha256: string }>();
const bibliography = new Map<string, { records: Fields[]; slugs: string[] }>();
const quran = new Map<string, Fields[]>(), bible = new Map<string, Fields[]>();
for (const filename of readdirSync(path.join(root, "content-drafts")).filter(f => f.endsWith(".json")).sort()) {
  const draft = readJSON<ReleaseDraft>(`content-drafts/${filename}`);
  drafts.set(draft.slug, { draft, sha256: releaseHash(draft) });
  for (const source of draft.furtherReading ?? []) {
    const key = bibliographyKey(source), group = bibliography.get(key) ?? { records: [], slugs: [] };
    group.records.push(clean(bibliographyRecord(source))); group.slugs.push(draft.slug); bibliography.set(key, group);
  }
  for (const v of draft.quranVerses ?? []) quran.set(String(v.reference), [...(quran.get(String(v.reference)) ?? []), clean(scriptureRecord("quran-verses", v))]);
  for (const v of draft.bibleVerses ?? []) bible.set(String(v.reference), [...(bible.get(String(v.reference)) ?? []), clean(scriptureRecord("bible-verses", v))]);
}
if (drafts.size !== 125) throw new Error(`Expected the reviewed 125-draft corpus, found ${drafts.size}.`);
const editionRecords: Fields[] = [
  { citationKey: "quran-tanzil-sahih-international", type: "quran", title: "The Quran — Tanzil Uthmani text with Saheeh International translation", url: "https://alquran.cloud", note: "Uthmani-script Arabic text from Tanzil with the Saheeh International English translation." },
  { citationKey: "bible-web-translation", type: "bible", title: "The Holy Bible, World English Bible (public domain)", url: "https://worldenglish.bible", note: "Public-domain English translation from the World English Bible." },
];
for (const record of editionRecords) bibliography.set(String(record.citationKey), { records: [record], slugs: [] });

// Revalidate the exact current quote corpus using the repository's actual
// canonical checks. Both are read-only with respect to editorial databases.
const quranOutput = execFileSync(process.execPath, ["payload/verify-quran-uthmani.mjs", ".codex-quran-audit/quran-uthmani.json", ".codex-quran-audit/en-sahih.json"], { cwd: root, encoding: "utf8" });
const bibleOutput = execFileSync("python", ["outputs/factual-corrections-20261002/verify-bible.py"], { cwd: root, encoding: "utf8" });
const bibleCheck = readJSON<{ recordsChecked: number; matchingRecords: number; differences: unknown[] }>("outputs/factual-corrections-20261002/bible-verification.json");
if (bibleCheck.recordsChecked !== 661 || bibleCheck.matchingRecords !== 661 || bibleCheck.differences.length) throw new Error("Current WEB corpus did not pass the source comparator.");
if (!/structured Qur'an verses checked: 761/.test(quranOutput) || !/Arabic body quotations checked: 30/.test(quranOutput) || !quranOutput.includes("ALL QUR'AN TEXT MATCHES")) throw new Error("Current Quran corpus did not pass the approved canonical check.");
const qaFiles = ["theology-independent-qa.json", "transmission-ethics-independent-qa.json", "root-independent-qa.json"];
const qaResults = qaFiles.flatMap(name => {
  const value = readJSON<Fields[] | { findings: Fields[] }>(`outputs/factual-corrections-20261002/${name}`);
  return Array.isArray(value) ? value : value.findings;
});
if (qaResults.length !== 117 || qaResults.some(r => r.result !== "Resolved")) throw new Error("The 117-finding independent QA is incomplete.");
const correctionReview = readJSON<{ counts: Fields; decisions: Fields[] }>("outputs/factual-corrections-20261002/rechecked-corrections.json");
const editorialURLs = requiredURLs(correctionReview.decisions.flatMap(d => Array.isArray(d.sourceUrls) ? d.sourceUrls as string[] : []));
if (!editorialURLs.length) throw new Error("Editorial source evidence is missing.");
const makeArtifact = (kind: Artifact["kind"], reviewedBy: string, sourceUrls: string[], method: Fields): Artifact => ({ kind, status: "verified", reviewedBy, verifiedAt: now, sourceUrls, method, subjects: [] });
const editorial = makeArtifact("editorial-review", "Codex source-backed editorial audit and independent cross-review", editorialURLs, {
  scope: "Current article prose, full import inputs and retained standalone FAQs; Quran/Bible quotations checked separately; disputed interpretations and qualified claims remain attributed.",
  articleCorpus: 125, auditedFindings: 117, independentQaResolved: 117,
  publicationScope: "113 active articles; 12 retired redirects retained as private reviewed records, never newly published.",
  bibliographyLimit: "Bibliography identities, supplied metadata and broad topic relevance were checked; this is not a claim that every full book or unread quotation was verified.",
  supplementalReview: "Root reviewed the current metadata corrections and source-grounded clarifications of worship, Messiahship and revelation; existing Quran/Bible quotations and their reference tokens were preserved.",
  evidenceInputs: ["outputs/factual-audit-20261002/full-factual-audit.json", "outputs/factual-corrections-20261002/rechecked-corrections.json", ...qaFiles.map(f => `outputs/factual-corrections-20261002/${f}`)].map(filename => ({ filename, sha256: fileHash(readFileSync(path.join(root, filename))) })),
});
for (const [slug, item] of drafts) editorial.subjects.push({ collection: "articles", key: slug, recordSha256: item.sha256, status: "verified", sourceUrls: editorialURLs, scope: "Source-backed editorial review of this exact current draft; not a universal scholarly or medical endorsement." });
const quranArtifact = makeArtifact("canonical-quran", "Codex canonical Tanzil/Saheeh International comparison", ["https://tanzil.net/docs/Uthmani_script", "https://api.alquran.cloud/v1/quran/quran-uthmani", "https://api.alquran.cloud/v1/quran/en.sahih"], {
  recordsChecked: 761, arabicBodyQuotationsChecked: 30, matches: 761,
  normalization: "Arabic NFC and layout whitespace as in repository verifier; English normalized word sequence, allowing only capitalization/punctuation/whitespace variation.",
  existingTextPolicy: "Existing canonical-equivalent Arabic/English values are retained exactly; new records come from the verified draft records. Surah-name transliteration aliases do not alter numeric reference or scripture text.",
  comparatorSha256: fileHash(readFileSync("payload/verify-quran-uthmani.mjs")),
  arabicDatasetSha256: fileHash(readFileSync(".codex-quran-audit/quran-uthmani.json")), englishDatasetSha256: fileHash(readFileSync(".codex-quran-audit/en-sahih.json")),
});
const bibleArtifact = makeArtifact("world-english-bible", "Codex World English Bible source-data comparison", ["https://github.com/seven1m/open-bibles/blob/master/eng-web.usfx.xml", "https://worldenglish.bible/"], {
  recordsChecked: 661, matches: 661, differences: 0,
  normalization: "Normalized English word sequence; punctuation/capitalization/whitespace differences do not change words. No unsupported Bible paraphrase is introduced.",
  comparatorSha256: fileHash(readFileSync("outputs/factual-corrections-20261002/verify-bible.py")), sourceDatasetSha256: fileHash(readFileSync("outputs/factual-audit-20261002/web-source.usfx.xml")),
  verifierResultSha256: fileHash(readFileSync("outputs/factual-corrections-20261002/bible-verification.json")),
});
const bibliographyArtifact = makeArtifact("bibliographic-source", "Codex primary catalog/institutional/source-text metadata review", requiredURLs(proofRows.flatMap(p => [...p.primarysourceURLs, ...(p.replacementProof?.primarysourceURLs ?? [])])), {
  scope: "Exact source identity, author/editor attribution, publication metadata actually supplied, and general further-reading relevance. No claim that a full book was read, every argument endorsed, or unread quotations checked.",
  originalReviewedRecords: 378, verifiedWithoutCorrection: 339, verifiedCorrections: 38,
  unverifiedOldRecordPolicy: "Rowan Williams's old The Trinity listing stays unverified and unreferenced; separately documented On Christian Theology is approved as its replacement.",
  provenance: ["source-proofs-a.json", "source-proofs-b.json", "metadata-corrections.json", "metadata-corrections-b.json"].map(name => ({ name, sha256: fileHash(readFileSync(`outputs/release-20261002/${name}`)) })),
});
function addSubject(artifact: Artifact, subject: Subject) {
  if (!artifact.subjects.some(s => s.collection === subject.collection && s.key === subject.key && s.recordSha256 === subject.recordSha256)) artifact.subjects.push(subject);
}
function compatibleScripture(collection: SourceCollection, record: Fields, aliases: Fields[]) {
  if (collection === "quran-verses") return aliases.every(a => normalized(a.reference) === normalized(record.reference) && normalized(a.surahNumber) === normalized(record.surahNumber) && normalized(a.ayahNumber) === normalized(record.ayahNumber) && normalized(a.arabic) === normalized(record.arabic) && english(a.translation) === english(record.translation) && normalized(a.translator) === normalized(record.translator) && normalized(a.sourceAttribution) === normalized(record.sourceAttribution));
  return aliases.every(a => ["book", "chapter", "verse", "reference", "version", "sourceAttribution"].every(k => normalized(a[k]) === normalized(record[k])) && english(a.text) === english(record.text));
}
function compatibleReviewedMetadata(record: Fields, reviewed: Fields, aliases: Fields[]) {
  const conflicts: string[] = [];
  for (const k of ["author", "title"]) if (normalized(reviewed[k]) && identity(record[k]) !== identity(reviewed[k])) conflicts.push(k);
  for (const k of ["type", "publisher", "year", "url"]) {
    if (normalized(reviewed[k]) && normalized(record[k]) !== normalized(reviewed[k])) conflicts.push(k);
    if (!normalized(reviewed[k]) && normalized(record[k]) && !aliases.some(a => normalized(a[k]) === normalized(record[k]))) conflicts.push(`unreviewed ${k} enrichment`);
  }
  if (normalized(record.note) !== normalized(reviewed.note) && !aliases.some(a => normalized(a.note) === normalized(record.note))) conflicts.push("unreviewed context note");
  return conflicts;
}
function proofFor(key: string) {
  const changed = correctionsByKey.get(key);
  const p = changed ? proofsByKey.get(changed[0].oldKey) : proofsByKey.get(key);
  if (!p?.reviewComplete) throw new Error(`No complete primary metadata review for ${key}.`);
  if (p.decision === "unverified") {
    if (!changed || p.replacementProof?.decision !== "verified") throw new Error(`Unverified old source cannot be approved: ${key}.`);
    return { row: p, urls: requiredURLs(p.replacementProof.primarysourceURLs), scope: p.replacementProof.scope, corrected: true };
  }
  if (p.decision === "needsfix" && (!changed || !p.correctionVerifiedAgainstPrimarySource)) throw new Error(`Unapplied/unverified metadata correction: ${key}.`);
  if (!["verified", "needsfix"].includes(p.decision)) throw new Error(`Unsupported source decision for ${key}.`);
  return { row: p, urls: requiredURLs(p.primarysourceURLs), scope: p.verificationScope, corrected: Boolean(changed) };
}
const local = readReleaseSnapshot(path.join(root, "payload/payload.db"));
const productionFile = productionPath ?? "outputs/release-20261002/production-content-snapshot.json";
const variants: { name: string; snapshot: ReleaseSnapshot }[] = [{ name: "local", snapshot: local }];
if (existsSync(path.join(root, productionFile))) {
  const value = readJSON<ReleaseSnapshot | { snapshot: ReleaseSnapshot }>(productionFile);
  variants.push({ name: "server", snapshot: "snapshot" in value ? value.snapshot : value });
}
const manifestByVariant = new Map<string, ApprovedReleaseManifest>();
for (const { name, snapshot } of variants) {
  const current = new Map(snapshot.sources.map(s => [`${s.collection}:${s.key}`, s]));
  const sourceApprovals: ApprovedReleaseManifest["sourceApprovals"] = [];
  const requiredSourceUpdates: NonNullable<ApprovedReleaseManifest["requiredSourceUpdates"]> = [];
  for (const [key, group] of bibliography) {
    const proof = proofFor(key), existing = current.get(`citations:${key}`);
    let record: Fields;
    let reconciled = false;
    if (proof.corrected) {
      const correctedRecords = correctionsByKey.get(key)!.map(c => {
        const slug = path.basename(c.filename, ".json");
        const source = drafts.get(slug)?.draft.furtherReading?.find(s => bibliographyKey(s) === key);
        if (!source) throw new Error(`Applied correction is missing in its current draft: ${c.filename}:${key}`);
        const actual = clean(bibliographyRecord(source)), approved = clean(bibliographyRecord(c.correction));
        const mismatches = ["citationKey", "title", "author", "type", "publisher", "year", "url"].filter(field => {
          if (field === "title" || field === "author") return identity(actual[field]) !== identity(approved[field]);
          return normalized(actual[field]) !== normalized(approved[field]);
        });
        if (mismatches.length) throw new Error(`Current correction differs from its primary-checked metadata (${mismatches.join(", ")}): ${c.filename}:${key}`);
        // Context notes may have been unified for an already reviewed shared
        // source. They do not authorize new author/edition/publication fields.
        return actual;
      });
      record = correctedRecords[0];
      const conflicts = group.records.flatMap(r => ["title", "author", "type", "publisher", "year", "url"].filter(k => {
        if (!normalized(r[k]) || !normalized(record[k])) return false;
        if (k === "title" || k === "author") return identity(r[k]) !== identity(record[k]);
        if (k === "url" && proof.urls.includes(String(r[k]))) return false;
        return normalized(r[k]) !== normalized(record[k]);
      }));
      if (conflicts.length) failures.push(`${name}: corrected source has conflicting supplied alias metadata (${[...new Set(conflicts)].join(", ")}): ${key}`);
    } else if (existing) {
      record = clean(existing.record);
      const conflicts = compatibleReviewedMetadata(record, proof.row.reviewedMetadata, group.records);
      if (conflicts.length) {
        // Replace a stale production variant only with the exact intersection
        // of the primary-reviewed metadata and an approved current draft.
        // An unreviewed enrichment or vaguely similar alias still fails closed.
        const reviewedRecord = clean({ citationKey: key, ...proof.row.reviewedMetadata });
        const approvedAlias = group.records.find(alias => releaseHash(alias) === releaseHash(reviewedRecord));
        if (approvedAlias) {
          metadataReconciliations.push({ variant: name, key, changedFields: conflicts, beforeRecordSha256: releaseHash(record), approvedRecordSha256: releaseHash(approvedAlias), reason: "Exact complete record agrees with both the primary metadata review and a current approved draft." });
          record = approvedAlias;
          reconciled = true;
        } else failures.push(`${name}: existing metadata not covered by review (${conflicts.join(", ")}): ${key}`);
      }
    } else record = clean(group.records[0]);
    if (!proof.urls.length) failures.push(`${name}: no primary URLs for ${key}`);
    const recordSha256 = releaseHash(record);
    addSubject(bibliographyArtifact, { collection: "citations", key, recordSha256, status: "verified", sourceUrls: proof.urls, scope: proof.scope, evidence: { originalReviewKey: proof.row.citationKey, decision: proof.corrected ? "Verified correction/replacement applied" : "Verified identity/provided metadata/relevance", checked: proof.row.reasons } });
    sourceApprovals.push({ collection: "citations", key, record, recordSha256, proofId: "bibliography" });
    if (proof.corrected || reconciled) requiredSourceUpdates.push({ collection: "citations", key, recordSha256 });
  }
  for (const [collection, groups, artifact] of [["quran-verses", quran, quranArtifact], ["bible-verses", bible, bibleArtifact]] as const) {
    for (const [key, aliases] of groups) {
      const existing = current.get(`${collection}:${key}`), record = clean(existing?.record ?? aliases[0]);
      if (!compatibleScripture(collection, record, aliases)) failures.push(`${name}: scripture does not match checked draft words/Arabic/metadata: ${key}`);
      const recordSha256 = releaseHash(record);
      addSubject(artifact, { collection, key, recordSha256, status: "verified", sourceUrls: artifact.sourceUrls, scope: "This exact record's scripture matches the actual source comparator under its documented normalization; metadata/reference agrees with the checked corpus." });
      sourceApprovals.push({ collection, key, record, recordSha256, proofId: collection === "quran-verses" ? "quran" : "bible" });
      // Explicitly include the real scripture corpus, even peripheral verses
      // not currently chosen as foundational cards. Never include placeholders.
      requiredSourceUpdates.push({ collection, key, recordSha256 });
    }
  }
  manifestByVariant.set(name, { schemaVersion: 1, release: "factual-review-20261002", mutationSlugs: [...drafts.keys()], articleApprovals: [...drafts].map(([slug, item]) => ({ slug, draftSha256: item.sha256, publish: !articleRedirects[slug], proofId: "articles" })), sourceApprovals, requiredSourceUpdates, proofs: [] });
}
for (const [name, artifact] of [["article-review", editorial], ["canonical-quran", quranArtifact], ["world-english-bible", bibleArtifact], ["bibliographic-source", bibliographyArtifact]] as const) artifacts.set(`${directory}/${name}.json`, `${JSON.stringify(artifact, null, 2)}\n`);
const proofObjects = [
  ["articles", "article-review", editorial], ["quran", "canonical-quran", quranArtifact], ["bible", "world-english-bible", bibleArtifact], ["bibliography", "bibliographic-source", bibliographyArtifact],
] as const;
const keyScripture = readJSON<Record<string, { quran?: string[]; bible?: string[] }>>("data/article-key-scripture.json");
for (const { name, snapshot } of variants) {
  const manifest = manifestByVariant.get(name)!;
  manifest.proofs = proofObjects.map(([id, filename, artifact]) => ({ id, kind: artifact.kind, status: "verified", reviewedBy: artifact.reviewedBy, verifiedAt: artifact.verifiedAt, sourceUrls: artifact.sourceUrls, artifactPath: `${directory}/${filename}.json`, artifactSha256: fileHash(artifacts.get(`${directory}/${filename}.json`)!) }));
  const plan = buildReleasePlan({ manifest, drafts, snapshot, keyScripture, redirects: articleRedirects, verifyArtifact: (proof, subject) => {
    const bytes = artifacts.get(proof.artifactPath); if (!bytes || fileHash(bytes) !== proof.artifactSha256) return false;
    const artifact = JSON.parse(bytes) as Artifact;
    return artifact.kind === proof.kind && artifact.status === "verified" && artifact.subjects.some(s => s.collection === subject.collection && s.key === subject.key && s.recordSha256 === subject.recordSha256 && s.status === "verified" && s.sourceUrls.length > 0);
  } });
  failures.push(...plan.issues.map(i => `${name}: ${i}`));
  decisions.push({ variant: name, sourceRecords: manifest.sourceApprovals.length, requiredSourceUpdates: manifest.requiredSourceUpdates?.length, planSha256: plan.planSha256, planSummary: plan.summary, issues: plan.issues });
  artifacts.set(`${directory}/manifest-${name}.json`, `${JSON.stringify(manifest, null, 2)}\n`);
}
if (failures.length) {
  console.log(JSON.stringify({ result: "Not generated: evidence compatibility failures", failures: [...new Set(failures)], variants: decisions, metadataReconciliations, verification: { quranOutput: quranOutput.trim(), bibleOutput: bibleOutput.trim() } }, null, 2));
  process.exitCode = 1;
} else {
  let patch = "*** Begin Patch\n";
  for (const [filename, value] of artifacts) {
    if (existsSync(path.join(root, filename))) throw new Error(`Refusing to replace existing packaged proof artifact without review: ${filename}.`);
    patch += `*** Add File: ${filename}\n${value.trimEnd().split("\n").map(line => `+${line}`).join("\n")}\n`;
  }
  patch += "*** End Patch\n";
  writeFileSync(path.resolve(root, outPath), patch, { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ result: "Generated reviewable evidence patch; no publication/database writes", output: path.resolve(root, outPath), artifacts: artifacts.size, variants: decisions, metadataReconciliations, subjectCounts: { articles: editorial.subjects.length, quran: quranArtifact.subjects.length, bible: bibleArtifact.subjects.length, bibliographic: bibliographyArtifact.subjects.length }, limits: bibliographyArtifact.method.scope, verification: { quranOutput: quranOutput.trim(), bibleOutput: bibleOutput.trim() } }, null, 2));
}
