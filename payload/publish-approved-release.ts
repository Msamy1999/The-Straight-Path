/**
 * Evidence-bound release workflow. Default is a SQLite READ-ONLY dry run.
 * Mutation requires --apply, --plan-hash=<approved dry-run hash>, a real
 * stored owner, and exact article/source evidence. Generic import stays intact.
 */
import { readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import type { CollectionAfterChangeHook, CollectionAfterOperationHook, CollectionBeforeChangeHook, CollectionBeforeOperationHook, PayloadRequest } from "payload";
import { articleRedirects } from "../data/article-redirects";
import { readReleaseSnapshot } from "./approved-release-snapshot";
import { prepareReleaseReaderConcurrency, verifyReleaseReaderConcurrency, type ReleaseSQLiteConnection } from "./approved-release-sqlite";
import { assertCommittedRelease, assertRegisteredReleaseTransaction, assertTransactionReleasePreconditions, readTransactionReleaseSnapshot, requireRealReleaseTransaction, type ReleaseTransactionRegistry, type TransactionReader } from "./approved-release-transaction";
import {
  buildReleasePlan, fileHash, releaseHash, validateReleaseManifest,
  type ApprovedReleaseManifest, type ReleaseDraft, type ReleaseProof,
} from "./approved-release-plan";

const args = process.argv.slice(2);
const option = (name: string) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const manifestPath = option("manifest");
if (!manifestPath) throw new Error("Use --manifest=<path>; default is read-only. Apply additionally requires --apply --plan-hash=<hash>.");
const apply = args.includes("--apply");
const traceEnabled = args.includes("--trace");
if (args.some(a => !a.startsWith("--manifest=") && !a.startsWith("--owner-id=") && !a.startsWith("--plan-hash=") && !a.startsWith("--output=") && a !== "--apply" && a !== "--trace")) throw new Error("Unknown release CLI argument.");
nextEnv.loadEnvConfig(process.cwd());
const root = process.cwd();
const databaseUri = process.env.DATABASE_URI ?? "file:./payload/payload.db";
if (!databaseUri.startsWith("file:") || databaseUri.includes("?")) throw new Error("This workflow requires a local SQLite file URI without query options.");
const databasePath = path.resolve(root, decodeURIComponent(databaseUri.slice(5)));
const manifest = JSON.parse(readFileSync(path.resolve(root, manifestPath), "utf8")) as ApprovedReleaseManifest;
const manifestErrors = validateReleaseManifest(manifest);
if (manifestErrors.length) throw new Error(manifestErrors.join("\n"));
const drafts = new Map<string, { draft: ReleaseDraft; sha256: string }>();
for (const name of readdirSync(path.join(root, "content-drafts")).filter(n => n.endsWith(".json"))) {
  const draft = JSON.parse(readFileSync(path.join(root, "content-drafts", name), "utf8")) as ReleaseDraft;
  drafts.set(draft.slug, { draft, sha256: releaseHash(draft) });
}
const keyScripture = JSON.parse(readFileSync(path.join(root, "data/article-key-scripture.json"), "utf8"));
const proofArtifacts = new Map<string, unknown>();
const verifyArtifact = (proof: ReleaseProof, subject: { collection: string; key: string; recordSha256: string }) => {
  try {
    if (path.isAbsolute(proof.artifactPath) || !/^(?:data\/release-evidence\/|outputs\/|release-evidence\/)/.test(proof.artifactPath.replace(/\\/g, "/")) || path.extname(proof.artifactPath) !== ".json") return false;
    const filename = realpathSync(path.resolve(root, proof.artifactPath));
    const relative = path.relative(root, filename);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
    const bytes = readFileSync(filename);
    if (fileHash(bytes) !== proof.artifactSha256) return false;
    let document = proofArtifacts.get(filename) as { kind?: string; status?: string; reviewedBy?: string; verifiedAt?: string; subjects?: { collection: string; key: string; recordSha256: string; status: string; sourceUrls: string[] }[] } | undefined;
    if (!document) { document = JSON.parse(bytes.toString("utf8")); proofArtifacts.set(filename, document); }
    return document?.kind === proof.kind && document.status === "verified" && document.reviewedBy === proof.reviewedBy && document.verifiedAt === proof.verifiedAt && Boolean(document.subjects?.some(s => s.collection === subject.collection && s.key === subject.key && s.recordSha256 === subject.recordSha256 && s.status === "verified" && Array.isArray(s.sourceUrls) && s.sourceUrls.length > 0 && s.sourceUrls.every(url => { try { const u = new URL(url); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } })));
  } catch { return false; }
};
const snapshot = readReleaseSnapshot(databasePath, option("owner-id"));
const makePlan = () => buildReleasePlan({ manifest, drafts, snapshot: readReleaseSnapshot(databasePath, option("owner-id")), keyScripture, redirects: articleRedirects, verifyArtifact });
const plan = buildReleasePlan({ manifest, drafts, snapshot, keyScripture, redirects: articleRedirects, verifyArtifact });
if (!apply) {
  // Source metadata and hashes are public evidence; user records never print.
  const result = { mode: "read-only", release: plan.release, planSha256: plan.planSha256, ownerPrincipalValidated: true, summary: plan.summary, issues: plan.issues, warnings: plan.warnings, neededSourceApprovals: plan.neededSourceApprovals, articleActions: plan.articleActions.map(a => ({ slug: a.slug, status: a.status, new: a.id === undefined })), sourceActions: plan.sourceActions.map(s => ({ collection: s.collection, key: s.key, recordSha256: s.recordSha256 })) };
  if (option("output")) {
    const filename = path.resolve(root, option("output")!);
    if (path.extname(filename) !== ".json") throw new Error("Dry-run reports must use a new .json artifact path.");
    // Machine-generated audit artifact only; never overwrite a source file,
    // existing report, database, environment file, or credential material.
    writeFileSync(filename, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    console.log(JSON.stringify({ mode: "read-only", report: filename, planSha256: plan.planSha256, summary: plan.summary, issueCount: plan.issues.length, neededSourceApprovalCount: plan.neededSourceApprovals.length }, null, 2));
  } else console.log(JSON.stringify(result, null, 2));
  process.exitCode = plan.issues.length ? 1 : 0;
} else {
  if (process.env.NODE_ENV !== "production") throw new Error("Apply requires NODE_ENV=production to prevent development schema pushes.");
  if (plan.issues.length) throw new Error(`Preflight rejected release with ${plan.issues.length} issue(s). No mutations performed.`);
  if (option("plan-hash") !== plan.planSha256) throw new Error("The approved dry-run plan hash is absent or no longer matches. No mutations performed.");
  const { getPayload, createLocalReq } = await import("payload");
  const { default: config } = await import("../payload.config");
  const { sqliteAdapter } = await import("@payloadcms/db-sqlite");
  const sanitized = await config;
  let transaction: null | number | string = null;
  let activeRequest: PayloadRequest | undefined;
  let phase = "initialization", stage = "initialize", currentSlug: string | undefined;
  let articleCount = 0;
  const registered = (req?: Partial<PayloadRequest>) => Boolean(transaction !== null && req?.transactionID === transaction && registry?.sessions?.[String(transaction)]?.db);
  const guard = (req: Partial<PayloadRequest>) => {
    if (transaction === null) return;
    if (activeRequest && req !== activeRequest) throw new Error("A nested release operation did not preserve the exact active request.");
    assertRegisteredReleaseTransaction(req, registry ?? {}, transaction);
  };
  const trace = (event: string, req?: Partial<PayloadRequest>, details?: { collection?: string; operation?: string; count?: number }) => {
    if (traceEnabled) console.log(JSON.stringify({ trace: event, time: new Date().toISOString(), phase, stage, ...(currentSlug ? { slug: currentSlug } : {}), ...(phase === "articles" ? { completedArticles: articleCount, totalArticles: plan.articleActions.length } : {}), ...details, transactionRegistered: registered(req) }));
  };
  const observe = (event: string, req: PayloadRequest, collection: string, operation: string) => {
    guard(req);
    if (phase === "articles") trace(event, req, { collection, operation });
  };
  const beforeOperation: CollectionBeforeOperationHook = ({ args, collection, operation, req }) => { observe("api:before", req, collection.slug, operation); return args; };
  const beforeChange: CollectionBeforeChangeHook = ({ data, collection, operation, req }) => { observe("change:before", req, collection.slug, operation); return data; };
  const afterChange: CollectionAfterChangeHook = ({ doc, collection, operation, req }) => { observe("change:after", req, collection.slug, operation); return doc; };
  const afterOperation: CollectionAfterOperationHook = ({ result, collection, operation, req }) => { observe("api:after", req, collection.slug, operation); return result; };
  // Enable real SQLite BEGIN IMMEDIATE transactions only in this short-lived
  // publisher. The normal web adapter, schema, access rules and gates stay as-is.
  const releaseConfig = {
    ...sanitized,
    db: { ...sanitized.db, ...sqliteAdapter({ client: { url: databaseUri }, transactionOptions: {} }), allowIDOnCreate: sanitized.db.allowIDOnCreate },
    collections: sanitized.collections.map(collection => ({ ...collection, lockDocuments: false as const, hooks: { ...collection.hooks, beforeOperation: [beforeOperation, ...collection.hooks.beforeOperation], beforeChange: [beforeChange, ...collection.hooks.beforeChange], afterChange: [...collection.hooks.afterChange, afterChange], afterOperation: [...collection.hooks.afterOperation, afterOperation] } })),
  };
  const payload = await getPayload({ config: releaseConfig });
  const registry = payload.db as unknown as ReleaseTransactionRegistry;
  const sqliteConnection = payload.db as unknown as ReleaseSQLiteConnection;
  let sourcePhaseCommitted = false;
  try {
    // Retrieve the actual stored principal; never manufacture an owner object.
    const owner = await payload.findByID({ collection: "users", id: snapshot.owner.id, depth: 0, overrideAccess: true });
    if (owner.role !== "owner") throw new Error("The stored principal no longer has owner authority.");
    const req = await createLocalReq({ user: owner, locale: "en", fallbackLocale: false, context: { approvedRelease: manifest.release } }, payload);
    activeRequest = req;
    phase = "sources";
    stage = "source-preconditions";
    await prepareReleaseReaderConcurrency(sqliteConnection);
    transaction = requireRealReleaseTransaction(await payload.db.beginTransaction());
    req.transactionID = transaction;
    await verifyReleaseReaderConcurrency(sqliteConnection, req, transaction);
    guard(req); trace("stage:before", req);
    const transactionReader = payload as unknown as TransactionReader;
    assertTransactionReleasePreconditions(plan, await readTransactionReleaseSnapshot(transactionReader, req, snapshot, plan), "sources");
    guard(req); trace("stage:after", req);
    if (makePlan().planSha256 !== plan.planSha256) throw new Error("Content changed after preflight; release aborted before mutations.");
    const sourceIds = new Map(snapshot.sources.map(s => [`${s.collection}:${s.key}`, s.id]));
    let sourceCount = 0;
    stage = "source-write";
    for (const action of plan.sourceActions) {
      const optional = action.collection === "citations" ? ["author", "publisher", "year", "url", "note"] : ["sourceAttribution"];
      // An explicitly approved complete record can remove stale metadata;
      // missing optional fields must not silently retain old false values.
      const clearedOptional = Object.fromEntries(optional.filter(key => action.record[key] === undefined).map(key => [key, null]));
      const data = { ...clearedOptional, ...action.record, status: "verified", ...(action.collection === "citations" ? { verifiedBy: action.proof.reviewedBy, verifiedDate: action.proof.verifiedAt } : {}) };
      const options = { collection: action.collection, data, depth: 0, overrideAccess: false, req, locale: "en" };
      guard(req);
      const result = action.id === undefined ? await payload.create(options as never) : await payload.update({ ...options, id: action.id } as never);
      guard(req);
      if (!("id" in result) || (typeof result.id !== "number" && typeof result.id !== "string")) throw new Error("Source mutation did not return a document ID.");
      sourceIds.set(`${action.collection}:${action.key}`, result.id);
      sourceCount++;
      if (sourceCount % 100 === 0 || sourceCount === plan.sourceActions.length) trace("sources:progress", req, { count: sourceCount });
    }
    // Commit checked source evidence before the separate atomic article phase.
    // The publication hook then checks those sources in its own exact request
    // transaction; a failed article phase does not falsely undo this evidence.
    stage = "source-commit";
    guard(req); trace("stage:before", req);
    await payload.db.commitTransaction(transaction);
    transaction = null;
    req.transactionID = undefined;
    sourcePhaseCommitted = true;
    console.log(JSON.stringify({ phase: "source-evidence", status: "committed", records: plan.sourceActions.length }));
    const assertPublicationInputsCurrent = () => {
      const settledSnapshot = readReleaseSnapshot(databasePath, option("owner-id"));
      const settledPlan = buildReleasePlan({ manifest, drafts, snapshot: settledSnapshot, keyScripture, redirects: articleRedirects, verifyArtifact });
      if (settledPlan.issues.length || settledPlan.principalSha256 !== plan.principalSha256 || releaseHash(settledPlan.articleActions) !== releaseHash(plan.articleActions)) throw new Error("Publication inputs changed after source verification; articles were not published.");
      const staged = new Map(plan.sourceActions.map(s => [`${s.collection}:${s.key}`, s]));
      const settled = new Map(settledSnapshot.sources.map(s => [`${s.collection}:${s.key}`, s]));
      for (const action of plan.sourceActions) {
        const actual = settled.get(`${action.collection}:${action.key}`);
        if (!actual || actual.status !== "verified" || releaseHash(actual.record) !== action.recordSha256) throw new Error("Approved source state changed before publication.");
      }
      for (const condition of plan.sourcePreconditions) {
        const key = `${condition.collection}:${condition.key}`;
        if (staged.has(key)) continue;
        const actual = settled.get(key);
        const actualHash = actual ? releaseHash({ id: actual.id, status: actual.status, record: actual.record }) : releaseHash("absent");
        if (actualHash !== condition.stateSha256) throw new Error("A preserved source changed before publication.");
      }
      for (const action of settledPlan.sourceActions) if (!staged.has(`${action.collection}:${action.key}`)) throw new Error("An unexpected source now requires verification; publication stopped.");
    };
    assertPublicationInputsCurrent();
    phase = "articles";
    stage = "article-preconditions";
    await prepareReleaseReaderConcurrency(sqliteConnection);
    transaction = requireRealReleaseTransaction(await payload.db.beginTransaction());
    req.transactionID = transaction;
    await verifyReleaseReaderConcurrency(sqliteConnection, req, transaction);
    guard(req); trace("stage:before", req);
    assertTransactionReleasePreconditions(plan, await readTransactionReleaseSnapshot(transactionReader, req, snapshot, plan), "articles");
    guard(req); trace("stage:after", req);
    assertPublicationInputsCurrent();
    const articleIds = new Map(snapshot.articles.map(a => [a.slug, a.id]));
    for (const action of plan.articleActions) {
      currentSlug = action.slug;
      stage = "article-read";
      guard(req); trace("stage:before", req);
      const citationIds = (keys: string[]) => keys.map(key => {
        const value = sourceIds.get(`citations:${key}`); if (value === undefined) throw new Error(`Required citation vanished: ${key}.`); return value;
      });
      const current = action.id === undefined ? undefined : await payload.findByID({ collection: "articles", id: action.id, depth: 0, overrideAccess: false, req, locale: "en", fallbackLocale: false, draft: true });
      guard(req); trace("stage:after", req);
      const currentSections = current?.sections ?? [];
      const idBySection = new Map(currentSections.map(s => [s.sectionId, s.id]));
      const desiredSections = (action.data.sections as ReleaseDraft["sections"]).map(s => ({ ...s, ...(idBySection.get(s.sectionId) ? { id: idBySection.get(s.sectionId) } : {}), citations: citationIds(action.sectionCitationKeys[s.sectionId] ?? []) }));
      const relationshipIds = (values: unknown) => Array.isArray(values) ? values.map(v => typeof v === "object" && v !== null && "id" in v ? v.id : v) : [];
      const currentComparableSections = currentSections.map(s => ({ sectionId: s.sectionId, title: s.title, kind: s.kind, body: s.body, citations: relationshipIds(s.citations) }));
      const desiredComparableSections = desiredSections.map(s => ({ sectionId: s.sectionId, title: s.title, kind: s.kind, body: s.body, citations: s.citations }));
      const body: Record<string, unknown> = { status: action.status, _status: action.payloadStatus, lastUpdated: new Date().toISOString() };
      if (!current) body.slug = action.slug;
      for (const field of ["title", "subtitle", "summary", "category", "audienceLevel", "tags"] as const) {
        if (!current || releaseHash(current[field]) !== releaseHash(action.data[field])) body[field] = action.data[field];
      }
      if (!current || releaseHash(currentComparableSections) !== releaseHash(desiredComparableSections)) body.sections = desiredSections;
      const desiredCitations = citationIds(action.citationKeys);
      if (!current || releaseHash(relationshipIds(current.citations)) !== releaseHash(desiredCitations)) body.citations = desiredCitations;
      const options = { collection: "articles" as const, data: body, depth: 0, overrideAccess: false, req, locale: "en", draft: action.payloadStatus === "draft" };
      stage = "article-write";
      guard(req); trace("stage:before", req);
      const result = action.id === undefined ? await payload.create(options as never) : await payload.update({ ...options, id: action.id } as never);
      guard(req); trace("stage:after", req);
      if (!("id" in result) || (typeof result.id !== "number" && typeof result.id !== "string")) throw new Error("Article mutation did not return a document ID.");
      articleIds.set(action.slug, result.id);
      articleCount++;
    }
    // Only changed/new approved articles are linked. Existing unrelated content
    // and glossary are never reseeded or rewritten by this workflow.
    for (const action of plan.articleActions) {
      currentSlug = action.slug;
      stage = "related-write";
      const relatedArticles = action.relatedSlugs.map(slug => {
        const value = articleIds.get(slug); if (value === undefined) throw new Error(`Related article vanished: ${slug}.`); return value;
      });
      const prior = snapshot.articles.find(a => a.slug === action.slug);
      if (!prior || releaseHash(prior.relatedSlugs) !== releaseHash(action.relatedSlugs)) {
        guard(req); trace("stage:before", req);
        await payload.update({ collection: "articles", id: articleIds.get(action.slug)!, data: { relatedArticles, status: action.status, _status: action.payloadStatus }, depth: 0, overrideAccess: false, req, locale: "en", draft: action.payloadStatus === "draft" } as never);
        guard(req); trace("stage:after", req);
      }
    }
    currentSlug = undefined;
    stage = "article-commit";
    guard(req); trace("stage:before", req);
    await payload.db.commitTransaction(transaction);
    transaction = null;
    req.transactionID = undefined;
    stage = "committed-state-verification";
    const committedSnapshot = readReleaseSnapshot(databasePath, option("owner-id"));
    const committedPlan = buildReleasePlan({ manifest, drafts, snapshot: committedSnapshot, keyScripture, redirects: articleRedirects, verifyArtifact });
    assertCommittedRelease(plan, committedSnapshot, committedPlan);
    trace("committed-state:verified", req);
    console.log(JSON.stringify({ mode: "applied", release: plan.release, planSha256: plan.planSha256, summary: plan.summary, sourcePhase: "committed", articlePhase: "committed atomically", sourceVerificationEvidence: "exact record hashes + checked proof artifacts", publication: "normal owner access and complete transaction-bound publish gates" }, null, 2));
  } catch (error) {
    if (transaction !== null) await payload.db.rollbackTransaction(transaction);
    if (sourcePhaseCommitted) console.error("Source evidence phase remains committed; article publication phase did not complete. Re-run read-only preflight before retrying.");
    throw error;
  } finally {
    await payload.destroy();
  }
}
