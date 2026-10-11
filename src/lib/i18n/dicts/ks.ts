/**
 * کٲشُر — deliberately minimal interface translation (Perso-Arabic, right-to-left).
 *
 * Same rule as Bodo: only wording that can be stated with confidence is written
 * here. Kashmiri devotional vocabulary borrows freely from Persian and Sanskrit
 * alike (پوٗجا, دُرگا, کتھ, سٔتھ), and those borrowings are rendered in the
 * standard Perso-Arabic orthography rather than approximated.
 *
 * Right-to-left layout is applied by the app shell from `languages.ts`; nothing
 * here needs to know about direction. Kashmiri has no mainstream engine voice,
 * so narration for this locale falls back to an Urdu voice where one exists and
 * the player labels the substitution.
 */
import type { Dict } from "./en";

export const ks: Dict = {
  "app.name": "نوراتری",
  "app.subtitle": "الہی شکتی",
  "app.enter": "اندر آیو",
  "app.jaiMataDi": "جے ماتا دی",
  "app.skipIntro": "تعارف ترٛاوِو",

  "nav.home": "گھر",
  "nav.navadurga": "نودرگا",
  "nav.navratri": "نوراتری",
  "nav.puja": "پوٗجا",
  "nav.mantras": "منتر تہ آرتی",
  "nav.stories": "کتھ تہ علم",
  "nav.listen": "بوزنہٕ سٟتؠ",
  "nav.guide": "اے آئی رہنما سٟتؠ پرژھیو",
  "nav.questions": "سوال ژھانڈ",
  "nav.journey": "میون سفر",
  "nav.about": "تعارف تہ ذریعہ",
  "nav.settings": "سیٹنگ تہ رسائی",
  "nav.search": "ژھانڈیو",
  "nav.language": "زبان",
  "nav.more": "مزید",
  "nav.menu": "فہرست",

  "action.read": "پڑھیو",
  "action.listen": "بوزیو",
  "action.pause": "روکیو",
  "action.stop": "بند کریو",
  "action.save": "محفوظ کریو",
  "action.saved": "محفوظ گومت",
  "action.close": "بند کریو",
  "action.search": "ژھانڈیو",
  "action.back": "واپس",
  "action.delete": "میٹیو",

  "home.today": "از",
  "home.todaysForm": "ازُک رُوپ",
  "home.mantraOfDay": "ازُک منتر",
  "home.langHint": "۲۴ زبانن منز",

  "nd.day": "دۄہ",
  "nd.meaning": "ناوُک مطلب",
  "nd.story": "کتھ",
  "nd.mantra": "منتر",

  "audio.title": "بوزنہٕ",
  "lib.filterLanguage": "زبان",
  "lib.rights": "حقوق",

  "j.saved": "محفوظ کرمت",
  "set.language": "زبان",
  "set.audio": "آواز",
  "set.textSize": "حروفن ہُنٛد سائز",

  "status.translationTitle": "ترجمہ ہُنٛد حال",
  "status.available": "دستیاب",
  "status.unavailable": "یہ زبانس منز چھُ نہٕ",

  "common.read": "پڑھیو",
  "common.listen": "بوزیو",
  "common.source": "ذریعہ",
  "common.loading": "لوڈ گژھان…",
  "common.close": "بند کریو",
  "common.no": "نہٕ",

  "err.title": "کانہہ غلطی گئی",
};
