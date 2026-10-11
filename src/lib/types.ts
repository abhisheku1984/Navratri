/**
 * Normalised content model.
 *
 * Scripture, translations, deities, temples, Peetha traditions, sources and
 * audio assets are separate record types with explicit links between them, so
 * that a translation can be swapped, re-attributed or withdrawn without
 * touching the verse it hangs off.
 */

import type { LangCode } from "@/lib/i18n";

export type VerificationStatus =
  | "verified"
  | "verified-with-caveats"
  | "partially-verified"
  | "tradition-recorded"
  | "awaiting-verification"
  | "awaiting-review";

export type Confidence = "high" | "medium" | "low";

export interface SourceRef {
  id: string;
  /** Short human label, e.g. "Sanskrit Documents durga700". */
  label?: string;
  /** Where in that source, e.g. "verse 5.14-16". */
  locator?: string;
}

export interface Citation {
  sourceId: string;
  locator?: string;
  note?: string;
}

/* ------------------------------------------------------------------ scripture */

export interface ScriptureVerse {
  n: number;
  nEnd: number;
  label: string;
  speaker: string | null;
  iTrans: string;
  devanagari: string;
  iast: string;
  padas: number;
}

export interface ScriptureChapter {
  id: string;
  number: number;
  slug: string;
  charitra: "prathama" | "madhyama" | "uttama";
  charitraLabel: string;
  presidingDeity: string;
  titleSanskrit: string;
  titleItrans: string;
  titleIast: string;
  titleEnglishEditorial: string;
  markandeyaPuranaChapter: number;
  verseUnitCount: number;
  traditionalVerseCount: number;
  colophonItrans: string | null;
  colophonDevanagari: string | null;
  svastiItrans: string | null;
  svastiDevanagari: string | null;
  viniyoga: { iTrans: string | null; devanagari: string | null };
  dhyana: { iTrans: string | null; devanagari: string | null };
  invocation: { iTrans: string | null; devanagari: string | null };
  sourceRef: string;
  verses: ScriptureVerse[];
}

export interface ScriptureAnga {
  id: string;
  slug: string;
  titleEnglish: string;
  titleSanskrit: string;
  titleItrans: string;
  titleIast: string;
  kind: "purvanga" | "uttaranga";
  order: number;
  note: string;
  verseUnitCount: number;
  traditionalVerseCount: number;
  viniyoga: { iTrans: string | null; devanagari: string | null };
  dhyana: { iTrans: string | null; devanagari: string | null };
  sourceRef: string;
  verses: ScriptureVerse[];
}

export interface TranslationChapter {
  chapter: number;
  language: string;
  translationId: string;
  paragraphs: string[];
  argument: string[];
  wordCount: number;
  witness: {
    translator: string;
    work: string;
    copyrightStatus: string;
    digitalCopy: string;
    ocrUncorrected: boolean;
    status: string;
    verseAlignment: null;
  };
}

/* ------------------------------------------------------------------ navadurga */

export interface NavadurgaForm {
  id: string;
  slug: string;
  day: number;
  nameDevanagari: string;
  nameHindi: string;
  nameTransliterated: string;
  meaning: string;
  originStory: string;
  iconography: string;
  symbolism: { attribute: string; meaning: string }[];
  dhyanaVerse: {
    devanagari: string | null;
    status: string;
    source: string;
    sourceFile: string;
    note: string;
  };
  kavachamNameVerse: { verse: number; devanagari: string | null; source: string };
  navarnaMantra: { devanagari: string; transliteration: string; meaning: string; note: string };
  colour: string;
  colourNote: string;
  offering: { flower: string; bhog: string; note: string };
  qualities: string[];
  chakra: string;
  planet: string;
  scriptureRef: string;
  familyStory: string;
  fiveMinuteRoutine: { step: string; text: string }[];
  regionalVariationNote: string;
  sampleContent: boolean;
}

/* ------------------------------------------------------------------- peethas */

export interface Peetha {
  id: string;
  slug: string;
  templeName: string;
  goddessName: string;
  bhairava: string | null;
  associatedBodyPart: string | null;
  location: { city: string; region: string; country: string };
  coordinates: { lat: number; lon: number } | null;
  coordinateNote: string;
  lists: string[];
  traditionNote: string;
  story: string;
  confidence: Confidence;
  verificationStatus: { status: VerificationStatus; lastChecked: string | null; note: string };
  officialWebsite: string | null;
  darshanTimings: string | null;
  accessibility: string | null;
  visitorInfoNote: string;
  sampleContent: boolean;
}

/* ------------------------------------------------------------------- temples */

export interface Temple {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  country: string;
  kind: "shakti-peetha" | "major-devi-shrine";
  coordinates: { lat: number; lon: number };
  coordinateNote: string;
  festivals: string[];
  note: string;
  officialWebsite: string | null;
  openingHours: string | null;
  contact: string | null;
  accessibility: string | null;
  infoStatus: string;
  infoNote: string;
  sampleContent: boolean;
}

/* ------------------------------------------------------------------ knowledge */

export interface KnowledgeTopic {
  slug: string;
  title: string;
  titleHi: string;
  tagline: string;
  story: string;
  detail: [string, string][];
  significance: string;
  characters: string[];
  places: string[];
  source: string;
  childVersion: string;
  reflection: string[];
  related: string[];
}

/* ------------------------------------------------------------------- mantras */

export interface MantraItem {
  slug: string;
  title: string;
  /**
   * For angas this is the title in Devanagari; for the two `not-included`
   * entries it is only the name of the text, never its content.
   */
  deva: string;
  iast: string;
  category: "mantra" | "stotra" | "anga" | "bhajan";
  attribution: string;
  meaning: string;
  wordMeaning: [string, string][];
  pronunciation: string;
  textStatus: "verified" | "verified-traditional" | "not-included";
  /** Present only where a text is deliberately withheld; explains why. */
  textStatusNote?: string;
  chapterRef: { chapter: number; verses: string; count: number } | null;
  /** In-app route to the full imported text, when one exists. */
  fullTextRef?: string;
  sourceRef?: string;
  audio: null | { url: string; licence: string; lastVerified: string };
}

/* ------------------------------------------------------------------- stories */

export interface Story {
  slug: string;
  title: string;
  titleHi: string;
  age: string;
  minutes: number;
  short: string;
  long: string;
  moral: string;
  sourceNote: string;
  illustrationHints: string[];
}

/* --------------------------------------------------------------- collections */

/**
 * Shared envelope for the editorial collections.
 *
 * The members are typed individually in content/index.ts rather than through a
 * generic parameter, because each collection names its own array (`terms`,
 * `guides`, `quizzes`) and a `<T>` that the body never mentions would only
 * invite callers to assume a shape the index signature does not guarantee.
 */
export interface Collection {
  collectionId: string;
  title: string;
  intro: string;
  editorialNote?: string;
  [key: string]: unknown;
}

export interface NavadurgaCollection extends Collection { forms: NavadurgaForm[] }
export interface PeethaCollection extends Collection {
  peethas: Peetha[];
  lists: Record<string, { label: string; note: string }>;
}
export interface TempleCollection extends Collection {
  temples: Temple[];
  lastVerified: string | null;
}
/* ------------------------------------------------------- knowledge base (KB) */

/**
 * Review state of a KB document.
 *
 * `in-house-editorial` is the honest default: written and checked inside the
 * project, not reviewed by an external scholar. The AI guide reports this
 * state in its citations, so a reader always knows which kind of claim they
 * are looking at.
 */
export type KbReviewState = "in-house-editorial" | "reviewed" | "draft";

export interface KbSourceRef {
  /** Must match an id in content/sources.json. Enforced by tests. */
  sourceId: string;
  locator: string;
  note?: string;
}

export interface KbLink {
  href: string;
  label: string;
}

/**
 * A translation of a KB document.
 *
 * Partial by design: a document may have a translated title and summary while
 * the body is still pending review. The UI then shows the translated heading
 * with the English body and says which part is untranslated, rather than
 * silently mixing or silently falling back.
 */
export interface KbTranslation {
  title?: string;
  summary?: string;
  body?: string[];
}

export interface KbDocument {
  id: string;
  /** Question-explorer section A–J. */
  section: string;
  slug: string;
  title: string;
  /** Question ids from the 50-question matrix that this document answers. */
  questions: string[];
  /** One-paragraph answer, written to stand alone. */
  summary: string;
  body: string[];
  keyPoints: string[];
  tradition: string;
  sources: KbSourceRef[];
  links: KbLink[];
  review: KbReviewState;
  updated: string;
  translations?: Record<string, KbTranslation>;
}

export interface KbSection {
  section: string;
  title: string;
  intro: string;
  documents: KbDocument[];
}

/** One of the 50 launch questions, mapped to the content that answers it. */
export interface LaunchQuestion {
  id: string;
  section: string;
  text: string;
  /** KB document slug that answers it, when one exists. */
  doc?: string;
  /** Fallback destination when there is no KB document (a page or the guide). */
  href?: string;
  /** A refined phrasing to send to the AI guide. */
  ask: string;
}

export interface KnowledgeCollection extends Collection { topics: KnowledgeTopic[] }
export interface MantraCollection extends Collection { items: MantraItem[] }
export interface StoryCollection extends Collection { stories: Story[] }

export interface ScriptureManifest {
  textId: string;
  titleSanskrit: string;
  titleIast: string;
  titleEnglish: string;
  chapters: {
    id: string;
    number: number;
    slug: string;
    titleSanskrit: string;
    titleIast: string;
    titleEnglish: string;
    charitra: string;
    charitraLabel: string;
    presidingDeity: string;
    verseUnitCount: number;
    traditionalVerseCount: number;
    markandeyaPuranaChapter: number;
  }[];
  angas: { id: string; slug: string; titleEnglish: string; titleSanskrit: string; kind: string;
           order: number; verseUnitCount: number }[];
  preludeItrans: string[];
  preludeDevanagari: string[];
  verseUnitTotal: number;
  traditionalVerseTotal: number;
  source: {
    id: string;
    file: string;
    provenance: string;
    transcribers: string[];
    proofreaders: string[];
    editionNote: string;
    derivedRendering: string;
  };
}

/* -------------------------------------------------------------- user data */

export type ScriptMode = "devanagari" | "iast" | "both";
export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  /**
   * Interface language. Widened from five languages to all 24 in the
   * multilingual upgrade; `LangCode` is the union exported by `@/lib/i18n`,
   * which validates the registry at test time.
   */
  language: LangCode;
  locationId: string;
  theme: ThemeMode;
  contrast: "normal" | "high";
  motion: "auto" | "reduced";
  textScale: number;      // 0.85 – 1.6
  verseScale: number;
  verseLine: number;
  script: ScriptMode;
  lowData: boolean;
  audioRate: number;
  /**
   * Preferred narration voice, by the engine's own voice name. Empty string
   * means "pick the best match for the selected language", which is the right
   * default: a pinned voice name does not exist on another device.
   */
  audioVoice: string;
  /** 0–1. Applied to narration where the engine supports it. */
  audioVolume: number;
  /** Show sentence-level captions under the narration player. */
  captions: boolean;
  /** Open the transcript panel as soon as a narration starts. */
  transcriptOpen: boolean;
  /**
   * When true the opening experience is skipped even on a first visit. The
   * intro is never shown twice regardless — this is for readers who want it
   * gone immediately.
   */
  skipIntro: boolean;
  firstRunDone: boolean;
  /** Enables the service worker and offline pinning. Off by default. */
  offline: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  audioVoice: "",
  audioVolume: 1,
  captions: true,
  transcriptOpen: false,
  skipIntro: false,
  language: "en",
  locationId: "delhi",
  theme: "system",
  contrast: "normal",
  motion: "auto",
  textScale: 1,
  verseScale: 1,
  verseLine: 1,
  script: "devanagari",
  lowData: false,
  audioRate: 1,
  firstRunDone: false,
  offline: false,
};

export interface Bookmark {
  id: string;
  kind: "verse" | "chapter" | "anga" | "peetha" | "temple" | "topic" | "mantra" | "story";
  ref: string;
  label: string;
  href: string;
  createdAt: number;
}

export interface ReadingProgress {
  /** key -> verse label last read */
  scripture: Record<string, string>;
  /** key -> 0..1 */
  chapters: Record<string, number>;
  completed: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  gratitude?: string;
}

/**
 * A stop on a saved pilgrimage itinerary.
 *
 * Coordinates are copied from the content record at the time the stop was
 * added, so an itinerary stays readable even if a record is later corrected —
 * but that also means a saved itinerary can go stale. The planner says so.
 */
export interface ItineraryStop {
  id: string;
  label: string;
  place?: string;
  lat: number;
  lon: number;
  href?: string;
  kind?: "peetha" | "temple";
}

/**
 * A reviewer's verdict on one content record.
 *
 * Mirrors the `content_review` table. Recording a verdict here does not change
 * the record's own verification status — that is a separate, deliberate act,
 * because a verdict entered on one device by one person is not the same thing
 * as the corpus being verified.
 */
export interface ReviewVerdict {
  /** Namespaced record id, e.g. `peethas:kamakhya`. */
  recordId: string;
  reviewer: string;
  reviewedAt: string;
  verdict: "approved" | "needs-work" | "rejected";
  notes?: string;
}

export interface UserState {
  settings: UserSettings;
  bookmarks: Bookmark[];
  progress: ReadingProgress;
  recitations: { chapterId: string; at: number }[];
  journal: JournalEntry[];
  quizScores: Record<string, { correct: number; total: number; at: number }>;
  favourites: { peethas: string[]; temples: string[] };
  /** Ordered list of stops. Empty means no itinerary has been planned. */
  itinerary: ItineraryStop[];
  /** Review verdicts keyed by record id. Latest verdict wins. */
  reviewVerdicts: Record<string, ReviewVerdict>;
  /**
   * Recently opened pages, newest first. Powers "My learning journey".
   * Local only, capped, and clearable — see the privacy section of Settings.
   */
  recent: RecentVisit[];
  /** Ratings on AI guide answers. Local only; nothing is sent anywhere. */
  guideFeedback: Record<string, "helpful" | "not-helpful">;
  /** Completed learning-journey steps, keyed by step id. */
  journeySteps: { id: string; at: number }[];
}

export interface RecentVisit {
  href: string;
  title: string;
  kind: string;
  at: number;
}
