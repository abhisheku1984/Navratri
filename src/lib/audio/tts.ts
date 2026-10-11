/**
 * Narration — how this app speaks.
 *
 * There are two real paths, and no third one that pretends:
 *
 *  1. **Device speech** (default, always available): the browser's
 *     `speechSynthesis` reads the text in the language the reader selected.
 *     No licence is needed, nothing is uploaded, and it works offline. Its
 *     honest limitation is voice *availability*: a device may have no Bengali
 *     voice, or only an Urdu voice where Sindhi was asked for. This module
 *     detects that, names it, and refuses to read one language's text with a
 *     different language's voice as if it were a match.
 *
 *  2. **Server-side synthesis** (opt-in): a deployment that holds credentials
 *     for a TTS provider can have `/api/tts` synthesise real audio. That route
 *     reports `configured: false` until credentials exist; the player then
 *     stays on device speech rather than showing a broken control. No key is
 *     ever read outside a route handler.
 *
 * What is *not* here: recorded human recitation. Devotional recordings have
 * rights holders, and none have granted permission — see docs/AUDIO.md. Narration
 * is always labelled as device speech or as a configured service, never as a
 * recitation.
 */
import { LANGUAGES, getLanguage } from "@/lib/i18n";

export interface VoiceLike {
  name?: string;
  lang?: string;
  localService?: boolean;
  default?: boolean;
}

export type VoiceMode =
  /** A voice exists for exactly this language. */
  | "native"
  /** No voice for this language; a related one is used, and the UI must say so. */
  | "substitute"
  /** Nothing usable: no speech engine, or no voices at all. */
  | "none";

export interface VoicePlan {
  mode: VoiceMode;
  /** Voice to use, when one was found. */
  voice: VoiceLike | null;
  /** For `substitute`: which language the borrowed voice actually speaks. */
  substitutedWith: string | null;
  /** Human-readable explanation, shown in the player. Never empty. */
  reason: string;
}

/**
 * Which languages may borrow another language's voice, and from which.
 *
 * This list is short on purpose. Borrowing a Hindi voice for Sanskrit
 * Devanagari is a defensible approximation that recitation practice itself
 * uses; borrowing an English voice for Tamil is not, and is not offered.
 */
export const SUBSTITUTE_VOICE: Record<string, { from: string; note: string }> = {
  sa: {
    from: "hi",
    note: "Sanskrit has no mainstream engine voice. Devanagari Sanskrit is read with a Hindi voice, which is the closest common match — the pronunciation of the text is that of the Hindi voice, not of a trained reciter.",
  },
  ks: {
    from: "ur",
    note: "Kashmiri voices are rare on consumer devices. Perso-Arabic Kashmiri is read with an Urdu voice where one exists; the substitution is labelled here rather than hidden.",
  },
  sd: {
    from: "ur",
    note: "Sindhi voices are rare on consumer devices. Perso-Arabic Sindhi is read with an Urdu voice where one exists, and the substitution is labelled.",
  },
  mni: {
    from: "bn",
    note: "Meitei has few engine voices. Bengali-script Meitei is read with a Bengali voice where one exists; the pronunciation is approximate and this label says so.",
  },
};

/** The BCP-47 tag to hand a speech engine. */
export function speechTagFor(lang: string): string {
  return getLanguage(lang).bcp47;
}

/**
 * Decide how (and whether) a language can be narrated on this device.
 *
 * Pure apart from the voice list passed in, so it is fully testable — the
 * "no voice" and "substitute" branches are the ones that matter and they are
 * covered by tests rather than by hoping.
 */
export function planVoice(lang: string, voices: VoiceLike[]): VoicePlan {
  const def = getLanguage(lang);
  if (!voices.length) {
    return {
      mode: "none",
      voice: null,
      substitutedWith: null,
      reason: `This device reports no speech voices, so ${def.label} narration is not available here. The text is always readable.`,
    };
  }

  const want = def.bcp47.toLowerCase();
  const primary = want.split("-")[0];

  const exact = voices.find((v) => (v.lang || "").toLowerCase().replace("_", "-") === want);
  if (exact) {
    return { mode: "native", voice: exact, substitutedWith: null, reason: `Reading with a ${def.label} voice on this device.` };
  }

  const sameLanguage = voices.find((v) => (v.lang || "").toLowerCase().split("-")[0] === primary);
  if (sameLanguage) {
    return {
      mode: "native",
      voice: sameLanguage,
      substitutedWith: null,
      reason: `Reading with a ${def.label} voice on this device (a regional variant was chosen).`,
    };
  }

  const sub = SUBSTITUTE_VOICE[def.code];
  if (sub) {
    const borrowed = voices.find((v) => (v.lang || "").toLowerCase().startsWith(sub.from));
    if (borrowed) {
      return {
        mode: "substitute",
        voice: borrowed,
        substitutedWith: getLanguage(sub.from).label,
        reason: sub.note,
      };
    }
  }

  return {
    mode: "none",
    voice: null,
    substitutedWith: null,
    reason: `No ${def.label} voice is installed on this device, and no related voice is available either. Nothing will be read aloud in another language's accent; the text stays as text.`,
  };
}

/**
 * Split text into narratable sentences.
 *
 * Sentence granularity is what makes the player's progress bar, captions and
 * seek control honest: `speechSynthesis` exposes no word-level timing, so the
 * only truthful unit of progress is the sentence actually being spoken.
 *
 * Handles Devanagari danda, Persian-Arabic question marks (RTL languages),
 * and abbreviations that would otherwise split badly ("St.", "ca.").
 */
export function splitSentences(text: string): string[] {
  const flat = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!flat) return [];

  const parts = flat
    .split(/(?<=[।॥.!?؟۔])\s+/u)
    .flatMap((chunk) => chunk.split(/\n{2,}/))
    .map((s) => s.trim())
    .filter(Boolean);

  // Re-join fragments that split on a known abbreviation or a single initial,
  // so "Pargiter, 1904." never becomes three entries.
  const merged: string[] = [];
  const ABBREV = /\b(?:ca|cf|St|Dr|Mr|Mrs|Ms|vol|no|p|pp|eds?|trans)\.$/i;
  for (const p of parts) {
    const prior = merged[merged.length - 1];
    if (prior && (ABBREV.test(prior) || /^[A-Z]\.$/.test(prior) || prior.length < 12)) {
      merged[merged.length - 1] = `${prior} ${p}`;
    } else {
      merged.push(p);
    }
  }
  return merged;
}

/**
 * Normalise text before it reaches a speech engine.
 *
 * Strips verse markers and numerals that read badly aloud and collapses
 * whitespace. Kept from the original implementation, which was already tested;
 * the behaviour is unchanged because the reasons for each rule still hold.
 */
export function prepareSpeechText(text: string): string {
  return text
    .replace(/॥[^॥।]*॥/g, " ")
    .replace(/[।॥|]+/g, ", ")
    .replace(/[०-९]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,+/g, ", ")
    .trim()
    .replace(/,\s*$/, "");
}

/** Playback speeds the player offers. Anything else is out of scope on purpose. */
export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export type Speed = (typeof SPEEDS)[number];

/** Which of the 24 languages have a substitute strategy recorded. */
export function languagesWithSubstitution(): string[] {
  return Object.keys(SUBSTITUTE_VOICE);
}

/** Every language the platform intends to narrate, for the settings matrix. */
export function narrationMatrix(voices: VoiceLike[]) {
  return LANGUAGES.map((l) => {
    const plan = planVoice(l.code, voices);
    return {
      code: l.code,
      label: l.label,
      native: l.native,
      mode: plan.mode,
      voiceName: plan.voice?.name ?? null,
      substitutedWith: plan.substitutedWith,
      reason: plan.reason,
    };
  });
}
