/**
 * মৈতৈলোন্ — deliberately minimal interface translation (Bengali script).
 *
 * Meitei is written here in the Bengali script, which is the script in ordinary
 * public use in Manipur and the one the reader will see on the page (Meitei
 * Mayek is offered by the font stack as well, and would need a separate
 * transliteration pass — recorded as remaining work rather than guessed).
 *
 * Only strings that can be stated with confidence are written. The rest fall
 * back to English and are counted as fallbacks, per the platform's rule that a
 * translation is never claimed unless it exists.
 */
import type { Dict } from "./en";

export const mni: Dict = {
  "app.name": "নবরাত্রি",
  "app.subtitle": "লাইনিং শক্তি",
  "app.enter": "উনসিল্লু",
  "app.jaiMataDi": "জয় মাতা দী",
  "app.skipIntro": "হৌজিক চৎলু",

  "nav.home": "মহুৎ চাং",
  "nav.navadurga": "নবদুর্গা",
  "nav.navratri": "নবরাত্রি",
  "nav.puja": "পূজা",
  "nav.mantras": "মন্ত্র অমসুং আরতি",
  "nav.stories": "ৱারী অমসুং হৈ",
  "nav.search": "থিবা",
  "nav.language": "লোল",
  "nav.settings": "সেটিং",
  "nav.about": "মরোল",
  "nav.saved": "থিংখৎলবা",
  "nav.more": "হেন্না",

  "action.read": "পাবা",
  "action.listen": "তাবা",
  "action.pause": "লেপ্পা",
  "action.stop": "লোয়ন",
  "action.save": "থিংখৎলু",
  "action.saved": "থিংখৎলে",
  "action.close": "লোয়ন",
  "action.search": "থিবা",
  "action.back": "হন্না",
  "action.delete": "মুৎথতলু",

  "home.today": "ঙসি",
  "home.todaysForm": "ঙসিগী মমল",
  "home.mantraOfDay": "ঙসিগী মন্ত্র",
  "home.langHint": "লোল ২৪",

  "nd.day": "নুমিৎ",
  "nd.story": "ৱারী",
  "nd.mantra": "মন্ত্র",

  "audio.title": "তাবা",
  "lib.filterLanguage": "লোল",

  "j.saved": "থিংখৎলবা",
  "set.language": "লোল",
  "set.audio": "খোংচৎ",
  "set.textSize": "ময়েক্কী অখন্নবা",

  "status.translationTitle": "হন্দোকলোনবগী পোৎলম",
  "status.available": "ফংই",
  "status.unavailable": "অসি লোলদা লৈতে",

  "common.read": "পাবা",
  "common.listen": "তাবা",
  "common.source": "মরোল",
  "common.loading": "লোদ তৌরি…",
  "common.close": "লোয়ন",
  "common.no": "নত্তে",

  "err.title": "মখা তানা খুদোংচাবা ফংলে",
};
