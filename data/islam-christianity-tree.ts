import type {
  CategorySlug,
  ResearchTreeNode,
  ResearchTreeStatus,
} from "@/types/domain";

/**
 * Pure branch definitions for the Islam & Christianity tree. Each branch
 * references a category by slug; lib/content composes the full tree nodes
 * (title/description/href from the category record) so this file stays
 * data-only with no cross-file logic imports.
 */
export type IslamChristianityBranchDef = {
  slug: CategorySlug;
  children: ResearchTreeNode[];
  defaultOpen?: boolean;
};

const plannedDescription =
  "Planned source-pending topic. Add verified references, translations, and context before publishing claims.";

function branch(
  slug: CategorySlug,
  children: ResearchTreeNode[],
  options: Pick<IslamChristianityBranchDef, "defaultOpen"> = {},
): IslamChristianityBranchDef {
  return {
    slug,
    defaultOpen: options.defaultOpen,
    children,
  };
}

function topic(
  title: string,
  href: string,
  description = plannedDescription,
  status?: ResearchTreeStatus,
  tag?: string,
): ResearchTreeNode {
  return {
    title,
    description,
    href,
    status,
    tag,
  };
}

export const islamChristianityBranches: IslamChristianityBranchDef[] = [
  branch(
    "the-quran-and-the-bible",
    [
      topic(
        "Who is God?",
        "/articles/who-is-god-quran-and-bible-comparison",
        "A draft comparison of how God is described, worshiped, and understood.",
        "draft",
      ),
      topic(
        "Who is Jesus?",
        "/articles/who-is-jesus",
        "A draft study path for comparing Jesus with scripture, interpretation, and context kept separate.",
        "draft",
      ),
      topic(
        "What is revelation?",
        "/articles/what-is-revelation",
        "A draft study on the Quran-Christ asymmetry: verbatim revelation versus the Word made flesh.",
        "draft",
      ),
      topic(
        "What is salvation?",
        "/articles/what-is-salvation",
        "A draft comparison of grace, faith, and deeds in each tradition's account of being saved.",
        "draft",
      ),
      topic(
        "What is sin?",
        "/articles/what-is-sin",
        "A draft comparison of sin as inherited condition versus a free moral choice.",
        "draft",
      ),
      topic(
        "What is worship?",
        "/articles/what-is-worship",
        "A draft study of worship due to God alone and how each tradition understands it.",
        "draft",
      ),
      topic(
        "The Day of Judgment",
        "/articles/the-day-of-judgment",
        "A draft comparison of resurrection, accountability, and final judgment in both scriptures.",
        "draft",
      ),
      topic(
        "The final message",
        "/articles/the-final-message",
        "A draft study of the Islamic claim of a final, completing revelation after Christ.",
        "draft",
      ),
    ],
    { defaultOpen: true },
  ),
  branch(
    "jesus-in-islam-and-christianity",
    [
      topic(
        "Who is Jesus?",
        "/articles/who-is-jesus",
        "A draft study for defining the main question before comparing scripture and interpretation.",
        "draft",
      ),
      topic(
        "The miraculous birth of Jesus",
        "/articles/the-miraculous-birth-of-jesus",
        "A draft study of the virgin birth as affirmed in both scriptures, and what each tradition concludes from it.",
        "draft",
      ),
      topic(
        "The miracles of Jesus",
        "/articles/the-miracles-of-jesus",
        "A draft study of the miracles reported in both scriptures and what they establish about Jesus.",
        "draft",
      ),
      topic(
        "Did Jesus worship God?",
        "/articles/did-jesus-worship-god",
        "A draft study question about prayer, worship, obedience, and what those actions mean.",
        "draft",
      ),
      topic(
        "Did Jesus claim to be God?",
        "/articles/did-jesus-claim-to-be-god",
        "A draft study separating text, interpretation, and theological argument on the pivotal question.",
        "draft",
      ),
      topic(
        "Jesus and the Trinity",
        "/articles/incarnation-explained",
        "The Incarnation explained: how Christians understand God becoming man, and the Islamic response.",
        "draft",
      ),
      topic(
        "Jesus as Messiah",
        "/articles/jesus-as-messiah",
        "A draft study on the shared title of Messiah and what each tradition means by it.",
        "draft",
      ),
      topic(
        "The crucifixion question",
        "/articles/the-crucifixion-question",
        "A draft study presenting the Christian, historical-critical, and Quranic positions fairly.",
        "draft",
      ),
      topic(
        "The second coming of Jesus",
        "/articles/the-second-coming-of-jesus",
        "A draft study of the shared expectation of Jesus' return.",
        "draft",
      ),
      topic(
        "Who follows Jesus more closely?",
        "/articles/who-follows-jesus-more-closely",
        "A draft framework for comparing devotion, worship, and obedience respectfully.",
        "draft",
      ),
      topic(
        "The divinity verses examined one by one",
        "/articles/the-divinity-verses-examined",
        "John 1:1, 8:58, 10:30, 20:28, and four Pauline texts, each with the Trinitarian and unitarian readings.",
        "draft",
      ),
    ],
    { defaultOpen: true },
  ),
  branch("tawhid-and-the-trinity", [
    topic(
      "What is Tawhid?",
      "/articles/what-is-tawhid",
      "A draft beginner article defining the topic with source placeholders.",
      "draft",
    ),
    topic(
      "What is the Trinity?",
      "/articles/what-is-the-trinity",
      "A draft article intended to explain Christian belief fairly before comparison.",
      "draft",
    ),
    topic(
      "Did the prophets teach pure monotheism?",
      "/articles/did-prophets-teach-pure-monotheism",
      "Competing Islamic and Christian claims about what Abraham, Moses, and Jesus taught about God's nature.",
      "draft",
    ),
    topic(
      "Did Jesus worship the Father?",
      "/articles/did-jesus-worship-god",
      "A draft bridge topic linked to Jesus and worship.",
      "draft",
    ),
    topic(
      "Incarnation explained",
      "/articles/incarnation-explained",
      "The hypostatic union and kenosis explained, alongside the Islamic theological objection to it.",
      "draft",
    ),
    topic(
      "Shirk explained",
      "/articles/shirk-explained",
      "What shirk means in Islam, and the Muslim-Christian debate over whether the Trinity constitutes it.",
      "draft",
    ),
    topic(
      "God's nature in Islam and Christianity",
      "/articles/gods-nature-islam-christianity",
      "Comparing the 99 names of Allah with Christian divine attributes and the doctrine of the Trinity.",
      "draft",
    ),
    topic(
      "Worshiping God alone",
      "/articles/worshiping-god-alone",
      "How Islam and Christianity both demand exclusive devotion to God alone, in their own terms.",
      "draft",
    ),
  ]),
  branch("salvation-and-purpose-of-life", [
    topic(
      "Purpose of life in Islam and Christianity",
      "/articles/purpose-of-life",
      "Worship and stewardship in Islam, and love of God and neighbor in Christianity, as life's purpose.",
      "draft",
    ),
    topic(
      "Sin and repentance",
      "/articles/sin-and-repentance",
      "How Islam and Christianity each understand sin, and the path back to God through repentance.",
      "draft",
    ),
    topic(
      "Original sin vs personal responsibility",
      "/articles/original-sin-vs-personal-responsibility",
      "A draft comparison of inherited guilt, accountability, repentance, and justice.",
      "draft",
    ),
    topic(
      "Grace, mercy, faith, and deeds",
      "/articles/grace-mercy-faith-deeds",
      "Sola fide, Catholic and Orthodox synergy, and the Islamic balance of trust in God and deeds.",
      "draft",
    ),
    topic(
      "Forgiveness without blood sacrifice",
      "/articles/forgiveness-in-islam-and-christianity",
      "A draft article about forgiveness, sacrifice, mercy, and justice.",
      "draft",
    ),
    topic(
      "Heaven and Hell",
      "/articles/heaven-and-hell",
      "Jannah and Jahannam alongside the Christian heaven and hell, in both traditions' own imagery.",
      "draft",
    ),
    topic(
      "Judgment Day",
      "/articles/judgment-day",
      "Yawm al-Qiyamah and the Last Judgment, compared across both traditions' eschatology.",
      "draft",
    ),
  ]),
  branch("preservation", [
    topic(
      "How the Quran was preserved",
      "/articles/how-was-the-quran-preserved",
      "A draft framework for preservation, source status, and careful definitions.",
      "draft",
    ),
    topic(
      "Bible manuscript transmission",
      "/articles/how-was-the-bible-transmitted",
      "A draft comparison article about transmission questions and source status.",
      "draft",
    ),
    topic(
      "Oral memorization of the Quran",
      "/articles/oral-memorization-of-the-quran",
      "How companion memorization created an independent oral check on the text from the start.",
      "draft",
    ),
    topic(
      "Written compilation of the Quran",
      "/articles/written-compilation-of-the-quran",
      "From verses recorded during revelation to Abu Bakr's single verified copy after Yamama.",
      "draft",
    ),
    topic(
      "Early Quran manuscripts",
      "/articles/early-quran-manuscripts",
      "What the Birmingham fragment, Sanaa palimpsest, and early codices actually establish.",
      "draft",
    ),
    topic(
      "Uthmanic standardization",
      "/articles/uthmanic-standardization",
      "Why unifying spelling across regional copies was standardization, not alteration.",
      "draft",
    ),
    topic(
      "Qira'at explained simply",
      "/articles/qiraat-explained-simply",
      "Certified recitation modes traced by unbroken chains, read from one fixed written text.",
      "draft",
    ),
    topic(
      "Gospel authorship and dating",
      "/articles/gospel-authorship-and-dating",
      "What mainstream scholarship says about who wrote the Gospels, and when.",
      "draft",
    ),
    topic(
      "Biblical canon formation",
      "/articles/biblical-canon-formation",
      "How the Bible's list of authoritative books took shape over centuries.",
      "draft",
    ),
    topic(
      "Textual variants explained",
      "/articles/textual-variants-explained",
      "The longer ending of Mark and the story in John 8, explained in plain language.",
      "draft",
    ),
    topic(
      "When was Deuteronomy written?",
      "/articles/when-was-deuteronomy-written",
      "The scholarly consensus on Deuteronomy's dating, and what a scripture's composition history means for its authority.",
      "draft",
    ),
    topic(
      "Pseudepigrapha in the New Testament",
      "/articles/pseudepigrapha-in-the-new-testament",
      "What mainstream scholarship says about books written in someone else's name, especially 2 Peter.",
      "draft",
    ),
  ]),
  branch("religious-history", [
    topic(
      "The historical Jesus",
      "/articles/the-historical-jesus",
      "What mainstream historical-critical scholarship holds about Jesus, compared with the Quran's account.",
      "draft",
    ),
    topic(
      "Early Christianity",
      "/articles/early-christianity",
      "From the crucifixion and resurrection claim through persecution to Constantine and Nicaea.",
      "draft",
    ),
    topic(
      "Paul and his influence",
      "/articles/paul-and-his-influence",
      "Paul's letters, his calling, and his lasting influence on Christian theology and practice.",
      "draft",
    ),
    topic(
      "Gospel authorship and dating",
      "/articles/gospel-authorship-and-dating",
      "What mainstream scholarship says about who wrote the Gospels, and when.",
      "draft",
    ),
    topic(
      "Council of Nicaea",
      "/articles/council-of-nicaea",
      "Why Constantine convened Nicaea in 325 CE, and the Islamic critique of doctrine settled by council.",
      "draft",
    ),
    topic(
      "Development of Trinity doctrine",
      "/articles/development-of-trinity-doctrine",
      "How Trinity doctrine developed over centuries of councils and debate, and the Quran's strict monotheism.",
      "draft",
    ),
    topic(
      "Quranic revelation history",
      "/articles/quranic-revelation-history",
      "How the Quran was revealed over 23 years and preserved through memorization and early writing.",
      "draft",
    ),
    topic(
      "Early Islamic preservation",
      "/articles/early-islamic-preservation",
      "How hadith transmission developed from companions' memorization to codified written collections.",
      "draft",
    ),
  ]),
  branch("war-and-violence", [
    topic(
      "Jihad and Just War theory",
      "/articles/jihad-and-just-war-theory",
      "Islamic jurisprudence on armed struggle compared with the Christian Just War tradition.",
      "draft",
    ),
    topic(
      "Crusades and Islamic history",
      "/articles/crusades-and-islamic-history",
      "The Crusades' religious and political dimensions, and how both traditions narrate the conflict.",
      "draft",
    ),
    topic(
      "Self-defense in scripture",
      "/articles/self-defense-in-scripture",
      "What the Quran and Bible say about the right to defend life and property.",
      "draft",
    ),
    topic(
      "Punishment for apostasy and war",
      "/articles/punishment-for-apostasy-and-war",
      "Islamic jurisprudence on apostasy law, compared with the history of Christian heresy trials.",
      "draft",
    ),
    topic(
      "Civilian protection in Islamic law and the Biblical tradition",
      "/articles/civilian-protection-in-war",
      "Who may be fought and who may never be targeted, in Islamic jurisprudence and the Biblical herem texts.",
      "draft",
    ),
    topic(
      "The rights of non-Muslims under Islamic law",
      "/articles/rights-of-non-muslims",
      "What Islamic law guarantees non-Muslims in life, property, worship, and legal protection.",
      "draft",
    ),
  ]),
  branch("women", [
    topic(
      "Women in the Quran and Bible",
      "/articles/women-in-the-quran-and-bible",
      "The role and status of women across key passages in both the Quran and the Bible.",
      "draft",
    ),
    topic(
      "Inheritance and testimony",
      "/articles/inheritance-and-testimony",
      "Islamic and Biblical law on inheritance shares and the legal weight of testimony.",
      "draft",
    ),
    topic(
      "Marriage and divorce",
      "/articles/marriage-and-divorce",
      "Islamic marriage contracts and divorce compared with Christian sacramental and Protestant views.",
      "draft",
    ),
    topic(
      "Modesty and dress",
      "/articles/modesty-and-dress",
      "Scriptural roots of hijab and Christian modesty teaching, and the diversity within each tradition.",
      "draft",
    ),
    topic(
      "Eve in Islam and Christianity",
      "/articles/eve-in-islam-and-christianity",
      "How the two traditions read Eve and the fall, and what follows for all women.",
      "draft",
    ),
    topic(
      "Women's worth: classical Christian voices and the Islamic tradition",
      "/articles/womens-worth-classical-voices",
      "Tertullian, Jerome, Aquinas, and Basil on women, alongside the Islamic textual tradition and modern responses.",
      "draft",
    ),
  ]),
  branch("historical-evidence", [
    topic(
      "The Exodus in historical context",
      "/articles/the-exodus-in-historical-context",
      "Comparing the Biblical and Quranic Exodus accounts against historical and archaeological evidence.",
      "draft",
    ),
    topic(
      "Pharaoh vs King: Youssef's story in history",
      "/articles/pharaoh-vs-king-youssef-story",
      "Why the Quran uses 'king' for Egypt's ruler in Youssef's time but 'pharaoh' in Moses' time.",
      "draft",
    ),
    topic(
      "Archeological evidence for Quranic accounts",
      "/articles/archeological-evidence-for-quranic-accounts",
      "What archaeology shows about the Quran's accounts of Ad, Thamud, Sodom, Babel, and Pharaoh's army.",
      "draft",
    ),
    topic(
      "Historical support for Biblical narratives",
      "/articles/historical-support-for-biblical-narratives",
      "Archaeological and historical support for David's kingdom, Jesus' birth, the crucifixion, and Paul.",
      "draft",
    ),
    topic(
      "James, Josephus, and the earliest external evidence",
      "/articles/james-josephus-and-external-evidence",
      "What Josephus's Testimonium and James passages actually say, and what the authenticity debate shows.",
      "draft",
    ),
    topic(
      "The crucifixion and history: how strong is the evidence?",
      "/articles/the-crucifixion-and-history",
      "A methodological audit of what historians can and cannot establish about the crucifixion.",
      "draft",
    ),
  ]),
  branch("prophecies", [
    topic(
      "Prophecies about Jesus",
      "/articles/prophecies-about-jesus",
      "Old Testament passages Christians read as predicting Jesus, and the scholarly debate around them.",
      "draft",
    ),
    topic(
      "Possible prophecies about Muhammad",
      "/articles/possible-prophecies-about-muhammad",
      "Biblical passages some Muslims read as foretelling Muhammad, and the Christian response.",
      "draft",
    ),
    topic(
      "Quranic fulfilled prophecies",
      "/articles/quranic-fulfilled-prophecies",
      "The Quran's claims of fulfilled prophecy, examined alongside scholarly critique.",
      "draft",
    ),
    topic(
      "Biblical prophecies and interpretation",
      "/articles/biblical-prophecies-and-interpretation",
      "Preterist, historicist, and futurist frameworks for reading Biblical prophecy.",
      "draft",
    ),
    topic(
      "End-times beliefs",
      "/articles/end-times-beliefs",
      "Islamic and Christian end-times beliefs, from the Dajjal and Gog and Magog to the Rapture and Tribulation.",
      "draft",
    ),
  ]),
  branch("scientific-signs", [
    topic(
      "How to approach scientific claims carefully",
      "/articles/how-to-approach-scientific-claims-carefully",
      "A framing guide for avoiding overstatement when discussing scripture and the natural world.",
      "draft",
    ),
    topic(
      "Embryology",
      "/articles/embryology",
      "The Quran's stages of fetal development in Surah 23, compared with modern embryology.",
      "draft",
    ),
    topic(
      "Cosmology",
      "/articles/cosmology",
      "The Quran's account of the heavens and earth being joined then separated, and modern cosmology.",
      "draft",
    ),
    topic(
      "Mountains",
      "/articles/mountains",
      "The Quran's description of mountains as stabilizing pegs, read alongside plate tectonics.",
      "draft",
    ),
    topic(
      "Seas and barriers",
      "/articles/seas-and-barriers",
      "The Quran's barrier between two seas, and the oceanography of density and salinity stratification.",
      "draft",
    ),
    topic(
      "Creation and nature",
      "/articles/creation-and-nature",
      "Design arguments from creation in the Quran, the Bible, and the Darwinian challenge to them.",
      "draft",
    ),
    topic(
      "Celestial signs: orbits, stars, iron, and light in the Quran",
      "/articles/celestial-signs-in-the-quran",
      "Orbits, star positions, plant pairs, iron, and moonlight, each honestly graded strong, flexible, or overclaimed.",
      "draft",
    ),
  ]),
  branch("difficult-questions", [
    {
      title: "What is a contradiction?",
      href: "/articles/what-is-a-contradiction",
      description:
        "A framing article distinguishing genuine contradictions from textual variants, harmonizable difficulties, and interpretation.",
      status: "draft",
      defaultOpen: true,
      children: [
        {
          title: "Contradictions in the Bible",
          href: "/articles/contradictions-in-the-bible",
          description:
            "A draft map of commonly cited biblical tensions. Each item states the competing claims, why critics call it a contradiction, and the main harmonization or critical response.",
          tag: "Bible",
          status: "draft",
        },
      ],
    },
    topic(
      "Genealogies of Jesus",
      "/articles/genealogies-of-jesus",
      "Why Matthew and Luke give Jesus two different genealogies, and how each tradition reads the difficulty.",
      "draft",
    ),
    topic(
      "The death of Judas",
      "/articles/the-death-of-judas",
      "Matthew's hanging and Acts' falling-headlong accounts of Judas' death, and how each is read.",
      "draft",
    ),
    topic(
      "The timing of the crucifixion",
      "/articles/the-timing-of-the-crucifixion",
      "Reconciling the Synoptic and Johannine timing of the Last Supper and crucifixion with Passover.",
      "draft",
    ),
    topic(
      "Did anyone see God?",
      "/articles/did-anyone-see-god",
      "Moses at Sinai, John 1:18, and Quran 6:103 and 7:143 on seeing God.",
      "draft",
    ),
    topic(
      "Is original sin just?",
      "/articles/original-sin-vs-personal-responsibility",
      "A draft comparison of inherited guilt, accountability, repentance, and justice.",
      "draft",
    ),
    topic(
      "Can God become man?",
      "/articles/can-god-become-man",
      "The Incarnation and Tawhid's objection to it, presented as a difference in starting premises about God.",
      "draft",
    ),
    topic(
      "Why would God allow scripture to be corrupted?",
      "/articles/why-would-god-allow-corruption",
      "The theological objection Muslims raise about textual corruption, and whether it rebounds on the Quran.",
      "draft",
    ),
  ]),
];
