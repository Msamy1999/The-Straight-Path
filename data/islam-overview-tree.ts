import type { ResearchTreeNode } from "@/types/domain";

const startWithGod: ResearchTreeNode[] = [
  {
    id: "who-is-allah",
    title: "Who is Allah?",
    description:
      "The beautiful names, God's transcendence, and why Islam insists on worshipping Him alone.",
    href: "/articles/who-is-allah",
    status: "draft",
  },
  {
    id: "what-is-tawhid",
    title: "What is Tawhid?",
    description:
      "The oneness of God, the meaning of worship, and why associating partners with Him is rejected.",
    href: "/articles/what-is-tawhid",
    status: "draft",
  },
  {
    id: "what-is-the-quran",
    title: "What is the Quran?",
    description:
      "Revelation through Gabriel, the Quran's 114 surahs, its guidance, and its preservation claim.",
    href: "/articles/what-is-the-quran",
    status: "draft",
  },
  {
    id: "who-is-prophet-muhammad",
    title: "Who is Prophet Muhammad ﷺ?",
    description:
      "A beginner biography of Islam's final prophet, from Mecca and the first revelation to Medina.",
    href: "/articles/who-is-prophet-muhammad",
    status: "draft",
  },
];

const beliefs: ResearchTreeNode[] = [
  {
    id: "what-are-the-prophets",
    title: "What are the prophets?",
    description:
      "The shared call of Abraham, Moses, Jesus, Muhammad, and all of God's true messengers.",
    href: "/articles/what-are-the-prophets",
    status: "draft",
  },
  {
    id: "six-pillars-of-faith",
    title: "Six pillars of faith",
    description:
      "Belief in God, angels, revealed books, prophets, the Last Day, and divine decree.",
    href: "/articles/six-pillars-of-faith",
    status: "draft",
  },
];

const dailyLife: ResearchTreeNode[] = [
  {
    id: "five-pillars-of-islam",
    title: "Five pillars of Islam",
    description:
      "Shahada, prayer, Zakat, fasting Ramadan, and pilgrimage as the foundations of Muslim practice.",
    href: "/articles/five-pillars-of-islam",
    status: "draft",
  },
  {
    id: "worship-and-daily-life",
    title: "Worship and daily life",
    description:
      "How prayer, remembrance, work, family care, and ethical character shape an ordinary Muslim day.",
    href: "/articles/worship-and-daily-life",
    status: "draft",
  },
  {
    id: "islamic-practices-and-health",
    title: "Islamic practices and health",
    description:
      "What scientific research supports about selected Islamic practices, and which popular health claims Muslims should avoid.",
    href: "/articles/islamic-practices-and-health",
    status: "draft",
  },
];

/** Guided beginner path for /islam-overview. */
export const islamOverviewTree: ResearchTreeNode[] = [
  {
    id: "start-with-god-and-revelation",
    title: "Start with God and revelation",
    description: "God, Tawhid, the Quran, and the Prophet Muhammad ﷺ.",
    children: startWithGod,
    defaultOpen: true,
  },
  {
    id: "what-muslims-believe",
    title: "What Muslims believe",
    description: "The prophets and the central articles of faith.",
    children: beliefs,
  },
  {
    id: "how-muslims-live",
    title: "How Muslims live",
    description: "The pillars of Islam and worship in ordinary life.",
    children: dailyLife,
  },
  {
    id: "continue-the-journey",
    title: "Continue the journey",
    description: "An affirmative introduction to Islam's message and purpose.",
    children: [
      {
        id: "why-islam",
        title: "Why Islam?",
        description:
          "An affirmative invitation to one God, prophetic guidance, the Quran, mercy, and purposeful worship.",
        href: "/articles/why-islam",
        status: "draft",
      },
    ],
  },
];
