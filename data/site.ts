import type { CategorySlug, FutureTopic, SiteCategory } from "@/types/domain";

function topic(title: string, description: string, href?: string): FutureTopic {
  return { title, description, href };
}

export const siteCategories = [
  {
    slug: "the-quran-and-the-bible",
    title: "The Quran & the Bible",
    href: "/the-quran-and-the-bible",
    description:
      "A beginner-friendly hub for comparing major questions in the Quran and Bible with clear source status.",
    icon: "scripture",
    tags: ["Scripture", "Theology"],
    futureTopics: [
      topic(
        "Who is God?",
        "A draft comparison of how God is described, worshiped, and understood.",
        "/articles/who-is-god-quran-and-bible-comparison",
      ),
      topic(
        "Who is Jesus?",
        "A study path for comparing Jesus with scripture, interpretation, and context kept separate.",
        "/articles/who-is-jesus",
      ),
      topic(
        "What is revelation?",
        "A planned study on scripture, prophethood, inspiration, and source attribution.",
      ),
      topic(
        "What is salvation?",
        "A planned comparison of forgiveness, accountability, mercy, and purpose.",
      ),
      topic(
        "What is sin?",
        "A planned topic for personal responsibility, repentance, and moral accountability.",
      ),
      topic(
        "What is worship?",
        "A planned study on worshiping God, prayer, obedience, and devotion.",
      ),
      topic(
        "What is the Day of Judgment?",
        "A planned comparison of accountability, resurrection, judgment, and final destiny.",
      ),
      topic(
        "What is the final message?",
        "A planned research path about prophecy, revelation, and the completion of guidance.",
      ),
    ],
    relatedSlugs: ["preservation", "jesus-in-islam-and-christianity", "sources"],
  },
  {
    slug: "jesus-in-islam-and-christianity",
    title: "Jesus in Islam & Christianity",
    href: "/jesus-in-islam-and-christianity",
    description:
      "A respectful path for Christians and other seekers to study Jesus through scripture, theology, and history.",
    icon: "jesus",
    tags: ["Jesus", "Theology"],
    futureTopics: [
      topic(
        "Who is Jesus?",
        "A draft study for defining the main question before comparing scripture and interpretation.",
        "/articles/who-is-jesus",
      ),
      topic(
        "The miraculous birth of Jesus",
        "A planned study with Quran and Bible passages to be added only after verification.",
      ),
      topic(
        "The miracles of Jesus",
        "A planned topic for comparing miracles with clear references and source notes.",
      ),
      topic(
        "Did Jesus worship God?",
        "A draft Christian-facing study question with scripture placeholders.",
        "/articles/did-jesus-worship-god",
      ),
      topic(
        "Did Jesus claim to be God?",
        "A planned study separating text, interpretation, and theological argument.",
      ),
      topic(
        "Jesus and the Trinity",
        "A planned bridge into Tawhid, Trinity, incarnation, and worship.",
        "/tawhid-and-the-trinity",
      ),
      topic(
        "Jesus as Messiah",
        "A planned study on the meaning of Messiah in Islamic and Christian discussions.",
      ),
      topic(
        "The crucifixion question",
        "A planned careful comparison with source status kept visible.",
      ),
      topic(
        "The second coming of Jesus",
        "A planned study of future expectation with scripture and source placeholders.",
      ),
      topic(
        "Who follows Jesus more closely?",
        "A draft article framework for comparing devotion, worship, and obedience respectfully.",
        "/articles/who-follows-jesus-more-closely",
      ),
    ],
    relatedSlugs: ["tawhid-and-the-trinity", "the-quran-and-the-bible", "questions"],
  },
  {
    slug: "preservation",
    title: "Preservation of Scripture",
    href: "/preservation",
    description:
      "A source-conscious study area for transmission, manuscripts, compilation, and why preservation matters.",
    icon: "preservation",
    tags: ["Preservation", "History", "Scripture"],
    futureTopics: [
      topic(
        "How the Quran was preserved",
        "A draft study framework for preservation, source status, and careful definitions.",
        "/articles/how-was-the-quran-preserved",
      ),
      topic(
        "Bible manuscript transmission",
        "A draft comparison article about transmission questions and source status.",
        "/articles/how-was-the-bible-transmitted",
      ),
      topic(
        "Oral memorization of the Quran",
        "A planned study on memorization that needs verified sources before claims are made.",
      ),
      topic(
        "Written compilation of the Quran",
        "A planned topic for compilation history with source placeholders.",
      ),
      topic(
        "Early Quran manuscripts",
        "A planned manuscript topic with no manuscript data added until verified.",
      ),
      topic(
        "Uthmanic standardization",
        "A planned study requiring careful historical source review.",
      ),
      topic(
        "Qira'at explained simply",
        "A planned beginner explanation with terminology and source safeguards.",
      ),
      topic(
        "Gospel authorship and dating",
        "A planned historical topic with citations required before publication.",
      ),
      topic(
        "Biblical canon formation",
        "A planned study on canon history and source types.",
      ),
      topic(
        "Textual variants explained",
        "A planned beginner topic on variants, evidence, and fair evaluation.",
      ),
      topic(
        "Why preservation matters",
        "A planned reflection on why source history matters for seekers.",
      ),
    ],
    relatedSlugs: ["the-quran-and-the-bible", "religious-history", "sources"],
  },
  {
    slug: "difficult-questions",
    title: "Contradictions & Difficult Questions",
    href: "/difficult-questions",
    description:
      "A careful space for hard questions, context, fair representation, and source-backed responses.",
    icon: "questions",
    tags: ["Questions", "Scripture"],
    futureTopics: [],
    relatedSlugs: ["questions", "the-quran-and-the-bible", "sources"],
  },
  {
    slug: "scientific-signs",
    title: "Scientific & Natural Signs",
    href: "/scientific-signs",
    description:
      "A cautious category for future discussions about the natural world, interpretation, and the limits of argument.",
    icon: "science",
    tags: ["Science", "Theology"],
    futureTopics: [
      topic(
        "Interpretation caution guide",
        "A planned note on avoiding overstatement when discussing scripture and the natural world.",
      ),
      topic(
        "Natural signs source map",
        "A placeholder for future passages, commentary, and source attribution.",
      ),
      topic(
        "Limits of scientific claims",
        "A future study note separating observation, interpretation, and argument.",
      ),
    ],
    relatedSlugs: ["religious-history", "questions", "sources"],
  },
  {
    slug: "religious-history",
    title: "Religious History",
    href: "/religious-history",
    description:
      "The history of early Christianity and Islam side by side — Jesus' era through Nicaea and the development of Trinity doctrine, and the Quran's own revelation and early preservation history.",
    icon: "history",
    tags: ["History", "Sources"],
    futureTopics: [
      topic(
        "The historical Jesus",
        "What mainstream historical-critical scholarship holds about Jesus, compared with the Quran's account.",
        "/articles/the-historical-jesus",
      ),
      topic(
        "Early Christianity",
        "From the crucifixion and resurrection claim through persecution to Constantine and Nicaea.",
        "/articles/early-christianity",
      ),
      topic(
        "The Council of Nicaea",
        "Why Constantine convened Nicaea in 325 CE, and the Islamic critique of doctrine settled by council.",
        "/articles/council-of-nicaea",
      ),
      topic(
        "Quranic revelation history",
        "How the Quran was revealed over 23 years and preserved through memorization and early writing.",
        "/articles/quranic-revelation-history",
      ),
    ],
    relatedSlugs: ["preservation", "historical-evidence", "sources"],
  },
  {
    slug: "historical-evidence",
    title: "Historical Evidence",
    href: "/historical-evidence",
    description:
      "Historical and archaeological support for the content within the Quran and Bible — ways the Quran's accounts align with historical plausibility, such as its distinct terms for Egypt's rulers across the Exodus and Youssef narratives.",
    icon: "sources",
    tags: ["History", "Sources", "Scripture"],
    futureTopics: [
      topic(
        "The Exodus in historical context",
        "Comparing the Biblical and Quranic Exodus accounts against historical and archaeological evidence.",
        "/articles/the-exodus-in-historical-context",
      ),
      topic(
        "Pharaoh vs King: Youssef's story in history",
        "Why the Quran uses 'king' for Egypt's ruler in Youssef's time but 'pharaoh' in Moses' time.",
        "/articles/pharaoh-vs-king-youssef-story",
      ),
      topic(
        "Archeological evidence for Quranic accounts",
        "What archaeology shows about the Quran's accounts of Ad, Thamud, Sodom, Babel, and Pharaoh's army.",
        "/articles/archeological-evidence-for-quranic-accounts",
      ),
    ],
    relatedSlugs: ["religious-history", "preservation", "sources"],
  },
  {
    slug: "tawhid-and-the-trinity",
    title: "Tawhid & the Trinity",
    href: "/tawhid-and-the-trinity",
    description:
      "A respectful comparison of Islamic monotheism and Christian Trinitarian theology using definitions and sources.",
    icon: "theology",
    tags: ["Theology", "Jesus"],
    futureTopics: [
      topic(
        "What is Tawhid?",
        "A draft beginner article defining the topic with source placeholders.",
        "/articles/what-is-tawhid",
      ),
      topic(
        "What is the Trinity?",
        "A draft article intended to explain Christian belief fairly before comparison.",
        "/articles/what-is-the-trinity",
      ),
      topic(
        "Did the prophets teach pure monotheism?",
        "A planned study needing verified scripture and historical sources.",
      ),
      topic(
        "Did Jesus worship the Father?",
        "A planned bridge topic linked to Jesus and worship.",
        "/articles/did-jesus-worship-god",
      ),
      topic(
        "Incarnation explained",
        "A planned Christian-theology explainer requiring careful sourcing.",
      ),
      topic(
        "Shirk explained",
        "A planned Islamic-theology explainer requiring careful sourcing.",
      ),
      topic(
        "God's nature in Islam and Christianity",
        "A planned comparison of divine nature, attributes, and worship.",
      ),
      topic(
        "Worshiping God alone",
        "A planned study on worship, devotion, and theological consistency.",
      ),
    ],
    relatedSlugs: ["jesus-in-islam-and-christianity", "salvation-and-purpose-of-life", "glossary"],
  },
  {
    slug: "salvation-and-purpose-of-life",
    title: "Salvation & Purpose of Life",
    href: "/salvation-and-purpose-of-life",
    description:
      "A future guide to worship, forgiveness, accountability, mercy, and purpose with sources separated from commentary.",
    icon: "salvation",
    tags: ["Purpose", "Theology"],
    futureTopics: [
      topic(
        "Purpose of life in Islam and Christianity",
        "A planned beginner study of worship, meaning, and accountability.",
      ),
      topic(
        "Sin and repentance",
        "A planned comparison of sin, repentance, mercy, and return to God.",
      ),
      topic(
        "Original sin vs personal responsibility",
        "A draft article comparing the issue with fair framing and source placeholders.",
        "/articles/original-sin-vs-personal-responsibility",
      ),
      topic(
        "Grace, mercy, faith, and deeds",
        "A planned study of key salvation terms and how each tradition uses them.",
      ),
      topic(
        "Forgiveness without blood sacrifice",
        "A draft article about forgiveness, sacrifice, mercy, and justice.",
        "/articles/forgiveness-in-islam-and-christianity",
      ),
      topic(
        "Heaven and Hell",
        "A planned study of final destiny and source-backed definitions.",
      ),
      topic(
        "Judgment Day",
        "A planned comparison of accountability and divine justice.",
      ),
      topic(
        "Why Islam's view of salvation is coherent",
        "A planned Islamic conclusion page that must be argued with sources.",
      ),
    ],
    relatedSlugs: ["tawhid-and-the-trinity", "questions", "jesus-in-islam-and-christianity"],
  },
  {
    slug: "prophecies",
    title: "Prophecies & Signs",
    href: "/prophecies",
    description:
      "Prophecies about Jesus and Muhammad each tradition claims, Quranic and Biblical prophecy interpretation, and shared end-times beliefs.",
    icon: "prophecies",
    tags: ["Prophecy", "History"],
    futureTopics: [
      topic(
        "Prophecies about Jesus",
        "Old Testament passages Christians read as predicting Jesus, and the scholarly debate around them.",
        "/articles/prophecies-about-jesus",
      ),
      topic(
        "Possible prophecies about Muhammad",
        "Biblical passages some Muslims read as foretelling Muhammad, and the Christian response.",
        "/articles/possible-prophecies-about-muhammad",
      ),
      topic(
        "End-times beliefs",
        "Islamic and Christian end-times beliefs, from the Dajjal and Gog and Magog to the Rapture and Tribulation.",
        "/articles/end-times-beliefs",
      ),
    ],
    relatedSlugs: ["religious-history", "the-quran-and-the-bible", "sources"],
  },
  {
    slug: "war-and-violence",
    title: "War & Violence",
    href: "/war-and-violence",
    description:
      "Islamic jurisprudence and Christian Just War tradition on armed conflict, self-defense, the Crusades, and how extremist groups misuse both traditions' texts.",
    icon: "warAndViolence",
    tags: ["Theology", "History", "Scripture"],
    futureTopics: [
      topic(
        "Jihad and Just War theory",
        "Islamic jurisprudence on armed struggle compared with the Christian Just War tradition.",
        "/articles/jihad-and-just-war-theory",
      ),
      topic(
        "Crusades and Islamic history",
        "The Crusades' religious and political dimensions, and how both traditions narrate the conflict.",
        "/articles/crusades-and-islamic-history",
      ),
      topic(
        "Terrorism and extremism: Islamic perspective",
        "Mainstream Islamic condemnation of terrorism, and how extremist groups misuse Islamic texts.",
        "/articles/terrorism-and-extremism-islamic-perspective",
      ),
    ],
    relatedSlugs: ["difficult-questions", "questions", "sources"],
  },
  {
    slug: "women",
    title: "Women",
    href: "/women",
    description:
      "The status of women in the Quran and Bible, inheritance and testimony, marriage and divorce, modesty, and female scholarship and leadership in both traditions.",
    icon: "women",
    tags: ["Theology", "History", "Scripture"],
    futureTopics: [
      topic(
        "Women in the Quran and Bible",
        "The role and status of women across key passages in both the Quran and the Bible.",
        "/articles/women-in-the-quran-and-bible",
      ),
      topic(
        "Marriage and divorce",
        "Islamic marriage contracts and divorce compared with Christian sacramental and Protestant views.",
        "/articles/marriage-and-divorce",
      ),
      topic(
        "Female scholars and leaders",
        "Women in Islamic scholarship and Christian church history, from Aisha to Deborah and Priscilla.",
        "/articles/female-scholars-and-leaders",
      ),
    ],
    relatedSlugs: ["the-quran-and-the-bible", "questions", "glossary"],
  },
  {
    slug: "questions",
    title: "Common Questions",
    href: "/questions",
    description:
      "Short beginner-friendly answers will live here, with links to deeper cited studies.",
    icon: "questions",
    tags: ["Questions"],
    futureTopics: [
      topic(
        "New reader questions",
        "A planned collection for visitors who are just beginning comparative study.",
      ),
      topic(
        "Christian visitor questions",
        "A future section for respectful questions Christians commonly ask about Islam.",
      ),
      topic(
        "Muslim study questions",
        "A placeholder for organized study prompts and citation-backed answers.",
      ),
    ],
    relatedSlugs: ["difficult-questions", "salvation-and-purpose-of-life", "glossary"],
  },
  {
    slug: "glossary",
    title: "Glossary",
    href: "/glossary",
    description:
      "Definitions for theological, historical, Arabic, and biblical terms used across the library.",
    icon: "glossary",
    tags: ["Sources", "Theology"],
    futureTopics: [
      topic(
        "Arabic terms",
        "A future glossary section for Arabic words with transliteration and source notes.",
      ),
      topic(
        "Biblical terms",
        "A planned glossary section for terms used in Bible and Christian theology discussions.",
      ),
      topic(
        "Historical method terms",
        "A placeholder for terms that appear in source criticism and history articles.",
      ),
    ],
    relatedSlugs: ["sources", "tawhid-and-the-trinity", "questions"],
  },
  {
    slug: "sources",
    title: "Source Library",
    href: "/sources",
    description:
      "A structured place to track translations, primary texts, academic references, and source status.",
    icon: "sources",
    tags: ["Sources", "Scripture", "History"],
    futureTopics: [
      topic(
        "Translation registry",
        "A planned list of Quran translations, Bible versions, and how each source is cited.",
      ),
      topic(
        "Citation status labels",
        "A future guide to verified, source-pending, and citation-needed labels.",
      ),
      topic(
        "Primary source index",
        "A placeholder index for primary texts and source access notes.",
      ),
    ],
    relatedSlugs: ["glossary", "religious-history", "the-quran-and-the-bible"],
  },
] satisfies SiteCategory[];

export const islamChristianityCategorySlugs = [
  "the-quran-and-the-bible",
  "jesus-in-islam-and-christianity",
  "tawhid-and-the-trinity",
  "salvation-and-purpose-of-life",
  "preservation",
  "religious-history",
  "war-and-violence",
  "women",
  "historical-evidence",
  "prophecies",
  "scientific-signs",
  "difficult-questions",
] satisfies CategorySlug[];

export const learnIslamCategorySlugs = [
  "tawhid-and-the-trinity",
  "the-quran-and-the-bible",
  "preservation",
  "salvation-and-purpose-of-life",
  "questions",
  "glossary",
  "sources",
] satisfies CategorySlug[];

// This file holds pure data only. Category lookup helpers live in
// lib/content, SEO metadata construction lives in lib/seo, and navigation
// config lives in lib/navigation.
