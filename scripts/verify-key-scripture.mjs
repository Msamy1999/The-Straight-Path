/* global console */

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const workspace = process.cwd();
const [requiredTreeText, optionalTreeText] = await Promise.all(
  ["islam-christianity-tree.ts", "islam-overview-tree.ts"].map((file) =>
    readFile(path.join(workspace, "data", file), "utf8"),
  ),
);
const treeText = `${requiredTreeText}\n${optionalTreeText}`;
const selections = JSON.parse(
  await readFile(
    path.join(workspace, "data", "article-key-scripture.json"),
    "utf8",
  ),
);
const treeSlugs = [
  ...new Set(
    [...treeText.matchAll(/\/articles\/([a-z0-9-]+)/g)].map(
      (match) => match[1],
    ),
  ),
].sort();
const selectedSlugs = Object.keys(selections).sort();
const optionalTreeSlugs = new Set(
  [...optionalTreeText.matchAll(/\/articles\/([a-z0-9-]+)/g)].map(
    (match) => match[1],
  ),
);
const failures = [];

for (const slug of treeSlugs) {
  if (!Object.hasOwn(selections, slug)) {
    if (optionalTreeSlugs.has(slug)) {
      continue;
    }
    failures.push(`${slug}: no foundational-passage selection`);
    continue;
  }

  const draftPath = path.join(workspace, "content-drafts", `${slug}.json`);
  let draft;
  try {
    draft = JSON.parse(await readFile(draftPath, "utf8"));
  } catch (error) {
    failures.push(`${slug}: cannot read ${draftPath} (${error.message})`);
    continue;
  }

  const selection = selections[slug];
  const quran = Array.isArray(selection.quran) ? selection.quran : [];
  const bible = Array.isArray(selection.bible) ? selection.bible : [];
  if (quran.length + bible.length > 4) {
    failures.push(`${slug}: select at most 4 foundational passages in total`);
  }

  const availableQuran = new Map(
    (draft.quranVerses ?? []).map((verse) => [verse.reference, verse]),
  );
  const availableBible = new Map(
    (draft.bibleVerses ?? []).map((verse) => [verse.reference, verse]),
  );
  if (
    availableQuran.size + availableBible.size > 0 &&
    quran.length + bible.length === 0
  ) {
    failures.push(`${slug}: available scripture exists but none was selected`);
  }
  for (const reference of quran) {
    if (!availableQuran.has(reference)) {
      failures.push(`${slug}: Quran reference not in its verified draft: ${reference}`);
    }
  }
  for (const reference of bible) {
    if (!availableBible.has(reference)) {
      failures.push(`${slug}: Bible reference not in its verified draft: ${reference}`);
    }
  }

  const audienceText = [
    draft.title,
    draft.subtitle,
    draft.summary,
    ...(draft.sections ?? []).flatMap((section) => [
      section.title,
      section.body,
    ]),
    ...(draft.faq ?? []).flatMap((faq) => [faq.question, faq.answer]),
  ]
    .filter(Boolean)
    .join("\n");
  for (const reference of [...quran, ...bible]) {
    if (!mentionsReference(audienceText, reference)) {
      failures.push(`${slug}: selected passage is not cited in article prose: ${reference}`);
    }
  }

  const selectedEnglish = [
    ...quran.map((reference) => availableQuran.get(reference)?.translation ?? ""),
    ...bible.map((reference) => availableBible.get(reference)?.text ?? ""),
  ].join(" ");
  const selectedWordCount = selectedEnglish.trim().split(/\s+/).filter(Boolean).length;
  if (selectedWordCount > 400) {
    failures.push(
      `${slug}: selected English scripture is too long (${selectedWordCount} words)`,
    );
  }
}

for (const slug of selectedSlugs) {
  if (!treeSlugs.includes(slug)) {
    failures.push(`${slug}: selection is not used by the Islam & Christianity tree`);
  }
}

if (failures.length > 0) {
  console.error("Foundational scripture verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Foundational scripture verified for ${treeSlugs.length} unique research-tree articles.`,
);

function mentionsReference(text, reference) {
  const normalize = (value) =>
    value
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ");
  const normalizedText = normalize(text);
  const normalizedReference = normalize(reference);
  if (normalizedText.includes(normalizedReference)) {
    return true;
  }
  const quranMatch = normalizedReference.match(/^quran (\d+):(\d+)/);
  if (quranMatch) {
    const [, surah, ayah] = quranMatch;
    if (
      normalizedText.includes(`${surah}:${ayah}`) ||
      new RegExp(`surah\\s+${surah}[^.\\n]{0,40}\\b${ayah}\\b`).test(
        normalizedText,
      )
    ) {
      return true;
    }
    const ranges = normalizedText.matchAll(
      new RegExp(`\\b${surah}:(\\d+)-(\\d+)\\b`, "g"),
    );
    for (const range of ranges) {
      if (Number(ayah) >= Number(range[1]) && Number(ayah) <= Number(range[2])) {
        return true;
      }
    }
    return false;
  }
  const bibleMatch = normalizedReference.match(/^(.+?) (\d+):(\d+)/);
  return bibleMatch
    ? normalizedText.includes(`${bibleMatch[1]} ${bibleMatch[2]}:${bibleMatch[3]}`)
    : false;
}
