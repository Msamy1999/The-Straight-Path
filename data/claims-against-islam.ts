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
      "The well-known reports in Sahih al-Bukhari are commonly understood to give Aisha a very young age at consummation. Some researchers reconstruct an older age from chronology, but that remains disputed. A truthful answer must acknowledge the reports and must not claim that the historical question is settled.",
      "The Quran sets no universal numerical marriage age. It does connect marriageable age with sound judgment (Quran 4:6), forbids treating women as property or coercing them (4:19), and gives women their own financial rights (4:4 and 4:7). The Prophet also required a woman's permission before marriage (Sahih al-Bukhari 5136).",
      "These texts mean that a historical report cannot excuse coercion, incapacity, or harm today. Consent, legal capacity, and protection from harm are essential; a child cannot meaningfully supply those conditions.",
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
      "Early Muslim states did expand through war; that political history should not be denied. But conquest, rule, and personal conversion are different claims. The Quran says there is no compulsion in religion (2:256), asks whether people can be compelled to believe (10:99), and orders protection and safe passage even for a polytheist seeking asylum (9:6).",
      "Muslim rulers did not always live up to those standards, and non-Muslims could face unequal taxation or legal status. That is not the same as proving that Islam required conversion at sword-point. The primary texts and the varied historical record must both be considered.",
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
      "That does not mean every classical rule or Muslim custom matches modern expectations of legal equality. Some inheritance, marriage, and divorce rules are genuinely disputed today. A fair judgment should distinguish what the Quran says, later legal interpretation, and the wrongdoing of particular Muslim societies.",
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
      "The Quran permits, but never commands, a man to marry up to four wives. Its permission is conditional: if he fears he cannot be just, he is told to marry only one (Quran 4:3). It also warns that complete equality between wives is difficult and forbids abandoning one wife by leaning entirely to another (4:129).",
      "This is not an identical marital arrangement for men and women, and Muslims should not pretend otherwise. The Muslim case is that it is a restricted permission carrying serious duties, not a male entitlement; the Prophet warned that unjust favoritism between wives has grave consequences (Sunan Abi Dawud 2133).",
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
      "No verse can force someone to conclude that Muhammad was sincere, but the charge should be weighed against the record. The Quran tells him to say that he asks no payment for the message (6:90), and Aisha described periods in which his household lived for months on dates and water rather than accumulating luxury (Sahih al-Bukhari 2567).",
      "He later exercised political and military authority in Medina, so the question is not settled by denying that authority. The relevant question is whether his long public life—its message, hardship, conduct, and use of power—fits better with prophethood or deliberate self-enrichment.",
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
      "Calling the Quran satanic or human-made is a theological claim, not a demonstrated fact. The Quran directly rejects both accusations: it denies that a human teacher supplied it (16:103), says devils did not bring it down (26:210–212), and challenges opponents to produce anything comparable if they believe it was invented (17:88).",
      "Muslims also point to the opening-revelation report, in which Muhammad is shaken rather than presenting a prepared composition (Sahih al-Bukhari 3). These are reasons within the Muslim case; they do not compel a non-Muslim to believe, but a fair critique must engage them instead of merely attaching a label.",
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
      "A group's use of Islamic words does not make its violence Islamic. The Quran permits fighting only against those who fight Muslims and forbids transgression (2:190); it commands peace when an enemy genuinely offers peace (8:61), and it treats unjust killing as a grave sin (17:33). The Prophet prohibited killing women and children in war (Sahih al-Bukhari 3015).",
      "Terrorism deliberately targets civilians and spreads fear. It violates these limits even when perpetrators cite scripture. Political conflict and extremist recruitment help explain why terrorism occurs, but they do not turn murder of non-combatants into a religious duty.",
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
      "Uthman's standardization was a real historical act, not something to conceal. Sahih al-Bukhari 4987 reports that he borrowed the manuscript kept by Hafsa, appointed a four-person committee to copy it, sent the copies to provinces, and ordered other written Quranic materials burned after disputes over recitation arose.",
      "That report describes the production of a common written standard from an existing manuscript, not Uthman claiming new revelation or writing a new book himself. Critics may still question the process; Muslims see it as preventing recitational fragmentation. Quran 15:9 states the Muslim belief in preservation, while Bukhari 4987 supplies the historical report that must be examined.",
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
      "Recognized qiraat are not rival books or rival revelations. They are transmitted recitation traditions for the same Quranic corpus. They share the Uthmanic written text in the overwhelming majority of places while differing in limited recitational and linguistic details; some differences can affect wording or grammar and should not be hidden.",
      "The qiraat should also not simply be called the seven ahruf. They are related but distinct technical concepts. Sahih al-Bukhari 4992 shows that the Prophet accepted more than one recitation of the same passage and described the Quran as revealed in seven ahruf. The question is whether the known, transmitted limits of variation are compatible with preservation—not whether variation exists at all.",
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
      "The Quran repeatedly mentions people who leave faith and places their final judgment with God (2:217 and 4:137). It does not state a fixed worldly punishment for a private change of belief, and it says there is no compulsion in religion (2:256). Nothing in those verses licenses private individuals to threaten, punish, or harm someone for changing belief.",
      "The difficult hadith must still be faced: Sahih al-Bukhari 6922 contains the wording used in classical apostasy rulings. Classical jurists generally developed severe rulings from it. Other Muslim scholars argue that it must be read with the early context of armed rebellion and public treason, not as a punishment for peaceful conscience. The disagreement should be stated plainly, while vigilante violence remains indefensible.",
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
      "The Quran and classical Islamic law regulated slavery; they did not announce an immediate universal abolition. That is a serious moral difficulty and should not be covered by slogans.",
      "At the same time, the Quran repeatedly makes emancipation a righteous act and an expiation for wrongdoing (90:13, 4:92, 5:89, and 58:3), requires a contract of emancipation for enslaved people who seek it when good is known in them, and forbids coercing enslaved women into prostitution (24:33). The Prophet attached a major spiritual reward to freeing an enslaved Muslim person (Sahih Muslim 1509a).",
      "Muslims who conclude that slavery has no place today see these texts as orienting society toward liberation and human dignity. That conclusion is a moral reading of the reforming direction of the texts, not a claim that the texts enacted instant abolition.",
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
      "Jihad is broader than war: it means striving in God's path, while it can also refer to armed struggle. When the Quran permits fighting, it limits it to those fighting Muslims and forbids transgression (2:190); it permits the oppressed to fight after being wronged (22:39) and commands acceptance of a genuine offer of peace (8:61).",
      "Armed jihad is therefore not a license for private warfare, forced conversion, or attacks on civilians. The Prophet's prohibition on killing women and children in war (Sahih al-Bukhari 3015) is a direct limit. Muslims have disagreed about applications in history, but extremist violence cannot erase the stated limits.",
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
      "The Quran commands Muslims to be just even toward those they dislike (5:8) and kind and fair to people who do not fight them because of religion (60:8). It also orders protection and safe passage for an enemy polytheist who seeks it (9:6). The Prophet gave a severe warning against killing a person protected by treaty (Sahih al-Bukhari 3166).",
      "Historically, the dhimma system offered protected status but was not equal citizenship by modern standards. Its practice varied widely, and its inequalities should not be denied. The Muslim case is not that every historical arrangement was ideal; it is that hatred and indiscriminate harm toward non-Muslims contradict explicit Quranic and prophetic commands.",
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
