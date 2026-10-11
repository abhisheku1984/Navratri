/**
 * Intro data — navadurga forms and the opening blessing, in a module that pulls
 * in *only* those two JSON files.
 *
 * Why a separate module instead of `@/lib/content`: `content/index.ts` imports
 * the whole corpus, including the 672 KB scripture, so importing it from a
 * client component would ship the Saptashati to every visitor in the intro
 * bundle. This file exists so the opening experience costs about 50 KB instead.
 */
import navadurgaJson from "@/content/navadurga.json";
import blessingJson from "@/content/blessing.json";

export interface IntroFormData {
  slug: string;
  day: number;
  nameDevanagari: string;
  nameTransliterated: string;
  meaning: string;
}

export function introForms(): IntroFormData[] {
  return (navadurgaJson as { forms: IntroFormData[] }).forms.map((f) => ({
    slug: f.slug,
    day: f.day,
    nameDevanagari: f.nameDevanagari,
    nameTransliterated: f.nameTransliterated,
    meaning: f.meaning,
  }));
}

export interface BlessingTranslation {
  text: string;
  status: string;
  note?: string;
}

export interface Blessing {
  id: string;
  sourceLanguage: string;
  sourceText: string;
  sourceNote: string;
  framing: string;
  disclosure: string;
  notAutoplay: string;
  translation: BlessingTranslation;
  /** True when this language's wording has not been checked by a native reader. */
  provisional: boolean;
}

type BlessingFile = {
  id: string;
  sourceLanguage: string;
  sourceText: string;
  sourceNote: string;
  presentation: { framing: string; disclosure: string; notAutoplay: string };
  translations: Record<string, BlessingTranslation>;
};

const FILE = blessingJson as unknown as BlessingFile;

/** The blessing for a language, falling back to the Hindi source text. */
export function getBlessing(lang: string): Blessing {
  const t = FILE.translations[lang] ?? FILE.translations.hi;
  return {
    id: FILE.id,
    sourceLanguage: FILE.sourceLanguage,
    sourceText: FILE.sourceText,
    sourceNote: FILE.sourceNote,
    framing: FILE.presentation.framing,
    disclosure: FILE.presentation.disclosure,
    notAutoplay: FILE.presentation.notAutoplay,
    translation: t,
    provisional: t.status === "draft",
  };
}

/** Every language that has a blessing text, with its review status. */
export function blessingLanguages(): { code: string; status: string }[] {
  return Object.entries(FILE.translations).map(([code, v]) => ({ code, status: v.status }));
}

export function blessingCoverage(): { total: number; authored: number; draft: number } {
  const all = Object.values(FILE.translations);
  return {
    total: all.length,
    authored: all.filter((v) => v.status === "authored" || v.status === "source").length,
    draft: all.filter((v) => v.status === "draft").length,
  };
}
