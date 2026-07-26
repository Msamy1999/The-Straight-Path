import type { ResearchTreeNode } from "@/types/domain";

export type ClaimAgainstIslam = {
  id: string;
  title: string;
  claim: string;
  response: string[];
  links?: Array<{ href: string; label: string }>;
};

/**
 * A beginner-facing index of recurring criticisms. Each entry gives the claim
 * in its strongest ordinary form, a concise response, and a path to deeper
 * study where the library has one. It is not a substitute for the linked
 * source-based articles.
 */
export const claimsAgainstIslam: ClaimAgainstIslam[] = [
  {
    id: "aishas-age",
    title: "“Aisha was a child bride, so Islam cannot be moral.”",
    claim:
      "Critics point to reports that place Aisha at a very young age when her marriage to the Prophet Muhammad was consummated.",
    response: [
      "The best-known hadith reports are commonly read as giving a young age. Other writers reconstruct an older age from biographical and chronological evidence, but those reconstructions are disputed. A serious answer should not pretend the historical calculation is settled.",
      "The right questions are what the reports say, how they are evaluated, what marriage meant in seventh-century Arabia, and how Muslims today should apply Islamic ethics to safeguarding children. Historical context explains a report; it does not prevent readers from asking a real moral question.",
    ],
  },
  {
    id: "spread-by-the-sword",
    title: "“Islam spread only by the sword.”",
    claim:
      "Because early Muslim states expanded through war, critics say people became Muslim only through forced conversion.",
    response: [
      "Early Muslim empires did expand through conquest, and that history should not be hidden. But political conquest and an individual's conversion are different questions. Large Muslim communities also grew through trade, scholarship, family ties, and preaching, especially far from the early battlefields.",
      "Islamic history includes both principled limits on warfare and episodes where Muslim rulers acted unjustly. Neither a slogan about peaceful spread nor a slogan about forced conversion is enough on its own.",
    ],
    links: [
      { href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" },
      { href: "/articles/civilian-protection-in-war", label: "Civilian protection" },
    ],
  },
  {
    id: "women",
    title: "“Islam treats women badly.”",
    claim:
      "Critics point to unequal inheritance shares in some cases, polygamy, dress rules, divorce rules, and the conduct of Muslim societies.",
    response: [
      "The Quran and Islamic law gave women defined rights to property, inheritance, consent, and learning in a setting where those rights were often insecure. At the same time, classical law contains rules that many modern readers see as unequal, and Muslim societies have often failed women in ways that cannot simply be blamed on culture alone.",
      "A fair study separates the Quran, later legal interpretations, and the actual conduct of different Muslim societies. It should also let women speak about their own lives rather than treating them as an abstract debate topic.",
    ],
    links: [
      { href: "/articles/women-in-the-quran-and-bible", label: "Women in the Quran and Bible" },
      { href: "/articles/inheritance-and-testimony", label: "Inheritance and testimony" },
    ],
  },
  {
    id: "polygamy",
    title: "“Polygamy proves Islam sees women as unequal.”",
    claim:
      "Islam permits a man to marry up to four wives, while a woman cannot marry multiple husbands.",
    response: [
      "The Quran permits polygyny under conditions of justice and financial responsibility; it does not make it a command. It also warns that complete equality between wives is difficult. Muslim families and legal systems have applied these texts in very different ways.",
      "The permission is a genuine moral question, not something answered by pretending it does not exist. Muslims explain it through family responsibility, social circumstances, and limits placed on the practice; critics may still judge those reasons differently.",
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "power-and-fame",
    title: "“Muhammad wanted power, wealth, or fame.”",
    claim:
      "Critics argue that the Prophet Muhammad used religion to gain influence and political authority.",
    response: [
      "The early Meccan period included public opposition, social pressure, and personal loss long before Muhammad led a community in Medina. Muslims see that pattern, together with the content of the Quran and his public character, as evidence that the message was not a scheme for status.",
      "After migration, he also became a political and military leader, so the historical record should be read in full rather than reduced to either persecution alone or power alone. The question ultimately concerns how one explains the whole life and message.",
    ],
    links: [{ href: "/articles/who-is-prophet-muhammad", label: "Who is Prophet Muhammad?" }],
  },
  {
    id: "satanic-or-human-source",
    title: "“The Quran came from Satan, or it was invented by a human being.”",
    claim:
      "Some critics say the Quran is demonic deception, copied material, or Muhammad's own composition rather than revelation.",
    response: [
      "These are competing theological explanations, not conclusions that can be established simply by asserting them. Muslims judge the Quran by its call to worship one God, its moral teaching, its literary form, its preservation, and Muhammad's life. Critics weigh those same features differently.",
      "A useful discussion asks for evidence for each explanation and compares the Quran's relationship to earlier traditions carefully. Similarity to earlier prophetic stories does not by itself prove copying; it may be explained as shared religious inheritance or as confirmation, depending on one's starting view.",
    ],
    links: [{ href: "/articles/why-the-quran", label: "Why the Quran?" }],
  },
  {
    id: "terrorism",
    title: "“Islam causes terrorism.”",
    claim:
      "Because some violent groups use Islamic language and cite the Quran, critics say terrorism follows naturally from Islam.",
    response: [
      "Terrorist groups do use Islamic language, and their arguments need to be answered directly. They do not represent all Muslim belief or the many legal and ethical teachings that restrict violence, forbid treachery, and protect non-combatants.",
      "Religion, politics, war, occupation, authoritarianism, and recruitment all shape violent movements. Explaining terrorism requires more than a single verse or a single label, while condemning attacks on civilians should remain clear and unqualified.",
    ],
    links: [
      { href: "/articles/terrorism-and-extremism-islamic-perspective", label: "Terrorism and extremism" },
      { href: "/articles/self-defense-in-scripture", label: "Self-defense in scripture" },
    ],
  },
  {
    id: "quran-changed",
    title: "“Uthman changed the Quran.”",
    claim:
      "Critics say the caliph Uthman created a new Quran by standardizing copies and ordering other materials destroyed.",
    response: [
      "The traditional account describes Uthman's project as standardizing written copies of an already-recited Quran to prevent public disputes over recitation, not composing a new revelation. Early manuscripts and memorization are part of the evidence that must be examined alongside the reports.",
      "Standardization is still a historical event worth studying closely. A sound answer should acknowledge companion materials, spelling differences, and authorized readings rather than making an absolute claim that no questions exist.",
    ],
    links: [
      { href: "/articles/uthmanic-standardization", label: "Uthmanic standardization" },
      { href: "/articles/was-the-quran-preserved", label: "Was the Quran preserved?" },
    ],
  },
  {
    id: "quran-versions",
    title: "“Different qira'at mean there are different Qurans.”",
    claim:
      "Critics point to recognized readings of the Quran and say this disproves its preservation.",
    response: [
      "Qira'at are transmitted reading traditions that share the Quran's central written text while differing in limited ways of pronunciation, vowels, and some word forms. They are not separate books with different doctrines or competing revelations.",
      "The variations are real and should be explained honestly. The question is whether their documented limits and transmission fit the claim of preservation better than the claim that the Quran was lost or rewritten.",
    ],
    links: [
      { href: "/articles/qiraat-explained-simply", label: "Qira'at explained simply" },
      { href: "/articles/textual-variants-explained", label: "Textual variants explained" },
    ],
  },
  {
    id: "apostasy",
    title: "“Islam kills people for leaving the religion.”",
    claim:
      "Critics point to classical rulings on apostasy and say Islam gives no room for freedom of conscience.",
    response: [
      "Classical legal schools did develop severe rulings in some apostasy cases, often linking public defection to rebellion, war, or political betrayal. That history should be faced plainly.",
      "Muslim scholars today disagree over how those rulings apply, especially where a person changes belief without violence or coercion. The Quran's statements against compulsion and the legal history both need to be part of an honest discussion.",
    ],
    links: [{ href: "/articles/punishment-for-apostasy-and-war", label: "Apostasy and war in Islamic law" }],
  },
  {
    id: "slavery",
    title: "“Islam permits slavery, so it cannot be just.”",
    claim:
      "Critics note that the Quran and classical Islamic law regulated slavery rather than abolishing it immediately.",
    response: [
      "Islam entered a world in which slavery was widespread. Its texts restricted some abuses and repeatedly encouraged freeing enslaved people, but they did not establish an immediate universal abolition. That is a serious fact, not one to hide.",
      "Muslims who defend Islam argue that its reforms moved society toward emancipation and that slavery has no place today. Critics may still ask why revelation did not forbid it at once; that moral question deserves a thoughtful answer rather than a slogan.",
    ],
  },
  {
    id: "jihad",
    title: "“Jihad simply means holy war against non-Muslims.”",
    claim:
      "Critics use the word jihad as if it always means unrestricted religious violence.",
    response: [
      "Jihad has a wider meaning of striving, while Islamic law also uses it for armed struggle under conditions that scholars debated. It is not a licence for private violence or attacks on civilians.",
      "Classical law includes real disagreements about war, state authority, treaties, and the treatment of others. A responsible account should neither erase those debates nor treat extremist readings as the whole of Islam.",
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }],
  },
  {
    id: "non-muslims",
    title: "“Islam teaches hatred or permanent second-class status for non-Muslims.”",
    claim:
      "Critics point to verses about conflict and to the historical dhimma system.",
    response: [
      "The Quran contains commands about conflict in particular settings as well as commands for justice, good conduct, and protection. Those passages must be read together and in context.",
      "The dhimma system did give non-Muslims a protected legal status, but it also marked a form of unequal citizenship by modern standards. Its rules and enforcement varied greatly by place and period. A fair response can recognize both protection and inequality without denying either.",
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
