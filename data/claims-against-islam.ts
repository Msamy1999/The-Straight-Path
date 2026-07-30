import type { ResearchTreeNode } from "@/types/domain";

export type EvidenceReference = {
  kind: "Quran" | "Hadith";
  reference: string;
  summary: string;
  href: string;
};

export type ClaimAgainstIslam = {
  id: string;
  title: string;
  claim: string;
  response: string[];
  evidence: EvidenceReference[];
  links?: Array<{ href: string; label: string }>;
};

/**
 * A beginner-facing index of recurring criticisms. The evidence section gives
 * readers primary texts used in the Muslim response; it does not pretend that
 * a citation by itself settles every historical or moral question.
 */
export const claimsAgainstIslam: ClaimAgainstIslam[] = [
  {
    id: "aishas-age",
    title: "Aisha was a child bride, so Islam cannot be moral.",
    claim:
      "Critics point to reports that place Aisha at a very young age when her marriage to the Prophet Muhammad was consummated.",
    response: [
      "Islam does not treat a girl or woman as property, and it does not make marriage valid through coercion. The Quran forbids inheriting women against their will (4:19), gives women their own financial rights (4:4 and 4:7), and links marriageable age with sound judgment (4:6). The Prophet required a woman's permission before marriage (Sahih al-Bukhari 5136).",
      "The well-known reports in Sahih al-Bukhari are commonly understood to give Aisha a very young age at consummation. Some researchers reconstruct an older age from chronology, though that remains disputed. Muslims do not need to deny the reports to affirm the Quranic and prophetic safeguards of consent, capacity, and protection from harm.",
      "No historical report can cancel those safeguards. Islam's principles do not permit coercion, incapacity, or harm today; a child cannot meaningfully provide the consent and sound judgment that marriage requires.",
    ],
    evidence: [
      {
        kind: "Quran",
        reference: "Quran 4:4 and 4:7",
        summary: "The mahr is given to the bride, and women have an assigned share of inheritance.",
        href: "https://quran.com/4/4-7",
      },
      {
        kind: "Quran",
        reference: "Quran 4:6",
        summary: "It connects marriageable age with sound judgment in returning a young person's property; it does not state a universal number for marriage.",
        href: "https://quran.com/4/6",
      },
      {
        kind: "Quran",
        reference: "Quran 4:19",
        summary: "It forbids inheriting women against their will and commands kind treatment.",
        href: "https://quran.com/4/19",
      },
      {
        kind: "Hadith",
        reference: "Sahih al-Bukhari 5136",
        summary: "A woman is not married without consultation or permission; the report explains how a virgin's permission may be expressed.",
        href: "https://sunnah.com/bukhari:5136",
      },
    ],
  },
  {
    id: "spread-by-the-sword",
    title: "Islam spread only by the sword.",
    claim:
      "Because early Muslim states expanded through war, critics say people became Muslim only through forced conversion.",
    response: [
      "Islam explicitly rejects forced faith: “there is no compulsion in religion” (Quran 2:256). The Quran asks whether people can be compelled to believe (10:99) and even orders protection and safe passage for a polytheist who seeks asylum (9:6). These are direct principles, not later excuses.",
      "Early Muslim states did expand through war, but political rule is not the same as forced conversion. Islam spread through preaching, trade, scholarship, and family life across regions far beyond the first battlefields. Where rulers acted unjustly, that was a failure to uphold the Quran's standard—not proof that Islam commands conversion at sword-point.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Quran", reference: "Quran 10:99", summary: "It asks whether people can be compelled to believe.", href: "https://quran.com/10/99" },
      { kind: "Quran", reference: "Quran 9:6", summary: "It requires protection and safe passage for a polytheist who seeks asylum.", href: "https://quran.com/9/6" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [
      { href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" },
      { href: "/articles/civilian-protection-in-war", label: "Civilian protection" },
    ],
  },
  {
    id: "women",
    title: "Islam treats women badly.",
    claim:
      "Critics point to unequal inheritance shares in some cases, polygamy, dress rules, divorce rules, and the conduct of Muslim societies.",
    response: [
      "Islam's primary texts give women direct religious and legal standing: men and women are equally accountable before God (Quran 33:35), are described as mutual supporters (9:71), and women own their mahr and inheritance share themselves (4:4 and 4:7). The Prophet made good treatment of one's wife a measure of character (Jami at-Tirmidhi 3895).",
      "These were real protections in a world where women often had insecure property and inheritance rights. Islamic law assigns family responsibilities in different ways, but difference is not permission for contempt or abuse. Muslim societies and later legal opinions must be measured against the Quran's standard of justice and the Prophet's command to treat women well.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 33:35", summary: "It affirms men's and women's equal accountability before God.", href: "https://quran.com/33/35" },
      { kind: "Quran", reference: "Quran 9:71", summary: "It describes believing men and women as mutual supporters.", href: "https://quran.com/9/71" },
      { kind: "Quran", reference: "Quran 4:4 and 4:7", summary: "They give women direct rights to mahr and inheritance.", href: "https://quran.com/4/4-7" },
      { kind: "Hadith", reference: "Jami at-Tirmidhi 3895", summary: "The Prophet said the best people are those best to their wives.", href: "https://sunnah.com/tirmidhi:3895" },
    ],
    links: [
      { href: "/articles/women-in-the-quran-and-bible", label: "Women in the Quran and Bible" },
      { href: "/articles/inheritance-and-testimony", label: "Inheritance and testimony" },
    ],
  },
  {
    id: "polygamy",
    title: "Polygamy proves Islam sees women as unequal.",
    claim:
      "Islam permits a man to marry up to four wives, while a woman cannot marry multiple husbands.",
    response: [
      "The Quran does not make polygyny a male entitlement or a religious command. It permits it only under the condition of justice, then directs a man to marry only one if he fears injustice (Quran 4:3). It further warns that complete equality is difficult and forbids leaving one wife neglected by leaning entirely toward another (4:129).",
      "Islamic justice is not based on making every family role identical; it is based on binding rights and responsibilities. Polygyny is therefore a restricted social permission, not a licence for desire or mistreatment. The Prophet warned of grave consequences for a husband who unjustly favors one wife over another (Sunan Abi Dawud 2133).",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:3", summary: "It conditions polygyny on justice and directs a man to marry only one if he fears injustice.", href: "https://quran.com/4/3" },
      { kind: "Quran", reference: "Quran 4:129", summary: "It warns that complete equality between wives is difficult and forbids abandoning one by leaning entirely to another.", href: "https://quran.com/4/129" },
      { kind: "Hadith", reference: "Sunan Abi Dawud 2133", summary: "It warns against unjustly inclining toward one of two wives.", href: "https://sunnah.com/abudawud:2133" },
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "power-and-fame",
    title: "Muhammad wanted power, wealth, or fame.",
    claim:
      "Critics argue that the Prophet Muhammad used religion to gain influence and political authority.",
    response: [
      "The Quran repeatedly commands Muhammad to say that he asks no payment for God's message (6:90). Aisha described periods in which his household lived for months on dates and water rather than accumulating luxury (Sahih al-Bukhari 2567). That is difficult to reconcile with a mission designed for wealth.",
      "Muhammad later exercised political and military authority in Medina, but he used it while continuing to teach accountability before God and personal restraint. His long public life—its hardship, message, conduct, and lack of personal enrichment—fits the Muslim case for prophethood far better than a search for fame or riches.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 6:90", summary: "Muhammad is told to say that he asks no payment for the message.", href: "https://quran.com/6/90" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 2567", summary: "Aisha describes the Prophet's household living for months on dates and water.", href: "https://sunnah.com/bukhari:2567" },
    ],
    links: [{ href: "/articles/who-is-prophet-muhammad", label: "Who is Prophet Muhammad?" }],
  },
  {
    id: "satanic-or-human-source",
    title: "The Quran came from Satan, or it was invented by a human being.",
    claim:
      "Some critics say the Quran is demonic deception, copied material, or Muhammad's own composition rather than revelation.",
    response: [
      "The Quran directly rejects both accusations: it denies that a human teacher supplied it (16:103), says devils did not bring it down (26:210–212), and challenges opponents to produce anything comparable if they believe it was invented (17:88). Its central call is to worship the one God, reject evil, uphold justice, and seek mercy—none of which resembles a satanic message.",
      "Muslims also point to the opening-revelation report, in which Muhammad is shaken rather than presenting a prepared composition (Sahih al-Bukhari 3). The Quran's message, challenge, preservation, and the Prophet's life form a cumulative case for revelation; dismissing it as satanic or invented simply assumes the conclusion instead of answering that case.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 16:103", summary: "It rejects the claim that a human being taught Muhammad the Quran.", href: "https://quran.com/16/103" },
      { kind: "Quran", reference: "Quran 26:210–212", summary: "It denies that devils brought the Quran down.", href: "https://quran.com/26/210-212" },
      { kind: "Quran", reference: "Quran 17:88", summary: "It challenges opponents to produce anything comparable to the Quran.", href: "https://quran.com/17/88" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3", summary: "Aisha's report describes the beginning of revelation at Hira.", href: "https://sunnah.com/bukhari:3" },
    ],
    links: [{ href: "/articles/why-the-quran", label: "Why the Quran?" }],
  },
  {
    id: "terrorism",
    title: "Islam causes terrorism.",
    claim:
      "Because some violent groups use Islamic language and cite the Quran, critics say terrorism follows naturally from Islam.",
    response: [
      "Terrorism is not a teaching of Islam; it violates Islam's stated limits. The Quran permits fighting only against those who fight Muslims and forbids transgression (2:190), commands peace when an enemy genuinely offers peace (8:61), and treats unjust killing as a grave sin (17:33). The Prophet prohibited killing women and children in war (Sahih al-Bukhari 3015).",
      "Deliberately targeting civilians and spreading fear is therefore not jihad. Violent groups may use Islamic words, but their actions contradict the Quran and the Prophet's rules of war. Political conflict and extremist recruitment help explain terrorism; they do not make murder of non-combatants a religious duty.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It limits fighting and prohibits transgression.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 8:61", summary: "It commands acceptance of a genuine offer of peace.", href: "https://quran.com/8/61" },
      { kind: "Quran", reference: "Quran 17:33", summary: "It condemns unjust killing.", href: "https://quran.com/17/33" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [
      { href: "/articles/terrorism-and-extremism-islamic-perspective", label: "Terrorism and extremism" },
      { href: "/articles/self-defense-in-scripture", label: "Self-defense in scripture" },
    ],
  },
  {
    id: "quran-changed",
    title: "Uthman changed the Quran.",
    claim:
      "Critics say the caliph Uthman created a new Quran by standardizing copies and ordering other materials destroyed.",
    response: [
      "Sahih al-Bukhari 4987 is evidence against the claim that Uthman invented a new Quran. It reports that he borrowed the manuscript kept by Hafsa, appointed a four-person committee to make copies from it, and sent those copies to the provinces when disputes over recitation appeared.",
      "The order to remove non-standard private materials was a preservation measure: it protected one verified written standard from public fragmentation. Uthman did not claim new revelation or write a new book; he standardized copies of an already-recited Quran. Quran 15:9 states the Muslim belief that God preserves the Reminder, and this careful standardization is part of the historical means through which Muslims understand that preservation.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 15:9", summary: "The Quran states the Muslim belief that God sent down the Reminder and will preserve it.", href: "https://quran.com/15/9" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4987", summary: "It records Uthman's standardization of copies from Hafsa's manuscript to prevent disputes in recitation.", href: "https://sunnah.com/bukhari:4987" },
    ],
    links: [
      { href: "/articles/uthmanic-standardization", label: "Uthmanic standardization" },
      { href: "/articles/was-the-quran-preserved", label: "Was the Quran preserved?" },
    ],
  },
  {
    id: "quran-versions",
    title: "Different qiraat mean there are different Qurans.",
    claim:
      "Critics point to recognized readings of the Quran and say this disproves its preservation.",
    response: [
      "Recognized qiraat are not rival books or rival revelations. They are carefully transmitted recitation traditions for the same Quranic corpus, sharing the Uthmanic written text in the overwhelming majority of places. Their limited differences in pronunciation, vowels, grammar, or wording were recorded and taught openly—not discovered as hidden competing Qurans.",
      "The qiraat should not simply be called the seven ahruf; they are related but distinct technical concepts. Sahih al-Bukhari 4992 shows that the Prophet accepted more than one recitation of the same passage and described the Quran as revealed in seven ahruf. Far from proving loss, this documented and controlled transmission is part of the Muslim case for preservation.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 15:9", summary: "It states the Muslim belief that God preserves the Reminder.", href: "https://quran.com/15/9" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4992", summary: "It records the Prophet accepting more than one recitation and teaching that the Quran was revealed in seven ahruf (modes).", href: "https://sunnah.com/bukhari:4992" },
    ],
    links: [
      { href: "/articles/qiraat-explained-simply", label: "Qiraat explained simply" },
      { href: "/articles/textual-variants-explained", label: "Textual variants explained" },
    ],
  },
  {
    id: "apostasy",
    title: "Islam kills people for leaving the religion.",
    claim:
      "Critics point to classical rulings on apostasy and say Islam gives no room for freedom of conscience.",
    response: [
      "Islam calls people to faith, but the Quran does not permit forcing belief. It says there is no compulsion in religion (2:256) and mentions people who leave faith while placing their final judgment with God (2:217 and 4:137). No individual has the right to threaten, punish, or harm someone for a private change of belief.",
      "Sahih al-Bukhari 6922 is a key text in classical apostasy rulings and must be interpreted responsibly. Classical jurists developed severe rulings from it, while other Muslim scholars read it in the early context of armed rebellion and public treason rather than peaceful conscience. In every reading, vigilante violence is indefensible and contradicts Islamic justice.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Quran", reference: "Quran 4:137", summary: "It describes repeated changes of belief without prescribing a fixed worldly penalty.", href: "https://quran.com/4/137" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 6922", summary: "This is a key hadith cited in classical apostasy rulings and requires careful legal and historical interpretation.", href: "https://sunnah.com/bukhari:6922" },
    ],
    links: [{ href: "/articles/punishment-for-apostasy-and-war", label: "Apostasy and war in Islamic law" }],
  },
  {
    id: "slavery",
    title: "Islam permits slavery, so it cannot be just.",
    claim:
      "Critics note that the Quran and classical Islamic law regulated slavery rather than abolishing it immediately.",
    response: [
      "Islam did not create the slavery it encountered; it confronted a universal institution by restricting abuses, recognizing the humanity of enslaved people, and opening repeated paths to freedom. The Quran makes emancipation a righteous act and an expiation for wrongdoing (90:13, 4:92, 5:89, and 58:3), requires a contract of emancipation for enslaved people who seek it when good is known in them, and forbids coercing enslaved women into prostitution (24:33).",
      "The Prophet attached a major spiritual reward to freeing an enslaved Muslim person (Sahih Muslim 1509a). These commands changed slavery from an unrestricted system into one constrained by rights, manumission, and moral accountability.",
      "The Quran did not announce an immediate universal abolition, but its repeated legal and moral movement is toward liberation and human dignity. Muslims who reject slavery today apply that direction faithfully rather than treating historical slavery as an Islamic ideal.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 90:13", summary: "It names freeing an enslaved person as a righteous act.", href: "https://quran.com/90/13" },
      { kind: "Quran", reference: "Quran 4:92", summary: "It makes freeing an enslaved person an expiation in a specified case.", href: "https://quran.com/4/92" },
      { kind: "Quran", reference: "Quran 5:89", summary: "It makes freeing an enslaved person an expiation in a specified case.", href: "https://quran.com/5/89" },
      { kind: "Quran", reference: "Quran 58:3", summary: "It makes freeing an enslaved person an expiation in a specified case.", href: "https://quran.com/58/3" },
      { kind: "Quran", reference: "Quran 24:33", summary: "It requires emancipation contracts in a stated case and forbids sexual coercion.", href: "https://quran.com/24/33" },
      { kind: "Hadith", reference: "Sahih Muslim 1509a", summary: "It gives a strong spiritual incentive for emancipating an enslaved Muslim person.", href: "https://sunnah.com/muslim:1509a" },
    ],
  },
  {
    id: "jihad",
    title: "Jihad simply means holy war against non-Muslims.",
    claim:
      "Critics use the word jihad as if it always means unrestricted religious violence.",
    response: [
      "Jihad means striving in God's path; it is broader than war and includes moral, intellectual, and spiritual struggle. Armed jihad exists in Islamic teaching, but the Quran limits fighting to those who fight Muslims and forbids transgression (2:190), permits the oppressed to fight after being wronged (22:39), and commands acceptance of a genuine offer of peace (8:61).",
      "It is therefore not a licence for private warfare, forced conversion, or attacks on civilians. The Prophet's prohibition on killing women and children in war (Sahih al-Bukhari 3015) is a direct limit. Extremist violence does not define jihad; it violates the conditions Islam places on the use of force.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It limits fighting and forbids transgression.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 22:39", summary: "It permits the oppressed to fight after being wronged.", href: "https://quran.com/22/39" },
      { kind: "Quran", reference: "Quran 8:61", summary: "It commands acceptance of a genuine offer of peace.", href: "https://quran.com/8/61" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }],
  },
  {
    id: "non-muslims",
    title: "Islam teaches hatred or permanent second-class status for non-Muslims.",
    claim:
      "Critics point to verses about conflict and to the historical dhimma system.",
    response: [
      "Islam does not teach hatred of non-Muslims. The Quran commands Muslims to be just even toward those they dislike (5:8), kind and fair to people who do not fight them because of religion (60:8), and protective of an enemy polytheist who seeks asylum (9:6). The Prophet gave a severe warning against killing a person protected by treaty (Sahih al-Bukhari 3166).",
      "The historical dhimma system was a premodern framework of protected status and legal duties, not permission for contempt, forced conversion, or indiscriminate harm. Its practice varied, but the permanent Islamic standard remains justice, faithfulness to agreements, and safety for peaceful non-Muslims.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 5:8", summary: "It commands justice even toward opponents.", href: "https://quran.com/5/8" },
      { kind: "Quran", reference: "Quran 60:8", summary: "It commands kindness and fairness toward peaceful non-Muslims.", href: "https://quran.com/60/8" },
      { kind: "Quran", reference: "Quran 9:6", summary: "It orders protection and safe passage for a polytheist seeking asylum.", href: "https://quran.com/9/6" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3166", summary: "It gives a severe warning against killing a person who has a treaty with Muslims.", href: "https://sunnah.com/bukhari:3166" },
    ],
    links: [{ href: "/articles/rights-of-non-muslims", label: "Rights of non-Muslims" }],
  },
];

export const claimsAgainstIslamTree: ResearchTreeNode[] = claimsAgainstIslam.map(
  (claim) => ({
    id: claim.id,
    title: claim.title,
    description: claim.claim,
    href: `/claims-against-islam#${claim.id}`,
  }),
);
