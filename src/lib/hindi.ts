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
 * The chapter stories (कथा) live in their own module: they are full tellings,
 * long enough to be worth reading on their own, and keeping them apart keeps
 * this file about the small renderings (speaker lines, labels, language lists).
 */
export { CHAPTER_STORY_HI, CHAPTER_STORY_EN } from "./chapter-stories";
import { CHAPTER_STORY_HI, CHAPTER_STORY_EN } from "./chapter-stories";

/** The honest label shown with the Hindi rendering. */
export const HINDI_RENDERING_NOTE = "समकालीन हिन्दी अनुवाद · Contemporary Hindi rendering";

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
