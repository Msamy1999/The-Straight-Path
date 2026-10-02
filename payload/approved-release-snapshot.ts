import { DatabaseSync } from "node:sqlite";
import type { ArticleState, Fields, ReleaseSnapshot, SourceState } from "./approved-release-plan";

type Row = Record<string, unknown>;
const id = (value: unknown) => value as number | string;
const nullable = (value: unknown) => value === null ? undefined : value;

/** Reads only public content plus the stored owner ID/role, never credentials. */
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
      const rawSections = db.prepare("SELECT s._order,s.id,s.section_id,s.kind,l.title,l.body FROM articles_sections s LEFT JOIN articles_sections_locales l ON l._parent_id=s.id AND l._locale='en' WHERE s._parent_id=? ORDER BY s._order").all(id(row.id)) as Row[];
      const rels = db.prepare('SELECT path,citations_id,articles_id FROM articles_rels WHERE parent_id=? ORDER BY "order"').all(id(row.id)) as Row[];
      const keysAt = (p: string) => rels.filter(r => r.path === p).map(r => {
        const key = citationKeys.get(r.citations_id);
        if (!key) throw new Error("An article links a missing citation record.");
        return key;
      });
      const sections = rawSections.map(s => ({ sectionId: s.section_id, kind: s.kind, title: s.title, body: s.body }));
      const sectionCitationKeys = Object.fromEntries(rawSections.map((s, i) => [String(s.section_id), keysAt(`sections.${i}.citations`)]));
      const data: Fields = { title: row.title, subtitle: row.subtitle, category: row.category, audienceLevel: row.audience_level, summary: row.summary, sections, tags: db.prepare('SELECT value FROM articles_tags WHERE parent_id=? ORDER BY "order"').all(id(row.id)).map(r => r.value) };
      articles.push({ id: id(row.id), slug: String(row.slug), status: row.status as ArticleState["status"], payloadStatus: row._status as ArticleState["payloadStatus"], data, citationKeys: keysAt("citations"), sectionCitationKeys, relatedSlugs: rels.filter(r => r.path === "relatedArticles").map(r => {
        const slug = slugs.get(r.articles_id); if (!slug) throw new Error("An article links a missing related article."); return slug;
      }) });
    }
    return { owner: { id: id(owner.id), role: String(owner.role) }, articles, sources };
  } finally { db.close(); }
}
