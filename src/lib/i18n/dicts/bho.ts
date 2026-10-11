/**
 * भोजपुरी — partial interface translation.
 *
 * Added deliberately as the 24th language (see `languages.ts` for why it was
 * chosen over Tulu, Rajasthani and Bhili) — every other language in the brief
 * is present, and Bhojpuri is not. Coverage is partial and the app says so;
 * strings not translated here fall back to English *and are counted as
 * fallbacks* in the language settings page.
 */
import type { Dict } from "./en";

export const bho: Dict = {
  "app.name": "नवरात्रि",
  "app.subtitle": "दिव्य शक्ति",
  "app.tagline": "माई दुर्गा के जानीं। पवित्र ग्रंथ खोजीं। शक्ति के अनुभव करीं।",
  "app.skipIntro": "भूमिका छोड़ीं",
  "app.enter": "भीतर आईं",
  "app.jaiMataDi": "जय माता दी",

  "nav.home": "घर",
  "nav.navadurga": "नवदुर्गा दरसन",
  "nav.navratri": "नवरात्रि परिचय",
  "nav.puja": "पूजा आ विधि",
  "nav.mantras": "मंत्र आ आरती",
  "nav.stories": "कथा आ ज्ञान",
  "nav.listen": "सुनाई संग्रह",
  "nav.guide": "एआई मार्गदर्शक से पूछीं",
  "nav.questions": "प्रश्न खोज",
  "nav.journey": "हमार यात्रा",
  "nav.about": "परिचय आ स्रोत",
  "nav.settings": "सेटिंग आ सुगमता",
  "nav.search": "खोजीं",
  "nav.saved": "सहेजल",
  "nav.more": "अउरी",
  "nav.menu": "सूची",
  "nav.language": "भाषा",
  "nav.chooseLanguage": "आपन भाषा चुनीं",

  "action.read": "पढ़ीं",
  "action.listen": "सुनीं",
  "action.listenPage": "ई पन्ना सुनीं",
  "action.listenStory": "पूरा कथा सुनीं",
  "action.pause": "रोकीं",
  "action.stop": "बंद करीं",
  "action.replay": "फेर चलाईं",
  "action.speed": "रफ्तार",
  "action.volume": "आवाज",
  "action.transcript": "लिखल पाठ",
  "action.captions": "उपशीर्षक",
  "action.voice": "स्वर",
  "action.back": "पाछे",
  "action.next": "आगे",
  "action.close": "बंद करीं",
  "action.save": "सहेजीं",
  "action.saved": "सहेजल गइल",
  "action.delete": "मिटाईं",
  "action.search": "खोजीं",
  "action.askGuide": "मार्गदर्शक से पूछीं",

  "home.heroTitle": "जय माता दी।",
  "home.heroSub": "दिव्य शक्ति के दुनिया में राउर स्वागत बा।",
  "home.heroBody": "माई दुर्गा के नउ रूप, पूरा दुर्गा सप्तशती, पूजा विधि, मंत्र आ नवरात्रि के परंपरा — आपन भाषा में पढ़ीं आ सुनीं।",
  "home.valueNavadurga": "नवदुर्गा दरसन",
  "home.valueNavadurgaNote": "नउ रूप, एक-एक क के, हर एक के कथा के साथे।",
  "home.valueListen": "सुनीं आ जानीं",
  "home.valueListenNote": "हर लेख राउर चुनल भाषा में पढ़ल जाला।",
  "home.valueGuide": "एआई मार्गदर्शक",
  "home.valueGuideNote": "एही संग्रह से, स्रोत के साथे जवाब।",
  "home.valueDaily": "रोज के ज्ञान",
  "home.valueDailyNote": "आजु के रूप, आजु के मंत्र, आजु के बिचार।",
  "home.valueRituals": "विधि जानीं",
  "home.valueRitualsNote": "घटस्थापन, रोज के पूजा, भोग, व्रत।",
  "home.today": "आजु",
  "home.todaysForm": "आजु के रूप",
  "home.mantraOfDay": "आजु के मंत्र",
  "home.langHint": "24 भाषा में पढ़ीं आ सुनीं",

  "intro.title": "नवदुर्गा",
  "intro.subtitle": "एक जोति के चारो ओर नउ रूप",
  "intro.skip": "भूमिका छोड़ीं",
  "intro.begin": "सुरु करीं",

  "nd.title": "नवदुर्गा के नउ रूप",
  "nd.day": "दिन",
  "nd.meaning": "नाम के अरथ",
  "nd.story": "कथा",
  "nd.symbolism": "प्रतीक",
  "nd.mantra": "मंत्र",
  "nd.offering": "परंपरागत भोग",

  "q.title": "प्रश्न खोज",
  "q.searchPlaceholder": "प्रश्न में खोजीं…",
  "q.openArticle": "जवाब पढ़ीं",
  "q.toGuide": "मार्गदर्शक से पूछीं",
  "q.section": "विभाग",

  "guide.title": "नवदुर्गा एआई मार्गदर्शक",
  "guide.placeholder": "आपन भाषा में प्रश्न लिखीं…",
  "guide.send": "भेजीं",
  "guide.sources": "स्रोत",
  "guide.feedbackHelpful": "उपयोगी",
  "guide.feedbackNot": "उपयोगी ना",
  "guide.noAnswer": "ई संग्रह में ऊ बात जवाब देवे खातिर पर्याप्त नइखे।",
  "action.listenAnswer": "ई जवाब सुनीं",

  "audio.title": "सुनाई",
  "audio.noVoice": "ई यंत्र पर {language} के आवाज नइखे।",
  "audio.transcriptLang": "लिखल पाठ ({language})",

  "lib.title": "सुनाई आ भक्ति पाठ",
  "lib.filterLanguage": "भाषा",

  "j.title": "हमार सीखे के यात्रा",
  "j.saved": "सहेजल लेख",
  "j.recent": "हाल में देखल",
  "j.deleteAll": "हमार सब डेटा मिटाईं",

  "set.title": "सेटिंग आ सुगमता",
  "set.language": "भाषा",
  "set.audio": "आवाज",
  "set.motionReduced": "हिलाई कम करीं",
  "set.textSize": "अक्षर के आकार",
  "set.voiceAuto": "आपसहुँ (भाषा खातिर सबसे नीमन)",

  "status.translationTitle": "अनुवाद के हाल",
  "status.available": "उपलब्ध",
  "status.unavailable": "ई भाषा में अभी नइखे",

  "common.read": "पढ़ीं",
  "common.listen": "सुनीं",
  "common.source": "स्रोत",
  "common.sources": "स्रोत",
  "common.loading": "लोड होखत बा…",
  "common.close": "बंद करीं",
  "common.no": "ना",

  "err.title": "कुछ गड़बड़ हो गइल",
  "err.notFound": "ऊ पन्ना नइखे",
};
