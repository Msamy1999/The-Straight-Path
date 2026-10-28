import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { CitationList } from "../components/content/CitationList";
import { CompactArticleDetails } from "../components/content/CompactArticleDetails";
import { TopicCard } from "../components/content/TopicCard";
import { ReaderFaqMarker } from "../components/content/ReaderLocale";
import { VerseCard } from "../components/content/VerseCard";
import { arabicReferenceLabel } from "../lib/reader-reference-label";

assert.equal(arabicReferenceLabel("Quran 42:51"), "القرآن ٤٢:٥١");
assert.equal(arabicReferenceLabel("Qur’an 53:3-4"), "القرآن ٥٣:٣-٤");
assert.equal(arabicReferenceLabel("2 Timothy 3:16"), "تيموثاوس الثانية ٣:١٦");
assert.equal(arabicReferenceLabel("John 1:14"), "يوحنا ١:١٤");
assert.equal(arabicReferenceLabel("16:102"), "١٦:١٠٢");
assert.equal(/[a-z]/i.test(arabicReferenceLabel("Unrecognized book 3:16")), false);

const source = { id: "test-source", type: "book" as const, title: "A source title", author: "A source author", year: 2020, url: "https://example.org/source", note: "Complete source note remains available." };
const citations = renderToStaticMarkup(<CitationList citations={[source]} compact />);
assert.ok(citations.includes(source.title) && citations.includes(source.note));
assert.match(citations, /data-citation-details/);
assert.match(citations, /href="https:\/\/example.org\/source"/);
assert.match(citations, /rel="noreferrer noopener"/);
const folded = renderToStaticMarkup(<CompactArticleDetails title="Sources and further reading" arabicTitle="المصادر وقراءات إضافية" count={1}><CitationList citations={[source]} compact /></CompactArticleDetails>);
assert.match(folded, /<details[^>]*data-compact-article-details/);
assert.doesNotMatch(folded.split(">")[0], /open=/);
assert.ok(folded.includes(source.note));
const longSummary = "An unchanged related summary. ".repeat(20);
const related = renderToStaticMarkup(<TopicCard title="A related title" description={longSummary} href="/articles/why-islam" compact />);
assert.ok(related.includes(longSummary));
assert.match(related, /line-clamp-2/);
assert.doesNotMatch(related, /min-h-44/);
const markers = renderToStaticMarkup(<><ReaderFaqMarker question /><ReaderFaqMarker question={false} /></>);
assert.match(markers, /text-accent/);
assert.match(markers, /text-secondary/);
assert.match(markers, />Q:</);
assert.match(markers, />A:</);

// Existing authored scripture is used verbatim; no invented quotation fixture.
const draft = JSON.parse(readFileSync("content-drafts/what-is-revelation.json", "utf8"));
const verse = draft.quranVerses[0];
const card = renderToStaticMarkup(<VerseCard verse={{ ...verse, scripture: "quran" }} />);
const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
assert.ok(card.includes(escape(verse.arabic.normalize("NFC"))));
assert.ok(card.includes(escape(verse.translation)));
assert.ok(card.includes(escape(verse.reference)));
console.log("Compact details, preserved full source/related text, FAQ colors, exact scripture, and Arabic reference labels verified.");
