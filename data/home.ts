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
      "A respectful, human-centered section on dignity, context, and responsible learning.",
    href: "/people-of-palestine",
    tag: "People",
  },
  {
    id: "common-questions",
    title: "Common Questions",
    description:
      "Beginner-friendly answers with draft status kept visible until sources are verified.",
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
      "Use named sources and mark draft material as source pending.",
  },
  {
    title: "Respectful tone",
    description:
      "Speak to Muslims, Christians, and sincere seekers without mockery or hostility.",
  },
  {
    title: "Clear citations",
    description:
      "Keep scripture, interpretation, history, and argument visibly separated.",
  },
  {
    title: "Corrections welcome",
    description:
      "Draft material is not final. Errors can be flagged, and supported corrections are welcomed before publication.",
  },
];

export const featuredResearchCards = [
  {
    title: "Who is Jesus?",
    description:
      "A draft comparison template for studying Jesus with scripture and context separated.",
    href: "/articles/who-is-jesus",
    label: "Draft article",
  },
  {
    title: "Did Jesus worship God?",
    description:
      "A planned study question for future sourced scripture and interpretation.",
    href: "/articles/did-jesus-worship-god",
    label: "Draft article",
  },
  {
    title: "Was the Quran preserved?",
    description:
      "A draft template for preservation questions, source status, and careful context.",
    href: "/articles/was-the-quran-preserved",
    label: "Draft article",
  },
  {
    title: "Tawhid vs Trinity",
    description:
      "A planned comparison of definitions, beliefs, and evidence with citations.",
    href: "/articles/what-is-tawhid",
    label: "Draft article",
  },
  {
    title: "Salvation in Islam and Christianity",
    description:
      "A planned study path about worship, forgiveness, accountability, and purpose.",
    href: "/articles/forgiveness-in-islam-and-christianity",
    label: "Draft article",
  },
];
