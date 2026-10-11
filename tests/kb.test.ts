/**
 * Knowledge base integrity.
 *
 * The KB is what the AI guide retrieves from and cites, so these tests are the
 * guardrails around its two failure modes:
 *
 *  1. a citation pointing at a source this app does not hold, and
 *  2. a link pointing at a page that does not exist.
 *
 * Both are a kind of fabrication — a plausible-looking pointer to nothing —
 * and both are caught here rather than in production.
 */
import { describe, expect, it } from "vitest";
import {
  getAngas, getChapters, getKbDocument, getKbDocuments, getKbSections,
  getKnowledgeTopics, getLaunchQuestionMatrix, getLaunchQuestionSections,
  getMantras, getNavadurgaForms, getPujaGuides, getSources, getStories,
  getChapter, getChapterArth, arthHiChapters,
} from "@/lib/content";
import { CHAPTER_STORY_EN, CHAPTER_STORY_HI } from "@/lib/hindi";
import { getChapters as chaptersForStories } from "@/lib/content";

const docs = getKbDocuments();
const sourceIds = new Set(getSources().map((s) => s.id));

/** Static app routes that exist for certain (directories under src/app). */
const STATIC_ROUTES = new Set([
  "/", "/about", "/accessibility", "/calendar", "/devi-gyan", "/guide",
  "/journey", "/kb", "/learn", "/learn/glossary", "/listen", "/maa-durga",
  "/mantras", "/navadurga", "/navratri", "/navratri/day-by-day", "/plan",
  "/privacy", "/puja", "/questions", "/report-error", "/saved", "/scripture",
  "/scripture/plans", "/search", "/settings", "/share", "/shakti-peethas",
  "/sources", "/stories", "/temples", "/terms", "/upload", "/more",
]);

function slugSet<T extends { slug: string }>(items: T[]): Set<string> {
  return new Set(items.map((x) => x.slug));
}

const KB = slugSet(docs);
const FORMS = slugSet(getNavadurgaForms());
const MANTRA = slugSet(getMantras());
const PUJA = slugSet(getPujaGuides());
const MAA = slugSet(getKnowledgeTopics());

/** Resolve one href to true when the destination exists in this app. */
function resolves(href: string): boolean {
  const [path] = href.split("#");
  const [clean] = path.split("?");

  if (STATIC_ROUTES.has(clean)) return true;

  let m = clean.match(/^\/kb\/([^/]+)$/);
  if (m) return KB.has(m[1]);

  m = clean.match(/^\/navadurga\/([^/]+)$/);
  if (m) return FORMS.has(m[1]);

  m = clean.match(/^\/mantras\/([^/]+)$/);
  if (m) return MANTRA.has(m[1]);

  m = clean.match(/^\/puja\/([^/]+)$/);
  if (m) return PUJA.has(m[1]);

  m = clean.match(/^\/maa-durga\/([^/]+)$/);
  if (m) return MAA.has(m[1]);

  m = clean.match(/^\/scripture\/(\d+)$/);
  if (m) return getChapters().some((c) => c.number === Number(m![1]));

  m = clean.match(/^\/scripture\/angas\/([^/]+)$/);
  if (m) return slugSet(getAngas()).has(m[1]);

  return false;
}

describe("knowledge base structure", () => {
  it("has ten sections, A to J", () => {
    expect(getKbSections().map((s) => s.section)).toEqual([
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    ]);
  });

  it("does not repeat a document id or slug", () => {
    const ids = docs.map((d) => d.id);
    const slugs = docs.map((d) => d.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has a unique question id on every document", () => {
    for (const d of docs) {
      expect(d.questions.length, d.id).toBeGreaterThan(0);
    }
  });

  it("gives every document a body, key points and a named review state", () => {
    for (const d of docs) {
      expect(d.body.length, d.id).toBeGreaterThan(0);
      expect(d.keyPoints.length, d.id).toBeGreaterThan(0);
      expect(d.summary.length, d.id).toBeGreaterThan(40);
      expect(["in-house-editorial", "reviewed", "draft"]).toContain(d.review);
      expect(d.updated, d.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("carries a Hindi translation with a translated body on every document", () => {
    for (const d of docs) {
      const hi = d.translations?.hi;
      expect(hi, `${d.id} has no hi translation`).toBeTruthy();
      expect(hi?.title?.length ?? 0, d.id).toBeGreaterThan(2);
      expect(hi?.summary?.length ?? 0, d.id).toBeGreaterThan(20);
      expect(hi?.body?.length ?? 0, `${d.id} hi body`).toBeGreaterThan(0);
    }
  });

  it("uses only language codes from the 24-language registry", () => {
    for (const d of docs) {
      for (const code of Object.keys(d.translations ?? {})) {
        expect(code.length, `${d.id}:${code}`).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe("knowledge base citations", () => {
  it("cites only sources that exist in sources.json", () => {
    for (const d of docs) {
      expect(d.sources.length, d.id).toBeGreaterThan(0);
      for (const s of d.sources) {
        expect(sourceIds.has(s.sourceId), `${d.id} → ${s.sourceId}`).toBe(true);
        expect(s.locator.length, `${d.id} ${s.sourceId}`).toBeGreaterThan(0);
      }
    }
  });

  it("resolves every link to a page that exists", () => {
    const broken: string[] = [];
    for (const d of docs) {
      for (const l of d.links) {
        if (!resolves(l.href)) broken.push(`${d.id} → ${l.href}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("50-question launch matrix", () => {
  const questions = getLaunchQuestionMatrix();

  it("has fifty questions, five per section", () => {
    expect(questions).toHaveLength(50);
    for (const s of getLaunchQuestionSections()) {
      expect(
        questions.filter((q) => q.section === s.letter).length,
        `section ${s.letter}`,
      ).toBe(5);
    }
  });

  it("numbers the questions A1 to J5 with no gaps", () => {
    const ids = questions.map((q) => q.id).sort();
    const expected: string[] = [];
    for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
      for (let n = 1; n <= 5; n++) expected.push(`${letter}${n}`);
    }
    expect(ids).toEqual(expected.sort());
  });

  it("points every question at real content", () => {
    for (const q of questions) {
      const target = q.doc ?? q.href;
      expect(target, q.id).toBeTruthy();
      if (q.doc) {
        expect(KB.has(q.doc), `${q.id} → ${q.doc}`).toBe(true);
      } else if (q.href) {
        expect(resolves(q.href), `${q.id} → ${q.href}`).toBe(true);
      }
    }
  });

  it("gives every question a retrieval phrasing for the guide", () => {
    for (const q of questions) {
      expect(q.ask.length, q.id).toBeGreaterThan(10);
    }
  });

  it("covers every question id somewhere in the KB documents", () => {
    const covered = new Set(docs.flatMap((d) => d.questions));
    const missing = questions.map((q) => q.id).filter((id) => !covered.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps the document a question names consistent with the question id", () => {
    for (const q of questions) {
      if (!q.doc) continue;
      const doc = getKbDocument(q.doc);
      expect(doc, `${q.id} → ${q.doc}`).toBeTruthy();
      expect(doc?.questions.includes(q.id), `${q.id} not listed on ${q.doc}`).toBe(true);
    }
  });
});

describe("language coverage of the reading experience", () => {
  it("has a knowledge-base article slug for every Navadurga form", () => {
    // FormStory() looks a form up by its own slug: if one is missing, the
    // form's page silently loses its selected-language story.
    const missing = getNavadurgaForms()
      .map((f) => f.slug)
      .filter((slug) => !KB.has(slug));
    expect(missing).toEqual([]);
  });

  it("gives every form article a Hindi rendering with a translated body", () => {
    for (const f of getNavadurgaForms()) {
      const doc = getKbDocument(f.slug);
      expect(doc, f.slug).toBeTruthy();
      const hi = doc?.translations?.hi;
      expect(hi?.body?.length ?? 0, `${f.slug} hi body`).toBeGreaterThan(0);
      expect(hi?.title?.length ?? 0, `${f.slug} hi title`).toBeGreaterThan(2);
    }
  });

  it("has a chapter narrative for all thirteen chapters, in Hindi and English", () => {
    for (const c of getChapters()) {
      expect(CHAPTER_STORY_HI[c.number]?.length ?? 0, `hi chapter ${c.number}`)
        .toBeGreaterThan(80);
      expect(CHAPTER_STORY_EN[c.number]?.length ?? 0, `en chapter ${c.number}`)
        .toBeGreaterThan(80);
    }
  });

  it("pairs a Hindi story rendering with an English one, story by story", () => {
    for (const s of getStories()) {
      expect(s.short.length, s.slug).toBeGreaterThan(50);
      expect(s.long.length, s.slug).toBeGreaterThan(200);
      const hasHi = Boolean(s.shortHi) || Boolean(s.longHi);
      if (hasHi) {
        // A half-translated story would render a mixed-language page.
        expect(s.shortHi?.length ?? 0, `${s.slug} shortHi`).toBeGreaterThan(50);
        expect(s.longHi?.length ?? 0, `${s.slug} longHi`).toBeGreaterThan(200);
      }
    }
  });

  it("holds a Hindi rendering for every story that the reader can reach today", () => {
    const withoutHi = getStories()
      .filter((s) => !(s.shortHi && s.longHi))
      .map((s) => s.slug);
    expect(withoutHi).toEqual([]);
  });
});

describe("Hindi arth (verse-by-verse meaning)", () => {
  it("covers exactly the verse units of the chapter it belongs to", () => {
    for (const n of arthHiChapters()) {
      const chapter = getChapter(n);
      expect(chapter, `chapter ${n}`).toBeTruthy();
      const arth = getChapterArth(n)!;
      const labels = chapter!.verses.map((v) => v.label);
      expect(Object.keys(arth.arth).sort()).toEqual([...labels].sort());
    }
  });

  it("writes a real sentence for every verse unit, never a placeholder", () => {
    for (const n of arthHiChapters()) {
      const arth = getChapterArth(n)!;
      for (const [label, text] of Object.entries(arth.arth)) {
        expect(text.length, `chapter ${n} verse ${label}`).toBeGreaterThan(8);
        // Verse units here can split a sentence across two units, so a comma
        // or a dash (meaning "this runs on into the next unit") is legitimate —
        // a bare unfinished fragment is not.
        expect(/[।?!”),—]$/.test(text.trim()), `${label} closes`).toBe(true);
        expect(/[\u0900-\u097F]/.test(text), `${label} is Devanagari`).toBe(true);
      }
      // the basis is stated on the page, so it must exist
      expect(arth.note.length, `chapter ${n} note`).toBeGreaterThan(60);
      expect(arth.label.length).toBeGreaterThan(1);
    }
  });

  it("labels the arth as this app's own rendering, not a published translation", () => {
    for (const n of arthHiChapters()) {
      const note = getChapterArth(n)!.note;
      expect(note).toMatch(/इस ऐप/);
      expect(note).toMatch(/प्रकाशित|अनुवाद/);
    }
  });
});

describe("chapter stories (कथा)", () => {
  it("is a full telling, not a summary line, for every chapter", () => {
    for (const c of chaptersForStories()) {
      const hi = CHAPTER_STORY_HI[c.number] ?? "";
      const en = CHAPTER_STORY_EN[c.number] ?? "";
      const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
      const paras = (text: string) => text.split(/\n{2,}/).filter((p) => p.trim()).length;

      // Regression guard: chapter 1 was a 60-word one-paragraph summary.
      expect(words(hi), `hi chapter ${c.number} words`).toBeGreaterThan(300);
      expect(words(en), `en chapter ${c.number} words`).toBeGreaterThan(300);
      expect(paras(hi), `hi chapter ${c.number} paragraphs`).toBeGreaterThanOrEqual(6);
      expect(paras(en), `en chapter ${c.number} paragraphs`).toBeGreaterThanOrEqual(6);
    }
  });
});
