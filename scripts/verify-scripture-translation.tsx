import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ScriptureReferenceText, splitScriptureReferences } from "../components/content/ScriptureReferenceText";

const samples = [
  "Quran 19:54 calls Ishmael a messenger and a prophet.",
  "Qur'an 33:40 and Qur’an 7:158 are different passages.",
  "John 16:12–13, 1 Corinthians 8:6, and Hebrews 1:3.",
  "The parallel reference is (33:40), not a machine-generated surah name.",
  "An ordinary explanation without a verse reference.",
];
for (const text of samples) {
  const parts = splitScriptureReferences(text);
  assert.equal(parts.map(part => part.text).join(""), text);
  assert.deepEqual(splitScriptureReferences(text), parts, "Repeated renders must not retain regex state");
}
assert.deepEqual(splitScriptureReferences(samples[0]).filter(p => p.protected).map(p => p.text), ["Quran 19:54"]);
assert.deepEqual(splitScriptureReferences(samples[1]).filter(p => p.protected).map(p => p.text), ["Qur'an 33:40", "Qur’an 7:158"]);
assert.deepEqual(splitScriptureReferences(samples[2]).filter(p => p.protected).map(p => p.text), ["John 16:12–13", "1 Corinthians 8:6", "Hebrews 1:3"]);
const html = renderToStaticMarkup(<ScriptureReferenceText text={samples[0]} />);
assert.match(html, /translate="no"/);
assert.match(html, /dir="ltr"/);
assert.match(html, /class="notranslate"/);
assert.match(html, /Quran 19:54<\/bdi> calls Ishmael/);
console.log("Immutable scripture reference tokens and LTR/translation protection verified.");
