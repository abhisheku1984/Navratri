/**
 * ᱥᱟᱱᱛᱟᱲᱤ — deliberately minimal interface translation (Ol Chiki script).
 *
 * The smallest locale in the set, on purpose. Santali is written in Ol Chiki,
 * and whilst devotional loanwords (ᱫᱩᱨᱜᱟ, ᱯᱩᱡᱟ, ᱢᱚᱱᱛᱚᱨ) are stable, the
 * surrounding interface wording is not something this codebase can assert
 * without a Santali reviewer. What is here is limited to forms that can be
 * stated plainly; everything else shows English and is counted as a fallback.
 *
 * Extending this file is the single highest-value translation task left in the
 * project — see docs/TRANSLATION.md.
 */
import type { Dict } from "./en";

export const sat: Dict = {
  "app.name": "ᱱᱚᱣᱨᱟᱛᱨᱤ",
  "app.subtitle": "ᱫᱤᱵᱭᱚ ᱥᱟᱠᱛᱤ",
  "app.enter": "ᱵᱚᱞᱚᱱ ᱢᱮ",
  "app.jaiMataDi": "ᱡᱚᱭ ᱢᱟᱛᱟ ᱫᱤ",

  "nav.home": "ᱢᱩᱬᱩᱛ ᱥᱟᱦᱴᱟ",
  "nav.navadurga": "ᱱᱚᱵᱫᱩᱨᱜᱟ",
  "nav.navratri": "ᱱᱚᱣᱨᱟᱛᱨᱤ",
  "nav.puja": "ᱯᱩᱡᱟ",
  "nav.mantras": "ᱢᱚᱱᱛᱚᱨ",
  "nav.stories": "ᱠᱟᱛᱷᱟ",
  "nav.search": "ᱥᱮᱬᱟᱭ",
  "nav.language": "ᱨᱳᱲ",
  "nav.settings": "ᱥᱮᱴᱤᱝ",
  "nav.about": "ᱵᱟᱵᱚᱛ",
  "nav.more": "ᱵᱟᱹᱲᱛᱤ",

  "action.read": "ᱯᱟᱲᱦᱟᱣ ᱢᱮ",
  "action.listen": "ᱟᱸᱡᱚᱢ ᱢᱮ",
  "action.stop": "ᱛᱷᱟᱢ ᱢᱮ",
  "action.close": "ᱵᱚᱸᱫ ᱢᱮ",
  "action.search": "ᱥᱮᱬᱟᱭ",
  "action.back": "ᱛᱟᱭᱚᱢ",

  "home.today": "ᱛᱮᱦᱮᱸᱧ",
  "home.mantraOfDay": "ᱛᱮᱦᱮᱸᱧᱟᱜ ᱢᱚᱱᱛᱚᱨ",

  "nd.day": "ᱢᱟᱦᱟ",
  "nd.story": "ᱠᱟᱛᱷᱟ",
  "nd.mantra": "ᱢᱚᱱᱛᱚᱨ",

  "audio.title": "ᱟᱸᱡᱚᱢ",
  "lib.filterLanguage": "ᱨᱳᱲ",

  "set.language": "ᱨᱳᱲ",
  "status.available": "ᱧᱟᱢᱚᱜ ᱠᱟᱱᱟ",
  "status.unavailable": "ᱱᱚᱶᱟ ᱨᱳᱲ ᱛᱮ ᱵᱟᱹᱱᱩᱜᱼᱟ",

  "common.read": "ᱯᱟᱲᱦᱟᱣ ᱢᱮ",
  "common.listen": "ᱟᱸᱡᱚᱢ ᱢᱮ",
  "common.source": "ᱯᱷᱮᱰᱟᱛ",
  "common.loading": "ᱞᱳᱰ ᱫᱚᱦᱚ ᱠᱟᱱᱟ…",
  "common.close": "ᱵᱚᱸᱫ ᱢᱮ",

  "err.title": "ᱢᱤᱫ ᱵᱷᱩᱞ ᱦᱩᱭ ᱟᱠᱟᱱᱟ",
};
