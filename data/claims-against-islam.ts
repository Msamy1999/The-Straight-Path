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
      "The best-known Sahih al-Bukhari reports give Aisha a young age at consummation. Claims that she was older remain disputed. The report comes from a society with different ideas about maturity and marriage. Al-Tirmidhi attributes to Aisha the statement that a girl of nine was regarded as a woman in that setting. Early reports also say she had been promised to Jubayr ibn Mut'im. These details describe that period; they are not modern medical tests. The Prophet's enemies are not known to have used this marriage as a scandal. That silence gives context, not proof.",
      "Welfare still matters. The Prophet taught that women must be consulted and give permission for marriage. Classical jurists differed over a guardian's powers concerning minors and virgin wards; that history must not be confused with modern adult-consent rules. Islam protects women’s property and forbids harm. These reports cannot justify endangering children today; capacity, welfare, law, and circumstances matter.",
      "Aisha was not presented as a silent victim. She questioned the Prophet until she understood difficult teachings. Abu Musa said the Companions sought her knowledge when a hadith was unclear. She became a teacher, jurist, hadith critic, and public authority. Her confident voice and major contributions challenge the claim that Muslim sources erased her voice or treated her as an object.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:4 and 4:7", summary: "Women receive their own mahr and inheritance shares.", href: "https://quran.com/4/4-7" },
      { kind: "Quran", reference: "Quran 4:6", summary: "It links maturity with sound judgment in the care of an orphan's property.", href: "https://quran.com/4/6" },
      { kind: "Quran", reference: "Quran 4:19", summary: "It forbids inheriting women against their will and commands honorable treatment.", href: "https://quran.com/4/19" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 5136", summary: "A woman is not married without consultation or permission.", href: "https://sunnah.com/bukhari:5136" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 5134", summary: "It is one of the reports giving Aisha's age at marriage and consummation.", href: "https://sunnah.com/bukhari:5134" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 103", summary: "Aisha questioned a difficult statement until she understood how it agreed with the Quran.", href: "https://sunnah.com/bukhari:103" },
      { kind: "Hadith", reference: "Jami at-Tirmidhi 3883", summary: "Abu Musa says the Companions found knowledge with Aisha when a hadith was unclear; al-Tirmidhi grades the report hasan sahih.", href: "https://sunnah.com/tirmidhi:3883" },
    ],
    links: [
      { href: "https://sunnah.com/tirmidhi:1109", label: "Al-Tirmidhi's contextual report on maturity" },
      { href: "https://www.dar-alifta.org/en/article/details/144/why-did-prophet-muhammad-marry-lady-aisha-when-she-was-only-9-years-old", label: "Historical context and the earlier betrothal report" },
    ],
  },
  {
    id: "spread-by-the-sword",
    title: "Islam spread only by the sword.",
    claim: "Because early Muslim states expanded through war, critics argue that Islam gained adherents only through forced conversion.",
    response: [
      "The Quran rejects forced faith: there is no compulsion in religion (2:256). It also says that a polytheist who asks for protection must receive safety and safe passage (9:6). Political expansion and personal conversion are not the same thing. Islam also spread through teaching, trade, families, and local communities.",
      "Early Muslim rule did not erase every local culture or require every community to convert. In many regions, non-Muslims kept their worship, laws, languages, and communal institutions. Rulers varied, and some acted unjustly. Still, this history does not support the claim that forced conversion was Islam's only means of growth.",
      "War was restricted as well. Quran 2:190 connects fighting with those who fight Muslims and forbids transgression. Jurists differed over the wider grounds for state warfare; that disagreement did not make forced faith or the deliberate killing of protected noncombatants lawful. The Prophet forbade killing women and children. Rulers' violations do not become Islam's command.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It states that there is no compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Quran", reference: "Quran 9:6", summary: "It requires protection and safe passage for a polytheist who seeks asylum.", href: "https://quran.com/9/6" },
      { kind: "Quran", reference: "Quran 2:190", summary: "It connects fighting with those who fight Muslims and forbids transgression.", href: "https://quran.com/2/190" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }, { href: "/articles/civilian-protection-in-war", label: "Civilian protection" }],
  },
  {
    id: "women",
    title: "Islam mistreats women.",
    claim: "Critics point to unequal inheritance shares in some cases, polygamy, dress rules, divorce rules, and the conduct of Muslim societies.",
    response: [
      "Islam holds men and women equally accountable before God. Both have rights and duties. Some family responsibilities differ, but difference does not mean greater human worth. It never authorizes humiliation, coercion, or abuse.",
      "Islamic family and civil duties are meant to protect the vulnerable and preserve women's dignity. The Prophet made good treatment of wives a sign of character. In his Final Sermon, he told men to fear God concerning women and to provide for them fairly.",
      "Muslim societies and later legal opinions must be tested against these standards. When Muslims abuse women, they violate Islam's justice; they do not represent it. The Islamic ideal is a family and civil order in which each person is protected and responsible before God.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 33:35", summary: "It gives men and women the same promise of forgiveness and reward for faith and good deeds.", href: "https://quran.com/33/35" },
      { kind: "Quran", reference: "Quran 9:71", summary: "It describes believing men and women as mutual supporters.", href: "https://quran.com/9/71" },
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
      "Quran 4:3 did not create unrestricted polygyny. It restricted an existing practice to four wives and required justice. If a man fears that he cannot be fair, the verse directs him to marry one. Quran 4:129 warns against neglecting one wife through favoritism. This is a limited permission, not a command or a license for desire.",
      "The Prophet was monogamous throughout his long marriage to Khadijah. His later marriages had identifiable social and family purposes. They included caring for widows, supporting vulnerable households, and joining families and communities. They should not be reduced to a model of indulgence.",
      "A husband remains responsible for fairness, maintenance, and dignity. If he cannot meet those duties, the Quran's practical direction is one wife. The rule is therefore a restriction with serious conditions, not proof that women have no worth.",
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
      "The Quran repeatedly tells Muhammad to say that he asks no payment for God's message. Aisha described months when his household lived on dates and water. Umar wept when he saw the marks of a simple mat on the Prophet's side. These reports are difficult to reconcile with a mission built for luxury.",
      "Muhammad later held political and military authority in Medina. Yet he continued to teach restraint, worship, accountability before God, and care for the weak. He did not turn prophethood into personal wealth. For Muslims, his hardship, message, and lack of enrichment form a cumulative case for sincere prophethood, not a search for fame.",
      "Power alone does not prove a prophet. The question is how power was used and what the leader gained. Muhammad's life combines authority with service, sacrifice, and a persistent call to worship God rather than himself.",
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
      "The Quran rejects both accusations. It denies that a human teacher supplied it. It says devils did not bring it down. It calls Satan a clear enemy. Its message is worship God alone, moral duty, mercy, and resistance to evil. Muslims see that as the opposite of a satanic call.",
      "Shared prophets do not prove copying. The Quran retells their stories in a distinct voice and builds one theology of Tawhid. It calls Muhammad al-nabi al-ummi, often translated as the unlettered prophet. A human-source theory must still explain the Quran's form, message, public recitation, and growth over twenty-three years.",
      "Muslims also point to specific announcements. Quran 30:2-4 says the defeated Byzantines would recover within a few years. Quran 48:27 announces safe entry into the Sacred Mosque after Muslims had been turned away. These claims deserve historical study. Alongside the Quran's challenge and Muhammad's life, they form part of the Muslim case.",
      "The first revelation report shows Muhammad frightened and seeking reassurance, not presenting a prepared book. No single point forces belief. But the satanic and copying theories explain the evidence less well than the Quran's own claim: revelation calling people from Satan to worship God alone.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 16:103", summary: "It rejects the claim that a human being taught Muhammad the Quran.", href: "https://quran.com/16/103" },
      { kind: "Quran", reference: "Quran 26:210-212", summary: "It denies that devils brought the revelation down.", href: "https://quran.com/26/210-212" },
      { kind: "Quran", reference: "Quran 35:6", summary: "It calls Satan an enemy and commands believers to treat him as an enemy.", href: "https://quran.com/35/6" },
      { kind: "Quran", reference: "Quran 17:88", summary: "It challenges mankind and jinn to produce the like of the Quran.", href: "https://quran.com/17/88" },
      { kind: "Quran", reference: "Quran 7:157-158", summary: "It describes Muhammad as the unlettered prophet and calls people to follow him.", href: "https://quran.com/7/157-158" },
      { kind: "Quran", reference: "Quran 30:2-4", summary: "It announces a Byzantine recovery within a few years after defeat.", href: "https://quran.com/30/2-4" },
      { kind: "Quran", reference: "Quran 48:27", summary: "It announces safe entry into the Sacred Mosque.", href: "https://quran.com/48/27" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3", summary: "Aisha's report describes the beginning of revelation at Hira.", href: "https://sunnah.com/bukhari:3" },
    ],
    links: [{ href: "/articles/why-the-quran", label: "Why the Quran?" }],
  },
  {
    id: "terrorism",
    title: "Islam breeds terrorism.",
    claim: "Because some violent groups use Islamic language and cite the Quran, critics argue that terrorism follows naturally from Islam.",
    response: [
      "Terrorism violates Islam's stated limits. The Quran permits fighting against those who fight Muslims and forbids transgression. It commands acceptance of a genuine peace offer. It condemns unjust killing. Quran 5:32 says that killing one innocent soul is like killing all humanity.",
      "The Prophet expressly forbade killing women and children in war. Islamic law also protects people who are not fighting. Deliberate attacks on civilians and the spread of terror are therefore not jihad, even when violent groups use Islamic language. Their actions must be judged by the Quran and Prophetic limits; they cannot redefine those limits.",
      "Muslims should condemn terrorism clearly and consistently. The crimes of groups that claim Islam are evidence against those groups, not proof that Islam commands their crimes.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It connects fighting with those who fight Muslims and forbids transgression.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 8:61", summary: "It commands Muslims to incline to peace when their opponents do.", href: "https://quran.com/8/61" },
      { kind: "Quran", reference: "Quran 5:32", summary: "It recounts a decree for the Children of Israel comparing unjust killing with killing all humanity.", href: "https://quran.com/5/32" },
      { kind: "Quran", reference: "Quran 17:33", summary: "It forbids taking life without right and forbids excess in responding to unjust killing.", href: "https://quran.com/17/33" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/terrorism-and-extremism-islamic-perspective", label: "Terrorism and extremism" }, { href: "/articles/self-defense-in-scripture", label: "Self-defense in scripture" }],
  },
  {
    id: "quran-changed",
    title: "The Quran was altered.",
    claim: "Critics assert that the caliph Uthman created a new Quran by standardizing copies and ordering other materials destroyed.",
    response: [
      "The central report does not say Uthman invented a Quran. The first collected manuscripts were held by Abu Bakr, then Umar, and then Hafsa. Hafsa was Umar's daughter, the Prophet's widow, and a Mother of the Believers. She was a trusted custodian. Uthman borrowed these established manuscripts, appointed qualified scribes, made standard copies, and returned the originals to Hafsa.",
      "The aim was to prevent public division over recitation as Muslims met people from different regions. The report says other fragmentary materials and whole codices were removed; it does not say every difference was merely a private note or spelling mark. The Quran was already memorized and written. Muslims understand standardization as one means by which God preserved the Reminder.",
      "The evidence supports an early shared Uthmanic written tradition, including limited regional consonantal differences and transmitted readings. Those details should be examined openly. They do not establish the accusation that Uthman invented new revelation. The central report gives the copying process, the collection's chain of custody, and the reason for the decision.",
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
      "Recognized qiraat are not rival books. They are accepted ways of reading the same Quran. Most differences concern sound, vowels, grammar, or a small number of words. They were taught in public, not found as hidden competing Qurans.",
      "Qiraat and ahruf are related but not identical. Hadith describe ahruf as early forms of reading allowed by God, though scholars differ on their scope. Qiraat are recorded readings that fit the written Quran. Scholars later set out the common group of ten from a wider body of reports; they did not invent those readings.",
      "The Quran was preserved through shared written copies and trained reciters. Its limited reading range does not amount to different lost or invented Qurans.",
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
      "The Quran says there is no compulsion in religion. It describes people who believe, disbelieve, and believe again while leaving their final judgment to God. Faith cannot be created by a threat. No private person may punish someone for doubt or a change of belief.",
      "The classical law must still be stated honestly. The major Sunni schools usually gave a state penalty for deliberate apostasy, based on hadith and early practice. They did not all require the person to have taken up arms. They differed over repentance, procedure, sex, and other conditions. These rulings came from states where religious loyalty and political membership were closely linked.",
      "Modern scholars disagree. Some keep the classical rule for a lawful Islamic court. Others say the Prophetic cases concerned rebellion, war, or political betrayal, not private belief. This disagreement never permits vigilantism. Any court would need lawful authority, proof, due process, and the wider legal system in which the rule was developed. It cannot be enforced by threats, mobs, or private individuals.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:256", summary: "It rejects compulsion in religion.", href: "https://quran.com/2/256" },
      { kind: "Quran", reference: "Quran 4:137", summary: "It describes repeated changes of belief; this passage does not state a fixed worldly penalty.", href: "https://quran.com/4/137" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 6922", summary: "A key hadith in classical apostasy rulings that requires legal and historical interpretation.", href: "https://sunnah.com/bukhari:6922" },
    ],
    links: [{ href: "/articles/punishment-for-apostasy-and-war", label: "Apostasy and war in Islamic law" }],
  },
  {
    id: "slavery",
    title: "Islam permits slavery, so it cannot be just.",
    claim: "Critics note that the Quran and classical Islamic law regulated slavery rather than abolishing it immediately.",
    response: [
      "Slavery before modern times was not the same as the racial chattel trade in the Americas. It was still coercive. Islam entered a society that already used slavery. It set rights, banned abuse, and opened paths to freedom. It did not make slavery an ideal.",
      "The Quran counts freeing a person among the hard acts of faith (90:11-13). It commands good treatment, supports freedom contracts, and forbids forcing enslaved women into prostitution. The Prophet required food, clothing, fair work, and help with heavy burdens.",
      "‘Those your right hands possess’ refers to people held in that old system. Major classical frameworks generally allowed an owner sex with an unmarried female slave without a marriage contract, although details varied. They required support and developed rules for an umm walad, the mother of her owner's child. Malik's Muwatta reports Umar's ruling that she must not be sold and becomes free when her owner dies. Classical law did not use modern consent standards. That difficulty must be acknowledged.",
      "Muslims reject slavery and concubinage today. Those legal routes no longer exist. The Quran repeatedly rewards freeing people and directs resources toward freedom. Its commands of justice and dignity cannot reopen an abolished system of ownership.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 90:11-13", summary: "It places freeing a person in the context of the difficult moral ascent.", href: "https://quran.com/90/11-13" },
      { kind: "Quran", reference: "Quran 4:36", summary: "It commands good treatment of those held under a person's authority.", href: "https://quran.com/4/36" },
      { kind: "Quran", reference: "Quran 24:33", summary: "It supports freedom contracts and forbids coercing enslaved women into prostitution.", href: "https://quran.com/24/33" },
      { kind: "Quran", reference: "Quran 4:92", summary: "It prescribes freeing an enslaved believer as part of expiation for accidental killing.", href: "https://quran.com/4/92" },
      { kind: "Quran", reference: "Quran 5:89", summary: "It lists freeing an enslaved person among the options for expiating a broken oath.", href: "https://quran.com/5/89" },
      { kind: "Quran", reference: "Quran 58:3", summary: "It requires freeing an enslaved person before resuming marital relations in the specified case.", href: "https://quran.com/58/3" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 2545", summary: "It requires food, clothing, manageable work, and help with burdensome work.", href: "https://sunnah.com/bukhari:2545" },
    ],
    links: [
      { href: "https://sunnah.com/urn/415310", label: "Malik's Muwatta: Umar's ruling on an umm walad" },
      { href: "https://www.cambridge.org/core/journals/international-journal-of-middle-east-studies/article/concubinage-and-consent/F8E807073C33F403A91C1ACA0CFA47FD", label: "Historical study of concubinage and consent" },
    ],
  },
  {
    id: "jihad",
    title: "Jihad simply means holy war against non-Muslims.",
    claim: "Critics apply the word \"jihad\" as if it refers to unrestricted religious violence.",
    response: [
      "Jihad means striving in God's path. It is broader than war. It includes moral, intellectual, and spiritual effort. The Quran praises people who restrain the self from wrongful desire. This is a foundation for struggling against the nafs, or lower self.",
      "Armed jihad exists, but it has rules. Quran 2:190 forbids transgression, 22:39 permits defense after wrongdoing, and 8:61 commands acceptance of peace. Many modern scholars stress defense; classical jurists also discussed state warfare beyond direct self-defense. That disagreement does not authorize the deliberate killing of protected noncombatants. The Prophet prohibited killing women and children. Jihad is not forced conversion, private warfare, or attacks on civilians.",
      "The popular phrase 'the greater jihad' is not established by a sound hadith. The inner struggle is still a genuine Quranic and ethical teaching. It should be explained from the Quran and sound principles, without relying on a weak report.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 2:190", summary: "It connects fighting with those who fight Muslims and forbids transgression.", href: "https://quran.com/2/190" },
      { kind: "Quran", reference: "Quran 22:39", summary: "It permits fighting for those being fought because they have been wronged.", href: "https://quran.com/22/39" },
      { kind: "Quran", reference: "Quran 8:61", summary: "It commands Muslims to incline to peace when their opponents do.", href: "https://quran.com/8/61" },
      { kind: "Quran", reference: "Quran 79:40-41", summary: "It promises Paradise to the person who fears God and restrains the self from wrongful desire.", href: "https://quran.com/79/40-41" },
      { kind: "Quran", reference: "Quran 91:9-10", summary: "It connects success with purifying the self and failure with corrupting it.", href: "https://quran.com/91/9-10" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3015", summary: "The Prophet forbade killing women and children in war.", href: "https://sunnah.com/bukhari:3015" },
    ],
    links: [{ href: "/articles/jihad-and-just-war-theory", label: "Jihad and just-war theory" }],
  },
  {
    id: "non-muslims",
    title: "Islam teaches hatred or permanent second-class status for non-Muslims.",
    claim: "Critics point to verses about conflict and to the historical dhimma system.",
    response: [
      "Islam does not teach hate of non-Muslims. The Quran commands justice to opponents, kindness to peaceful people of other faiths, and safe passage for anyone asking protection. The Prophet warned against killing a treaty-protected person.",
      "Dhimma was a premodern system protecting recognized non-Muslim communities under Muslim rule. It secured life, property, worship, and local affairs alongside political allegiance and legal duties. Eligible adult non-Muslim men paid jizya, commonly associated with protection and exemption from military service. Rates, exemptions, and enforcement varied. It should not be reduced to one modern tax or insurance contract.",
      "Dhimma was not modern equal citizenship, and rulers sometimes failed its ideals. It was not a license for forced conversion or contempt. Islamic standards remain justice, promises, and safety for peaceful non-Muslims. History should be judged by these standards.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 5:8", summary: "It commands justice even toward people one dislikes.", href: "https://quran.com/5/8" },
      { kind: "Quran", reference: "Quran 60:8", summary: "It permits kindness and fairness toward those who do not fight Muslims for their religion or expel them.", href: "https://quran.com/60/8" },
      { kind: "Quran", reference: "Quran 9:6", summary: "It requires protection and safe passage for a polytheist who seeks asylum.", href: "https://quran.com/9/6" },
      { kind: "Quran", reference: "Quran 9:29", summary: "It is the central Quranic verse cited in discussions of jizya and the historical dhimma framework.", href: "https://quran.com/9/29" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 3166", summary: "It gives a severe warning against killing a person protected by treaty.", href: "https://sunnah.com/bukhari:3166" },
    ],
    links: [
      { href: "/articles/rights-of-non-muslims", label: "Rights of non-Muslims" },
      { href: "https://www.dar-alifta.org/en/fatwa/details/5985/were-christians-forced-to-pay-the-jizyah-to-spare-their-lives", label: "Dar al-Ifta's explanation of jizya and protection" },
    ],
  },
  {
    id: "wife-beating",
    title: "Islam permits “domestic abuse.”",
    claim: "Critics point to Quran 4:34 and argue that Islam permits or excuses domestic abuse.",
    response: [
      "Quran 4:34 addresses serious marital conflict. It gives an order: advise, separate in bed, then a disputed word often translated as ‘strike.’ It then forbids husbands from acting against wives after peace returns. It does not permit rage, injury, humiliation, or control.",
      "The predominant classical interpretation allowed a restricted, non-injurious physical response and forbade striking the face. Some modern interpreters propose separation instead. These are different interpretations, not equally common classical readings. The Prophet's own example remains central: Aisha said he never struck a woman or servant. The Quran commands kind treatment; injury, intimidation, and cruelty are not justified.",
      "Domestic violence is forbidden. Harm and threats violate marriage's purpose of mercy. Abuse must be stopped through safety, lawful help, and accountability. This verse is not a license to terrorize a wife.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 4:34", summary: "It addresses a grave marital conflict in a staged sequence and forbids further aggression after reconciliation.", href: "https://quran.com/4/34" },
      { kind: "Quran", reference: "Quran 4:19", summary: "It forbids inheriting women against their will and commands kind treatment.", href: "https://quran.com/4/19" },
      { kind: "Quran", reference: "Quran 30:21", summary: "It describes marriage through comfort, affection, and mercy.", href: "https://quran.com/30/21" },
      { kind: "Hadith", reference: "Sahih Muslim 2328a", summary: "Aisha reported that the Prophet never struck a woman or servant.", href: "https://sunnah.com/muslim:2328a" },
      { kind: "Hadith", reference: "Sahih Muslim 1218a", summary: "The Farewell Sermon commands men to fear God concerning women and provide for them fairly.", href: "https://sunnah.com/muslim:1218a" },
    ],
    links: [{ href: "/articles/marriage-and-divorce", label: "Marriage and divorce" }],
  },
  {
    id: "homosexuality",
    title: "Islam promotes hatred against the LGBTQ+ community.",
    claim: "Critics argue that Islam's sexual ethics are unjust because classical Islamic teaching prohibits same-sex sexual acts.",
    response: [
      "LGBTQ+ includes different questions. Quran passages about Lot and old Islamic law address sex between people of the same sex. Gender identity is separate.",
      "Islam protects human dignity and does not blame someone for a feeling they did not choose. The Prophet taught that thoughts are overlooked unless acted on or spoken. Old schools forbid same-sex acts and place sex within marriage between a man and a woman. The same rule asks straight Muslims to be chaste.",
      "Moral disagreement never permits hate. Every person deserves justice, privacy, care, and safety. Harassment, shame, violence, and mob punishment are wrong. Muslims can state Islamic sexual ethics while offering friendship and inviting people to God's mercy.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 7:80-81", summary: "It recounts Lot's condemnation of men approaching men with desire instead of women.", href: "https://quran.com/7/80-81" },
      { kind: "Quran", reference: "Quran 30:21", summary: "It presents marriage as a source of comfort, affection, and mercy.", href: "https://quran.com/30/21" },
      { kind: "Quran", reference: "Quran 49:13", summary: "It describes humanity's shared origin and makes righteousness the measure of honor before God.", href: "https://quran.com/49/13" },
      { kind: "Quran", reference: "Quran 5:8", summary: "It commands justice even toward people one dislikes.", href: "https://quran.com/5/8" },
      { kind: "Hadith", reference: "Sahih al-Bukhari 5269", summary: "The Prophet taught that inner thoughts are overlooked unless they are acted upon or spoken.", href: "https://sunnah.com/bukhari:5269" },
    ],
  },
  {
    id: "jews-and-christians",
    title: "Islam teaches that Jews and Christians are enemies.",
    claim: "Critics point to Quranic passages about conflict and loyalty and argue that Islam teaches permanent hostility toward Jews and Christians.",
    response: [
      "No. The Quran does not make Jewish or Christian identity a reason for hatred. It tells Muslims to speak with the People of the Book in the best manner. It commands justice even toward opponents. It requires kindness and fairness toward people who do not fight Muslims because of religion.",
      "Some verses concern hostile groups, broken treaties, or political alliances during war. They cannot be detached from those settings and used to cancel the Quran's commands of justice, covenant-keeping, dialogue, and peaceful coexistence. The Prophet's dealings with Jewish and Christian people also varied by circumstance and must not be reduced to one rule of enmity.",
      "Islam permits principled disagreement about theology. It forbids collective hatred and injustice. A Muslim deals fairly with peaceful neighbors and opposes wrongdoing whoever commits it. The faith's call to worship one God is an invitation, not a command to hate an entire people.",
    ],
    evidence: [
      { kind: "Quran", reference: "Quran 29:46", summary: "It commands Muslims to discuss with the People of the Book in the best manner, except with wrongdoers.", href: "https://quran.com/29/46" },
      { kind: "Quran", reference: "Quran 5:8", summary: "It commands justice even toward people one dislikes.", href: "https://quran.com/5/8" },
      { kind: "Quran", reference: "Quran 60:8", summary: "It permits kindness and fairness toward those who do not fight Muslims for their religion or expel them.", href: "https://quran.com/60/8" },
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
      "Sharia is more than criminal law. It covers worship, family, contracts, morals, and public justice. The Quran tells rulers to keep trusts, judge fairly, consult people, and reject personal power.",
      "Islam gives no single modern constitution. A vote, elected council, fair courts, limits on leaders, and public checks can serve consultation and justice. Muslims disagree about institutions and how divine law relates to laws made by a majority.",
      "Some old rulings conflict with modern liberal ideas. Muslim governments also fail Islamic standards. That does not make tyranny Islamic. An Islamic order must protect life, property, due process, conscience, and justice for all. Judge it by these duties, not its label.",
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
