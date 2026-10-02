import { DatabaseSync } from "node:sqlite";
import type { ArticleState, Fields, ReleaseSnapshot, SourceState } from "./approved-release-plan";

type Row = Record<string, unknown>;
const id = (value: unknown) => value as number | string;
const nullable = (value: unknown) => value === null ? undefined : value;

/**
 * Reads published MAIN content and the latest PRIVATE draft content, plus the
 * stored owner ID/role only. Payload draft:true intentionally saves private
 * edits only in versions; their historical MAIN rows are not publication truth.
 */
export function readReleaseSnapshot(databasePath: string, ownerId?: string): ReleaseSnapshot {
  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    if (!db.prepare("PRAGMA table_info(users)").all().some(c => c.name === "role")) throw new Error("The database has no editorial role field; complete the approved role migration first.");
    const owners = db.prepare("SELECT id, role FROM users WHERE role='owner'").all() as Row[];
    const owner = ownerId ? owners.find(o => String(o.id) === ownerId) : owners.length === 1 ? owners[0] : undefined;
    if (!owner) throw new Error(ownerId ? "The requested principal is not an existing owner." : "Exactly one existing owner or an explicit owner ID is required.");
    const citationRows = db.prepare("SELECT id,citation_key,type,title,author,publisher,year,url,note,status FROM citations").all() as Row[];
    const sources: SourceState[] = citationRows.map(r => ({
      id: id(r.id), collection: "citations", key: String(r.citation_key), status: r.status as SourceState["status"],
      record: { citationKey: r.citation_key, type: r.type, title: r.title, author: nullable(r.author), publisher: nullable(r.publisher), year: nullable(r.year), url: nullable(r.url), note: nullable(r.note) },
    }));
    const citationKeys = new Map(citationRows.map(r => [r.id, String(r.citation_key)]));
    const quranRows = db.prepare("SELECT q.id,q.surah_name,q.surah_number,q.ayah_number,q.reference,q.arabic,l.translation,q.translator,q.source_attribution,q.status FROM quran_verses q LEFT JOIN quran_verses_locales l ON l._parent_id=q.id AND l._locale='en'").all() as Row[];
    for (const r of quranRows) sources.push({ id: id(r.id), collection: "quran-verses", key: String(r.reference), status: r.status as SourceState["status"], record: { surahName: r.surah_name, surahNumber: r.surah_number, ayahNumber: r.ayah_number, reference: r.reference, arabic: r.arabic, translation: r.translation, translator: r.translator, sourceAttribution: nullable(r.source_attribution) } });
    const bibleRows = db.prepare("SELECT b.id,b.book,b.chapter,b.verse,b.reference,l.text,b.version,b.source_attribution,b.status FROM bible_verses b LEFT JOIN bible_verses_locales l ON l._parent_id=b.id AND l._locale='en'").all() as Row[];
    for (const r of bibleRows) sources.push({ id: id(r.id), collection: "bible-verses", key: String(r.reference), status: r.status as SourceState["status"], record: { book: r.book, chapter: r.chapter, verse: r.verse, reference: r.reference, text: r.text, version: r.version, sourceAttribution: nullable(r.source_attribution) } });
    const duplicateKeys = sources.map(s => `${s.collection}:${s.key}`);
    if (new Set(duplicateKeys).size !== duplicateKeys.length) throw new Error("Duplicate source keys require editorial resolution before release.");
    const rows = db.prepare("SELECT a.id,a.slug,a.category,a.audience_level,a.status,a._status,l.title,l.subtitle,l.summary FROM articles a LEFT JOIN articles_locales l ON l._parent_id=a.id AND l._locale='en'").all() as Row[];
    const slugs = new Map(rows.map(r => [r.id, String(r.slug)]));
    const articles: ArticleState[] = [];
    for (const row of rows) {
      let content = row, contentID = id(row.id), sectionsTable = "articles_sections", relsTable = "articles_rels", tagsTable = "articles_tags", relationPrefix = "";
      if (row.status !== "published") {
        const versions = db.prepare("SELECT v.id AS version_id,v.version_slug AS slug,v.version_category AS category,v.version_audience_level AS audience_level,v.version_status AS status,v.version__status AS _status,l.version_title AS title,l.version_subtitle AS subtitle,l.version_summary AS summary FROM _articles_v v LEFT JOIN _articles_v_locales l ON l._parent_id=v.id AND l._locale='en' WHERE v.parent_id=? AND v.latest=1").all(id(row.id)) as Row[];
        if (versions.length !== 1) throw new Error(`Private article must have exactly one latest version before release: ${String(row.slug)}.`);
        const latest = versions[0];
        if (latest.slug !== row.slug) throw new Error(`A private latest draft changes its main slug; explicit editorial resolution is required: ${String(row.slug)}.`);
        if (!["draft", "reviewed"].includes(String(latest.status)) || latest._status !== "draft") throw new Error(`A private latest version has inconsistent publication controls: ${String(row.slug)}.`);
        content = latest; contentID = id(latest.version_id);
        sectionsTable = "_articles_v_version_sections"; relsTable = "_articles_v_rels"; tagsTable = "_articles_v_version_tags"; relationPrefix = "version.";
      }
      // Table names come only from the fixed choices above, never document data.
      const rawSections = db.prepare(`SELECT s._order,s.id,s.section_id,s.kind,l.title,l.body FROM ${sectionsTable} s LEFT JOIN ${sectionsTable}_locales l ON l._parent_id=s.id AND l._locale='en' WHERE s._parent_id=? ORDER BY s._order`).all(contentID) as Row[];
      const rels = db.prepare(`SELECT path,citations_id,articles_id FROM ${relsTable} WHERE parent_id=? ORDER BY "order"`).all(contentID) as Row[];
      const keysAt = (p: string) => rels.filter(r => r.path === p).map(r => {
        const key = citationKeys.get(r.citations_id);
        if (!key) throw new Error("An article links a missing citation record.");
        return key;
      });
      const sections = rawSections.map(s => ({ sectionId: s.section_id, kind: s.kind, title: s.title, body: s.body }));
      const sectionCitationKeys = Object.fromEntries(rawSections.map((s, i) => [String(s.section_id), keysAt(`${relationPrefix}sections.${i}.citations`)]));
      const data: Fields = { title: content.title, subtitle: content.subtitle, category: content.category, audienceLevel: content.audience_level, summary: content.summary, sections, tags: db.prepare(`SELECT value FROM ${tagsTable} WHERE parent_id=? ORDER BY "order"`).all(contentID).map(r => r.value) };
      articles.push({ id: id(row.id), slug: String(row.slug), status: content.status as ArticleState["status"], payloadStatus: content._status as ArticleState["payloadStatus"], data, citationKeys: keysAt(`${relationPrefix}citations`), sectionCitationKeys, relatedSlugs: rels.filter(r => r.path === `${relationPrefix}relatedArticles`).map(r => {
        const slug = slugs.get(r.articles_id); if (!slug) throw new Error("An article links a missing related article."); return slug;
      }) });
    }
    return { owner: { id: id(owner.id), role: String(owner.role) }, articles, sources };
  } finally { db.close(); }
}
