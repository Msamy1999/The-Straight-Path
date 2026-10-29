import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { articleTextLink, renderInlineMarkdown } from "../components/content/InlineArticleText";
import { isReferenceOnlyLine, stripMarkdownArtifacts } from "../lib/article-text";

assert.deepEqual(articleTextLink("/articles/why-the-quran"), { href: "/articles/why-the-quran", internal: true });
assert.deepEqual(articleTextLink("https://quran.com/112/1"), { href: "https://quran.com/112/1", internal: false });
for (const url of ["javascript:alert(1)", "//evil.test/path", "/articles/../admin", "/articles/x?next=https://evil.test", "/articles/x#y", "/articles/%2e%2e", "/articles/x\\y", "https://user:password@example.com", "http://example.com"]) {
  assert.equal(articleTextLink(url), undefined, url);
}
const text = "Continue with [Why the Quran?](/articles/why-the-quran), then examine [Quran 42:51](https://quran.com/42/51). **Evidence matters.**";
const html = renderToStaticMarkup(<>{renderInlineMarkdown(text, "test")}</>);
assert.match(html, /href="\/articles\/why-the-quran"/);
assert.doesNotMatch(html.match(/<a[^>]*href="\/articles\/why-the-quran"[^>]*>/)?.[0] ?? "", /target=/);
assert.match(html, /href="https:\/\/quran.com\/42\/51" target="_blank" rel="noreferrer noopener"/);
assert.match(html, /<bdi[^>]*translate="no"[^>]*>Quran 42:51<\/bdi>/);
assert.match(html, /<strong[^>]*>Evidence matters\.<\/strong>/);
assert.equal(stripMarkdownArtifacts(text), "Continue with Why the Quran?, then examine Quran 42:51. Evidence matters.");
assert.equal(isReferenceOnlyLine("[Why the Quran?](/articles/why-the-quran)"), true);
assert.equal(isReferenceOnlyLine("Continue with [Why the Quran?](/articles/why-the-quran)."), false);
console.log("Safe local study links, external source links, protected references, and clean narration verified.");
