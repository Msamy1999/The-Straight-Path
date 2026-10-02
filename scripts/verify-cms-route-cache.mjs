import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import console from "node:console";
import ts from "typescript";

const categoryRoutes = [
  "difficult-questions", "historical-evidence", "jesus-in-islam-and-christianity",
  "preservation", "prophecies", "questions", "religious-history",
  "salvation-and-purpose-of-life", "scientific-signs", "tawhid-and-the-trinity",
  "the-quran-and-the-bible", "war-and-violence", "women",
];
const routes = new Map([
  ["app/(frontend)/page.tsx", "/"],
  ...["islam-overview", "islam-christianity", "atheism-agnosticism",
    "people-of-palestine", "glossary", "sources", ...categoryRoutes]
    .map(route => [`app/(frontend)/${route}/page.tsx`, `/${route}`]),
  ["app/(frontend)/articles/[slug]/page.tsx", "/articles/[slug]"],
  ["app/sitemap.ts", "/sitemap.xml"],
]);
assert.equal(routes.size, 22);

function dynamicMode(path, source) {
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const node of tree.statements) {
    if (!ts.isVariableStatement(node) || !node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === "dynamic" &&
          declaration.initializer && ts.isStringLiteral(declaration.initializer)) {
        return declaration.initializer.text;
      }
    }
  }
}

if (process.argv.includes("--baseline")) {
  const unguarded = [...routes.keys()].filter(path => {
    const source = execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8" });
    return dynamicMode(path, source) !== "force-dynamic";
  });
  assert.equal(unguarded.length, 22, "Baseline must reproduce all affected build-time routes");
  console.log("Baseline reproduced: 22 CMS-dependent routes lacked a runtime-rendering guard.");
  process.exit(0);
}

for (const path of routes.keys()) {
  const source = readFileSync(path, "utf8");
  assert.equal(dynamicMode(path, source), "force-dynamic", `${path} must use runtime published availability`);
  assert.doesNotMatch(source, /includeDrafts\s*:\s*true/, `${path} must not bypass public visibility`);
  assert.doesNotMatch(source, /export const fetchCache\s*=\s*["']force-no-store/, "Keep tagged database caches");
}
const article = readFileSync("app/(frontend)/articles/[slug]/page.tsx", "utf8");
assert.doesNotMatch(article, /generateStaticParams|getArticleSlugs/, "Do not bake builder article availability into paths");
assert.match(article, /getArticleBySlug\(slug\)/, "Article pages must still use the content seam");
const search = readFileSync("app/(frontend)/search/page.tsx", "utf8");
assert.match(search, /await searchParams/, "Search remains request-dependent without unrelated configuration changes");

function inspectPages(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) inspectPages(path);
    else if (entry.name === "page.tsx" && !routes.has(path)) {
      const source = readFileSync(path, "utf8");
      assert.notEqual(dynamicMode(path, source), "force-dynamic", `Do not opt unrelated route ${path} out of prerendering`);
      if (source.includes('@/lib/content') || source.includes('@/components/content/CategoryPage')) {
        assert.equal(path, "app/(frontend)/search/page.tsx", `New CMS-dependent route requires a cache policy: ${path}`);
      }
    }
  }
}
inspectPages("app/(frontend)");

if (process.argv.includes("--build")) {
  const manifest = JSON.parse(readFileSync(resolve(".next/prerender-manifest.json"), "utf8"));
  for (const route of routes.values()) {
    assert.equal(manifest.routes[route], undefined, `${route} must not retain build-database HTML`);
  }
  assert.equal(Object.keys(manifest.routes).some(route => route.startsWith("/articles/")), false,
    "Article HTML must not come from the build-time editorial database");
  console.log("Production manifest verified: CMS pages, article HTML, and sitemap are not prerendered.");
}
console.log("22 scoped CMS routes render at runtime; strict visibility and tagged content caches remain intact.");
