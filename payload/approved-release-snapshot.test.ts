import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { readReleaseSnapshot } from "./approved-release-snapshot";

function fixture() {
  const directory = mkdtempSync(path.join(os.tmpdir(), "tsp-snapshot-semantics-"));
  const filename = path.join(directory, "synthetic.db"), db = new DatabaseSync(filename);
  db.exec(`
    CREATE TABLE users(id INTEGER,role TEXT); INSERT INTO users VALUES(1,'owner');
    CREATE TABLE citations(id INTEGER,citation_key TEXT,type TEXT,title TEXT,author TEXT,publisher TEXT,year INTEGER,url TEXT,note TEXT,status TEXT);
    INSERT INTO citations VALUES(1,'old-source','book','Old synthetic source',NULL,NULL,NULL,NULL,NULL,'verified');
    INSERT INTO citations VALUES(2,'current-source','book','Current synthetic source',NULL,NULL,NULL,NULL,NULL,'verified');
    CREATE TABLE quran_verses(id INTEGER,surah_name TEXT,surah_number INTEGER,ayah_number INTEGER,reference TEXT,arabic TEXT,translator TEXT,source_attribution TEXT,status TEXT);
    CREATE TABLE quran_verses_locales(_parent_id INTEGER,_locale TEXT,translation TEXT);
    CREATE TABLE bible_verses(id INTEGER,book TEXT,chapter INTEGER,verse TEXT,reference TEXT,version TEXT,source_attribution TEXT,status TEXT);
    CREATE TABLE bible_verses_locales(_parent_id INTEGER,_locale TEXT,text TEXT);
    CREATE TABLE articles(id INTEGER,slug TEXT,category TEXT,audience_level TEXT,status TEXT,_status TEXT);
    INSERT INTO articles VALUES(1,'public-article','questions','beginner','published','published'),(2,'retired-private','questions','beginner','reviewed','draft');
    CREATE TABLE articles_locales(_parent_id INTEGER,_locale TEXT,title TEXT,subtitle TEXT,summary TEXT);
    INSERT INTO articles_locales VALUES(1,'en','Public MAIN title','Public subtitle','Approved public summary'),(2,'en','Historical private MAIN title','Old subtitle','Old summary');
    CREATE TABLE articles_sections(_order INTEGER,_parent_id INTEGER,id TEXT,section_id TEXT,kind TEXT);
    INSERT INTO articles_sections VALUES(1,1,'public-main-section','answer','notes'),(1,2,'private-main-section','answer','notes');
    CREATE TABLE articles_sections_locales(_parent_id TEXT,_locale TEXT,title TEXT,body TEXT);
    INSERT INTO articles_sections_locales VALUES('public-main-section','en','Published answer','Approved public MAIN body'),('private-main-section','en','Old answer','Historical private MAIN body');
    CREATE TABLE articles_rels(parent_id INTEGER,"order" INTEGER,path TEXT,citations_id INTEGER,articles_id INTEGER);
    INSERT INTO articles_rels VALUES(1,1,'citations',1,NULL),(1,2,'sections.0.citations',1,NULL),(2,1,'citations',1,NULL);
    CREATE TABLE articles_tags(parent_id INTEGER,"order" INTEGER,value TEXT); INSERT INTO articles_tags VALUES(1,1,'Questions'),(2,1,'History');
    CREATE TABLE _articles_v(id INTEGER,parent_id INTEGER,version_slug TEXT,version_category TEXT,version_audience_level TEXT,version_status TEXT,version__status TEXT,latest INTEGER);
    INSERT INTO _articles_v VALUES(101,1,'public-article','questions','beginner','reviewed','draft',1),(102,2,'retired-private','questions','beginner','reviewed','draft',1);
    CREATE TABLE _articles_v_locales(_parent_id INTEGER,_locale TEXT,version_title TEXT,version_subtitle TEXT,version_summary TEXT);
    INSERT INTO _articles_v_locales VALUES(101,'en','Unapproved PUBLIC draft title','Draft subtitle','Unapproved summary'),(102,'en','Current reviewed PRIVATE title','Current subtitle','Current summary');
    CREATE TABLE _articles_v_version_sections(_order INTEGER,_parent_id INTEGER,id INTEGER,section_id TEXT,kind TEXT);
    INSERT INTO _articles_v_version_sections VALUES(1,101,1001,'answer','notes'),(1,102,1002,'answer','notes');
    CREATE TABLE _articles_v_version_sections_locales(_parent_id INTEGER,_locale TEXT,title TEXT,body TEXT);
    INSERT INTO _articles_v_version_sections_locales VALUES(1001,'en','Unapproved answer','Unapproved PUBLIC draft body'),(1002,'en','Current answer','Approved current PRIVATE draft body');
    CREATE TABLE _articles_v_rels(parent_id INTEGER,"order" INTEGER,path TEXT,citations_id INTEGER,articles_id INTEGER);
    INSERT INTO _articles_v_rels VALUES(102,1,'version.citations',2,NULL),(102,2,'version.sections.0.citations',2,NULL),(102,3,'version.relatedArticles',NULL,1);
    CREATE TABLE _articles_v_version_tags(parent_id INTEGER,"order" INTEGER,value TEXT); INSERT INTO _articles_v_version_tags VALUES(102,1,'Questions');
  `);
  db.close();
  return { filename, update: (statement: string) => { const connection = new DatabaseSync(filename); try { connection.exec(statement); } finally { connection.close(); } }, cleanup: () => {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("tsp-snapshot-semantics-"));
    rmSync(resolved, { recursive: true, force: true });
  } };
}

test("published MAIN remains authoritative while private latest prose, citations and related links are verified", () => {
  const f = fixture();
  try {
    const snapshot = readReleaseSnapshot(f.filename);
    const publicArticle = snapshot.articles.find(a => a.slug === "public-article")!, privateArticle = snapshot.articles.find(a => a.slug === "retired-private")!;
    assert.equal(publicArticle.data.title, "Public MAIN title");
    assert.equal((publicArticle.data.sections as { body: string }[])[0].body, "Approved public MAIN body");
    assert.deepEqual(publicArticle.citationKeys, ["old-source"]);
    assert.equal(privateArticle.data.title, "Current reviewed PRIVATE title");
    assert.equal((privateArticle.data.sections as { body: string }[])[0].body, "Approved current PRIVATE draft body");
    assert.deepEqual(privateArticle.citationKeys, ["current-source"]);
    assert.deepEqual(privateArticle.sectionCitationKeys, { answer: ["current-source"] });
    assert.deepEqual(privateArticle.relatedSlugs, ["public-article"]);
    assert.deepEqual(privateArticle.data.tags, ["Questions"]);
    assert.equal(privateArticle.id, 2);
    assert.equal(privateArticle.status, "reviewed"); assert.equal(privateArticle.payloadStatus, "draft");
    assert.equal(snapshot.articles.filter(a => a.status === "published" && a.payloadStatus === "published").length, 1);
  } finally { f.cleanup(); }
});

test("private latest controls cannot manufacture public publication or rename main slugs", () => {
  const f = fixture();
  try {
    f.update("UPDATE _articles_v SET version_status='published',version__status='published' WHERE id=102");
    assert.throws(() => readReleaseSnapshot(f.filename), /inconsistent publication controls/);
    f.update("UPDATE _articles_v SET version_status='reviewed',version__status='draft',version_slug='changed-slug' WHERE id=102");
    assert.throws(() => readReleaseSnapshot(f.filename), /changes its main slug/);
  } finally { f.cleanup(); }
});

test("missing or duplicate latest PRIVATE versions fail closed instead of falling back to stale main", () => {
  const f = fixture();
  try {
    f.update("UPDATE _articles_v SET latest=0 WHERE id=102");
    assert.throws(() => readReleaseSnapshot(f.filename), /exactly one latest version/);
    f.update("UPDATE _articles_v SET latest=1 WHERE id=102; INSERT INTO _articles_v SELECT 103,parent_id,version_slug,version_category,version_audience_level,version_status,version__status,latest FROM _articles_v WHERE id=102");
    assert.throws(() => readReleaseSnapshot(f.filename), /exactly one latest version/);
  } finally { f.cleanup(); }
});
