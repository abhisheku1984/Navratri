import { NextResponse } from "next/server";
import {
  getAngas,
  getChapters,
  getGlossaryTerms,
  getMantras,
  getNavadurgaForms,
  getPeethas,
  getQuizzes,
  getStories,
  getTemples,
} from "@/lib/content";
import { searchCounts } from "@/lib/search";
import { LANGUAGES } from "@/lib/i18n";

export const runtime = "nodejs";

/**
 * The Durga Saptashati colophon states 700 verses. The content set is imported
 * in verse *units* — a unit may span a range, such as 5.14–16 — so the unit
 * count is lower than the traditional count by design. Both are reported, and
 * the traditional total must match the colophon exactly.
 */
const EXPECTED_CHAPTERS = 13;
const EXPECTED_TRADITIONAL_VERSES = 700;
const EXPECTED_ANGAS = 6;

type Check = { name: string; ok: boolean; detail: string };

/**
 * Liveness and content-integrity endpoint.
 *
 * This does real work rather than returning a static 200: it re-reads the
 * imported content set and asserts the invariants that `verify:scripture`
 * enforces at build time, so a deployment whose content was truncated or
 * corrupted at install reports itself unhealthy instead of serving broken
 * pages.
 *
 * Deliberately exposes no configuration values. `deviGyan.configured` is a
 * boolean — whether a provider key is present — never the key itself.
 */
export function GET() {
  const startedAt = Date.now();
  const checks: Check[] = [];

  const add = (name: string, ok: boolean, detail: string) => {
    checks.push({ name, ok, detail });
  };

  try {
    const chapters = getChapters();
    add(
      "scripture.chapters",
      chapters.length === EXPECTED_CHAPTERS,
      `${chapters.length} of ${EXPECTED_CHAPTERS} chapters loaded`,
    );

    const traditional = chapters.reduce((sum, c) => sum + c.traditionalVerseCount, 0);
    const units = chapters.reduce((sum, c) => sum + c.verseUnitCount, 0);
    add(
      "scripture.verses",
      traditional === EXPECTED_TRADITIONAL_VERSES && units > 0,
      `${units} verse units covering ${traditional} traditional verses ` +
        `(colophon states ${EXPECTED_TRADITIONAL_VERSES})`,
    );

    // Every chapter must actually carry Devanagari text, not just metadata.
    const empty = chapters.filter((c) => !Array.isArray(c.verses) || c.verses.length === 0);
    add(
      "scripture.versesPresent",
      empty.length === 0,
      empty.length === 0
        ? "every chapter has verse text"
        : `no verse text in: ${empty.map((c) => c.number).join(", ")}`,
    );

    const angas = getAngas();
    add(
      "scripture.angas",
      angas.length === EXPECTED_ANGAS,
      `${angas.length} of ${EXPECTED_ANGAS} auxiliary recitations`,
    );

    const forms = getNavadurgaForms();
    add("navadurga", forms.length === 9, `${forms.length} of 9 Navadurga forms`);

    const peethas = getPeethas();
    add("peethas", peethas.length > 0, `${peethas.length} Shakti Peetha records`);

    const temples = getTemples();
    add("temples", temples.length > 0, `${temples.length} temple records`);

    add("mantras", getMantras().length > 0, `${getMantras().length} mantra records`);
    add("stories", getStories().length > 0, `${getStories().length} story records`);
    add("glossary", getGlossaryTerms().length > 0, `${getGlossaryTerms().length} glossary terms`);
    add("quizzes", getQuizzes().length > 0, `${getQuizzes().length} quizzes`);

    const counts = searchCounts();
    add(
      "search.index",
      counts.total > 0,
      `${counts.total} searchable documents across ${Object.keys(counts.byKind).length} kinds`,
    );
  } catch (err) {
    // A throw here means the content set could not be read at all. Report it
    // as a failed check rather than letting the endpoint 500 unstructured.
    add(
      "content.load",
      false,
      err instanceof Error ? err.message : String(err),
    );
  }

  const failed = checks.filter((c) => !c.ok);
  const healthy = failed.length === 0;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        total: checks.length,
        failed: failed.length,
        results: checks,
      },
      content: {
        chapters: EXPECTED_CHAPTERS,
        languages: LANGUAGES.map((l) => l.code),
      },
      deviGyan: {
        // Presence only. The key itself is never read into this response.
        configured: Boolean(process.env.DEVI_GYAN_API_KEY),
      },
      checkedInMs: Date.now() - startedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        // Health checks are polled. Do not let a CDN cache a stale result.
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
