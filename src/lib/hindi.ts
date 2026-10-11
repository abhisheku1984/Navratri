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
