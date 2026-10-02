import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { PayloadRequest } from "payload";
import { articleStateHash, releaseHash, type Fields, type ReleasePlan, type ReleaseSnapshot, type SourceState } from "./approved-release-plan";
import { assertCommittedRelease, assertRegisteredReleaseTransaction, assertTransactionReleasePreconditions, readTransactionReleaseSnapshot, requireRealReleaseTransaction, type TransactionReader } from "./approved-release-transaction";

function fixture() {
  const record = { citationKey: "source-one", type: "book", title: "Identifiable Book", author: "An Author", url: "https://example.org/book", note: "A checked description." };
  const source: SourceState = { id: 1, collection: "citations", key: record.citationKey, status: "pending", record };
  const snapshot: ReleaseSnapshot = { owner: { id: 1, role: "owner" }, sources: [source], articles: [{ id: 1, slug: "article-one", status: "reviewed", payloadStatus: "draft", data: { title: "Title", subtitle: "Subtitle", summary: "Summary", category: "questions", audienceLevel: "beginner", tags: ["Questions"], sections: [{ sectionId: "answer", title: "Answer", kind: "notes", body: "Approved prose." }] }, citationKeys: [source.key], sectionCitationKeys: { answer: [source.key] }, relatedSlugs: [] }] };
  const plan: ReleasePlan = { release: "fixture", principalSha256: releaseHash(snapshot.owner), manifestSha256: "m", planSha256: "p", sourceActions: [], sourcePreconditions: [{ collection: source.collection, key: source.key, stateSha256: releaseHash({ id: source.id, status: source.status, record: source.record }) }], articlePreconditions: [{ slug: snapshot.articles[0].slug, stateSha256: articleStateHash(snapshot.articles[0]) }], articleActions: [], neededSourceApprovals: [], issues: [], warnings: [], summary: { approvedArticles: 1, draftMutations: 1, sourceMutations: 0, articleMutations: 0, publishedAfter: 1, preservedVerifiedSources: 0 } };
  const req = { transactionID: "actual-transaction-fixture" } as Partial<PayloadRequest>;
  const calls: string[] = [];
  let ownerRole = "owner";
  const currentSource = { id: source.id, status: source.status, ...record };
  const currentArticle: Fields & { _status: string } = { id: 1, slug: snapshot.articles[0].slug, status: "reviewed", _status: "draft", ...snapshot.articles[0].data, citations: [1], relatedArticles: [], sections: [{ sectionId: "answer", title: "Answer", kind: "notes", body: "Approved prose.", citations: [1] }] };
  const checkOptions = (options: { req: Partial<PayloadRequest>; overrideAccess: false; collection: string }) => {
    assert.equal(options.req, req);
    assert.equal(options.req.transactionID, "actual-transaction-fixture");
    assert.equal(options.overrideAccess, false);
    calls.push(options.collection);
  };
  const reader: TransactionReader = {
    findByID: async options => { checkOptions(options); return { id: 1, role: ownerRole }; },
    find: async options => {
      checkOptions(options);
      if (options.collection === "citations") return { docs: [currentSource] };
      assert.equal(options.draft, true);
      return { docs: [currentArticle] };
    },
  };
  return { record, snapshot, plan, req, calls, reader, currentSource, currentArticle, setOwnerRole: (role: string) => { ownerRole = role; } };
}

test("every precondition read stays inside the same real request transaction", async () => {
  const f = fixture();
  const state = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assertTransactionReleasePreconditions(f.plan, state, "sources");
  assert.deepEqual(f.calls, ["users", "citations", "articles"]);
});
test("an editor's source change after external preflight is rejected by transaction reads", async () => {
  const f = fixture();
  f.currentSource.note = "A concurrent editor changed this source.";
  const state = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assert.throws(() => assertTransactionReleasePreconditions(f.plan, state, "sources"), /Transaction-bound source precondition changed/);
});
test("an editor's article change after external preflight is rejected before mutation", async () => {
  const f = fixture();
  f.currentArticle.summary = "A newer editorial draft.";
  const state = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assert.throws(() => assertTransactionReleasePreconditions(f.plan, state, "sources"), /Transaction-bound article precondition changed/);
});
test("Payload _status changes are protected by the transaction precondition", async () => {
  const f = fixture();
  f.currentArticle._status = "published";
  const state = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assert.throws(() => assertTransactionReleasePreconditions(f.plan, state, "sources"), /Transaction-bound article precondition changed/);
});
test("publication phase accepts only the exact committed verified source values", async () => {
  const f = fixture();
  f.plan.sourceActions = [{ collection: "citations", key: "source-one", id: 1, record: f.record, recordSha256: releaseHash(f.record), proof: { id: "proof", kind: "bibliographic-source", status: "verified", reviewedBy: "Fixture review", verifiedAt: "2026-10-02T18:00:00Z", artifactPath: "data/release-evidence/fixture.json", artifactSha256: "a".repeat(64), sourceUrls: ["https://example.org/book"] } }];
  f.currentSource.status = "verified";
  const state = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assertTransactionReleasePreconditions(f.plan, state, "articles");
  f.currentSource.note = "Changed after source-phase commit.";
  const changed = await readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan);
  assert.throws(() => assertTransactionReleasePreconditions(f.plan, changed, "articles"), /Transaction-bound verified source changed/);
});
test("stored owner role is rechecked inside the transaction before content reads", async () => {
  const f = fixture(); f.setOwnerRole("reviewer");
  await assert.rejects(readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan), /Stored owner authority changed/);
  assert.deepEqual(f.calls, ["users"]);
});
test("no-op/null transaction IDs fail before even a precondition read", async () => {
  const f = fixture(); f.req.transactionID = undefined;
  await assert.rejects(readTransactionReleaseSnapshot(f.reader, f.req, f.snapshot, f.plan), /real release transaction/);
  assert.deepEqual(f.calls, []);
  for (const value of [null, undefined, "", NaN, {}]) assert.throws(() => requireRealReleaseTransaction(value), /real release transaction/);
});
test("normal web database config is unchanged; transaction options are CLI-local", () => {
  assert.doesNotMatch(readFileSync("payload.config.ts", "utf8"), /transactionOptions/);
  const cli = readFileSync("payload/publish-approved-release.ts", "utf8");
  assert.match(cli, /sqliteAdapter\(\{ client: \{ url: databaseUri \}, transactionOptions: \{\}/);
  assert.match(cli, /assertTransactionReleasePreconditions\(plan, await readTransactionReleaseSnapshot/);
  assert.match(cli, /_status: action\.payloadStatus/);
});

test("every operation requires the same still-registered transaction session", () => {
  const req = { transactionID: "active" } as Partial<PayloadRequest>;
  const registry = { sessions: { active: { db: {} } } };
  assert.doesNotThrow(() => assertRegisteredReleaseTransaction(req, registry, "active"));
  req.transactionID = "different";
  assert.throws(() => assertRegisteredReleaseTransaction(req, registry, "active"), /transaction changed/);
  req.transactionID = undefined;
  assert.throws(() => assertRegisteredReleaseTransaction(req, registry, "active"), /real release transaction/);
  req.transactionID = "active";
  assert.throws(() => assertRegisteredReleaseTransaction(req, { sessions: {} }, "active"), /no longer registered/);
  assert.throws(() => assertRegisteredReleaseTransaction(req, { sessions: { active: {} } }, "active"), /no longer registered/);
});

test("post-commit verification rejects a silent article rollback or incomplete publication", () => {
  const f = fixture();
  const settled = { ...f.plan, articleActions: [] };
  const committed = { ...f.snapshot, articles: f.snapshot.articles.map(article => ({ ...article, status: "published" as const, payloadStatus: "published" as const })) };
  assert.doesNotThrow(() => assertCommittedRelease(f.plan, committed, settled));
  assert.throws(() => assertCommittedRelease(f.plan, f.snapshot, settled), /did not match/);
  assert.throws(() => assertCommittedRelease(f.plan, f.snapshot, { ...settled, issues: ["Publication is incomplete"] }), /did not match/);
  assert.throws(() => assertCommittedRelease(f.plan, f.snapshot, { ...settled, articleActions: [{}] as ReleasePlan["articleActions"] }), /did not match/);
  assert.throws(() => assertCommittedRelease(f.plan, f.snapshot, { ...settled, summary: { ...settled.summary, publishedAfter: 0 } }), /did not match/);
  assert.throws(() => assertCommittedRelease(f.plan, { ...f.snapshot, owner: { id: 1, role: "reviewer" } }, settled), /Owner authority changed/);
});

test("post-commit verification checks exact verified sources and preserves untouched source state", () => {
  const f = fixture();
  const action = { collection: "citations" as const, key: "source-one", id: 1, record: f.record, recordSha256: releaseHash(f.record), proof: {} as ReleasePlan["sourceActions"][number]["proof"] };
  const plan = { ...f.plan, sourceActions: [action] };
  const committed = { ...f.snapshot, articles: f.snapshot.articles.map(article => ({ ...article, status: "published" as const, payloadStatus: "published" as const })) };
  const snapshot = { ...committed, sources: [{ ...f.snapshot.sources[0], status: "verified" as const }] };
  const settled = { ...plan, articleActions: [] };
  assert.doesNotThrow(() => assertCommittedRelease(plan, snapshot, settled));
  assert.throws(() => assertCommittedRelease(plan, committed, settled), /did not remain committed/);
  assert.throws(() => assertCommittedRelease(plan, { ...snapshot, sources: [{ ...snapshot.sources[0], record: { ...f.record, note: "Changed after commit" } }] }, settled), /did not remain committed/);
  assert.throws(() => assertCommittedRelease(plan, { ...snapshot, sources: [{ ...snapshot.sources[0], id: 2 }] }, settled), /did not remain committed/);
  assert.throws(() => assertCommittedRelease(f.plan, snapshot, { ...f.plan, articleActions: [] }), /preserved source changed/);
});
