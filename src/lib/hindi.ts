/**
 * Contemporary Hindi renderings for the reader.
 *
 * These are original Hindi compositions for this app, derived from the
 * public-domain narrative of the Devi Mahatmya (and its public-domain English
 * witness, Pargiter 1904). They are NOT copied from any copyrighted edition
 * (e.g. Gita Press) and are always labelled in the UI as a contemporary
 * rendering so they are never mistaken for a published translation.
 */

export interface SpeakerHindi {
  deva: string;   // Devanagari form of the speaker line
  hindi: string;  // plain-Hindi gloss, e.g. "ऋषि ने कहा"
}

export const SPEAKER_HI: Record<string, SpeakerHindi> = {
  "R^iShiruvAcha": { deva: "ऋषि उवाच", hindi: "ऋषि (मार्कण्डेय) ने कहा" },
  "shrIbhagavAnuvAcha": { deva: "श्रीभगवानुवाच", hindi: "भगवान् ने कहा" },
  "devyuvAcha": { deva: "देव्युवाच", hindi: "देवी ने कहा" },
};

/** Fallback when a speaker code is unknown. */
export function speakerHindi(code: string | null | undefined): SpeakerHindi | null {
  if (!code) return null;
  return SPEAKER_HI[code] ?? { deva: code, hindi: code };
}

/**
 * A short contemporary Hindi narrative for each of the thirteen chapters,
 * shown after the chapter so the story is available in Hindi. Labelled in the
 * UI as a contemporary rendering.
 */
export const CHAPTER_STORY_HI: Record<number, string> = {
  1: "वैश्य सुरथ और क्षत्रिय समाधि, दोनों अपने-अपने दुःख से विवश होकर वन में मिलते हैं और मेधा ऋषि से देवी की महिमा पूछते हैं। ऋषि बताते हैं कि सृष्टि के आदि में जब मधु और कैटभ नामक दो दैत्यों ने ब्रह्मा को संकट में डाला, तब विष्णु की योगनिद्रा से महाकाली जागृत हुईं और उन दोनों दैत्यों का वध किया।",
  2: "महिषासुर ने स्वर्ग जीतकर देवताओं को निकाल बाहर किया। पीड़ित देव ब्रह्मा के साथ विष्णु और शिव के पास गए; उनके तथा सभी देवों के तेज से मिलकर देवी का दिव्य, तेजोमय रूप प्रकट हुआ।",
  3: "महिषासुर और देवी के बीच घोर युद्ध हुआ। अंत में देवी ने अपने चरण से उसे दबाकर शूल से उसका वध किया, और तीनों लोकों में शांति छा गई।",
  4: "विजय के पश्चात् देवताओं ने 'या देवी सर्वभूतेषु…' आदि मंगलकारी स्तोत्रों से देवी की स्तुति की; प्रसन्न होकर देवी ने उन्हें वरदान दिए।",
  5: "शुम्भ और निशुम्भ के अत्याचार से पीड़ित देवता हिमालय पर जाकर देवी की स्तुति करने लगे। देवी ने शुम्भ के दूत से कहा कि मैं प्रतिज्ञा से बँधी हूँ — जो मुझे युद्ध में जीतेगा, वही मेरा पति बनेगा।",
  6: "शुम्भ ने धूम्रलोचन और अपनी सेना देवी पर भेजी; देवी ने उन सबका नाश कर दिया। चण्ड और मुण्ड भी देवी के सामने टिक न सके।",
  7: "चण्ड और मुण्ड जब देवी की ओर ललकारते हुए आए, तब देवी की भृकुटी से महाकाली (चामुण्डा) प्रकट हुईं और उन्होंने चण्ड-मुण्ड का वध किया — इसी से 'चामुण्डा' नाम पड़ा।",
  8: "रक्तबीज नामक दैत्य से घोर युद्ध हुआ, जिसकी रक्त की प्रत्येक बूँद से नए दैत्य जन्म लेते थे। देवी ने काली को उसका रक्त पीने दिया और रक्तबीज का अंत किया।",
  9: "इसके पश्चात् निशुम्भ देवी से युद्ध करने आया; देवी ने उसका भी वध कर देवताओं को अभय किया।",
  10: "शुम्भ के साथ अंतिम और भयंकर संग्राम हुआ; इसी प्रसंग में देवताओं ने नारायणी स्तुति से देवी के विराट् रूप की उपासना की।",
  11: "नारायणी स्तुति — 'या देवी सर्वभूतेषु शक्ति-रूपेण संस्थिता…' आदि पद्यों से देवी की सर्वव्यापी शक्ति, करुणा और महिमा की स्तुति की गई।",
  12: "देवी ने वरदान दिया कि जो मेरे इस माहात्म्य का पाठ और श्रवण करेंगे, उनका कल्याण होगा; संकट के समय स्मरण करने पर मैं उनकी रक्षा करूँगी।",
  13: "अंत में सुरथ को राज्य और समाधि को परम ज्ञान का वरदान मिला। ऋषि कहते हैं कि जो श्रद्धा से इस देवी-माहात्म्य का पाठ करते हैं, उन पर देवी की कृपा रहती है।",
};

/** The honest label shown with the Hindi rendering. */
export const HINDI_RENDERING_NOTE = "समकालीन हिन्दी अनुवाद · Contemporary Hindi rendering";

/** Short contemporary English narrative, parallel to the Hindi, for switching. */
export const CHAPTER_STORY_EN: Record<number, string> = {
  1: "The merchant Suratha and the kshatriya Samadhi, each ruined by circumstance, meet in the forest and ask the sage Medhas about the glory of the Devi. The sage tells how, at the beginning of creation, when the demons Madhu and Kaitabha threatened Brahma, Mahakali rose from Vishnu's yogic sleep and slew them.",
  2: "Mahishasura conquered heaven and drove out the gods. The gods went to Vishnu and Shiva; from the combined radiance of all the gods the divine form of the Goddess emerged.",
  3: "A terrible battle raged between Mahishasura and the Devi. At last she pinned him with her foot and slew him with her trident, and peace returned to the three worlds.",
  4: "After the victory the gods hymned the Devi with auspicious stotras; pleased, she granted them boons.",
  5: "Oppressed by Shumbha and Nishumbha, the gods went to the Himalaya and praised the Devi. She told Shumbha's messenger she was bound by her vow: only he who defeats her in battle may be her lord.",
  6: "Shumbha sent Dhumralochana and his army; the Devi destroyed them all. Chanda and Munda too could not stand before her.",
  7: "When Chanda and Munda advanced, the Devi's frowned brow brought forth Mahakali (Chamunda), who slew them — hence the name Chamunda.",
  8: "In the battle with Raktabija, whose every drop of blood spawned a new demon, the Devi let Kali drink his blood and so ended him.",
  9: "Then Nishumbha came to fight; the Devi slew him too and gave the gods fearlessness.",
  10: "The final battle with Shumbha raged; in that moment the gods praised her vast form with the Narayani stuti.",
  11: "The Narayani stuti hymns the Devi as the all-pervading power, compassion and glory — 'Ya devi sarva-bhuteshu shakti-rupena samsthita…'",
  12: "The Devi granted that whoever recites or hears this mahatmya shall be blessed; in times of trouble, remembering her, she will protect them.",
  13: "At last Suratha received his kingdom and Samadhi supreme knowledge. The sage says that those who recite this Devi-mahatmya with faith abide in the Devi's grace.",
};

export const STORY_LANGUAGES = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिन्दी" },
] as const;

export type StoryLang = (typeof STORY_LANGUAGES)[number]["code"];

/** The story for a chapter in the requested language (falls back to English). */
export function chapterStory(lang: string, n: number): { text: string; lang: StoryLang } {
  if (lang === "hi" && CHAPTER_STORY_HI[n]) return { text: CHAPTER_STORY_HI[n], lang: "hi" };
  return { text: CHAPTER_STORY_EN[n] ?? "", lang: "en" };
}

export const STORY_NOTE: Record<StoryLang, string> = {
  en: "Contemporary English rendering",
  hi: HINDI_RENDERING_NOTE,
};
