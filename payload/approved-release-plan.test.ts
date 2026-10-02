import assert from "node:assert/strict";
import test from "node:test";
import { bibliographyKey, bibliographyRecord, buildReleasePlan, importedArticleData, releaseHash, validateReleaseManifest, type ApprovedReleaseManifest, type ReleaseDraft, type ReleaseProof, type ReleaseSnapshot, type SourceState } from "./approved-release-plan";

const draft: ReleaseDraft = { slug: "example", title: "Example", subtitle: "Subtitle", category: "questions", audienceLevel: "beginner", summary: "A reviewed explanation.", tags: ["Questions"], sections: [{ sectionId: "answer", title: "Answer", kind: "notes", body: "Evidence beside the claim." }], furtherReading: [{ author: "A. Writer", title: "Documented Work", note: "Article-specific context." }] };
const book = bibliographyRecord(draft.furtherReading![0]);
const editions = [
  { citationKey: "quran-tanzil-sahih-international", type: "quran", title: "The Quran — Tanzil Uthmani text with Saheeh International translation", url: "https://alquran.cloud", note: "Uthmani-script Arabic text from Tanzil with the Saheeh International English translation." },
  { citationKey: "bible-web-translation", type: "bible", title: "The Holy Bible, World English Bible (public domain)", url: "https://worldenglish.bible", note: "Public-domain English translation from the World English Bible." },
];
const editorial: ReleaseProof = { id: "article-proof", kind: "editorial-review", status: "verified", reviewedBy: "Recorded review", verifiedAt: "2026-10-02T18:00:00Z", sourceUrls: ["https://example.org/source"], artifactPath: "data/release-evidence/editorial.json", artifactSha256: "a".repeat(64) };
const sourceProof: ReleaseProof = { ...editorial, id: "source-proof", kind: "bibliographic-source" };
function fixture(status: SourceState["status"] = "pending") {
  const sources: SourceState[] = [...editions, book].map((record, i) => ({ id: i + 1, collection: "citations", key: String(record.citationKey), status, record }));
  const citationKeys = sources.map(s => s.key);
  const snapshot: ReleaseSnapshot = { owner: { id: 9, role: "owner" }, articles: [{ id: 1, slug: draft.slug, status: "reviewed", payloadStatus: "draft", data: importedArticleData(draft), citationKeys, sectionCitationKeys: { answer: [] }, relatedSlugs: [] }], sources };
  const manifest: ApprovedReleaseManifest = { schemaVersion: 1, release: "release-test", mutationSlugs: [draft.slug], articleApprovals: [{ slug: draft.slug, draftSha256: releaseHash(draft), publish: true, proofId: editorial.id }], sourceApprovals: [], proofs: [editorial, sourceProof] };
  return { snapshot, manifest, drafts: new Map([[draft.slug, { draft, sha256: releaseHash(draft) }]]), keyScripture: {}, redirects: {}, verifyArtifact: () => true };
}

test("pending sources never become verified without exact per-record approval", () => {
  const f = fixture(), p = buildReleasePlan(f);
  assert.equal(p.sourceActions.length, 0);
  assert.equal(p.neededSourceApprovals.length, 3);
  assert.ok(p.issues.some(i => i.includes("Exact verified evidence")));
  assert.ok(f.snapshot.sources.every(s => s.status === "pending"));
});
test("unchanged verified records retain verification without rewritten shared notes", () => {
  const f = fixture("verified");
  f.snapshot.sources[2].record.note = "Existing verified, shared context.";
  f.snapshot.articles[0].status = "published";
  f.snapshot.articles[0].payloadStatus = "published";
  f.manifest.articleApprovals[0].publish = false;
  const p = buildReleasePlan(f);
  assert.deepEqual(p.issues, []);
  assert.equal(p.sourceActions.length, 0);
  assert.equal(p.articleActions.length, 0);
  assert.equal(p.summary.preservedVerifiedSources, 3);
});
test("exact checked source hashes produce evidence-bound actions", () => {
  const f = fixture();
  f.manifest.sourceApprovals = f.snapshot.sources.map(s => ({ collection: s.collection, key: s.key, recordSha256: releaseHash(s.record), proofId: sourceProof.id }));
  const p = buildReleasePlan(f);
  assert.deepEqual(p.issues, []);
  assert.equal(p.sourceActions.length, 3);
  assert.equal(p.articleActions[0].status, "published");
  assert.ok(p.sourceActions.every(s => s.proof.status === "verified"));
});
test("a changed source hash or wrong proof kind prevents approval", () => {
  const f = fixture();
  f.manifest.sourceApprovals = f.snapshot.sources.map(s => ({ collection: s.collection, key: s.key, recordSha256: releaseHash(s.record), proofId: sourceProof.id }));
  f.manifest.sourceApprovals[0].recordSha256 = "f".repeat(64);
  f.manifest.sourceApprovals[1].proofId = editorial.id;
  const p = buildReleasePlan(f);
  assert.ok(p.issues.some(i => i.includes("Exact verified evidence")));
  assert.ok(p.issues.some(i => i.includes("wrong-kind")));
});
test("changed draft bytes represented by the canonical parsed hash invalidate approval", () => {
  const f = fixture("verified");
  f.drafts.set(draft.slug, { draft: { ...draft, summary: "Unreviewed replacement." }, sha256: releaseHash({ ...draft, summary: "Unreviewed replacement." }) });
  assert.ok(buildReleasePlan(f).issues.some(i => i.includes("changed since approval")));
});
test("a reviewer snapshot cannot act as an owner", () => {
  const f = fixture("verified"); f.snapshot.owner.role = "reviewer";
  assert.ok(buildReleasePlan(f).issues.some(i => i.includes("real existing owner")));
});
test("retired redirects are not newly published", () => {
  const f = fixture("verified");
  assert.ok(buildReleasePlan({ ...f, redirects: { example: "canonical" } }).issues.some(i => i.includes("Retired redirect")));
  f.snapshot.articles[0].status = "published";
  assert.deepEqual(buildReleasePlan({ ...f, redirects: { example: "canonical" } }).issues, []);
});
test("status-only approval cannot publish prose different from the approved draft", () => {
  const f = fixture("verified"); f.manifest.mutationSlugs = [];
  f.snapshot.articles[0].data.summary = "Existing public record's reviewed summary.";
  const p = buildReleasePlan(f);
  assert.ok(p.issues.some(i => i.includes("Status-only article prose differs")));
});
test("status-only approval keeps matching current prose and changes publication only", () => {
  const f = fixture("verified"); f.manifest.mutationSlugs = [];
  const p = buildReleasePlan(f);
  assert.deepEqual(p.issues, []);
  assert.equal(p.articleActions[0].data.summary, draft.summary);
  assert.equal(p.articleActions[0].status, "published");
});
test("source corrections cannot expand into unrelated records", () => {
  const f = fixture("verified");
  f.manifest.requiredSourceUpdates = [{ collection: "citations", key: "unrelated", recordSha256: "b".repeat(64) }];
  assert.ok(buildReleasePlan(f).issues.some(i => i.includes("outside approved article references")));
});
test("verification/status/ID fields cannot be injected in a content approval", () => {
  const f = fixture();
  f.manifest.sourceApprovals = [{ collection: "citations", key: bibliographyKey(draft.furtherReading![0]), recordSha256: releaseHash(book), record: { ...book, status: "verified", id: 200 }, proofId: sourceProof.id }];
  assert.ok(validateReleaseManifest(f.manifest).some(i => i.includes("non-content fields")));
});
test("missing or altered proof artifacts reject both publication and verification", () => {
  const f = fixture();
  f.manifest.sourceApprovals = f.snapshot.sources.map(s => ({ collection: s.collection, key: s.key, recordSha256: releaseHash(s.record), proofId: sourceProof.id }));
  const p = buildReleasePlan({ ...f, verifyArtifact: () => false });
  assert.equal(p.sourceActions.length, 0);
  assert.ok(p.issues.some(i => i.includes("changed proof artifact")));
});
test("plan hashes bind owner, content status, approved source values, and scope", () => {
  const f = fixture("verified"), a = buildReleasePlan(f).planSha256;
  f.snapshot.owner.id = 10; const b = buildReleasePlan(f).planSha256;
  assert.notEqual(a, b);
  f.snapshot.articles[0].status = "published";
  assert.notEqual(b, buildReleasePlan(f).planSha256);
});
test("a changed already-verified source invalidates the dry-run hash", () => {
  const f = fixture("verified"), before = buildReleasePlan(f).planSha256;
  f.snapshot.sources[2].record.note = "A concurrently changed source annotation.";
  assert.notEqual(before, buildReleasePlan(f).planSha256);
});
test("publication requires both custom and Payload statuses to be published", () => {
  const f = fixture("verified");
  f.snapshot.articles[0].status = "published";
  f.snapshot.articles[0].payloadStatus = "draft";
  const p = buildReleasePlan(f);
  assert.deepEqual(p.issues, []);
  assert.equal(p.articleActions.length, 1);
  assert.equal(p.articleActions[0].status, "published");
  assert.equal(p.articleActions[0].payloadStatus, "published");
});
test("Payload draft status is bound into the approved preconditions and plan hash", () => {
  const f = fixture("verified"), before = buildReleasePlan(f);
  f.snapshot.articles[0].payloadStatus = "published";
  const after = buildReleasePlan(f);
  assert.notEqual(before.articlePreconditions[0].stateSha256, after.articlePreconditions[0].stateSha256);
  assert.notEqual(before.planSha256, after.planSha256);
});
