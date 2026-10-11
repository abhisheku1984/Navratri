/**
 * Interface strings.
 *
 * Scope, deliberately narrow: this module translates the *chrome* — labels,
 * buttons, headings, system messages. It does not translate sacred text.
 * Scripture translations live in src/content/scripture/translations/<lang>-<id>
 * and are imported from identified, licensed editions with a named translator.
 * Machine translation is never applied to a verse.
 *
 * Consequence you should see in the UI: the interface is available in Hindi,
 * Telugu and Bengali today, while the verse-level translation on offer is
 * Pargiter's English. That asymmetry is stated on the language settings page
 * rather than hidden behind a flag that implies otherwise.
 */

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", scripture: "Pargiter (1904), imported" },
  { code: "hi", label: "Hindi", native: "हिन्दी", scripture: "Not yet imported" },
  { code: "te", label: "Telugu", native: "తెలుగు", scripture: "Not yet imported" },
  { code: "bn", label: "Bengali", native: "বাংলা", scripture: "Not yet imported" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्", scripture: "Original text + IAST" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  "app.name": "Navratri",
  "app.subtitle": "The Divine Shakti",
  "app.tagline": "Discover Maa Durga. Explore Sacred Scriptures. Experience the Power of Shakti.",
  "nav.home": "Home",
  "nav.durga": "Maa Durga",
  "nav.scripture": "Scripture",
  "nav.peethas": "Shakti Peethas",
  "nav.more": "More",
  "nav.search": "Search",
  "nav.saved": "Saved",
  "nav.settings": "Settings",
  "nav.about": "About",
  "nav.calendar": "Festival calendar",
  "nav.puja": "Puja guides",
  "nav.mantras": "Mantra library",
  "nav.stories": "Stories",
  "nav.temples": "Temple directory",
  "nav.plan": "Plan a pilgrimage",
  "nav.assistant": "Devi Gyan",
  "nav.learn": "Learn & quiz",
  "nav.sources": "Sources & verification",
  "nav.upload": "Upload a text",
  "nav.navadurga": "Navadurga",
  "home.welcome": "Jai Mata Di. Welcome to the World of Divine Shakti.",
  "home.today": "Today",
  "home.todaysDevi": "Today's form of Maa Durga",
  "home.mantraOfDay": "Mantra of the day",
  "home.continueReading": "Continue reading",
  "home.panchang": "Panchang",
  "home.navratriDay": "Navratri day",
  "home.notNavratri": "It is not Navratri today",
  "common.read": "Read",
  "common.listen": "Listen",
  "common.bookmark": "Save",
  "common.bookmarked": "Saved",
  "common.share": "Share",
  "common.back": "Back",
  "common.source": "Source",
  "common.verified": "Verified",
  "common.partial": "Partially verified",
  "common.awaiting": "Awaiting verification",
  "common.sample": "Sample content",
  "common.sanskrit": "Sanskrit",
  "common.translation": "Translation",
  "common.meaning": "Meaning",
  "common.close": "Close",
  "common.copy": "Copy",
  "common.search.placeholder": "Search verses, goddesses, temples, chapters…",
  "common.noResults": "Nothing matched that. Try a shorter phrase, or a name in Devanagari.",
  "common.loading": "Loading…",
  "common.error": "Something went wrong. The content is still on your device — try reloading.",
  "scripture.toc": "Chapter index",
  "scripture.verses": "verses",
  "scripture.angs": "Auxiliary recitations",
  "scripture.langNote": "Verse-level translation is Pargiter (1904). Machine translation is never applied to sacred text.",
  "peethas.disputed": "Traditional lists disagree here. The disagreement is recorded rather than resolved.",
  "peethas.noTimings": "Darshan timings are not published here because they have not been verified against a current official source.",
  "assistant.intro": "Ask about Maa Durga, a verse, a temple, or how traditions differ.",
  "assistant.caveat": "Answers are retrieved from this app's own content and cite it. Where sources disagree you will see both.",
  "settings.language": "Language",
  "settings.location": "Calendar location",
  "settings.appearance": "Appearance",
  "settings.reading": "Reading",
  "settings.privacy": "Your data stays on this device.",
  "trust.privacy": "Privacy",
  "trust.terms": "Terms",
  "trust.report": "Report an error",
};

const hi: Dict = {
  "app.name": "नवरात्रि",
  "app.subtitle": "दिव्य शक्ति",
  "app.tagline": "माँ दुर्गा को जानिए। पवित्र शास्त्रों का अन्वेषण कीजिए। शक्ति का अनुभव कीजिए।",
  "nav.home": "मुख्य",
  "nav.durga": "माँ दुर्गा",
  "nav.scripture": "शास्त्र",
  "nav.peethas": "शक्तिपीठ",
  "nav.more": "और",
  "nav.search": "खोज",
  "nav.saved": "सहेजा गया",
  "nav.settings": "सेटिंग्स",
  "nav.about": "परिचय",
  "nav.calendar": "उत्सव पंचांग",
  "nav.puja": "पूजा विधि",
  "nav.mantras": "मन्त्र संग्रह",
  "nav.stories": "कथाएँ",
  "nav.temples": "मन्दिर सूची",
  "nav.plan": "तीर्थ यात्रा योजना",
  "nav.assistant": "देवी ज्ञान",
  "nav.learn": "सीखें और परीक्षा",
  "nav.sources": "स्रोत और सत्यापन",
  "nav.upload": "पाठ अपलोड करें",
  "nav.navadurga": "नवदुर्गा",
  "home.welcome": "जय माता दी। दिव्य शक्ति की दुनिया में आपका स्वागत है।",
  "home.today": "आज",
  "home.todaysDevi": "आज की देवी",
  "home.mantraOfDay": "आज का मन्त्र",
  "home.continueReading": "पठन जारी रखें",
  "home.panchang": "पंचांग",
  "home.navratriDay": "नवरात्रि दिवस",
  "home.notNavratri": "आज नवरात्रि नहीं है",
  "common.read": "पढ़ें",
  "common.listen": "सुनें",
  "common.bookmark": "सहेजें",
  "common.bookmarked": "सहेजा गया",
  "common.share": "साझा करें",
  "common.back": "वापस",
  "common.source": "स्रोत",
  "common.verified": "सत्यापित",
  "common.partial": "आंशिक रूप से सत्यापित",
  "common.awaiting": "सत्यापन प्रतीक्षित",
  "common.sample": "नमूना सामग्री",
  "common.sanskrit": "संस्कृत",
  "common.translation": "अनुवाद",
  "common.meaning": "अर्थ",
  "common.close": "बंद करें",
  "common.copy": "प्रतिलिपि",
  "common.search.placeholder": "श्लोक, देवी, मन्दिर, अध्याय खोजें…",
  "common.noResults": "कुछ नहीं मिला। छोटा वाक्य या देवनागरी में नाम आज़माइए।",
  "common.loading": "लोड हो रहा है…",
  "common.error": "कुछ गड़बड़ हुई। सामग्री आपके उपकरण पर है — पुनः लोड कर देखें।",
  "scripture.toc": "अध्याय अनुक्रमणिका",
  "scripture.verses": "श्लोक",
  "scripture.angs": "अंग पाठ",
  "scripture.langNote": "श्लोक-स्तर अनुवाद पार्जिटर (1904) है। पवित्र पाठ पर यंत्री अनुवाद कभी प्रयोग नहीं किया जाता।",
  "peethas.disputed": "परम्पराओं में इस विषय पर मतभेद है। मतभेद को दर्ज किया गया है, मिटाया नहीं गया।",
  "peethas.noTimings": "दर्शन समय यहाँ प्रकाशित नहीं किया गया क्योंकि किसी वर्तमान आधिकारिक स्रोत से सत्यापित नहीं है।",
  "assistant.intro": "माँ दुर्गा, किसी श्लोक, मन्दिर, या परम्पराओं के अंतर के बारे में पूछें।",
  "assistant.caveat": "उत्तर इसी ऐप की सामग्री से लिए जाते हैं और स्रोत बताते हैं। मतभेद होने पर दोनों दिखाए जाते हैं।",
  "settings.language": "भाषा",
  "settings.location": "पंचांग स्थान",
  "settings.appearance": "रूप",
  "settings.reading": "पठन",
  "settings.privacy": "आपका डेटा इसी उपकरण पर रहता है।",
  "trust.privacy": "गोपनीयता",
  "trust.terms": "शर्तें",
  "trust.report": "त्रुटि बताएं",
};

const te: Dict = {
  "app.name": "నవరాత్రి",
  "app.subtitle": "దివ్య శక్తి",
  "app.tagline": "మా దుర్గను తెలుసుకోండి. పవిత్ర గ్రంథాలను అన్వేషించండి.",
  "nav.home": "హోమ్",
  "nav.durga": "మా దుర్గ",
  "nav.scripture": "గ్రంథం",
  "nav.peethas": "శక్తి పీఠాలు",
  "nav.more": "మరిన్ని",
  "nav.search": "వెతకండి",
  "nav.saved": "భద్రపరిచినవి",
  "nav.settings": "సెట్టింగ్‌లు",
  "nav.about": "గురించి",
  "home.welcome": "జై మాతా ది. దివ్య శక్తి ప్రపంచానికి స్వాగతం.",
  "common.read": "చదవండి",
  "common.bookmark": "భద్రపరచండి",
  "common.source": "మూలం",
  "common.search.placeholder": "శ్లోకాలు, దేవతలు, ఆలయాలు వెతకండి…",
};

const bn: Dict = {
  "app.name": "নবরাত্রি",
  "app.subtitle": "দিব্য শক্তি",
  "app.tagline": "মা দুর্গাকে জানুন। পবিত্র শাস্ত্র অন্বেষণ করুন।",
  "nav.home": "মূলপাতা",
  "nav.durga": "মা দুর্গা",
  "nav.scripture": "শাস্ত্র",
  "nav.peethas": "শক্তিপীঠ",
  "nav.more": "আরও",
  "nav.search": "খুঁজুন",
  "nav.saved": "সংরক্ষিত",
  "nav.settings": "সেটিংস",
  "nav.about": "পরিচয়",
  "home.welcome": "জয় মা দি। দিব্য শক্তির জগতে স্বাগতম।",
  "common.read": "পড়ুন",
  "common.bookmark": "সংরক্ষণ",
  "common.source": "সূত্র",
  "common.search.placeholder": "শ্লোক, দেবী, মন্দির খুঁজুন…",
};

const sa: Dict = {
  "app.name": "नवरात्रि",
  "app.subtitle": "दिव्यशक्तिः",
  "app.tagline": "मां दुर्गां जानीत। पवित्राणि शास्त्राणि अन्विष्यत।",
  "nav.home": "गृहम्",
  "nav.durga": "मा दुर्गा",
  "nav.scripture": "शास्त्रम्",
  "nav.peethas": "शक्तिपीठानि",
  "nav.more": "अन्यत्",
  "nav.search": "अन्वेषणम्",
  "home.welcome": "जय माता दी। दिव्यशक्तिलोके स्वागतम्।",
  "common.read": "पठतु",
  "common.source": "स्रोतः",
};

const DICTS: Record<LangCode, Dict> = { en, hi, te, bn, sa };

export function t(lang: LangCode, key: string): string {
  return DICTS[lang]?.[key] ?? en[key] ?? key;
}

/** True when a key has a real translation in this language (not a fallback). */
export function hasTranslation(lang: LangCode, key: string): boolean {
  return Boolean(DICTS[lang]?.[key]);
}

export function coverage(lang: LangCode): { translated: number; total: number; pct: number } {
  const total = Object.keys(en).length;
  const translated = Object.keys(en).filter((k) => DICTS[lang]?.[k]).length;
  return { translated, total, pct: Math.round((translated / total) * 100) };
}
