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

/** Primary texts used in concise Muslim responses to recurring criticisms. */
export const claimsAgainstIslam: ClaimAgainstIslam[] = [
  {
    id: "aishas-age",
    title: "Aisha was a child bride, so Islam cannot be moral.",
    claim: "Critics point to reports that place Aisha at a very young age when her marriage to the Prophet Muhammad was consummated.",
    response: [
      "Islam does not treat women as property or make a coerced marriage valid. The Quran forbids inheriting women against their will, gives them independent financial rights, and connects marriageable age with sound judgment; the Prophet required a woman's permission before marriage.",
      "The well-known reports in Sahih al-Bukhari give Aisha a young age at consummation. Some modern reconstructions argue for an older age, but that remains disputed. This is also a question of presentism: modern childhood norms cannot simply be projected onto a very different society. The moral standard Muslims apply today is consent, capacity, welfare, and the prevention of harm.",
      "Aisha's later life does not fit a picture of a silenced victim: she was a confident public voice, a major teacher, and a leading narrator of hadith. Her stature shows the agency and scholarly authority Islam recognized in women, though it is not a substitute for taking consent and harm seriously in every marriage.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:4 and 4:7", summary: "Women receive their own mahr and inheritance shares.", href: "https://quran.com/4/4-7" },
      { kind: "Quran", reference: "Quran 4:6 and 4:19", summary: "It links maturity with sound judgment and forbids treating women against their will.", href: "https://quran.com/4/6" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 5136", summary: "A woman is not married without consultation or permission.", href: "https://sunnah.com/bukhari:5136" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 5134", summary: "It is one of the reports giving Aisha's age at marriage and consummation.", href: "https://sunnah.com/bukhari:5134" },
    ],
  },
  {
    id: "spread-by-the-sword",
    title: "Islam spread only by the sword.",
    claim: "Because early Muslim states expanded through war, critics argue that Islam gained adherents only through forced conversion.",
    response: [
      "The Quran rejects forced faith: there is no compulsion in religion (2:256), and even a polytheist seeking protection must be granted safety and safe passage (9:6). Political expansion and personal conversion are not the same thing; Islam also spread through teaching, trade, families, and local communities.",
      "Early Muslim rule did not erase every local culture or require every community to become Muslim. Non-Muslim communities continued worship, law, language, and communal life in many places, even though particular rulers and periods varied greatly. That historical record is incompatible with the claim that conversion by force was Islam's only mechanism of growth.",
      "War itself was constrained: fighting is against those fighting you, without transgression, and non-combatants such as women and children are protected. Muslims judge any ruler's injustice by these standards rather than making it Islam's command.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Quran", reference: "Quran 9:6 and 2:190", summary: "It requires asylum and safe passage, and limits fighting without transgression.", href: "https://quran.com/9/6" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }, { href: "/articles/civilian-protection-in-war", label: "Civilian protection" }],
  },
  {
    id: "women",
    title: "Islam mistreats women.",
    claim: "Critics point to unequal inheritance shares in some cases, polygamy, dress rules, divorce rules, and the conduct of Muslim societies.",
    response: [
      "Islam gives men and women equal accountability before God, mutual duties of support, and direct legal rights to mahr and inheritance. Some family responsibilities are differentiated, but this does not measure either sex's worth or authorize superiority, humiliation, or abuse.",
      "When applied rightly, Islamic family and civil duties safeguard the vulnerable and protect the dignity of women and the integrity of the family. The Prophet made good treatment of wives a measure of character and, in his final sermon, told men to fear God concerning women and provide for them fairly.",
      "Muslim practice and later legal opinions should be tested against those standards. Abuse is a violation of Islam's justice, not an expression of it.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 33:35 and 9:71", summary: "Men and women are equally accountable before God and are mutual supporters.", href: "https://quran.com/33/35" },
      { kind: "Quran", reference: "Quran 4:4 and 4:7", summary: "Women have direct rights to mahr and inheritance.", href: "https://quran.com/4/4-7" },
      { kind: "Hadith", reference: "Sahih Muslim 1218a", summary: "The Farewell Sermon commands men to fear God concerning women and provide fairly.", href: "https://sunnah.com/muslim:1218a" },
      { kind: "Hadith", reference: "Jami at-Tirmidhi 3895", summary: "The Prophet said the best people are those best to their wives.", href: "https://sunnah.com/tirmidhi:3895" },
    ],
    links: [{ href: "/articles/women-in-the-quran-and-bible", label: "Women in the Quran and Bible" }, { href: "/articles/inheritance-and-testimony", label: "Inheritance and testimony" }],
  },
  {
    id: "polygamy",
    title: "Polygamy proves Islam sees women as unequal.",
    claim: "Critics assert that Islam's permission of men to marry up to four wives indicates unjust treatment of women.",
    response: [
      "Quran 4:3 did not introduce unrestricted polygyny; it capped and conditioned an existing practice at four and directs a man to one wife if he fears injustice. Quran 4:129 then warns against neglecting one wife through partiality. It is a restricted permission, not a command or a licence for desire.",
      "The Prophet was monogamous throughout his long marriage to Khadijah. Many later marriages had identifiable social, family, and community purposes, including care for widows and the formation of family bonds; they should not be reduced to a model of indulgence.",
      "A husband remains answerable for fairness, maintenance, and dignity. Where those conditions cannot be met, the Quran's own direction is one wife.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:3", summary: "It limits polygyny to four and directs one wife where justice is feared impossible.", href: "https://quran.com/4/3" },
      { kind: "Quran", reference: "Quran 4:129", summary: "It forbids abandoning one wife by inclining entirely toward another.", href: "https://quran.com/4/129" },
      { kind: "Hadith", reference: "Sunan Abi Dawud 2133", summary: "It warns against unjust partiality between wives.", href: "https://sunnah.com/abudawud:2133" },
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "power-and-fame",
    title: "Muhammad wanted power, wealth, or fame.",
    claim: "Critics argue that the Prophet Muhammad used religion to gain influence and political authority.",
    response: [
      "The Quran repeatedly commands Muhammad to say that he asks no payment for God's message. Aisha described months in which his household lived on dates and water, and reports describe Umar being moved when he saw the Prophet resting on a simple mat. That is difficult to square with a mission designed for luxury.",
      "Muhammad later exercised political and military authority in Medina, but continued to teach restraint, accountability before God, and care for the weak. For Muslims, the hardship, message, and absence of personal enrichment form a cumulative case for prophethood rather than a search for fame.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 6:90", summary: "Muhammad is told to say that he asks no payment for the message.", href: "https://quran.com/6/90" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 2567", summary: "Aisha describes the Prophet's household living for months on dates and water.", href: "https://sunnah.com/bukhari:2567" },
      { kind: "Hadith", reference: "Sunan Ibn Majah 4153", summary: "Umar wept on seeing the marks of a mat on the Prophet's side and his simple room.", href: "https://sunnah.com/ibnmajah:4153" },
    ],
    links: [{ href: "/articles/who-is-prophet-muhammad", label: "Who is Prophet Muhammad?" }],
  },
  {
    id: "satanic-or-human-source",
    title: "The Quran came from Satan, or it was invented by a human being.",
    claim: "Some critics say the Quran is demonic deception, copied material, or Muhammad's own composition rather than revelation.",
    response: [
      "The Quran rejects both accusations: it denies a human teacher supplied it, says devils did not bring it down, and repeatedly calls Satan a clear enemy. Its central message is worship of God alone, moral accountability, mercy, and resistance to evil; Muslims see that as the opposite of a satanic call.",
      "Muslims also point to its linguistic challenge, its claims of signs and fulfilled forecasts, and the Prophet's known background as a seventh-century Arabian preacher rather than a biblical scholar. These are cumulative reasons Muslims see divine inspiration; they do not require the historically implausible idea that he secretly copied or composed the Quran unaided.",
      "The opening-revelation report depicts Muhammad shaken by the experience, not launching a prepared literary project. The case for revelation rests on the Quran's message, form, history, and the Prophet's life together.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 16:103", summary: "It rejects the claim that a human being taught Muhammad the Quran.", href: "https://quran.com/16/103" },
      { kind: "Quran", reference: "Quran 26:210-212 and 35:6", summary: "It denies that devils brought it down and calls Satan a clear enemy.", href: "https://quran.com/26/210-212" },
      { kind: "Quran", reference: "Quran 17:88 and 7:157-158", summary: "It issues its literary challenge and describes the Prophet as unlettered.", href: "https://quran.com/17/88" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3", summary: "Aisha's report describes the beginning of revelation at Hira.", href: "https://sunnah.com/bukhari:3" },
    ],
    links: [{ href: "/articles/why-the-quran", label: "Why the Quran?" }],
  },
  {
    id: "terrorism",
    title: "Islam breeds terrorism.",
    claim: "Because some violent groups use Islamic language and cite the Quran, critics argue that terrorism follows naturally from Islam.",
    response: [
      "Terrorism violates Islam's stated limits. The Quran permits fighting only against those who fight Muslims and forbids transgression, commands acceptance of a genuine peace offer, and condemns unjust killing. In its account of a command to the Children of Israel, it says that unjustly killing one soul is like killing all humanity (5:32).",
      "The Prophet expressly forbade killing women and children in war. Deliberate attacks on civilians and the spread of terror are therefore not jihad, even when violent groups use Islamic language. Their conduct is judged against the Quran and Prophetic limits, not allowed to redefine them.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190 and 8:61", summary: "It limits fighting, forbids transgression, and commands acceptance of peace.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 5:32 and 17:33", summary: "It treats unjust killing as an immense wrong and forbids taking life without right.", href: "https://quran.com/5/32" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/terrorism-and-extremism-islamic-perspective", label: "Terrorism and extremism" }, { href: "/articles/self-defense-in-scripture", label: "Self-defense in scripture" }],
  },
  {
    id: "quran-changed",
    title: "The Quran was altered.",
    claim: "Critics assert that the caliph Uthman created a new Quran by standardizing copies and ordering other materials destroyed.",
    response: [
      "The central report does not describe Uthman inventing a Quran. It says the first collected manuscripts were held by Abu Bakr, then Umar, then Hafsa - Umar's daughter, the Prophet's widow, and a Mother of the Believers. Uthman borrowed this established collection, appointed a committee of Qurayshi and Medinan scribes, made standard copies, then returned it to Hafsa.",
      "Removing unofficial personal materials was a measure against public fragmentation in recitation, not new revelation. Uthman's copies standardized an already memorized and written Quran; Muslims understand this careful communal process as one means by which God preserved the Reminder.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 15:9", summary: "The Quran states the Muslim belief that God will preserve the Reminder.", href: "https://quran.com/15/9" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4986", summary: "It traces the first collection from Abu Bakr to Umar and then Hafsa.", href: "https://sunnah.com/bukhari/66/8" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4987", summary: "It records Uthman's copying from Hafsa's manuscripts and returning them to her.", href: "https://sunnah.com/bukhari/66/9" },
    ],
    links: [{ href: "/articles/uthmanic-standardization", label: "Uthmanic standardization" }, { href: "/articles/was-the-quran-preserved", label: "Was the Quran preserved?" }],
  },
  {
    id: "quran-versions",
    title: "Different readings mean there are different Qurans.",
    claim: "Critics point to recognized qiraat (readings) of the Quran and say this disproves its preservation.",
    response: [
      "Recognized qiraat are not rival books or rival revelations. They are rigorously transmitted recitation traditions for the same Quranic corpus and largely share the Uthmanic consonantal text. Their limited differences in pronunciation, vowels, grammar, and some wording were taught openly, not discovered as hidden competing Qurans.",
      "The qiraat are not simply identical to the seven ahruf. The ahruf are early, divinely authorized modes or forms of recitation mentioned in hadith; scholars differ over their precise scope. Later canonical qiraat are documented reading traditions transmitted within the written Quranic text. That distinction is important, and neither concept means that a different Quran was lost or invented.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 15:9", summary: "It states the Muslim belief that God preserves the Reminder.", href: "https://quran.com/15/9" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 4992", summary: "It records the Prophet accepting more than one recitation and referring to seven ahruf.", href: "https://sunnah.com/bukhari:4992" },
    ],
    links: [{ href: "/articles/qiraat-explained-simply", label: "Readings explained simply" }, { href: "/articles/textual-variants-explained", label: "Textual variants explained" }],
  },
  {
    id: "apostasy",
    title: "Islam kills people for leaving the religion.",
    claim: "Critics point to classical rulings on apostasy and argue that Islam gives no room for freedom of conscience.",
    response: [
      "Islam calls people to faith because rejecting God has ultimate, eternal consequences, but the Quran does not authorize forcing belief. It mentions people who leave faith while placing their final judgment with God. No private person may threaten, punish, or harm someone for a change of belief.",
      "Classical jurists derived severe rulings from Sahih al-Bukhari 6922. Many treated public apostasy in the early Islamic polity as more than private conviction: it could involve public agitation, leading others away from Islam, or rupture of a religious-civil allegiance, and was therefore discussed alongside treason. Other Muslim scholars limit the ruling to rebellion or wartime betrayal. The legal debate cannot be honestly reduced to one uncontested rule.",
      "Islamic rulings are meant to prevent harm and require lawful authority, due process, justice, and social conditions; vigilantism is forbidden. Contemporary Muslims and jurists continue to disagree about how classical apostasy law applies in modern states.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256 and 4:137", summary: "It rejects compulsion and describes repeated changes of belief without a stated fixed worldly penalty.", href: "https://quran.com/2/256" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 6922", summary: "A key hadith in classical apostasy rulings that requires legal and historical interpretation.", href: "https://sunnah.com/bukhari:6922" },
    ],
    links: [{ href: "/articles/punishment-for-apostasy-and-war", label: "Apostasy and war in Islamic law" }],
  },
  {
    id: "slavery",
    title: "Islam permits slavery, so it cannot be just.",
    claim: "Critics note that the Quran and classical Islamic law regulated slavery rather than abolishing it immediately.",
    response: [
      "Premodern slavery was not identical to the modern, racial chattel system of the trans-Atlantic trade, but it was still a coercive institution and must not be romanticized. Islam entered a world structured around it and imposed rights, bans on mistreatment, and repeated routes to emancipation rather than presenting enslavement as an ideal.",
      "In context, the Quran describes the difficult moral ascent as faith, feeding in hardship, and freeing a person (90:11-13). It commands good treatment of those under one's authority, encourages manumission through expiations, requires emancipation contracts in a stated case, and forbids coercing enslaved women into prostitution. The Prophet required food, clothing, manageable work, and assistance for enslaved people.",
      "The phrase 'those your right hands possess' is the Quran's legal idiom for people held under the historical institution. Classical law gave concubines a recognized legal standing and prohibited many forms of abuse, while Quran 24:33 expressly forbids sexual coercion into prostitution. These rules should not be confused with a modern consent framework; Muslims reject slavery today and read the Quran's repeated movement toward freedom as its ethical direction.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 90:11-13", summary: "It places freeing a person in the context of the difficult moral ascent.", href: "https://quran.com/90/11-13" },
      { kind: "Quran", reference: "Quran 4:36 and 24:33", summary: "It commands good treatment and forbids coercing enslaved women into prostitution.", href: "https://quran.com/4/36" },
      { kind: "Quran", reference: "Quran 4:92, 5:89, and 58:3", summary: "It makes freeing an enslaved person an expiation in specified cases.", href: "https://quran.com/4/92" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 2545", summary: "It requires food, clothing, manageable work, and help with burdensome work.", href: "https://sunnah.com/bukhari:2545" },
    ],
  },
  {
    id: "jihad",
    title: "Jihad simply means holy war against non-Muslims.",
    claim: "Critics apply the word \"jihad\" as if it refers to unrestricted religious violence.",
    response: [
      "Jihad means striving in God's path; it is broader than war and includes moral, intellectual, and spiritual struggle. The Quran praises the person who restrains the self from wrongful desire, a core basis for the Islamic struggle against the nafs. Armed jihad exists, but it is governed by authority, just cause, proportionality, and limits.",
      "The Quran limits fighting to those who fight Muslims, forbids transgression, permits defense after wrong, and commands acceptance of a genuine offer of peace. The Prophet prohibited killing women and children; Islamic martial law also protects non-combatants and forbids betrayal and mutilation. It is not a licence for forced conversion, private warfare, or attacks on civilians.",
      "The popular wording that calls inner struggle 'the greater jihad' is not established by a sound hadith. The inner struggle itself is a genuine Quranic and ethical Islamic teaching, and it should be supported without relying on a weak report.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190, 22:39, and 8:61", summary: "It limits fighting, permits defense after wrong, and commands acceptance of peace.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 79:40-41 and 91:9-10", summary: "It praises restraining the self and purifying it.", href: "https://quran.com/79/40-41" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }],
  },
  {
    id: "non-muslims",
    title: "Islam teaches hatred or permanent second-class status for non-Muslims.",
    claim: "Critics point to verses about conflict and to the historical dhimma system.",
    response: [
      "Islam does not teach hatred of non-Muslims. The Quran commands justice even toward opponents, kindness and fairness toward peaceful people of other faiths, and safe passage for an enemy polytheist who asks for protection. The Prophet gave a severe warning against killing a person protected by treaty.",
      "Dhimma was a premodern protected-status framework for non-Muslim communities under Muslim rule. In principle it secured life, property, worship, and communal affairs in return for public allegiance and the jizya. Jizya was generally levied on eligible adult non-Muslim men and was linked to state protection and exemption from the Muslim military obligation; its rates, exemptions, and implementation varied by time and place.",
      "It was not modern equal citizenship, and historical governments did not always meet their own ideals. But it was not a licence for forced conversion or contempt. The governing Islamic standards remain justice, fidelity to covenants, and safety for peaceful non-Muslims.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 5:8, 60:8, and 9:6", summary: "It commands justice, fairness to peaceful non-Muslims, and protection for asylum seekers.", href: "https://quran.com/5/8" },
      { kind: "Quran", reference: "Quran 9:29", summary: "It is the central Quranic verse cited in discussions of jizya and the historical dhimma framework.", href: "https://quran.com/9/29" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3166", summary: "It gives a severe warning against killing a person protected by treaty.", href: "https://sunnah.com/bukhari:3166" },
    ],
    links: [{ href: "/articles/rights-of-non-muslims", label: "Rights of non-Muslims" }],
  },
  {
    id: "wife-beating",
    title: "Islam permits “domestic abuse.”",
    claim: "Critics point to Quran 4:34 and argue that Islam permits or excuses domestic abuse.",
    response: [
      "Quran 4:34 is a difficult verse and must not be hidden. It sets out a sequence for a serious marital breakdown: counsel, temporary separation in bed, and a final disputed term often translated as striking. It immediately forbids seeking a way against the wife once reconciliation occurs; it does not authorise rage, injury, humiliation, or routine control.",
      "Classical jurists who understood the term as a physical act restricted it severely and forbade injury and striking the face. Other modern Muslim interpreters read it as separation rather than hitting. In either approach, domestic abuse is not a Prophetic model: Aisha said the Prophet never struck a woman or servant, and the Quran commands spouses to be treated with kindness.",
      "A Muslim cannot use this verse to justify violence. Harm, coercion, and intimidation violate the Quranic purpose of mercy in marriage and must be confronted through protection, lawful redress, and accountability.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:34", summary: "It addresses a grave marital conflict in a staged sequence and forbids further aggression after reconciliation.", href: "https://quran.com/4/34" },
      { kind: "Quran", reference: "Quran 4:19 and 30:21", summary: "It commands kind treatment and describes marriage through comfort, affection, and mercy.", href: "https://quran.com/4/19" },
      { kind: "Hadith", reference: "Sahih Muslim 2328a", summary: "Aisha reported that the Prophet never struck a woman or servant.", href: "https://sunnah.com/muslim:2328a" },
      { kind: "Hadith", reference: "Sahih Muslim 1218a", summary: "The Farewell Sermon commands men to fear God concerning women and provide for them fairly.", href: "https://sunnah.com/muslim:1218a" },
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "homosexuality",
    title: "Islam prohibits homosexuality.",
    claim: "Critics argue that Islam's sexual ethics are unjust because classical Islamic teaching prohibits same-sex sexual acts.",
    response: [
      "Islamic teaching distinguishes a person's inherent dignity from every desire or action. The Quran places sexual intimacy within marriage between a man and a woman, and the classical Muslim understanding of the passages about the people of Lot prohibits same-sex sexual acts. That is a moral teaching shared by the major classical schools, not a licence to demean people.",
      "Muslims believe sexual ethics are part of a wider framework of chastity, fidelity, family responsibility, and accountability before God. A Muslim may explain and hold that conviction while still treating every person with justice, privacy, compassion, and protection from abuse. Harassment, violence, coercion, and vigilante punishment are not Islamic answers to moral disagreement.",
      "People can disagree deeply about this teaching. The Muslim response is that divine moral limits are not hatred; they are part of a consistent ethic that asks every person, whatever their circumstances, to seek God's guidance and mercy.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 7:80-81", summary: "It recounts Lot's condemnation of men approaching men with desire instead of women.", href: "https://quran.com/7/80-81" },
      { kind: "Quran", reference: "Quran 30:21", summary: "It presents marriage as a source of comfort, affection, and mercy.", href: "https://quran.com/30/21" },
      { kind: "Quran", reference: "Quran 49:13 and 5:8", summary: "It grounds human dignity and commands justice even toward those one dislikes.", href: "https://quran.com/49/13" },
    ],
  },
  {
    id: "jews-and-christians",
    title: "Islam teaches that Jews and Christians are enemies.",
    claim: "Critics point to Quranic passages about conflict and loyalty and argue that Islam teaches permanent hostility toward Jews and Christians.",
    response: [
      "No. The Quran does not make a person's Jewish or Christian identity a reason for hatred. It instructs Muslims to speak with the People of the Book in the best manner, to be just even toward opponents, and to be kind and fair to people who do not fight them because of religion.",
      "Some verses concern particular hostile groups, broken treaties, or political alliances during conflict. They cannot be detached from that setting and used to cancel the Quran's repeated commands of justice, covenant keeping, dialogue, and peaceful coexistence. The Prophet's dealings with Jewish and Christian individuals and communities must also be read in their varied historical contexts, not reduced to one rule of enmity.",
      "Islam permits principled disagreement about theology while forbidding collective hatred and injustice. A Muslim's standard is to deal fairly with peaceful neighbours and to oppose wrongdoing whoever commits it.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 29:46", summary: "It commands Muslims to discuss with the People of the Book in the best manner, except with wrongdoers.", href: "https://quran.com/29/46" },
      { kind: "Quran", reference: "Quran 5:8 and 60:8", summary: "It commands justice and kindness toward those who do not fight Muslims for their religion.", href: "https://quran.com/5/8" },
      { kind: "Quran", reference: "Quran 9:6", summary: "It requires protection and safe passage for a polytheist who seeks asylum.", href: "https://quran.com/9/6" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3166", summary: "It gives a severe warning against killing a person protected by treaty.", href: "https://sunnah.com/bukhari:3166" },
    ],
    links: [{ href: "/articles/rights-of-non-muslims", label: "Rights of non-Muslims" }],
  },
  {
    id: "sharia-and-democracy",
    title: "Sharia is incompatible with justice and democracy.",
    claim: "Critics argue that Sharia necessarily produces authoritarian rule and cannot coexist with democracy, human rights, or accountable government.",
    response: [
      "Sharia is broader than a state criminal code. It includes worship, family, contracts, ethics, and the public duties of justice and mercy. The Quran commands rulers to return trusts, judge fairly, consult their community, and refer disputes to principled law rather than personal power.",
      "Islam does not prescribe one modern constitutional blueprint. Elections, representative institutions, courts, limits on executive power, and public accountability can serve the Quranic aims of consultation and justice. Muslim thinkers disagree about institutional design and about how divine law relates to legislation by a majority.",
      "There are real points of tension between some classical rulings and some liberal-democratic assumptions, and Muslim governments have often failed their own standards. That does not make tyranny Islamic. A credible Islamic public order must protect life, property, due process, conscience, and justice for all people under its authority.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:58", summary: "It commands trusts to be returned and judgments between people to be made with justice.", href: "https://quran.com/4/58" },
      { kind: "Quran", reference: "Quran 42:38", summary: "It praises believers whose affairs are conducted through mutual consultation.", href: "https://quran.com/42/38" },
      { kind: "Quran", reference: "Quran 5:8", summary: "It commands justice even toward those Muslims dislike.", href: "https://quran.com/5/8" },
    ],
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
