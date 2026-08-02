/**
 * Applies the seeker-oriented editorial pass to every content draft.
 *
 * The articles are intended for people investigating whether Islam is true.
 * This migration keeps fair comparison, but makes the purpose explicit,
 * distinguishes kinds of evidence, and gives every article a clear next step.
 * It is idempotent and edits only the top-level JSON values that changed.
 *
 *   node payload/apply-seeker-orientation.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const draftsDir = path.resolve(dirname, "../content-drafts");
const states = new Map();

for (const file of readdirSync(draftsDir).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(draftsDir, file);
  const raw = readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  states.set(data.slug, { data, filePath, raw, changedKeys: new Set() });
}

function mark(state, ...keys) {
  for (const key of keys) state.changedKeys.add(key);
}

function stateFor(slug) {
  const state = states.get(slug);
  if (!state) throw new Error("Unknown draft slug: " + slug);
  return state;
}

function section(draft, sectionId) {
  return draft.sections.find((item) => item.sectionId === sectionId);
}

function replaceTopLevelValue(raw, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keyPattern = new RegExp("\\n([ \\t]*)\\\"" + escapedKey + "\\\"\\s*:");
  const keyMatch = keyPattern.exec(raw);
  if (!keyMatch) {
    const closeIndex = raw.lastIndexOf("}");
    if (closeIndex === -1) throw new Error("Top-level JSON object is malformed");
    const prefix = raw.slice(0, closeIndex).trimEnd();
    const separator = prefix.endsWith("{") ? "" : ",";
    const serialized = JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
    return `${prefix}${separator}\n  \"${key}\": ${serialized}\n${raw.slice(closeIndex)}`;
  }
  const baseIndent = keyMatch[1];
  let start = keyMatch.index + keyMatch[0].length;
  while (/\s/.test(raw[start])) start += 1;

  let end = start;
  const opener = raw[start];
  if (opener === '"') {
    end += 1;
    let escaped = false;
    while (end < raw.length) {
      const character = raw[end];
      if (!escaped && character === '"') {
        end += 1;
        break;
      }
      escaped = !escaped && character === "\\";
      if (character !== "\\") escaped = false;
      end += 1;
    }
  } else if (opener === "[" || opener === "{") {
    const closer = opener === "[" ? "]" : "}";
    let depth = 0;
    let inString = false;
    let escaped = false;
    while (end < raw.length) {
      const character = raw[end];
      if (inString) {
        if (!escaped && character === '"') inString = false;
        escaped = !escaped && character === "\\";
        if (character !== "\\") escaped = false;
      } else if (character === '"') {
        inString = true;
      } else if (character === opener) {
        depth += 1;
      } else if (character === closer) {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
      end += 1;
    }
  } else {
    while (end < raw.length && !/[\n,}]/.test(raw[end])) end += 1;
  }

  const serialized = JSON.stringify(value, null, 2).replace(/\n/g, "\n" + baseIndent);
  return raw.slice(0, start) + serialized + raw.slice(end);
}

function update(slug, keys, callback) {
  const state = stateFor(slug);
  callback(state.data);
  mark(state, ...keys);
}

function replaceText(value, from, to) {
  if (typeof value !== "string" || !value.includes(from)) return value;
  return value.split(from).join(to);
}

function replaceInDraft(draft, from, to) {
  let changed = false;
  const textFields = ["title", "subtitle", "summary"];
  for (const key of textFields) {
    const next = replaceText(draft[key], from, to);
    if (next !== draft[key]) {
      draft[key] = next;
      changed = true;
    }
  }
  for (const item of draft.sections ?? []) {
    const next = replaceText(item.body, from, to);
    if (next !== item.body) {
      item.body = next;
      changed = true;
    }
  }
  for (const item of draft.faq ?? []) {
    for (const key of ["question", "answer"]) {
      const next = replaceText(item[key], from, to);
      if (next !== item[key]) {
        item[key] = next;
        changed = true;
      }
    }
  }
  return changed;
}

function setSectionBody(draft, sectionId, body) {
  const item = section(draft, sectionId);
  if (!item || item.body === body) return false;
  item.body = body;
  return true;
}

const categoryFocus = {
  "difficult-questions":
    "Questions about God, suffering, morality, history, or reason are not treated as isolated objections; they are tests of which worldview best explains reality and human responsibility.",
  "historical-evidence":
    "History can establish context, sources, and probabilities, but it cannot by itself verify revelation or rule out a miracle; the Islamic claim must therefore be assessed through both historical reasoning and the Quran's claim to be revelation.",
  "jesus-in-islam-and-christianity":
    "Islam's central claim is that Jesus is the Messiah and a uniquely honored human messenger, not God; Christian readings deserve their strongest presentation before that Islamic conclusion is evaluated.",
  "preservation":
    "The Islamic preservation claim is a cumulative case involving revelation, recitation, writing, manuscripts, and scholarly transmission; those kinds of evidence should not be collapsed into one another or described with absolute slogans.",
  "prophecies":
    "Prophecy arguments require attention to the original text, genre, historical setting, transmission, and later interpretation; a possible correspondence is not automatically a fulfilled prediction.",
  "questions":
    "A method article is useful only if it leads beyond comparison: the reader should use its distinctions to investigate Islam's claims about God, revelation, accountability, and the Quran.",
  "religious-history":
    "Religious history supplies context for how communities transmitted and interpreted their teachings, but historical development is not the same thing as proof or disproof of revelation.",
  "salvation-and-purpose-of-life":
    "Islam presents human life as purposeful worship of the one God, moral accountability, repentance, mercy, and a final return to Him; comparison should clarify that invitation rather than stop at description.",
  "scientific-signs":
    "Science can test natural mechanisms and historical claims, but it cannot by itself certify revelation; Quranic scientific-sign arguments must therefore remain textually careful, scientifically current, and modest about what they prove.",
  "sources":
    "Reliable investigation of Islam requires primary texts, transparent source labels, and honest acknowledgment of uncertainty; careful method serves the truth-seeking question rather than replacing it.",
  "tawhid-and-the-trinity":
    "Islam's central claim is tawhid: God is one, incomparable, and alone worthy of worship. Christian Trinitarian theology should be represented as its informed defenders understand it, while the Islamic objection is identified as a theological judgment and argued from Islamic premises.",
  "the-quran-and-the-bible":
    "The comparison ultimately asks which account of God, revelation, Jesus, sin, and salvation is true—not merely how the two communities differ in vocabulary or practice.",
  "war-and-violence":
    "Islamic texts, classical Sunni law, historical practice, modern Muslim ethics, and contemporary international law are related but distinct layers; a seeker should examine each before reaching a conclusion about Islam's moral framework.",
  women:
    "The Islamic case about women should distinguish Quranic spiritual accountability, legal rules, classical fiqh, historical practice, and modern interpretation, while treating difficult passages directly rather than hiding them.",
};

const specialFocus = {
  "can-god-become-man":
    "The Islamic objection to incarnation is a metaphysical and theological argument from divine transcendence and dependence, not a claim that the Christian position has been refuted merely by using simpler language; the strongest Chalcedonian response remains part of the test.",
  "celestial-signs-in-the-quran":
    "The passages should be weighed first in their Arabic, literary, and classical-tafsir settings. Modern scientific resonance may support reflection, but it should be called possible or contested where the text and science do not force one reading.",
  "creation-and-nature":
    "Design and fine-tuning are arguments from evidence, not settled scientific results. Naturalist explanations and Muslim debates about evolution and causation deserve serious treatment before the article draws an Islamic inference.",
  "development-of-trinity-doctrine":
    "Doctrinal development should be distinguished from the Christian claim that later creeds clarify earlier convictions. The history may be read as clarification, change, or both; the Islamic judgment should be clearly labeled as such.",
  "early-islamic-preservation":
    "Hadith preservation involved oral teaching, early written notes, first- and second-century collections, and later canonical compilations. The timing and reliability of individual reports remain questions of method, not reasons to erase either the strengths or the limits of the tradition.",
  "early-quran-manuscripts":
    "A manuscript can show early copying and textual continuity without, by itself, proving an entire revelation or dating the ink from a parchment result; the physical evidence should be read with those limits visible.",
  embryology:
    "Quranic embryology arguments are an interpretive debate. Arabic terms, classical tafsir, ancient medical parallels, and modern embryology should be compared without treating a modern translation as the only possible meaning.",
  "inheritance-and-testimony":
    "Quran 2:282 concerns documenting a debt, not a universal rule that every female testimony always equals half of male testimony. Inheritance shares and evidentiary rules need separate, school-aware treatment.",
  "pharaoh-vs-king-youssef-story":
    "The malik/fir'awn distinction is a real textual observation, but it does not by itself establish a Middle Kingdom Joseph or New Kingdom Moses chronology. Classical tafsir, modern Egyptology, and the author's historical inference must remain separate.",
  "qiraat-explained-simply":
    "Canonical qira'at, the Uthmanic rasm, later vocalization, and early manuscript variation are related but not identical. The Islamic preservation case is strong when it explains the authorized reading tradition without claiming zero variation.",
  "quranic-revelation-history":
    "The traditional chronology is conventionally described as beginning around 610 CE and ending in 632 CE, with exact dating and the relationship between recitation, writing, rasm, and qira'at explained rather than compressed into one timeline.",
  "rights-of-non-muslims":
    "Protection and subordination both appear in the history of dhimma, but the rules and lived experience varied by jurist, dynasty, place, and period. Comparative claims such as 'unusual' need evidence rather than assertion.",
  "seas-and-barriers":
    "The Quranic language can be read as describing a boundary or separating zone where water masses meet; oceanography does not support an impermeable wall or a claim that fresh and salt water never mix.",
  "self-defense-in-scripture":
    "The Quran contains important restraints on fighting aggressors, but the scope of defensive warfare, personal defense, state authority, and classical Sunni jurisprudence must be distinguished rather than reduced to one absolute rule.",
  "shirk-explained":
    "Mainstream Sunni theology classifies Trinitarian doctrine as incompatible with tawhid, but that doctrinal judgment is not the same as declaring every individual Christian's sincerity or final fate. The three-part tawhid taxonomy is a widely used teaching framework, not a universally identical label across every Sunni school.",
  "strong-vs-debated-scientific-claims":
    "The article's confidence labels are useful only when each claim states its classical reading, current scientific status, and evidentiary limits. A cautious cumulative case is more persuasive than a catalog of forced miracles or exaggerated contradictions.",
  "the-crucifixion-and-history":
    "Historical method gives a strong probability judgment about what sources and historians say happened; Quran 4:157 is a revelation claim that challenges that reconstruction. A seeker should weigh both layers without pretending they use the same standard of proof.",
  "the-divinity-verses-examined":
    "Greek grammar and translation are relevant evidence, not magic words that settle theology. Mainstream Christian exegesis, minority readings, Islamic interpretation, and the limits of historical method should remain visible side by side.",
  "the-miracles-of-jesus":
    "'Real miracles' is a statement of Islamic or Christian belief, not a neutral historical finding. The article should distinguish scriptural testimony, theological commitment, and what ordinary historical method can verify.",
  "what-is-a-contradiction":
    "The framework is a tool for testing claims, not a substitute for investigating whether the Quran is revelation. Definitions and a few representative examples should carry the reader toward the primary texts rather than endless cataloguing.",
  "what-is-revelation":
    "Islamic doctrine, Christian inspiration and incarnation, canon history, and historical evidence answer different questions. The reader should see the Islamic claim clearly without being asked to confuse belief with a neutral historical result.",
  "what-is-salvation":
    "'Christianity' is not one undifferentiated model: Catholic, Orthodox, and Protestant accounts differ. Islam's account of faith, repentance, deeds, intercession, and mercy should be stated as Sunni teaching without reducing salvation to a transaction.",
  "what-is-sin":
    "Western Christian original-sin formulations should be distinguished from Eastern Orthodox ancestral-sin accounts and other Christian readings. Islam's teaching on fitrah, personal responsibility, repentance, and mercy is a positive truth claim, not only a criticism of Christianity.",
  "what-is-tawhid":
    "The three aspects of tawhid are widely used Sunni teaching categories that clarify one doctrine; they are not a binding taxonomy accepted in identical terms by every Sunni theological school. The Quranic claim that all prophets called to worship one God is an Islamic doctrinal claim, even when historical readers interpret biblical texts differently.",
  "what-is-the-trinity":
    "Trinitarian doctrine is not fairly described as a simple late invention: Christians argue that later terminology clarifies a pattern they see in scripture and worship. Historical development and the Islamic judgment that the doctrine conflicts with tawhid should be presented together.",
  "what-is-worship":
    "Islam insists that ultimate worship belongs to God alone. Christian theology also distinguishes its worship and adoration of Jesus within its doctrine of one God, so the Islamic conclusion should be stated confidently without implying that Christians are unaware of their own categories.",
  "when-was-deuteronomy-written":
    "Critical dating, traditional Mosaic authorship, and intermediate models are major scholarly positions with different evidence and assumptions. The title and wording should not turn one influential academic reconstruction into the only accepted view.",
  "who-follows-jesus-more-closely":
    "This is not a ranking of Christians' sincerity. It asks whether Islam's account of Jesus as a worshipping, obedient messenger offers a coherent way to follow his example while recognizing Christian claims about faith, sacrament, and discipleship.",
  "why-preservation-matters":
    "Muslims understand Quranic preservation as both a theological promise and a historical transmission claim; Christians frame authority through different combinations of text, church, canon, and tradition. These should be compared without treating a manuscript result as a complete theological proof.",
  "why-the-quran":
    "A cumulative case should state its criteria: which claims are empirical, literary, historical, theological, or experiential, and what a serious skeptical response would be. The invitation to Islam should rest on honest examination, not on pretending that one feature settles everything.",
  "why-would-god-allow-corruption":
    "The question deserves multiple Christian answers, not only the conclusion that corruption is required. Quranic polemic, later Muslim tahrif interpretations, Christian theology, and manuscript history should be kept distinct before the reader evaluates Islam's preservation claim.",
  "women-in-the-quran-and-bible":
    "Passages about women need case-by-case context, with differences among Sunni schools, Christian denominations, historical periods, spiritual status, law, and social practice made visible.",
  "womens-worth-classical-voices":
    "A fair comparison needs representative positive, negative, and dissenting voices on both sides, exact editions, and a warning that selected quotations do not represent every Christian or Muslim. The Islamic invitation should rest on its own sources, not on a one-sided portrait of Christianity.",
};

function focusFor(draft) {
  return specialFocus[draft.slug] ?? categoryFocus[draft.category] ??
    "The evidence and interpretations in this article should be weighed as part of the larger question of whether Islam is true, not treated as a reason to remain indefinitely in comparison.";
}

function comparisonLine(draft) {
  const text = `${draft.title} ${draft.summary ?? ""}`.toLowerCase();
  const comparisonTopic = /christian|bible|jesus|trinity|atheis|agnostic|religion|quran|scripture/.test(text);
  if (comparisonTopic) {
    return "Where Christianity, atheism, or another alternative appears, its strongest responsible argument should be stated in a form an informed defender would recognize before the Islamic response is offered.";
  }
  return "Where historians or scholars disagree, the article identifies the main alternatives before drawing its Islamic implication.";
}

function seekerGuideBody(draft) {
  return [
    "This article is written for a sincere seeker asking whether Islam is true. It is not only a neutral comparison or an interfaith description.",
    focusFor(draft),
    comparisonLine(draft),
    "Read the labels carefully: an explicit Quranic or Prophetic text, an established Sunni teaching, a classical or modern scholarly interpretation, a historical reconstruction, and the author's inference are different kinds of claim. Disputed questions should be identified as disputed rather than hidden.",
  ].join("\n\n");
}

function seekerConclusionBody(draft) {
  return [
    "This article is one part of a larger truth-seeking case. Its subject should not be treated as an isolated proof or as a reason to stop at comparison. The Islamic claim is that the Quran restores clear guidance about the one God and calls human beings to respond to Him with faith, worship, repentance, and moral responsibility.",
    focusFor(draft),
    "If you are asking whether Islam is true, take a direct next step: read the Quran itself in a reliable translation, revisit the primary sources linked here, and write down the strongest objection that remains. Ask God sincerely for guidance and take that question to a trustworthy, knowledgeable Muslim. The aim is not to win an interfaith argument or to caricature alternatives, but to investigate Islam honestly and then respond to its claim.",
  ].join("\n\n");
}

function seekerFaqAnswer(draft) {
  return `Begin with the Quran in a reliable translation and the primary sources linked in this article. Ask God sincerely for guidance, note the strongest question that remains, and discuss it with a trustworthy, knowledgeable Muslim. ${focusFor(draft)}`;
}

function applyMetadata(draft) {
  const marker = "sincere seekers asking whether Islam is true";
  if (!draft.summary?.toLowerCase().includes("whether islam is true")) {
    draft.summary = `For ${marker}: ${draft.summary}`;
  }

  if (!draft.subtitle?.toLowerCase().includes("whether islam is true")) {
    const suffix = "Written for sincere seekers asking whether Islam is true.";
    const joined = `${draft.subtitle?.trim() ?? ""} — ${suffix}`.trim();
    draft.subtitle = joined.length <= 220 ? joined : "A respectful, source-aware guide for sincere seekers asking whether Islam is true.";
  }

  if (draft.seo) {
    const base = `A fair, source-aware guide for seekers asking whether Islam is true: ${draft.title}.`;
    const fallback = `Source-aware guide for seekers asking whether Islam is true: ${draft.title}.`;
    const candidate = base.length <= 160 ? base : fallback;
    draft.seo.metaDescription = candidate.length <= 160 ? candidate : candidate.slice(0, 157).replace(/\s+\S*$/, "") + "...";
  }
}

function insertSeekerSections(draft) {
  const guideBody = seekerGuideBody(draft);
  const conclusionBody = seekerConclusionBody(draft);
  const guide = section(draft, "seeker-guide");
  if (guide) {
    guide.title = "For a Seeker Asking Whether Islam Is True";
    guide.kind = "summary";
    guide.body = guideBody;
  } else {
    draft.sections.unshift({
      sectionId: "seeker-guide",
      title: "For a Seeker Asking Whether Islam Is True",
      kind: "summary",
      body: guideBody,
    });
  }

  const conclusion = section(draft, "seeker-conclusion");
  if (conclusion) {
    conclusion.title = "What This Means for a Seeker";
    conclusion.kind = "summary";
    conclusion.body = conclusionBody;
  } else {
    const faqIndex = draft.sections.findIndex((item) => item.sectionId === "faq");
    const item = {
      sectionId: "seeker-conclusion",
      title: "What This Means for a Seeker",
      kind: "summary",
      body: conclusionBody,
    };
    if (faqIndex === -1) draft.sections.push(item);
    else draft.sections.splice(faqIndex, 0, item);
  }

  const nextQuestion = "If I am asking whether Islam is true, what should I do next?";
  if (!Array.isArray(draft.faq)) draft.faq = [];
  const faqItem = draft.faq.find((item) => item.question === nextQuestion);
  if (faqItem) faqItem.answer = seekerFaqAnswer(draft);
  else draft.faq.push({ question: nextQuestion, answer: seekerFaqAnswer(draft) });

  const faqSection = section(draft, "faq");
  if (faqSection && !faqSection.body.includes(nextQuestion)) {
    faqSection.body = `${faqSection.body.trim()}\n\nQ: ${nextQuestion}\nA: ${seekerFaqAnswer(draft)}`;
  }
}

function applyTargetedCorrections(draft) {
  const corrections = {
    "civilian-protection-in-war": [
      ["a genuine cross-school juristic consensus", "a narrowly documented classical consensus on non-combatant women and children"],
      ["a genuine cross-school consensus (ijma)", "a narrowly documented classical consensus (ijma)"],
    ],
    "early-islamic-preservation": [
      [
        "developed through an oral culture of memorization among the companions, followed by systematic written codification in the 9th century",
        "developed through memorization, early written notes and collections, and later large canonical compilations that matured in the 9th century",
      ],
    ],
    embryology: [
      [
        "Muslim scholars claim these descriptions align remarkably with modern embryology, while secular scholars emphasize that such language was known in ancient medical texts and that interpretations were often retrofitted to match contemporary science.",
        "Some Muslim writers argue that these descriptions resonate with modern embryology, while other Muslim scholars, historians of medicine, and secular critics emphasize the terms' broad meanings, ancient medical parallels, and the risk of reading modern science back into the text.",
      ],
    ],
    "pharaoh-vs-king-youssef-story": [
      [
        "This linguistic distinction reflects genuine historical differences: Youssef likely served a Middle Kingdom ruler, while Moses confronted a New Kingdom pharaoh centuries later. Examining both the Quranic and Biblical accounts alongside Egyptian chronology illuminates how terminological precision may encode historical accuracy.",
        "The distinction is textually clear, but it does not by itself prove that Youssef served a Middle Kingdom ruler or that Moses confronted a New Kingdom pharaoh. Those chronologies are modern historical hypotheses that must be weighed alongside classical tafsir, biblical evidence, and the absence of direct independent confirmation.",
      ],
    ],
    "qiraat-explained-simply": [
      [
        "all read from the same fixed Uthmanic written text",
        "transmitted within the Uthmanic rasm tradition, while differences in vocalization and, in some readings, word form require careful explanation",
      ],
      [
        "rather than the manuscript variants found in the New Testament",
        "rather than simply equating them with the manuscript variants found in the New Testament",
      ],
    ],
    "quranic-revelation-history": [
      ["(609–632 CE)", "(conventionally c. 610–632 CE)"],
      ["which remains the basis of all Quran copies today", "which became the basis of the mainstream written Quranic tradition, alongside authorized recitational variation"],
    ],
    "rights-of-non-muslims": [
      ["were unusual in the pre-modern world", "are described by some historians as distinctive in particular contexts, but that comparative claim requires evidence"],
      ["unusual in the pre-modern world", "distinctive in particular contexts of the pre-modern world"],
    ],
    "seas-and-barriers": [
      ["barriers preventing the mixing of fresh and salt water", "boundaries or separating zones where fresh and salt water meet"],
      ["a phenomenon now understood through oceanography as density stratification and thermoclines", "a phenomenon that can involve salinity gradients, density stratification, estuarine circulation, and mixing"],
    ],
    "self-defense-in-scripture": [
      ["The Quran establishes clear principles limiting defense to those who initiate harm", "The Quran contains important principles about fighting aggression, while the scope of defensive warfare remains a matter of juristic interpretation"],
    ],
    "when-was-deuteronomy-written": [
      ["When Was Deuteronomy Written? The Scholarly Consensus", "When Was Deuteronomy Written? Major Scholarly Views"],
      ["most academic scholars date its legal core", "many critical scholars date its legal core"],
    ],
    "who-follows-jesus-more-closely": [
      ["Who Follows Jesus More Closely?", "Following Jesus: What Do the Sources Ask?"],
      [
        "Muslims today keep strikingly similar practices as daily obligations, while mainstream Christianity understands following Jesus as faith in his person rather than replication of his customs.",
        "Many Muslims practice several of these habits as daily obligations, while Christian traditions differ over how following Jesus relates to faith, sacrament, moral imitation, and the continuation of his ritual customs.",
      ],
      ["The community whose ordinary members still do all of these things every day", "Muslim practice offers a living example of several of these prophetic habits"],
    ],
    "why-preservation-matters": [
      ["The Quran states that God himself guarantees its preservation, tying its truth claim directly to a verbatim transmission history.", "Muslims read the Quran as promising divine preservation and connect that theological claim with a historical transmission record, while recognizing that rasm, qira'at, manuscript evidence, and translation are not identical questions."],
    ],
    "what-is-salvation": [
      [
        "Mainstream Christianity answers that salvation is a gift of grace received through faith in Christ's atoning death",
        "Many Protestant accounts emphasize salvation as a gift of grace received through faith in Christ's atoning death, while Catholic and Orthodox accounts place that grace within sacramental and transformative participation",
      ],
    ],
    "what-is-sin": [
      [
        "Christianity defines sin as 'lawlessness'",
        "Western Christian formulations define sin as 'lawlessness'",
      ],
      [
        "in mainstream teaching, as a condition every person inherits from Adam's fall",
        "in many Western Christian formulations, as a condition connected to Adam's fall; Eastern Orthodox accounts more often speak of ancestral sin and its consequences rather than inherited guilt in the same way",
      ],
    ],
    "what-is-tawhid": [
      [
        "Muslim scholars have traditionally unpacked Tawhid into three connected aspects",
        "Many Sunni teaching texts unpack Tawhid into three connected aspects",
      ],
      [
        "What are the three categories of Tawhid?",
        "What three teaching categories of Tawhid are commonly used?",
      ],
      [
        "Scholars traditionally teach Tawhid in three aspects:",
        "Many Sunni teaching texts explain Tawhid through three aspects:",
      ],
    ],
    "what-is-the-trinity": [
      [
        "The Islamic conclusion can be stated gently. The Quran does not ask Christians to abandon Jesus; it asks them to return to him — to the prayerful, dependent, obedient servant of God the Gospels themselves portray, who calls the Father greater, confesses that only God knows the hour, and directs all worship to the One who sent him.",
        "The Islamic conclusion can be stated clearly and respectfully. The Quran does not ask Christians to abandon Jesus; it asks them to honor him as the prayerful, dependent, obedient servant of God whom the Gospels portray, and to direct worship to the One who sent him.",
      ],
      [
        "On the Islamic reading, the Trinity is a sincere but mistaken development, assembled from real scriptural honor for Jesus and Greek philosophical categories, formalized by councils in 325 and 381 — not in the preaching of Jesus.",
        "On the Islamic reading, the Trinity conflicts with the unqualified oneness proclaimed by the prophets. Historically, Christians argue that later councils clarified a pattern already present in scripture and worship; the fact that terminology and formulations developed over time does not by itself settle whether that Christian continuity claim succeeds.",
      ],
    ],
    "what-is-worship": [
      [
        "What gives that answer its force is that it needs no later councils or centuries of doctrinal refinement to state it.",
        "Islam presents that answer in a direct creed. Christian theology also has its own distinctions between worship, adoration, honor, and devotion within its doctrine of one God; the Islamic argument is that ultimate worship should nevertheless be directed to God alone.",
      ],
    ],
    "the-miracles-of-jesus": [
      [
        "Islam and Christianity both affirm that Jesus (peace be upon him) performed real miracles",
        "Muslims and Christians both affirm in their scriptures and theology that Jesus performed miracles; historical method cannot independently verify every reported wonder",
      ],
    ],
    "the-crucifixion-and-history": [
      [
        "This article lays out the consensus case, the critical audit, and the Quran's account side by side, without declaring a winner.",
        "This article lays out the consensus case, the critical audit, and the Quran's account side by side, then explains why historical probability and a revelation claim must be weighed as different kinds of evidence by a seeker.",
      ],
    ],
    "the-divinity-verses-examined": [
      [
        "and the unitarian or Muslim reading with its own, without declaring a winner.",
        "and the unitarian or Muslim reading with its own. It does not treat grammar alone as a complete proof; it asks which account of God and Jesus best fits the whole body of evidence and revelation.",
      ],
    ],
    "what-is-a-contradiction": [
      [
        "It sets up the method the next five articles in this series will use.",
        "It sets up a method for testing claims, then points the reader toward the larger question of whether the Quran is revelation rather than leaving the investigation at terminology.",
      ],
    ],
    "women-in-the-quran-and-bible": [
      [
        "This article surveys key scriptural texts on women's creation, rights, responsibilities, and authority, highlighting how both traditions wrestle with the relationship between spiritual equality and social organization.",
        "This article surveys key scriptural texts on women's creation, rights, responsibilities, and authority, labeling the differences among spiritual equality, legal rules, social roles, historical practice, Sunni interpretation, and Christian denominational interpretation.",
      ],
    ],
    "womens-worth-classical-voices": [
      [
        "Both traditions' mainstream responses and internal reform conversations are presented at full strength, with no winner declared.",
        "The selected voices and internal reform conversations are presented with their limits made explicit; the article does not treat a handful of quotations as representative of every Christian or Muslim, and it directs the seeker back to the primary Islamic case rather than ending in neutrality.",
      ],
    ],
  };

  for (const [from, to] of corrections[draft.slug] ?? []) replaceInDraft(draft, from, to);

  if (draft.summary?.includes("without declaring a winner")) {
    draft.summary = draft.summary.replace(
      "without declaring a winner",
      "and closes by asking what a seeker should examine next",
    );
  }

  if (draft.slug === "when-was-deuteronomy-written") {
    draft.title = "When Was Deuteronomy Written? Major Scholarly Views";
    if (draft.seo) draft.seo.metaTitle = draft.title;
  }

  if (draft.slug === "who-follows-jesus-more-closely") {
    draft.title = "Following Jesus: What Do the Sources Ask?";
    if (draft.seo) draft.seo.metaTitle = draft.title;
    const summary = section(draft, "beginner-summary");
    if (summary) {
      summary.body = summary.body.replace(
        "Mainstream Christianity does not deny these habits of Jesus; it teaches that following him means faith in his person, not replication of his customs.",
        "Christian traditions generally affirm these habits of Jesus, but differ over how following him relates to faith in his person, sacrament, moral imitation, and the continuation of his ritual customs.",
      );
    }
    const conclusion = section(draft, "islamic-conclusion");
    if (conclusion) {
      conclusion.body = conclusion.body.replace(
        "Muslim practice offers a living example of several of these prophetic habits, as obedience to the God Jesus worshipped, is the Muslim community.",
        "Muslim practice offers a living example of several of these prophetic habits as obedience to the God Jesus worshipped. This is an invitation to examine Islam's account of Jesus, not a verdict on every Christian's sincerity.",
      );
    }
  }

  if (draft.slug === "civilian-protection-in-war") {
    replaceInDraft(
      draft,
      "a narrowly documented classical consensus on non-combatant women and children on the immunity of non-combatant women and children specifically",
      "a narrowly documented classical consensus on the immunity of non-combatant women and children",
    );
  }

  if (draft.slug === "the-miracles-of-jesus") {
    replaceInDraft(draft, "reported wonder: healing", "reported wonder, including healing");
  }

  if (draft.slug === "self-defense-in-scripture") {
    replaceInDraft(
      draft,
      "while the scope of defensive warfare remains a matter of juristic interpretation, while biblical passages",
      "while the scope of defensive warfare remains a matter of juristic interpretation; biblical passages",
    );
  }

  if (draft.slug === "can-god-become-man") {
    replaceInDraft(
      draft,
      "This article lays out both positions in their strongest, most carefully reasoned form, and ends without declaring a winner: the real disagreement lies further back, in what each tradition holds God's nature to allow in the first place.",
      "This article lays out both positions in their strongest, most carefully reasoned form, then invites the seeker to ask which account of God's nature best fits revelation, reason, and the evidence rather than remaining in comparison for its own sake.",
    );
  }

  if (draft.slug === "what-is-sin") {
    draft.summary =
      "For sincere seekers asking whether Islam is true: Western Christian formulations define sin as 'lawlessness' (1 John 3:4), and many Western accounts connect the human condition to Adam's fall; Eastern Orthodox accounts more often speak of ancestral sin and its consequences rather than inherited guilt in the same way. Many Christian traditions connect forgiveness to Christ's atoning work, though they explain that work differently. Islam teaches that every soul begins morally free and unstained — a claim the Quran grounds in the principle that 'no bearer of burdens will bear the burden of another' (Quran 17:15) — and that sin is a choice ranging from minor lapses to grave major sins (kaba'ir), fully erased through sincere repentance offered directly to God (Quran 66:8). This article quotes each tradition's own scripture before comparing how each understands what sin is and how it is removed.";
  }

  if (draft.slug === "shirk-explained") {
    const item = section(draft, "muslim-perspective-trinity");
    if (item && !item.body.includes("doctrinal level")) {
      item.body = item.body.replace(
        "Muslim scholars and theologians interpret the Christian doctrine of the Trinity as a form of shirk.",
        "Muslim scholars and theologians interpret the Christian doctrine of the Trinity as a form of shirk at the level of doctrine. This classification is not a license to pronounce on every individual Christian's sincerity or final fate, which belongs to God and requires separate judgment.",
      );
    }
  }
}

function applyCorpus() {
  for (const state of states.values()) {
    applyMetadata(state.data);
    insertSeekerSections(state.data);
    applyTargetedCorrections(state.data);
    const keys = ["title", "subtitle", "summary", "sections"];
    if (state.data.faq !== undefined) keys.push("faq");
    if (state.data.seo !== undefined) keys.push("seo");
    mark(state, ...keys);
  }
}

function persist() {
  let changedFiles = 0;
  for (const state of states.values()) {
    if (state.changedKeys.size === 0) continue;
    let nextRaw = state.raw;
    for (const key of state.changedKeys) {
      nextRaw = replaceTopLevelValue(nextRaw, key, state.data[key]);
    }
    if (nextRaw !== state.raw) {
      writeFileSync(state.filePath, nextRaw, "utf8");
      changedFiles += 1;
    }
  }
  console.log(`seeker orientation applied; files changed: ${changedFiles}`);
}

applyCorpus();
persist();
