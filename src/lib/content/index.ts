/**
 * Content access layer.
 *
 * All scripture and editorial content lives in normalised JSON under
 * src/content and is read through this module. Nothing in the UI reaches into
 * the JSON directly, which is what lets the same data be served from Postgres
 * in production (see db/schema.sql and docs/DATA_MODEL.md) without changing a
 * single component.
 *
 * The JSON is imported statically rather than read with node:fs. That is a
 * deliberate constraint, not a convenience: several screens (the calendar, the
 * Peetha and temple directories, search, the glossary) are client components,
 * and a filesystem read cannot be bundled for the browser. Static imports also
 * mean the corpus is versioned into the build, works on serverless targets with
 * no writable filesystem, and lets the bundler drop anything a route never asks
 * for.
 */
import type {
  KnowledgeCollection, KnowledgeTopic, KbDocument, KbSection, LaunchQuestion,
  MantraCollection, MantraItem,
  NavadurgaCollection, NavadurgaForm, PeethaCollection, Peetha,
  ScriptureAnga, ScriptureChapter, ScriptureManifest, StoryCollection, Story,
  TempleCollection, Temple, TranslationChapter,
} from "@/lib/types";

import scriptureManifest from "@/content/scripture/manifest.json";

import ch01 from "@/content/scripture/chapters/01.json";
import ch02 from "@/content/scripture/chapters/02.json";
import ch03 from "@/content/scripture/chapters/03.json";
import ch04 from "@/content/scripture/chapters/04.json";
import ch05 from "@/content/scripture/chapters/05.json";
import ch06 from "@/content/scripture/chapters/06.json";
import ch07 from "@/content/scripture/chapters/07.json";
import ch08 from "@/content/scripture/chapters/08.json";
import ch09 from "@/content/scripture/chapters/09.json";
import ch10 from "@/content/scripture/chapters/10.json";
import ch11 from "@/content/scripture/chapters/11.json";
import ch12 from "@/content/scripture/chapters/12.json";
import ch13 from "@/content/scripture/chapters/13.json";

import angaKavacham from "@/content/scripture/angas/devi-kavacham.json";
import angaArgala from "@/content/scripture/angas/argala-stotram.json";
import angaKilaka from "@/content/scripture/angas/kilaka-stotram.json";
import angaSuktam from "@/content/scripture/angas/devi-suktam.json";
import angaKshamapana from "@/content/scripture/angas/aparadha-kshamapana.json";
import angaDhyana from "@/content/scripture/angas/chandika-dhyana.json";

import arthHi01 from "@/content/scripture/arth-hi/01.json";
import arthHi02 from "@/content/scripture/arth-hi/02.json";
import arthHi03 from "@/content/scripture/arth-hi/03.json";
import arthHi04 from "@/content/scripture/arth-hi/04.json";
import trManifestJson from "@/content/scripture/translations/en-pargiter-1904/manifest.json";
import tr01 from "@/content/scripture/translations/en-pargiter-1904/01.json";
import tr02 from "@/content/scripture/translations/en-pargiter-1904/02.json";
import tr03 from "@/content/scripture/translations/en-pargiter-1904/03.json";
import tr04 from "@/content/scripture/translations/en-pargiter-1904/04.json";
import tr05 from "@/content/scripture/translations/en-pargiter-1904/05.json";
import tr06 from "@/content/scripture/translations/en-pargiter-1904/06.json";
import tr07 from "@/content/scripture/translations/en-pargiter-1904/07.json";
import tr08 from "@/content/scripture/translations/en-pargiter-1904/08.json";
import tr09 from "@/content/scripture/translations/en-pargiter-1904/09.json";
import tr10 from "@/content/scripture/translations/en-pargiter-1904/10.json";
import tr11 from "@/content/scripture/translations/en-pargiter-1904/11.json";
import tr12 from "@/content/scripture/translations/en-pargiter-1904/12.json";
import tr13 from "@/content/scripture/translations/en-pargiter-1904/13.json";

import navadurgaJson from "@/content/navadurga.json";
import peethasJson from "@/content/peethas.json";
import templesJson from "@/content/temples.json";
import knowledgeJson from "@/content/knowledge.json";
import mantrasJson from "@/content/mantras.json";
import storiesJson from "@/content/stories.json";
import festivalsJson from "@/content/festivals.json";
import pujaJson from "@/content/puja.json";
import glossaryJson from "@/content/glossary.json";
import quizJson from "@/content/quiz.json";
import locationsJson from "@/content/locations.json";
import sourcesJson from "@/content/sources.json";

import kbA from "@/content/kb/a-discover.json";
import kbB from "@/content/kb/b-nine-forms.json";
import kbC from "@/content/kb/c-navratri.json";
import kbD from "@/content/kb/d-puja.json";
import kbE from "@/content/kb/e-mantras.json";
import kbF from "@/content/kb/f-fasting.json";
import kbG from "@/content/kb/g-stories.json";
import kbH from "@/content/kb/h-regional.json";
import kbI from "@/content/kb/i-reflection.json";
import kbJ from "@/content/kb/j-personalized.json";
import questionsJson from "@/content/questions.json";

/* ---------------------------------------------------------------- scripture */

export function getScriptureManifest(): ScriptureManifest {
  return scriptureManifest as ScriptureManifest;
}

const CHAPTERS: ScriptureChapter[] = [
  ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13,
] as unknown as ScriptureChapter[];

export function getChapters(): ScriptureChapter[] {
  return CHAPTERS;
}

export function getChapter(numberOrSlug: string | number): ScriptureChapter | null {
  const n = typeof numberOrSlug === "number" ? numberOrSlug : Number(numberOrSlug);
  if (!Number.isNaN(n) && n >= 1 && n <= 13) {
    return CHAPTERS.find((c) => c.number === n) ?? null;
  }
  return CHAPTERS.find((c) => c.slug === numberOrSlug) ?? null;
}

/**
 * This app's own Hindi arth (verse-by-verse meaning), where one has been
 * written. Deliberately its own file per chapter, separate from the verified
 * Sanskrit corpus: the corpus is checked by `verify:scripture`, and a rendering
 * must never be able to quietly alter a verse.
 *
 * The arth is written from the Sanskrit; it is not a copy of any published
 * Hindi translation, and the reader is told that on the page.
 */
export interface ChapterArth {
  chapter: number;
  language: "hi";
  title: string;
  label: string;
  note: string;
  arth: Record<string, string>;
}

const ARTH_HI: Record<number, ChapterArth> = {
  1: arthHi01 as unknown as ChapterArth,
  2: arthHi02 as unknown as ChapterArth,
  3: arthHi03 as unknown as ChapterArth,
  4: arthHi04 as unknown as ChapterArth,
};

export function getChapterArth(number: number): ChapterArth | null {
  return ARTH_HI[number] ?? null;
}

/** How many chapters have a written Hindi arth so far. */
export function arthHiChapters(): number[] {
  return Object.keys(ARTH_HI).map(Number).sort((a, b) => a - b);
}

export function getChapterIndex() {
  return getScriptureManifest().chapters;
}

export function getManifestEntry(number: number) {
  return getScriptureManifest().chapters.find((c) => c.number === number) ?? null;
}

const ANGAS: ScriptureAnga[] = ([
  angaKavacham, angaArgala, angaKilaka, angaSuktam, angaKshamapana, angaDhyana,
] as unknown as ScriptureAnga[]).sort((a, b) => a.order - b.order);

export function getAngas(): ScriptureAnga[] {
  return ANGAS;
}

export function getAnga(slug: string): ScriptureAnga | null {
  return ANGAS.find((a) => a.slug === slug) ?? null;
}

const TRANSLATIONS: TranslationChapter[] = [
  tr01, tr02, tr03, tr04, tr05, tr06, tr07, tr08, tr09, tr10, tr11, tr12, tr13,
] as unknown as TranslationChapter[];

/**
 * English (Pargiter, 1904) is the only complete translation imported. The
 * `lang` parameter is kept so a Hindi or Telugu translation can be added as a
 * sibling directory without touching any call site.
 */
export function getTranslations(lang = "en"): Record<number, TranslationChapter> {
  if (lang !== "en") return {};
  const out: Record<number, TranslationChapter> = {};
  for (const t of TRANSLATIONS) out[t.chapter] = t;
  return out;
}

export function getTranslation(chapter: number): TranslationChapter | null {
  return getTranslations()[chapter] ?? null;
}

/* --------------------------------------------------------------- collections */

export function getNavadurga(): NavadurgaCollection {
  return navadurgaJson as NavadurgaCollection;
}
export function getNavadurgaForms(): NavadurgaForm[] {
  return getNavadurga().forms;
}
export function getNavadurgaForm(slug: string): NavadurgaForm | null {
  return getNavadurgaForms().find((f) => f.slug === slug) ?? null;
}
export function getNavadurgaByDay(day: number): NavadurgaForm | null {
  return getNavadurgaForms().find((f) => f.day === day) ?? null;
}

export function getPeethaCollection(): PeethaCollection {
  return peethasJson as PeethaCollection;
}
export function getPeethas(): Peetha[] {
  return getPeethaCollection().peethas;
}
export function getPeetha(slug: string): Peetha | null {
  return getPeethas().find((p) => p.slug === slug) ?? null;
}

export function getTempleCollection(): TempleCollection {
  return templesJson as TempleCollection;
}
export function getTemples(): Temple[] {
  return getTempleCollection().temples;
}
export function getTemple(slug: string): Temple | null {
  return getTemples().find((t) => t.slug === slug) ?? null;
}

export function getKnowledgeCollection(): KnowledgeCollection {
  return knowledgeJson as KnowledgeCollection;
}
export function getKnowledgeTopics(): KnowledgeTopic[] {
  return getKnowledgeCollection().topics;
}
export function getKnowledgeTopic(slug: string): KnowledgeTopic | null {
  return getKnowledgeTopics().find((t) => t.slug === slug) ?? null;
}

export function getMantraCollection(): MantraCollection {
  return mantrasJson as MantraCollection;
}
export function getMantras(): MantraItem[] {
  return getMantraCollection().items;
}
export function getMantra(slug: string): MantraItem | null {
  return getMantras().find((m) => m.slug === slug) ?? null;
}

export function getStoryCollection(): StoryCollection {
  return storiesJson as StoryCollection;
}
export function getStories(): Story[] {
  return getStoryCollection().stories;
}
export function getStory(slug: string): Story | null {
  return getStories().find((s) => s.slug === slug) ?? null;
}

/* ------------------------------------------------------------------ editorial */

export interface FestivalObservance {
  slug: string;
  name: string;
  kind: string;
  months: string;
  summary: string;
  practices: string[];
}
export interface FestivalCollection {
  collectionId: string; title: string; intro: string; editorialNote: string;
  observances: FestivalObservance[];
}

export interface PujaGuide {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
}
export interface PujaCollection {
  collectionId: string; title: string; intro: string; editorialNote: string;
  guides: PujaGuide[];
}

export interface GlossaryTerm {
  id: string; english: string; devanagari: string; definition: string;
}
export interface GlossaryCollection {
  collectionId: string; title: string; intro: string; editorialNote: string;
  terms: GlossaryTerm[];
}

export interface Quiz {
  id: string; title: string; topic: string;
  questions: { q: string; options: string[]; answer: number; why: string }[];
}
export interface QuizCollection {
  collectionId: string; title: string; intro: string; editorialNote: string;
  quizzes: Quiz[];
}

export interface GeoPlace {
  id: string; city: string; region: string; country: string;
  lat: number; lon: number; utcOffsetHours: number; timezone: string;
}
export interface LocationCollection {
  collectionId: string; title: string; intro: string; locations: GeoPlace[];
}

export interface SourceRecord {
  id: string;
  kind: string;
  title: string;
  status: string;
  /** Where the material came from. Absent on records that are authored in-app. */
  provenance?: string;
  /** Only the Sanskrit transcription carries named people. */
  people?: { transcribers: string[]; proofreaders: string[] };
  editionNote?: string;
  /** Path to the copy held in this repository. */
  localCopy?: string;
  /** What was derived from it, and how. */
  derived?: string;
  licence?: string;
  /** How it was checked, where a check exists. */
  verification?: string;
  author?: string;
  published?: string;
  digitalCopy?: string;
  /** Honest limitations of the source. Never empty in spirit, often present. */
  caveats?: string[];
}
export interface SourceCollection {
  collectionId: string; title: string; intro: string; sources: SourceRecord[];
}

export interface TranslationManifest {
  translationId: string;
  language: string;
  title: string;
  copyrightStatus: string;
  granularity: string;
  verseAlignment: null;
  ocrUncorrected: boolean;
  chapters: { chapter: number; status: string; paragraphs: number; wordCount: number }[];
  notes: string[];
}

export function getFestivalCollection(): FestivalCollection {
  return festivalsJson as FestivalCollection;
}
export function getFestivals(): FestivalObservance[] {
  return getFestivalCollection().observances;
}

export function getPujaCollection(): PujaCollection {
  return pujaJson as PujaCollection;
}
export function getPujaGuides(): PujaGuide[] {
  return getPujaCollection().guides;
}
export function getPujaGuide(slug: string): PujaGuide | null {
  return getPujaGuides().find((g) => g.slug === slug) ?? null;
}

export function getGlossaryCollection(): GlossaryCollection {
  return glossaryJson as GlossaryCollection;
}
export function getGlossaryTerms(): GlossaryTerm[] {
  return getGlossaryCollection().terms;
}

export function getQuizCollection(): QuizCollection {
  return quizJson as QuizCollection;
}
export function getQuizzes(): Quiz[] {
  return getQuizCollection().quizzes;
}
export function getQuiz(id: string): Quiz | null {
  return getQuizzes().find((q) => q.id === id) ?? null;
}

export function getLocations(): LocationCollection {
  return locationsJson as LocationCollection;
}

export function getSourceCollection(): SourceCollection {
  return sourcesJson as SourceCollection;
}
export function getSources(): SourceRecord[] {
  return getSourceCollection().sources;
}

export function getTranslationManifest(): TranslationManifest | null {
  return trManifestJson as TranslationManifest;
}

/* --------------------------------------------------------- knowledge base (KB) */

/**
 * The curated knowledge base: section-wise, source-tagged documents written to
 * answer the 50 launch questions, with per-language translations where they
 * have been reviewed.
 *
 * This is the corpus the AI guide retrieves from. Every document names its
 * sources by id, and every id is checked against content/sources.json by
 * `tests/kb.test.ts`, so a citation can never point at a source that does not
 * exist in this app.
 */
const KB_FILES: KbSection[] = [
  kbA as KbSection, kbB as KbSection, kbC as KbSection, kbD as KbSection,
  kbE as KbSection, kbF as KbSection, kbG as KbSection, kbH as KbSection,
  kbI as KbSection, kbJ as KbSection,
];

export function getKbSections(): KbSection[] {
  return KB_FILES;
}

export function getKbDocuments(): KbDocument[] {
  return KB_FILES.flatMap((s) => s.documents);
}

export function getKbDocument(slug: string): KbDocument | null {
  return getKbDocuments().find((d) => d.slug === slug) ?? null;
}

export function getKbSection(letter: string): KbSection | null {
  return KB_FILES.find((s) => s.section === letter.toUpperCase()) ?? null;
}

/* ------------------------------------------------- 50 launch questions */

export function getLaunchQuestionMatrix(): LaunchQuestion[] {
  return questionsJson.questions as LaunchQuestion[];
}

export function getLaunchQuestionSections(): { letter: string; title: string; intro: string }[] {
  return questionsJson.sections;
}
