import type { ResearchTreeNode } from "@/types/domain";

/**
 * A source-led study path for /people-of-palestine. Draft status remains an
 * editorial control; public article availability is resolved through Payload.
 */
export const peopleOfPalestineTree: ResearchTreeNode[] = [
  {
    id: "understanding-people-and-place",
    title: "Understanding people and place",
    description: "Begin with Palestinian people, communities, and a clear map in words.",
    status: "draft",
    defaultOpen: true,
    children: [
      {
        id: "who-are-the-people-of-palestine",
        title: "Who are the people of Palestine?",
        description:
          "Meet a diverse people shaped by family, faith, culture, memory, and ties to place.",
        href: "/articles/who-are-the-people-of-palestine",
        tag: "Foundation",
        status: "draft",
      },
      {
        id: "palestine-places-and-people",
        title: "Gaza, the West Bank, East Jerusalem, Israel, and the diaspora",
        description:
          "A beginner-friendly guide to the places and legal terms used when discussing Palestine.",
        href: "/articles/palestine-places-and-people",
        tag: "Geography",
        status: "draft",
      },
    ],
  },
  {
    id: "history-and-displacement",
    title: "History and displacement",
    description: "Learn the main dates first, then examine the Nakba and refugee question closely.",
    status: "draft",
    children: [
      {
        id: "palestine-beginner-timeline",
        title: "Palestine: a beginner's historical timeline",
        description:
          "The Mandate, partition, 1948, 1967, the Intifadas, and Oslo in one careful sequence.",
        href: "/articles/palestine-beginner-timeline",
        tag: "Timeline",
        status: "draft",
      },
      {
        id: "nakba-and-palestinian-refugees",
        title: "The Nakba and Palestinian refugees explained",
        description:
          "What happened in 1948, how refugee terms are used, and why displacement remains unresolved.",
        href: "/articles/nakba-and-palestinian-refugees",
        tag: "History",
        status: "draft",
      },
    ],
  },
  {
    id: "faith-and-sacred-place",
    title: "Faith and sacred place",
    description: "Understand Palestine's place in Muslim faith and Al-Aqsa's specific importance.",
    status: "draft",
    children: [
      {
        id: "why-palestine-matters-to-muslims",
        title: "Why Palestine matters to Muslims",
        description:
          "A concise spiritual and ethical introduction to Muslim concern for Palestine.",
        href: "/articles/why-palestine-matters-to-muslims",
        tag: "Faith",
        status: "draft",
      },
      {
        id: "jerusalem-and-al-aqsa",
        title: "Jerusalem and Al-Aqsa",
        description:
          "Quranic, hadith, and historical foundations for the sanctuary's place in Islam.",
        href: "/articles/jerusalem-and-al-aqsa",
        tag: "Sacred place",
        status: "draft",
      },
    ],
  },
  {
    id: "human-dignity-and-justice",
    title: "Human dignity and responsible action",
    description: "Connect Islamic justice to civilian dignity and practical, lawful help.",
    status: "draft",
    children: [
      {
        id: "human-dignity-and-justice-topic",
        title: "Human dignity and justice",
        description:
          "Islamic principles for truth, justice, civilian protection, and rejection of collective blame.",
        href: "/articles/human-dignity-and-justice",
        tag: "Ethics",
        status: "draft",
      },
      {
        id: "help-palestine-responsibly",
        title: "How Muslims can help Palestine responsibly",
        description:
          "Pray, learn, give, and advocate through verified, lawful, and compassionate action.",
        href: "/articles/help-palestine-responsibly",
        tag: "Action",
        status: "draft",
      },
    ],
  },
  {
    id: "learn-responsibly",
    title: "Learn responsibly",
    description: "Check claims, understand source types, and build a reliable reading practice.",
    status: "draft",
    children: [
      {
        id: "how-to-learn-responsibly",
        title: "How to learn responsibly",
        description:
          "A practical checklist for dates, images, quotations, estimates, and breaking claims.",
        href: "/articles/how-to-learn-responsibly",
        tag: "Method",
        status: "draft",
      },
      {
        id: "source-library-for-palestine",
        title: "Source library for Palestine",
        description:
          "An annotated directory of primary documents, legal materials, humanitarian data, and history.",
        href: "/articles/source-library-for-palestine",
        tag: "Sources",
        status: "draft",
      },
    ],
  },
];
