import { Fragment } from "react";

// These are locators, not translated prose. In particular, machine translation
// must not invent a surah name for a chapter/verse number (19 is Maryam, not
// Al-Isra). Keep the published reference exactly as the editor supplied it.
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
  "Sirach", "Wisdom of Solomon", "Tobit", "Judith", "1 Maccabees", "2 Maccabees",
].sort((a, b) => b.length - a.length);
const namedReference = `(?:Qur['’]?an|${books.join("|")})\\s*`;
const referencePattern = new RegExp(`\\b(?:${namedReference})?\\d{1,3}:\\d{1,3}(?:\\s*[-–]\\s*\\d{1,3})?`, "gi");

export function splitScriptureReferences(text: string): { text: string; protected: boolean }[] {
  const output: { text: string; protected: boolean }[] = [];
  let cursor = 0;
  for (const match of text.matchAll(referencePattern)) {
    const start = match.index;
    if (start > cursor) output.push({ text: text.slice(cursor, start), protected: false });
    output.push({ text: match[0], protected: true });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) output.push({ text: text.slice(cursor), protected: false });
  return output;
}

export function ScriptureReferenceText({ text }: { text: string }) {
  return splitScriptureReferences(text).map((part, index) => part.protected ? (
    <bdi key={index} lang="en" dir="ltr" translate="no" data-scripture-reference className="notranslate">
      {part.text}
    </bdi>
  ) : <Fragment key={index}>{part.text}</Fragment>);
}
