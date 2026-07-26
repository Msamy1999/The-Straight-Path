/**
 * Fast, network-free validation for content-drafts/*.json.
 *
 * Checks structure, links, prose-to-structured scripture coverage, known
 * high-risk regressions, and typed further-reading metadata. Run the slower
 * verify-drafts.mjs afterward to compare every stored verse with live APIs.
 */
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const draftsDir = path.resolve(dirname, "../content-drafts");
const files = readdirSync(draftsDir).filter((name) => name.endsWith(".json"));
const drafts = files.map((file) => ({
  file,
  data: JSON.parse(readFileSync(path.join(draftsDir, file), "utf8")),
}));

const problems = [];
const warnings = [];
const slugs = new Set(drafts.map(({ data }) => data.slug));
const sectionKinds = new Set([
  "summary",
  "scripture",
  "interpretation",
  "history",
  "argument",
  "sources",
  "notes",
]);

const bibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const escapedBooks = [...bibleBooks]
  .sort((a, b) => b.length - a.length)
  .map((book) => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const bibleReferencePattern = new RegExp(
  "\\b(" + escapedBooks.join("|") + ")\\s+(\\d+):(\\d+(?:\\s*[-–]\\s*(?:(?:\\d+):)?\\d+)?)",
  "g",
);
const quranReferencePattern = /\b(?:Qur(?:an|['’]an)|Surah)\s+(\d{1,3}):(\d{1,3})\b/gi;

function articleProse(draft) {
  return [
    draft.summary,
    ...draft.sections.map((section) => section.body),
    ...(draft.faq ?? []).flatMap((item) => [item.question, item.answer]),
  ].join("\n\n");
}

function proseQuranReferences(draft) {
  const references = new Set();
  for (const match of articleProse(draft).matchAll(quranReferencePattern)) {
    references.add("Quran " + Number(match[1]) + ":" + Number(match[2]));
  }
  return references;
}

function proseBibleReferences(draft) {
  const references = new Set();
  for (const match of articleProse(draft).matchAll(bibleReferencePattern)) {
    references.add(
      match[1] + " " + Number(match[2]) + ":" + match[3].replace(/\s*[–-]\s*/g, "-"),
    );
  }
  return references;
}

const bannedClaims = [
  ["Quranic Tower of Babel", "The Quran does not contain a Babel narrative"],
  ["Clear Confirmations:** The Tower of Babel", "Babel cannot be presented as Quranic confirmation"],
  ["Surah 4:171 states, \"Say, 'He is Allah", "false Quran 4:171 quotation"],
  ["Al-Ghazali argued that truth cannot contradict truth", "Ibn Rushd attribution regression"],
  ["fresh water and salt water do not mix", "waters continuously mix"],
  ["fresh and salt water do not mix", "waters continuously mix"],
  ["mountains do indeed play a crucial role in Earth's stability", "mountain stabilization overclaim"],
  ["Sixteen Centuries in Practice", "chronology should be approximately fourteen centuries"],
  ["close to a coin flip among neutral specialists", "unsupported John 1:1 consensus claim"],
  ["no good emerges from violence when alternatives exist", "invented hadith paraphrase"],
  ["never denied this hadith's authenticity", "absolute authenticity claim"],
];

const invalidBibliographyPairs = [
  ["The Qur'an and the Bible: Text and Commentary", "John C. Reeves"],
  ["The Suffering Servant in Deutero-Isaiah", "Brevard Childs"],
  ["Introduction to the Old Testament as Hebrew Bible", "Walter Brueggemann and William C. Placher"],
  ["Jesus in Islam and Christianity: Dialogue and Comparative Studies", "Jamal Badawi"],
  ["The Gospel of John", "New Testament"],
];

const advancedSchoolNames = /\b(?:Athari|Ashari|Ash'ari|Maturidi|Mu'tazili|Murji'ah|Khawarij)\b/i;

for (const { file, data: draft } of drafts) {
  const label = draft.slug || file;
  for (const field of ["slug", "title", "summary", "sections", "quranVerses", "bibleVerses"]) {
    if (draft[field] == null) problems.push(label + ": missing required field " + field);
  }

  const sectionIds = new Set();
  for (const item of draft.sections ?? []) {
    if (sectionIds.has(item.sectionId)) problems.push(label + ": duplicate section id " + item.sectionId);
    sectionIds.add(item.sectionId);
    if (!item.body?.trim()) problems.push(label + ": empty section body " + item.sectionId);
    if (!sectionKinds.has(item.kind)) problems.push(label + ": unsupported section kind " + item.kind);
  }

  for (const related of draft.relatedSlugs ?? []) {
    if (!slugs.has(related)) problems.push(label + ": broken related slug " + related);
    if (related === draft.slug) problems.push(label + ": article relates to itself");
  }

  const quranStructured = new Set();
  for (const verse of draft.quranVerses ?? []) {
    if (quranStructured.has(verse.reference)) problems.push(label + ": duplicate Quran reference " + verse.reference);
    quranStructured.add(verse.reference);
    for (const field of ["surahName", "surahNumber", "ayahNumber", "reference", "arabic", "translation", "translator", "sourceAttribution"]) {
      if (verse[field] == null || verse[field] === "") problems.push(label + ": incomplete Quran record " + verse.reference + " (" + field + ")");
    }
  }
  for (const reference of proseQuranReferences(draft)) {
    if (!quranStructured.has(reference)) problems.push(label + ": prose Quran reference is not structured: " + reference);
  }

  const bibleStructured = new Set();
  for (const verse of draft.bibleVerses ?? []) {
    if (bibleStructured.has(verse.reference)) problems.push(label + ": duplicate Bible reference " + verse.reference);
    bibleStructured.add(verse.reference);
    for (const field of ["book", "chapter", "verse", "reference", "text", "version", "sourceAttribution"]) {
      if (verse[field] == null || verse[field] === "") problems.push(label + ": incomplete Bible record " + verse.reference + " (" + field + ")");
    }
  }
  // Some articles compare many passages without reproducing every verse in
  // full. Keep their locators explicit and validate them separately instead
  // of treating a reference as if it were a quoted scripture record.
  const bibleReferenceOnly = new Set();
  for (const item of draft.bibleReferences ?? []) {
    const reference = typeof item === "string" ? item : item?.reference;
    if (!reference) {
      problems.push(label + ": incomplete Bible reference-only record");
      continue;
    }
    if (bibleReferenceOnly.has(reference)) {
      problems.push(label + ": duplicate Bible reference-only record " + reference);
    }
    bibleReferenceOnly.add(reference);
  }
  for (const reference of proseBibleReferences(draft)) {
    if (!bibleStructured.has(reference) && !bibleReferenceOnly.has(reference)) {
      problems.push(label + ": prose Bible reference is not structured or listed: " + reference);
    }
  }

  const serialized = JSON.stringify(draft);
  if (draft.audienceLevel === "beginner" && advancedSchoolNames.test(articleProse(draft))) {
    problems.push(
      label +
        ": beginner article contains advanced school labels; explain the shared foundation in plain language instead",
    );
  }
  if (/John 7:53[–-]8(?!:11)/.test(serialized)) {
    problems.push(label + ": malformed Pericope Adulterae range; use John 7:53-8:11");
  }
  for (const [phrase, reason] of bannedClaims) {
    if (serialized.toLowerCase().includes(phrase.toLowerCase())) {
      problems.push(label + ": banned claim regression (" + reason + ")");
    }
  }

  for (const item of draft.furtherReading ?? []) {
    if (!item.title || !item.author || !item.note) {
      problems.push(label + ": further-reading item lacks title, author, or verification note");
    }
    if (item.type && !["book", "journalArticle", "primaryText"].includes(item.type)) {
      problems.push(label + ": unsupported further-reading type: " + item.type);
    }
    for (const [title, author] of invalidBibliographyPairs) {
      if (item.title.includes(title) && item.author.includes(author)) {
        problems.push(label + ": invalid bibliography pair: " + title + " / " + author);
      }
    }
    if (item.type === "journalArticle") {
      for (const field of ["journal", "year", "volume", "issue", "pages", "url"]) {
        if (!item[field]) problems.push(label + ": journal article lacks " + field + ": " + item.title);
      }
    }
    if (item.type === "primaryText" && !item.url) {
      problems.push(label + ": primary text lacks a reproducible edition URL: " + item.title);
    }
  }

  for (const passage of articleProse(draft).split(/(?<=[!?])\s+|(?<=[a-z0-9)\]"'])\.\s+(?=[A-Z])|\n+/)) {
    if (
      !passage.trim().endsWith("?") &&
      /Sahih (?:al-)?Bukhari|Sahih Muslim|Jami.? at-Tirmidhi|Sunan (?:Abi|Abu) Dawud|Sunan Ibn Majah/i.test(passage) &&
      /\b(?:report(?:s|ed)?|narrat(?:es|ed|ion|ions)|describ(?:es|ed)|teach(?:es|ing)|said|states?|reads?)\b/i.test(passage) &&
      !/(?:Bukhari|Muslim|Tirmidhi|Dawud|Majah)\s*(?:[,(:]\s*)?(?:(?:hadith|no\.)\s*)?\d+/i.test(passage)
    ) {
      warnings.push(label + ": named hadith collection without a numeric locator near claim: " + passage.slice(0, 120));
    }
  }
}

const duplicateSlugs = drafts
  .map(({ data }) => data.slug)
  .filter((slug, index, all) => all.indexOf(slug) !== index);
for (const slug of duplicateSlugs) problems.push("duplicate slug: " + slug);

console.log("drafts checked: " + drafts.length);
console.log("Quran records: " + drafts.reduce((total, item) => total + item.data.quranVerses.length, 0));
console.log("Bible records: " + drafts.reduce((total, item) => total + item.data.bibleVerses.length, 0));
if (warnings.length) {
  console.log("WARNINGS (" + warnings.length + "):");
  for (const warning of warnings) console.log(" - " + warning);
}
if (problems.length) {
  console.error("PROBLEMS (" + problems.length + "):");
  for (const problem of problems) console.error(" - " + problem);
  process.exit(1);
}
console.log("LOCAL DRAFT VALIDATION CLEAN");
