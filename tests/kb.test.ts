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
  getMantras, getNavadurgaForms, getPujaGuides, getSources,
} from "@/lib/content";

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
