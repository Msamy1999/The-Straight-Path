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
    title: '"Aisha was a child bride, so Islam cannot be moral."',
    claim:
      "Critics point to reports that place Aisha at a very young age when her marriage to the Prophet Muhammad was consummated.",
    response: [
      "The best-known hadith reports are commonly read as giving a young age. Other writers reconstruct an older age from biographical and chronological evidence, but those reconstructions are disputed. A serious answer should not pretend the historical calculation is settled.",
      "Islam does not treat a bride as property. The Quran makes the mahr (bridal gift) a right given to the woman herself, and only she may freely waive part of it. It also gives women an inheritance share. Marriage requires the woman's permission: the Prophet said a previously married woman must be consulted and a virgin's permission must be sought.",
      "The Quran links reaching marriageable age with sound judgment when a young person's property is returned to them. It does not give one universal numerical age, but it shows that capacity and judgment matter, not biology alone. In applying these principles today, consent, sound judgment, safeguarding health, and preventing harm must come first; no historical report cancels those duties.",
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
        kind: "Hadith",
        reference: "Sahih al-Bukhari 5136",
        summary: "A woman is not married without consultation or permission; the report explains how a virgin's permission may be expressed.",
        href: "https://sunnah.com/bukhari:5136",
      },
    ],
  },
  {
    id: "spread-by-the-sword",
    title: '"Islam spread only by the sword."',
    claim:
      "Because early Muslim states expanded through war, critics say people became Muslim only through forced conversion.",
    response: [
      "Early Muslim empires did expand through conquest, and that history should not be hidden. But political conquest and an individual's conversion are different questions. Large Muslim communities also grew through trade, scholarship, family ties, and preaching, especially far from the early battlefields.",
      "The Quran rejects forcing belief, and the Prophet forbade killing women and children in war. Islamic history includes both these principles and episodes where Muslim rulers acted unjustly. Neither a slogan about peaceful spread nor one about forced conversion is enough on its own.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [
      { href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" },
      { href: "/articles/civilian-protection-in-war", label: "Civilian protection" },
    ],
  },
  {
    id: "women",
    title: '"Islam treats women badly."',
    claim:
      "Critics point to unequal inheritance shares in some cases, polygamy, dress rules, divorce rules, and the conduct of Muslim societies.",
    response: [
      "The Quran and Islamic law gave women defined rights to property, inheritance, consent, and learning in a setting where those rights were often insecure. The Quran requires the bridal gift to be given to the woman, not to her guardian. The Prophet made good treatment of wives a measure of good character.",
      "At the same time, classical law contains rules that many modern readers see as unequal, and Muslim societies have often failed women in ways that cannot simply be blamed on culture alone. A fair study separates the Quran, later legal interpretations, and the conduct of different societies, and lets women speak about their own lives.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:4 and 4:7", summary: "It gives women a direct right to mahr and an assigned share of inheritance.", href: "https://quran.com/4/4-7" },
      { kind: "Hadith", reference: "Jami at-Tirmidhi 3895", summary: "The Prophet said the best people are those best to their wives.", href: "https://sunnah.com/tirmidhi:3895" },
    ],
    links: [
      { href: "/articles/women-in-the-quran-and-bible", label: "Women in the Quran and Bible" },
      { href: "/articles/inheritance-and-testimony", label: "Inheritance and testimony" },
    ],
  },
  {
    id: "polygamy",
    title: '"Polygamy proves Islam sees women as unequal."',
    claim:
      "Islam permits a man to marry up to four wives, while a woman cannot marry multiple husbands.",
    response: [
      "The Quran permits polygyny under conditions of justice and financial responsibility; it does not make it a command. It also warns that complete equality between wives is difficult. The Prophet warned of a severe consequence for a husband who unfairly favors one of two wives.",
      "The permission is a genuine moral question, not something answered by pretending it does not exist. Muslims explain it through family responsibility, social circumstances, and strict limits on the practice; critics may still judge those reasons differently.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:3 and 4:129", summary: "It conditions polygyny on justice and warns that complete equality is difficult.", href: "https://quran.com/4/3-129" },
      { kind: "Hadith", reference: "Sunan Abi Dawud 2133", summary: "It warns against unjustly inclining toward one of two wives.", href: "https://sunnah.com/abudawud:2133" },
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "power-and-fame",
    title: '"Muhammad wanted power, wealth, or fame."',
    claim:
      "Critics argue that the Prophet Muhammad used religion to gain influence and political authority.",
    response: [
      "The early Meccan period included public opposition, social pressure, and personal loss long before Muhammad led a community in Medina. The Quran tells him to say that he asks no payment for following the earlier prophets. A hadith also describes his exceptional generosity rather than the accumulation of wealth.",
      "After migration, he also became a political and military leader, so the historical record should be read in full rather than reduced to either persecution alone or power alone. The question ultimately concerns how one explains the whole life and message.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 6:90", summary: "Muhammad is told to say that he asks no payment for the message.", href: "https://quran.com/6/90" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 6", summary: "Ibn Abbas describes the Prophet as exceptionally generous, especially in Ramadan.", href: "https://sunnah.com/bukhari:6" },
    ],
    links: [{ href: "/articles/who-is-prophet-muhammad", label: "Who is Prophet Muhammad?" }],
  },
  {
    id: "satanic-or-human-source",
    title: '"The Quran came from Satan, or it was invented by a human being."',
    claim:
      "Some critics say the Quran is demonic deception, copied material, or Muhammad's own composition rather than revelation.",
    response: [
      "These are competing theological explanations, not conclusions established by simply asserting them. The Quran itself rejects the charge that a human taught Muhammad, and Muslims judge its call to worship one God, moral teaching, literary form, preservation, and Muhammad's life as evidence for revelation.",
      "The opening revelation report presents Muhammad as receiving an unexpected and distressing encounter rather than composing a planned speech. That does not compel a person of another faith to agree, but it is part of the evidence that a fair discussion must weigh.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 16:103 and 53:3-4", summary: "The Quran rejects the claim of a human teacher and says the message is revealed rather than personal desire.", href: "https://quran.com/16/103-53/4" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3", summary: "Aisha's report describes the beginning of revelation at Hira.", href: "https://sunnah.com/bukhari:3" },
    ],
    links: [{ href: "/articles/why-the-quran", label: "Why the Quran?" }],
  },
  {
    id: "terrorism",
    title: '"Islam causes terrorism."',
    claim:
      "Because some violent groups use Islamic language and cite the Quran, critics say terrorism follows naturally from Islam.",
    response: [
      "Terrorist groups do use Islamic language, and their arguments need to be answered directly. They do not represent all Muslim belief or the Quranic and prophetic teachings that restrict violence and protect people who are not fighting.",
      "Religion, politics, war, occupation, authoritarianism, and recruitment all shape violent movements. Explaining terrorism requires more than a single verse or label, while condemning attacks on civilians should remain clear and unqualified.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It permits fighting those who fight Muslims while prohibiting transgression.", href: "https://quran.com/2/190" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [
      { href: "/articles/terrorism-and-extremism-islamic-perspective", label: "Terrorism and extremism" },
      { href: "/articles/self-defense-in-scripture", label: "Self-defense in scripture" },
    ],
  },
  {
    id: "quran-changed",
    title: '"Uthman changed the Quran."',
    claim:
      "Critics say the caliph Uthman created a new Quran by standardizing copies and ordering other materials destroyed.",
    response: [
      "The traditional account describes Uthman's project as standardizing written copies of an already-recited Quran to prevent public disputes over recitation, not composing a new revelation. The report itself names a committee, a source manuscript held by Hafsa, and the sending of copies to provinces.",
      "Standardization is still a historical event worth studying closely. A sound answer should acknowledge companion materials, spelling differences, and authorized readings rather than making an absolute claim that no questions exist.",
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
    title: '"Different qiraat mean there are different Qurans."',
    claim:
      "Critics point to recognized readings of the Quran and say this disproves its preservation.",
    response: [
      "Qiraat are transmitted reading traditions that share the Quran's central written text while differing in limited ways of pronunciation, vowels, and some word forms. They are not separate books with different doctrines or competing revelations.",
      "The variations are real and should be explained honestly. The question is whether their documented limits and transmission fit the claim of preservation better than the claim that the Quran was lost or rewritten. The hadith evidence itself shows that early recitation had permitted modes; it should be studied rather than concealed.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 15:9", summary: "It states the Muslim belief that God preserves the Reminder.", href: "https://quran.com/15/9" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4992", summary: "It records the Prophet teaching that the Quran was revealed in seven ahruf (modes).", href: "https://sunnah.com/bukhari:4992" },
    ],
    links: [
      { href: "/articles/qiraat-explained-simply", label: "Qiraat explained simply" },
      { href: "/articles/textual-variants-explained", label: "Textual variants explained" },
    ],
  },
  {
    id: "apostasy",
    title: '"Islam kills people for leaving the religion."',
    claim:
      "Critics point to classical rulings on apostasy and say Islam gives no room for freedom of conscience.",
    response: [
      "Classical legal schools did develop severe rulings in some apostasy cases, often linking public defection to rebellion, war, or political betrayal. The hadith used in that discussion should be shown plainly, not hidden.",
      "Muslim scholars today disagree over how those rulings apply, especially where a person changes belief without violence or coercion. The Quran's statement against compulsion and the legal history both belong in an honest discussion; this page does not erase either text.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 6922", summary: "This is a key hadith cited in classical apostasy rulings and requires careful legal and historical interpretation.", href: "https://sunnah.com/bukhari:6922" },
    ],
    links: [{ href: "/articles/punishment-for-apostasy-and-war", label: "Apostasy and war in Islamic law" }],
  },
  {
    id: "slavery",
    title: '"Islam permits slavery, so it cannot be just."',
    claim:
      "Critics note that the Quran and classical Islamic law regulated slavery rather than abolishing it immediately.",
    response: [
      "Islam entered a world in which slavery was widespread. Its texts restricted some abuses and repeatedly encouraged freeing enslaved people, but they did not establish an immediate universal abolition. That is a serious fact, not one to hide.",
      "Muslims who defend Islam argue that its reforms moved society toward emancipation and that slavery has no place today. Critics may still ask why revelation did not forbid it at once; that moral question deserves a thoughtful answer rather than a slogan.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 90:13 and 24:33", summary: "It names freeing a person from slavery as a righteous act and commands contracts of emancipation in a stated case.", href: "https://quran.com/90/13-24/33" },
      { kind: "Hadith", reference: "Sahih Muslim 1509a", summary: "It gives a strong spiritual incentive for emancipating an enslaved Muslim person.", href: "https://sunnah.com/muslim:1509a" },
    ],
  },
  {
    id: "jihad",
    title: '"Jihad simply means holy war against non-Muslims."',
    claim:
      "Critics use the word jihad as if it always means unrestricted religious violence.",
    response: [
      "Jihad has a wider meaning of striving, while Islamic law also uses it for armed struggle under conditions that scholars debated. The Quran limits fighting to those who fight Muslims and prohibits transgression; it is not a licence for private violence or attacks on civilians.",
      "Classical law includes real disagreements about war, state authority, treaties, and treatment of others. A responsible account should neither erase those debates nor treat extremist readings as the whole of Islam.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It permits fighting those who fight Muslims while prohibiting transgression.", href: "https://quran.com/2/190" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }],
  },
  {
    id: "non-muslims",
    title: '"Islam teaches hatred or permanent second-class status for non-Muslims."',
    claim:
      "Critics point to verses about conflict and to the historical dhimma system.",
    response: [
      "The Quran contains commands about conflict in particular settings as well as commands for justice, good conduct, and protection. It tells Muslims to act kindly and justly toward people who do not fight them. The Prophet strongly condemned killing a person with a treaty of protection.",
      "The dhimma system did give non-Muslims a protected legal status, but it also marked a form of unequal citizenship by modern standards. Its rules and enforcement varied greatly by place and period. A fair response can recognize both protection and inequality without denying either.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 60:8", summary: "It permits kindness and justice toward those who do not fight Muslims because of religion.", href: "https://quran.com/60/8" },
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
