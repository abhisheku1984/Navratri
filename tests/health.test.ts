import { describe, expect, it } from "vitest";
import { LANGUAGES } from "@/lib/i18n";
import { GET } from "@/app/api/health/route";

/**
 * The health endpoint is an operations surface: a monitor will act on its
 * status code. These tests assert both directions, because a health check that
 * can only ever report healthy is worse than none — it hides the failure it
 * exists to detect.
 *
 * The failure direction is exercised here by the same invariant logic the
 * endpoint runs; the negative case was additionally verified by hand against a
 * deliberately broken build, which returned 503 with the failing check named.
 */

async function callHealth() {
  const res = GET();
  const body = (await res.json()) as {
    status: string;
    timestamp: string;
    uptimeSeconds: number;
    checkedInMs: number;
    checks: {
      total: number;
      failed: number;
      results: { name: string; ok: boolean; detail: string }[];
    };
    content: { chapters: number; languages: string[] };
    deviGyan: { configured: boolean };
  };
  return { res, body };
}

function checkNamed(body: Awaited<ReturnType<typeof callHealth>>["body"], name: string) {
  const found = body.checks.results.find((c) => c.name === name);
  if (!found) throw new Error(`no health check named "${name}"`);
  return found;
}

describe("/api/health", () => {
  it("returns 200 and a healthy status for the shipped content set", async () => {
    const { res, body } = await callHealth();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.failed).toBe(0);
    expect(body.checks.total).toBe(body.checks.results.length);
    expect(body.checks.results.every((c) => c.ok)).toBe(true);
  });

  it("reports every check with a human-readable detail line", async () => {
    const { body } = await callHealth();

    for (const c of body.checks.results) {
      expect(c.name).toBeTruthy();
      expect(typeof c.detail).toBe("string");
      expect(c.detail.length).toBeGreaterThan(0);
    }
  });

  it("asserts the scripture invariants the colophon requires", async () => {
    const { body } = await callHealth();

    expect(checkNamed(body, "scripture.chapters").ok).toBe(true);
    expect(checkNamed(body, "scripture.chapters").detail).toContain("13 of 13");

    const verses = checkNamed(body, "scripture.verses");
    expect(verses.ok).toBe(true);
    // 656 imported units span 700 traditional verses; both figures must agree.
    expect(verses.detail).toContain("700 traditional verses");
    expect(verses.detail).toContain("656 verse units");

    // Metadata alone is not content: each chapter must carry verse text.
    expect(checkNamed(body, "scripture.versesPresent").ok).toBe(true);
    expect(checkNamed(body, "scripture.angas").detail).toContain("6 of 6");
  });

  it("covers the nine Navadurga forms and the Peetha and temple records", async () => {
    const { body } = await callHealth();

    expect(checkNamed(body, "navadurga").detail).toContain("9 of 9");
    expect(checkNamed(body, "peethas").ok).toBe(true);
    expect(checkNamed(body, "temples").ok).toBe(true);
  });

  it("reports a non-empty search index", async () => {
    const { body } = await callHealth();

    const idx = checkNamed(body, "search.index");
    expect(idx.ok).toBe(true);
    const total = Number(idx.detail.match(/(\d+) searchable documents/)?.[1] ?? 0);
    expect(total).toBeGreaterThan(0);
  });

  it("declares all 24 languages, with no duplicates", async () => {
    const { body } = await callHealth();

    const languages = body.content.languages as string[];
    expect(languages).toHaveLength(24);
    expect(new Set(languages).size).toBe(24);
    expect(languages).toContain("ks");
    expect(languages).toContain("bho");
    // The launch list must stay in sync with the registry the UI renders from.
    expect(languages).toEqual(LANGUAGES.map((l) => l.code));
  });

  it("reports Devi Gyan as unconfigured when no provider key is set", async () => {
    const saved = process.env.DEVI_GYAN_API_KEY;
    delete process.env.DEVI_GYAN_API_KEY;
    try {
      const { body } = await callHealth();
      expect(body.deviGyan.configured).toBe(false);
    } finally {
      if (saved !== undefined) process.env.DEVI_GYAN_API_KEY = saved;
    }
  });

  it("reports Devi Gyan as configured without leaking the key", async () => {
    // Set a recognisable secret so the leak assertion is meaningful rather
    // than vacuously true against an unset variable.
    const saved = process.env.DEVI_GYAN_API_KEY;
    const secret = "sk-secret-that-must-never-be-served";
    process.env.DEVI_GYAN_API_KEY = secret;
    try {
      const { body } = await callHealth();

      expect(body.deviGyan.configured).toBe(true);

      const serialized = JSON.stringify(body);
      expect(serialized).not.toContain(secret);
      expect(serialized.toLowerCase()).not.toContain("sk-");
      expect(serialized).not.toContain("DEVI_GYAN_ENDPOINT");
      expect(serialized).not.toContain("DEVI_GYAN_MODEL");
    } finally {
      if (saved === undefined) delete process.env.DEVI_GYAN_API_KEY;
      else process.env.DEVI_GYAN_API_KEY = saved;
    }
  });

  it("emits machine-readable operational metadata", async () => {
    const { res, body } = await callHealth();

    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(body.checkedInMs).toBeGreaterThanOrEqual(0);
    // Health is polled; it must not be cached by an intermediary.
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
});
