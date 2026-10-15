import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { importedArticleData, releaseHash } from "../../../payload/approved-release-plan";
import { readReleaseSnapshot } from "../../../payload/approved-release-snapshot";

// Read-only release-specific guard. Never print record contents or user data.
const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath) throw new Error("Pass a before database and optionally the rehearsed/applied database.");
const proof = JSON.parse(readFileSync("data/release-evidence/reader-refinements-20261015/article-review.json", "utf8"));
const draft = JSON.parse(readFileSync("content-drafts/islamic-practices-and-health.json", "utf8"));
const before = readReleaseSnapshot(beforePath);
const article = before.articles.find(a => a.slug === draft.slug);
if (!article || article.status !== "published" || article.payloadStatus !== "published") throw new Error("Expected an existing published article; stopped.");
const withoutChangedBodies = (data: Record<string, unknown>) => ({
  ...data,
  sections: (data.sections as { sectionId: string; body: string }[]).map(s => proof.scope.includes(s.sectionId) ? { ...s, body: "approved-section-change" } : s),
});
if (releaseHash(withoutChangedBodies(article.data)) !== releaseHash(withoutChangedBodies(importedArticleData(draft)))) throw new Error("Unrelated published prose differs; stopped before overwrite.");
for (const section of article.data.sections as { sectionId: string; body: string }[]) {
  if (proof.scope.includes(section.sectionId) && releaseHash(section.body) !== proof.beforeSectionBodyHashes[section.sectionId]) throw new Error("A target section changed since owner approval; stopped.");
}
const db = new DatabaseSync(beforePath, { readOnly: true });
try {
  const latest = db.prepare("SELECT version_status AS status, version__status AS payloadStatus FROM _articles_v WHERE parent_id=? AND latest=1").all(article.id);
  if (latest.length !== 1 || latest[0].status !== "published" || latest[0].payloadStatus !== "published") throw new Error("A private edit or inconsistent latest version needs editorial resolution; stopped.");
} finally { db.close(); }

if (afterPath) {
  const after = readReleaseSnapshot(afterPath);
  const updated = after.articles.find(a => a.slug === draft.slug);
  if (!updated || releaseHash(updated.data) !== releaseHash(importedArticleData(draft))) throw new Error("The approved prose was not applied exactly.");
  for (const field of ["id", "slug", "status", "payloadStatus", "citationKeys", "sectionCitationKeys", "relatedSlugs"] as const) {
    if (releaseHash(updated[field]) !== releaseHash(article[field])) throw new Error(`Article ${field} was changed outside the two-section scope.`);
  }
  if (releaseHash(before.owner) !== releaseHash(after.owner) || releaseHash(before.sources) !== releaseHash(after.sources)) throw new Error("Owner/source state changed unexpectedly.");
  if (releaseHash(before.articles.filter(a => a.slug !== draft.slug)) !== releaseHash(after.articles.filter(a => a.slug !== draft.slug))) throw new Error("An unrelated article changed.");
}
console.log(JSON.stringify({ guard: "passed", scope: proof.scope, preservedOtherProse: true, privateDraftConflict: false, ...(afterPath ? { verifiedApplication: true, preservedSourcesAndRelations: true, preservedOtherArticles: true } : {}) }));
