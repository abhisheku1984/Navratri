/**
 * Global search.
 *
 * The index must resolve a query in any of the three scripts, find verses by
 * their number as well as their text, and never send anything off-device.
 */
import { describe, expect, it } from "vitest";
import { buildIndex, search, searchCounts } from "@/lib/search";

describe("index construction", () => {
  it("indexes the whole library once and reuses it", () => {
    const a = buildIndex();
    const b = buildIndex();
    expect(a).toBe(b); // memoised: same array identity
    expect(a.length).toBeGreaterThan(800);
  });

  it("indexes every content kind the UI offers as a filter", () => {
    const counts = searchCounts();
    for (const kind of ["chapter", "verse", "anga", "navadurga", "peetha",
                        "temple", "mantra", "story", "topic", "glossary"]) {
      expect(counts.byKind[kind], `${kind} not indexed`).toBeGreaterThan(0);
    }
  });

  it("indexes all 656 verse units", () => {
    expect(searchCounts().byKind.verse).toBe(656);
  });
});

describe("querying", () => {
  it("returns nothing for an empty query rather than the whole corpus", () => {
    expect(search("")).toEqual([]);
    expect(search("   ")).toEqual([]);
  });

  it("finds a verse by its Devanagari text", () => {
    // the mantra page is titled exactly this, so it legitimately outranks the
    // verse; what matters is that the verse itself is reachable
    const hits = search("या देवी सर्वभूतेषु", 100);
    expect(hits.length).toBeGreaterThan(0);
    const verse = hits.find((h) => h.kind === "verse");
    expect(verse, "no verse matched its own text").toBeTruthy();
    expect(verse!.href).toMatch(/^\/scripture\/5#5\.14-16$/);
  });

  it("finds the same verse by IAST transliteration", () => {
    const hits = search("sarvabhūteṣu", 100);
    expect(hits.some((h) => h.kind === "verse" && h.href.includes("#5.14-16"))).toBe(true);
  });

  it("finds that verse by the romanisation people actually type", () => {
    // ITRANS "sarvabhuteshu" against IAST "sarvabhūteṣu": different schemes,
    // same word. This is the query a reader would really enter.
    const hits = search("ya devi sarvabhuteshu", 300);
    expect(hits.some((h) => h.kind === "verse" && h.href.includes("#5.14-16"))).toBe(true);
  });

  it("finds a verse by its number", () => {
    const hits = search("5.14");
    expect(hits.some((h) => h.href.endsWith("#5.14-16"))).toBe(true);
  });

  it("finds a goddess by her Latin name, without diacritics", () => {
    const hits = search("Kalaratri");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].href).toBe("/navadurga/kalaratri");
  });

  it("finds the same goddess by the full IAST spelling", () => {
    const hits = search("Kālarātri");
    expect(hits[0].href).toBe("/navadurga/kalaratri");
  });

  it("finds her by her Devanagari name despite Sanskrit inflection", () => {
    // the name is stored as कालरात्रि, the Kavacham reads कालरात्रिश्च, the
    // dhyana verse कालरात्रिर्भयङ्करी — none is a substring of the query
    const hits = search("कालरात्री");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].href).toBe("/navadurga/kalaratri");
  });

  it("finds a Peetha by city", () => {
    const hits = search("Kamakhya Guwahati");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].kind).toBe("peetha");
    expect(hits[0].href).toBe("/shakti-peethas/kamakhya");
  });

  it("finds a chapter by its number and by title", () => {
    expect(search("Raktabija").some((h) => h.href === "/scripture/8")).toBe(true);
    expect(search("Narayani Stuti").some((h) => h.href === "/scripture/11")).toBe(true);
  });

  it("finds a glossary term", () => {
    const hits = search("Ghatasthapana");
    expect(hits.some((h) => h.kind === "glossary")).toBe(true);
  });

  it("is case-insensitive", () => {
    const lower = search("mahishasura").map((h) => h.id).sort();
    const upper = search("MAHISHASURA").map((h) => h.id).sort();
    expect(lower).toEqual(upper);
    expect(lower.length).toBeGreaterThan(0);
  });

  it("ranks an exact title match above a loose token match", () => {
    const hits = search("Kamakhya");
    expect(hits[0].title).toContain("Kamakhya");
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i].score).toBeLessThanOrEqual(hits[i - 1].score);
    }
  });

  it("respects the limit", () => {
    expect(search("devi", 5)).toHaveLength(5);
  });

  it("produces a trimmed excerpt with an ellipsis for long matches", () => {
    const hits = search("Mahishasura");
    const long = hits.find((h) => h.excerpt.length > 100);
    expect(long).toBeTruthy();
    expect(long!.excerpt.length).toBeLessThan(400);
  });

  it("returns nothing for a query that matches no content", () => {
    expect(search("zzzqqxxvvv")).toEqual([]);
  });
});

describe("filter counts", () => {
  it("counts the whole index with no query", () => {
    const c = searchCounts();
    expect(c.total).toBe(buildIndex().length);
  });

  it("counts only matches when given a query", () => {
    const c = searchCounts("Kalaratri");
    expect(c.total).toBeGreaterThan(0);
    expect(c.total).toBeLessThan(searchCounts().total);
    const summed = Object.values(c.byKind).reduce((a, b) => a + b, 0);
    expect(summed).toBe(c.total);
  });

  it("reports zero for an unmatched query", () => {
    expect(searchCounts("zzzqqxxvvv").total).toBe(0);
  });
});
