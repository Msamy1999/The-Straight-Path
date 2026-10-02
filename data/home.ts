import type { ResearchTreeNode } from "@/types/domain";

/**
 * The five required entry points into the library (PART 5's "Main paths").
 * Rendered as a flat tree/path list on the homepage rather than a card grid.
 */
export const mainPaths: ResearchTreeNode[] = [
  {
    id: "learn-islam",
    title: "Learn Islam",
    description:
      "Start with foundations: Allah, Tawhid, the Quran, the Prophet ﷺ, the pillars, and daily worship.",
    href: "/islam-overview",
    tag: "Start here",
  },
  {
    id: "compare-islam-christianity",
    title: "Compare Islam & Christianity",
    description:
      "A dedicated branch for Jesus, scripture, preservation, theology, and salvation, built for Christian visitors.",
    href: "/islam-christianity",
    tag: "For Christians",
  },
  {
    id: "questions-from-atheists-and-agnostics",
    title: "Questions from atheists and agnostics",
    description:
      "Careful paths for doubt, meaning, evidence, and belief.",
    href: "/atheism-agnosticism",
    tag: "Doubt",
  },
  {
    id: "people-of-palestine",
    title: "People of Palestine",
    description:
      "Meet the people, learn the history and sacred significance, and turn concern into truthful, responsible action.",
    href: "/people-of-palestine",
    tag: "People",
  },
  {
    id: "common-questions",
    title: "Common Questions",
    description:
      "Beginner-friendly answers with links to deeper evidence and study.",
    href: "/questions",
    tag: "Questions",
  },
];

export const christianLearningPath = [
  {
    title: "Start with Jesus",
    description:
      "Begin with worship, prayer, obedience, and how claims about God are framed.",
    href: "/jesus-in-islam-and-christianity",
  },
  {
    title: "Study Tawhid",
    description:
      "Learn how Islamic monotheism defines worship, prophethood, and devotion to God.",
    href: "/tawhid-and-the-trinity",
  },
  {
    title: "Compare the Quran and Bible",
    description:
      "Prepare to compare verified Quran passages and Bible passages with translation and source attribution.",
    href: "/the-quran-and-the-bible",
  },
  {
    title: "Study preservation",
    description:
      "Trace questions about transmission, manuscripts, and historical context for both scriptures.",
    href: "/preservation",
  },
  {
    title: "Study salvation",
    description:
      "Compare worship, forgiveness, accountability, and purpose across both traditions.",
    href: "/salvation-and-purpose-of-life",
  },
  {
    title: "Read common questions",
    description:
      "Bring the evidence together through scripture, theology, preservation, and purpose.",
    href: "/questions",
  },
];

export const comparisonMethods = [
  {
    title: "Sources first",
    description:
      "Start with exact references and clearly label translation, version, or source-status details.",
  },
  {
    title: "Historical context",
    description:
      "Place claims in context before drawing conclusions from them.",
  },
  {
    title: "Scholarly sources",
    description:
      "Use named historians, primary texts, and reliable academic sources.",
  },
  {
    title: "Respectful tone",
    description:
      "Speak to all sincere seekers without mockery or hostility.",
  },
  {
    title: "Clear citations",
    description:
      "Keep scripture, interpretation, history, and argument visibly separated.",
  },
  {
    title: "Corrections welcome",
    description:
      "Supported corrections are welcomed so the material remains accurate and clearly sourced.",
  },
];

export const featuredResearchCards = [
  {
    title: "Who is Jesus?",
    description:
      "A comparison of Islamic and Christian teachings about Jesus through scripture and historical context.",
    href: "/articles/who-is-jesus",
    label: "Article",
  },
  {
    title: "Did Jesus worship God?",
    description:
      "A study of Jesus's prayer, worship, and obedience in the Gospel accounts.",
    href: "/articles/did-jesus-worship-god",
    label: "Article",
  },
  {
    title: "Was the Quran preserved?",
    description:
      "A study of Quranic transmission, memorization, compilation, and early manuscripts.",
    href: "/articles/was-the-quran-preserved",
    label: "Article",
  },
  {
    title: "Tawhid vs Trinity",
    description:
      "A comparison of Islamic monotheism and Christian Trinitarian belief.",
    href: "/articles/what-is-tawhid",
    label: "Article",
  },
  {
    title: "Salvation in Islam and Christianity",
    description:
      "A study of worship, forgiveness, accountability, mercy, and purpose.",
    href: "/articles/forgiveness-in-islam-and-christianity",
    label: "Article",
  },
];
