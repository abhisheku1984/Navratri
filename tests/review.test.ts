import { describe, expect, it } from "vitest";
import { buildReviewItems, narrowState, summarise } from "@/lib/review";

/**
 * The review console's whole purpose is to report provenance honestly, so the
 * property that matters most is negative: a record with no status field must
 * never be reported as verified. If that fails, the console launders
 * unreviewed editorial content into something that looks checked.
 */

describe("narrowState", () => {
  it("accepts only the known verification states", () => {
    expect(narrowState("verified")).toBe("verified");
    expect(narrowState("awaiting-review")).toBe("awaiting-review");
    expect(narrowState("partially-verified")).toBe("partially-verified");
  });

  it("rejects near-misses rather than upgrading them", () => {
    // "unverified" is what temples.json actually stores. It is NOT the same as
    // "awaiting-verification", and must not be read as any known state.
    expect(narrowState("unverified")).toBeNull();
    expect(narrowState("Verified")).toBeNull();
    expect(narrowState("verified-traditional")).toBeNull();
    expect(narrowState("not-included")).toBeNull();
    expect(narrowState("")).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(narrowState(null)).toBeNull();
    expect(narrowState(undefined)).toBeNull();
    expect(narrowState({ status: "verified" })).toBeNull();
    expect(narrowState(1)).toBeNull();
  });
});

describe("buildReviewItems", () => {
  const items = buildReviewItems();

  it("covers every collection", () => {
    const byCollection = summarise(items).byCollection;
    for (const c of [
      "scripture", "angas", "navadurga", "peethas", "temples",
      "mantras", "knowledge", "stories", "glossary", "sources",
    ] as const) {
      expect(byCollection[c], `missing collection ${c}`).toBeGreaterThan(0);
    }
  });

  it("gives every record a unique namespaced id", () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Namespaced so a peetha and a temple with the same slug cannot collide.
    for (const id of ids) expect(id).toMatch(/^[a-z]+:.+$/);
  });

  it("never reports a record with no status field as verified", () => {
    const laundered = items.filter((i) => i.statusAbsent && i.state === "verified");
    expect(laundered.map((i) => i.id)).toEqual([]);
  });

  it("marks editorial content as awaiting review", () => {
    // Knowledge topics, stories and glossary terms carry only prose provenance
    // and no status at all. They must be awaiting review, and flagged as
    // having no status field.
    for (const collection of ["knowledge", "stories", "glossary"] as const) {
      const group = items.filter((i) => i.collection === collection);
      expect(group.length).toBeGreaterThan(0);
      for (const it of group) {
        expect(it.state, `${it.id} should await review`).toBe("awaiting-review");
        expect(it.statusAbsent, `${it.id} should flag absent status`).toBe(true);
      }
    }
  });

  it("keeps the scripture chapters as the one genuinely verified group", () => {
    const chapters = items.filter((i) => i.collection === "scripture");
    expect(chapters).toHaveLength(13);
    for (const c of chapters) {
      expect(c.state).toBe("verified");
      // Verified means checked, so a check must be named.
      expect(c.verification).toBeTruthy();
      expect(c.provenance).toBeTruthy();
    }
  });

  it("records that temple visitor details are unverified", () => {
    const temples = items.filter((i) => i.collection === "temples");
    expect(temples).toHaveLength(28);
    for (const t of temples) {
      expect(t.state).not.toBe("verified");
      expect(t.caveats?.join(" ")).toMatch(/unverified/i);
    }
  });

  it("carries the Peetha verification note and confidence through", () => {
    const peethas = items.filter((i) => i.collection === "peethas");
    expect(peethas).toHaveLength(60);
    // Every peetha has a verificationStatus object, so none is status-absent.
    for (const p of peethas) {
      expect(p.statusAbsent).toBe(false);
      expect(p.confidence).toMatch(/^(high|medium|low)$/);
    }
  });

  it("flags the mantras whose full text is deliberately withheld", () => {
    const withheld = items.filter((i) => i.collection === "mantras" && i.caveats?.length);
    expect(withheld.length).toBeGreaterThan(0);
    for (const m of withheld) {
      expect(m.caveats?.join(" ")).toMatch(/not included/i);
    }
  });

  it("flags sample content rather than hiding it", () => {
    const sample = items.filter((i) => i.sample);
    expect(sample.length).toBeGreaterThan(0);
    // Every peetha and temple record is explicitly sample-flagged in the corpus.
    expect(sample.some((i) => i.collection === "peethas")).toBe(true);
    expect(sample.some((i) => i.collection === "temples")).toBe(true);
  });

  it("does not mutate the content it reads", () => {
    const before = buildReviewItems();
    const after = buildReviewItems();
    expect(after).toEqual(before);
  });
});

describe("summarise", () => {
  const items = buildReviewItems();
  const s = summarise(items);

  it("counts every record exactly once", () => {
    const stateSum = Object.values(s.byState).reduce((a, b) => a + b, 0);
    const collectionSum = Object.values(s.byCollection).reduce((a, b) => a + b, 0);
    expect(stateSum).toBe(s.total);
    expect(collectionSum).toBe(s.total);
    expect(s.total).toBe(items.length);
  });

  it("initialises every state, including the empty ones", () => {
    for (const st of [
      "verified", "verified-with-caveats", "partially-verified",
      "tradition-recorded", "awaiting-verification", "awaiting-review",
    ] as const) {
      expect(typeof s.byState[st], `${st} missing`).toBe("number");
    }
  });

  it("reports that most of the corpus is still outstanding", () => {
    // The honest headline: editorial content vastly outweighs the imported
    // scripture, so awaiting-review is the largest bucket.
    const outstanding =
      s.byState["awaiting-review"] + s.byState["awaiting-verification"];
    expect(outstanding).toBeGreaterThan(s.byState.verified);
  });

  it("handles an empty list without dividing by zero", () => {
    const empty = summarise([]);
    expect(empty.total).toBe(0);
    expect(empty.statusAbsent).toBe(0);
    expect(empty.sample).toBe(0);
  });
});
