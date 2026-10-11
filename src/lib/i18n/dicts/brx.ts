/**
 * बड़ो — deliberately minimal interface translation (Devanagari script).
 *
 * Read this before extending it. Bodo is written here only where the wording
 * can be stated confidently: religious vocabulary that Bodo borrows intact
 * (दुर्गा, पूजा, मन्त्र, आरति, कथा, स्रोत are used in Bodo as they are), plus
 * everyday words in a register I can vouch for. Everything else falls back to
 * English and is *counted as a fallback* in Settings.
 *
 * A short honest list is worth more than a long invented one — the alternative
 * would be a machine-guessed page that reads as fluent Bodo to nobody who
 * actually speaks it.
 */
import type { Dict } from "./en";

export const brx: Dict = {
  "app.name": "नवरात्रि",
  "app.subtitle": "दिव्य शक्ति",
  "app.enter": "हाबा",
  "app.jaiMataDi": "जय माता दी",
  "app.skipIntro": "सिगांनि बिथा खालाम",

  "nav.home": "मुंगा बिलाइ",
  "nav.navadurga": "नवदुर्गा",
  "nav.navratri": "नवरात्रि",
  "nav.puja": "पूजा",
  "nav.mantras": "मन्त्र आरति",
  "nav.stories": "कथा ज्ञान",
  "nav.search": "नागिर",
  "nav.language": "राव",
  "nav.settings": "सेटिंग",
  "nav.about": "परिचय",
  "nav.saved": "थिना खालामनाय",
  "nav.more": "गोबां",

  "action.read": "पारि",
  "action.listen": "खोनासं",
  "action.pause": "थाब",
  "action.stop": "बन्द",
  "action.save": "थिना खालाम",
  "action.saved": "थिना खालामनाय",
  "action.close": "बन्द खालाम",
  "action.search": "नागिर",
  "action.back": "उनथिं",
  "action.delete": "दिहुन",

  "home.today": "दिनै",
  "home.todaysForm": "दिनैनि रूप",
  "home.mantraOfDay": "दिनैनि मन्त्र",
  "home.langHint": "24 रावआव",

  "nd.day": "सान",
  "nd.meaning": "मुंदां",
  "nd.story": "कथा",
  "nd.mantra": "मन्त्र",

  "audio.title": "खोनासंनाय",
  "lib.filterLanguage": "राव",
  "lib.rights": "अधिकार",

  "j.saved": "थिना खालामनाय",
  "set.language": "राव",
  "set.audio": "खोनासंनाय",
  "set.textSize": "हांखोनि महर",

  "status.translationTitle": "सोलायनायनि स्थिति",
  "status.available": "मोनथाय",
  "status.unavailable": "बे रावआव मोननाय नङा",

  "common.read": "पारि",
  "common.listen": "खोनासं",
  "common.source": "स्रोत",
  "common.loading": "लोड जादों…",
  "common.close": "बन्द खालाम",
  "common.all": "गासैबो",
  "common.no": "नङा",

  "err.title": "मोनसे गोरोन्थि जादों",
};
