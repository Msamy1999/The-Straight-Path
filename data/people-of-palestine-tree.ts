import type { ResearchTreeNode } from "@/types/domain";

/**
 * A carefully sourced draft study path for /people-of-palestine. Every entry links
 * to a draft article; none is presented as a final or published conclusion.
 */
export const peopleOfPalestineTree: ResearchTreeNode[] = [
  {
    id: "understanding-people-and-place",
    title: "Understanding people and place",
    description: "Draft introductions centred on people, place, and religious connection.",
    status: "draft",
    defaultOpen: true,
    children: [
      {
        id: "who-are-the-people-of-palestine",
        title: "Who are the people of Palestine?",
        description:
          "A draft introduction focused on human dignity, community, and daily life rather than politics or slogans.",
        href: "/articles/who-are-the-people-of-palestine",
        tag: "Foundation",
        status: "draft",
      },
      {
        id: "why-palestine-matters-to-muslims",
        title: "Why Palestine matters to Muslims",
        description:
          "A draft on the religious, historical, and human ties Muslims feel toward Palestine, written carefully and without inflammatory language.",
        href: "/articles/why-palestine-matters-to-muslims",
        tag: "Foundation",
        status: "draft",
      },
      {
        id: "jerusalem-and-al-aqsa",
        title: "Jerusalem and Al-Aqsa",
        description:
          "A draft on the significance of Jerusalem and Al-Aqsa Mosque, with historical claims clearly distinguished from religious belief.",
        href: "/articles/jerusalem-and-al-aqsa",
        tag: "History",
        status: "draft",
      },
    ],
  },
  {
    id: "human-dignity-and-justice",
    title: "Human dignity and justice",
    description: "A draft reflection on dignity, compassion, and justice.",
    status: "draft",
    children: [
      {
        id: "human-dignity-and-justice-topic",
        title: "Human dignity and justice",
        description:
          "A draft reflection on dignity, compassion, and justice as shared human and Islamic values.",
        href: "/articles/human-dignity-and-justice",
        tag: "Ethics",
        status: "draft",
      },
    ],
  },
  {
    id: "learn-responsibly",
    title: "Learn responsibly",
    description: "How to assess sources and avoid propaganda while reading about Palestine.",
    status: "draft",
    children: [
      {
        id: "how-to-learn-responsibly",
        title: "How to learn responsibly",
        description:
          "A draft guide for evaluating sources, avoiding propaganda, and reading history and news carefully.",
        href: "/articles/how-to-learn-responsibly",
        tag: "Method",
        status: "draft",
      },
      {
        id: "source-library-for-palestine",
        title: "Source library for Palestine",
        description:
          "A draft reading list that separates primary sources, reference works, and current reporting.",
        href: "/articles/source-library-for-palestine",
        tag: "Sources",
        status: "draft",
      },
    ],
  },
];
