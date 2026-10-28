// UI book names only, not scripture translations. Arabic names follow the
// Van Dyck catalogue: https://libraries.dbs.org/ARB/Bible/StudyBible/content/texts/ara_svd/index.html
const bookNames: Record<string, string> = {
  Genesis: "التكوين", Exodus: "الخروج", Leviticus: "اللاويين", Numbers: "العدد", Deuteronomy: "التثنية",
  Joshua: "يشوع", Judges: "القضاة", Ruth: "راعوث", "1 Samuel": "صموئيل الأول", "2 Samuel": "صموئيل الثاني",
  "1 Kings": "الملوك الأول", "2 Kings": "الملوك الثاني", "1 Chronicles": "أخبار الأيام الأول", "2 Chronicles": "أخبار الأيام الثاني",
  Ezra: "عزرا", Nehemiah: "نحميا", Esther: "أستير", Job: "أيوب", Psalms: "المزامير", Psalm: "المزامير",
  Proverbs: "الأمثال", Ecclesiastes: "الجامعة", "Song of Solomon": "نشيد الأنشاد", "Song of Songs": "نشيد الأنشاد",
  Isaiah: "إشعياء", Jeremiah: "إرميا", Lamentations: "مراثي إرميا", Ezekiel: "حزقيال", Daniel: "دانيال",
  Hosea: "هوشع", Joel: "يوئيل", Amos: "عاموس", Obadiah: "عوبديا", Jonah: "يونان", Micah: "ميخا", Nahum: "ناحوم",
  Habakkuk: "حبقوق", Zephaniah: "صفنيا", Haggai: "حجي", Zechariah: "زكريا", Malachi: "ملاخي",
  Matthew: "متى", Mark: "مرقس", Luke: "لوقا", John: "يوحنا", Acts: "أعمال الرسل", Romans: "رومية",
  "1 Corinthians": "كورنثوس الأولى", "2 Corinthians": "كورنثوس الثانية", Galatians: "غلاطية", Ephesians: "أفسس",
  Philippians: "فيلبي", Colossians: "كولوسي", "1 Thessalonians": "تسالونيكي الأولى", "2 Thessalonians": "تسالونيكي الثانية",
  "1 Timothy": "تيموثاوس الأولى", "2 Timothy": "تيموثاوس الثانية", Titus: "تيطس", Philemon: "فليمون", Hebrews: "العبرانيين",
  James: "يعقوب", "1 Peter": "بطرس الأولى", "2 Peter": "بطرس الثانية", "1 John": "يوحنا الأولى", "2 John": "يوحنا الثانية",
  "3 John": "يوحنا الثالثة", Jude: "يهوذا", Revelation: "رؤيا يوحنا", Sirach: "يشوع بن سيراخ",
  "Wisdom of Solomon": "حكمة سليمان", Tobit: "طوبيا", Judith: "يهوديت", "1 Maccabees": "المكابيين الأول", "2 Maccabees": "المكابيين الثاني",
};

export function arabicReferenceLabel(reference: string): string {
  const match = reference.trim().match(/^(.*?)(\d{1,3}:\d{1,3}(?:\s*[-–]\s*\d{1,3})?)$/);
  if (!match) return /[a-z]/i.test(reference) ? "مرجع المقطع" : reference;
  const name = match[1].trim();
  const label = /^qur['’]?an$/i.test(name) ? "القرآن" :
    Object.entries(bookNames).find(([english]) => english.toLowerCase() === name.toLowerCase())?.[1] ?? (name ? "مرجع كتابي" : "");
  const locator = match[2].replace(/\d/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
  return [label, locator].filter(Boolean).join(" ");
}
