/**
 * The 24 languages of the platform.
 *
 * A note on the count, because the brief that defined this list contained
 * Sanskrit twice. Resolved here, once, explicitly:
 *
 *  - Sanskrit appears **once** (`sa`).
 *  - Kashmiri and Sindhi appear once each and stay distinct (`ks`, `sd`).
 *  - Urdu and English appear once each (`ur`, `en`).
 *  - That left 23 unique languages from the 24 requested slots, so one was
 *    added: **Bhojpuri (`bho`)** — a Scheduled-language-adjacent language of
 *    roughly 50 million speakers, written in Devanagari, and *not* already in
 *    the list. Tulu, Rajasthani and Bhili were the other candidates; Bhojpuri
 *    was chosen because its Navratri and Durga practice is well documented and
 *    its script needs no new font work.
 *
 * `assertLanguageRegistry()` is called by the test suite and by the language
 * settings page, so the count cannot drift silently again.
 *
 * Scripts and direction are recorded per language rather than assumed:
 * Kashmiri and Sindhi are written here in Perso-Arabic (their standard Indian
 * orthography) and therefore render right-to-left, as does Urdu. Santali is
 * written in Ol Chiki. Manipuri is written in the Bengali script. Bodo, Dogri,
 * Konkani, Maithili, Nepali, Sanskrit and Bhojpuri are Devanagari.
 */

export type ScriptId =
  | "arabic" | "bengali" | "devanagari" | "gujarati" | "gurmukhi" | "kannada"
  | "latin" | "malayalam" | "ol-chiki" | "odia" | "tamil" | "telugu";

export interface LanguageDef {
  /** Stable app code. BCP-47 where one exists, else a registered subtag. */
  code: string;
  /** English label, for people who cannot read the native name yet. */
  label: string;
  /** Endonym — how the language names itself. Never translated. */
  native: string;
  script: ScriptId;
  dir: "ltr" | "rtl";
  /** Tag handed to a speech engine or TTS provider. */
  bcp47: string;
  /**
   * Font stack tried in order. Names are of fonts that exist on common
   * systems or are commonly installed; the list always ends in a generic
   * family so text is never invisible if nothing matches.
   */
  fontStack: string;
  /**
   * Where a script family is shared, which language's typography to borrow
   * for Devanagari-derived and similar scripts. Used only for line-height and
   * optical-size tuning, never to change wording.
   */
  scriptGroup: "indic" | "perso-arabic" | "ol-chiki" | "latin";
  /** Shown in the picker so the choice is legible before it is committed. */
  sample: string;
  /**
   * Transcription of the app's own name, used in the intro and header when a
   * design slot cannot fit the full endonym.
   */
  appName: string;
}

export const LANGUAGES: LanguageDef[] = [
  {
    code: "as", label: "Assamese", native: "অসমীয়া", script: "bengali", dir: "ltr",
    bcp47: "as-IN", scriptGroup: "indic", appName: "নৱৰাত্রি",
    fontStack: "'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', system-ui, sans-serif",
    sample: "জয় মাতা দি",
  },
  {
    code: "bn", label: "Bengali", native: "বাংলা", script: "bengali", dir: "ltr",
    bcp47: "bn-IN", scriptGroup: "indic", appName: "নবরাত্রি",
    fontStack: "'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', system-ui, sans-serif",
    sample: "জয় মাতা দি",
  },
  {
    code: "bho", label: "Bhojpuri", native: "भोजपुरी", script: "devanagari", dir: "ltr",
    bcp47: "bho-IN", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "brx", label: "Bodo", native: "बड़ो", script: "devanagari", dir: "ltr",
    bcp47: "brx-IN", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "doi", label: "Dogri", native: "डोगरी", script: "devanagari", dir: "ltr",
    bcp47: "doi-IN", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "en", label: "English", native: "English", script: "latin", dir: "ltr",
    bcp47: "en-IN", scriptGroup: "latin", appName: "Navratri",
    fontStack: "ui-serif, Georgia, 'Times New Roman', serif",
    sample: "Jai Mata Di",
  },
  {
    code: "gu", label: "Gujarati", native: "ગુજરાતી", script: "gujarati", dir: "ltr",
    bcp47: "gu-IN", scriptGroup: "indic", appName: "નવરાત્રિ",
    fontStack: "'Noto Sans Gujarati', 'Nirmala UI', 'Shruti', system-ui, sans-serif",
    sample: "જય માતા દી",
  },
  {
    code: "hi", label: "Hindi", native: "हिन्दी", script: "devanagari", dir: "ltr",
    bcp47: "hi-IN", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "kn", label: "Kannada", native: "ಕನ್ನಡ", script: "kannada", dir: "ltr",
    bcp47: "kn-IN", scriptGroup: "indic", appName: "ನವರಾತ್ರಿ",
    fontStack: "'Noto Sans Kannada', 'Nirmala UI', 'Tunga', system-ui, sans-serif",
    sample: "ಜಯ ಮಾತಾ ದಿ",
  },
  {
    code: "ks", label: "Kashmiri", native: "کٲشُر", script: "arabic", dir: "rtl",
    bcp47: "ks-IN", scriptGroup: "perso-arabic", appName: "نوراتری",
    fontStack: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Nirmala UI', system-ui, sans-serif",
    sample: "جے ماتا دی",
  },
  {
    code: "kok", label: "Konkani", native: "कोंकणी", script: "devanagari", dir: "ltr",
    bcp47: "kok-IN", scriptGroup: "indic", appName: "नवरात्री",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "mai", label: "Maithili", native: "मैथिली", script: "devanagari", dir: "ltr",
    bcp47: "mai-IN", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "ml", label: "Malayalam", native: "മലയാളം", script: "malayalam", dir: "ltr",
    bcp47: "ml-IN", scriptGroup: "indic", appName: "നവരാത്രി",
    fontStack: "'Noto Sans Malayalam', 'Nirmala UI', 'Kartika', system-ui, sans-serif",
    sample: "ജയ് മാതാ ദി",
  },
  {
    code: "mni", label: "Manipuri (Meitei)", native: "মৈতৈলোন্", script: "bengali", dir: "ltr",
    bcp47: "mni-IN", scriptGroup: "indic", appName: "নবরাত্রি",
    fontStack: "'Noto Sans Bengali', 'Noto Sans Meetei Mayek', 'Nirmala UI', system-ui, sans-serif",
    sample: "জয় মাতা দী",
  },
  {
    code: "mr", label: "Marathi", native: "मराठी", script: "devanagari", dir: "ltr",
    bcp47: "mr-IN", scriptGroup: "indic", appName: "नवरात्र",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "ne", label: "Nepali", native: "नेपाली", script: "devanagari", dir: "ltr",
    bcp47: "ne-NP", scriptGroup: "indic", appName: "नवरात्रि",
    fontStack: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', system-ui, sans-serif",
    sample: "जय माता दी",
  },
  {
    code: "or", label: "Odia", native: "ଓଡ଼ିଆ", script: "odia", dir: "ltr",
    bcp47: "or-IN", scriptGroup: "indic", appName: "ନବରାତ୍ରି",
    fontStack: "'Noto Sans Oriya', 'Nirmala UI', 'Kalinga', system-ui, sans-serif",
    sample: "ଜୟ ମାତା ଦି",
  },
  {
    code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", script: "gurmukhi", dir: "ltr",
    bcp47: "pa-IN", scriptGroup: "indic", appName: "ਨਵਰਾਤਰੀ",
    fontStack: "'Noto Sans Gurmukhi', 'Nirmala UI', 'Raavi', system-ui, sans-serif",
    sample: "ਜੈ ਮਾਤਾ ਦੀ",
  },
  {
    code: "sa", label: "Sanskrit", native: "संस्कृतम्", script: "devanagari", dir: "ltr",
    bcp47: "sa-IN", scriptGroup: "indic", appName: "नवरात्रिः",
    fontStack: "'Noto Serif Devanagari', 'Noto Sans Devanagari', 'Nirmala UI', system-ui, serif",
    sample: "जय माता दी",
  },
  {
    code: "sat", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "ol-chiki", dir: "ltr",
    bcp47: "sat-IN", scriptGroup: "ol-chiki", appName: "ᱱᱟᱣᱨᱟᱛᱨᱤ",
    fontStack: "'Noto Sans Ol Chiki', 'Nirmala UI', system-ui, sans-serif",
    sample: "ᱡᱚᱭ ᱢᱟᱛᱟ ᱫᱤ",
  },
  {
    code: "sd", label: "Sindhi", native: "سنڌي", script: "arabic", dir: "rtl",
    bcp47: "sd-IN", scriptGroup: "perso-arabic", appName: "نوراتري",
    fontStack: "'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 'Nirmala UI', system-ui, sans-serif",
    sample: "جي ماتا دي",
  },
  {
    code: "ta", label: "Tamil", native: "தமிழ்", script: "tamil", dir: "ltr",
    bcp47: "ta-IN", scriptGroup: "indic", appName: "நவராத்திரி",
    fontStack: "'Noto Sans Tamil', 'Nirmala UI', 'Latha', system-ui, sans-serif",
    sample: "ஜெய் மாதா தி",
  },
  {
    code: "te", label: "Telugu", native: "తెలుగు", script: "telugu", dir: "ltr",
    bcp47: "te-IN", scriptGroup: "indic", appName: "నవరాత్రి",
    fontStack: "'Noto Sans Telugu', 'Nirmala UI', 'Gautami', system-ui, sans-serif",
    sample: "జయ్ మాతా ది",
  },
  {
    code: "ur", label: "Urdu", native: "اردو", script: "arabic", dir: "rtl",
    bcp47: "ur-IN", scriptGroup: "perso-arabic", appName: "نوراتری",
    fontStack: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Nirmala UI', system-ui, sans-serif",
    sample: "جے ماتا دی",
  },
];

/** Language codes the app accepts anywhere a `lang` parameter is read. */
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function getLanguage(code: string | undefined | null): LanguageDef {
  return (code && BY_CODE.get(code)) || BY_CODE.get("en")!;
}

export function isLanguageCode(code: string): boolean {
  return BY_CODE.has(code);
}

export function isRtl(lang: string): boolean {
  return getLanguage(lang).dir === "rtl";
}

export interface RegistryProblem {
  kind:
    | "wrong-count" | "duplicate-code" | "duplicate-native" | "missing-field"
    | "rtl-without-arabic" | "bcp47-mismatch";
  detail: string;
}

/**
 * Validate the registry. Returns an empty array when the list is sound.
 *
 * This exists because the brief this app was built from listed Sanskrit twice
 * and nobody noticed for a while. A count that is only checked by eye is a
 * count that drifts.
 */
export function assertLanguageRegistry(): RegistryProblem[] {
  const problems: RegistryProblem[] = [];
  if (LANGUAGES.length !== 24) {
    problems.push({ kind: "wrong-count", detail: `expected 24 languages, found ${LANGUAGES.length}` });
  }
  const seenCode = new Set<string>();
  const seenNative = new Map<string, string>();
  for (const l of LANGUAGES) {
    if (seenCode.has(l.code)) {
      problems.push({ kind: "duplicate-code", detail: `duplicate code ${l.code}` });
    }
    seenCode.add(l.code);

    const prior = seenNative.get(l.native);
    if (prior) {
      problems.push({
        kind: "duplicate-native",
        detail: `${l.code} duplicates the endonym already used by ${prior} (${l.native})`,
      });
    }
    seenNative.set(l.native, l.code);

    if (!l.label || !l.native || !l.bcp47 || !l.fontStack || !l.sample) {
      problems.push({ kind: "missing-field", detail: `${l.code} is missing a required field` });
    }
    if (l.dir === "rtl" && l.script !== "arabic") {
      problems.push({
        kind: "rtl-without-arabic",
        detail: `${l.code} is marked right-to-left but its script is ${l.script}`,
      });
    }
    if (!l.bcp47.toLowerCase().startsWith(l.code.toLowerCase())) {
      problems.push({ kind: "bcp47-mismatch", detail: `${l.code} has BCP-47 tag ${l.bcp47}` });
    }
  }
  return problems;
}

/**
 * Which languages still need a hand-authored decision recorded about audio.
 * Kept next to the registry so the two cannot drift apart.
 */
export const SPEECH_NOTES: Partial<Record<string, string>> = {
  sa: "Sanskrit has no mainstream engine voice. Devanagari Sanskrit is read with a Hindi voice where one is installed, and the UI says that is what is happening.",
  mni: "Manipuri voices are rare. Bengali or Hindi is used for Bengali-script text and the substitution is labelled.",
  brx: "Bodo voices are rare on consumer devices.",
  sat: "Ol Chiki voices are rare on consumer devices.",
  ks: "Kashmiri voices are rare; Perso-Arabic text may be read with an Urdu voice when installed.",
  sd: "Sindhi voices are rare; Perso-Arabic text may be read with an Urdu voice when installed.",
};
