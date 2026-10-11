/**
 * Devi Gyan.
 *
 * The guardrails are the product requirement here, so they are what gets
 * tested: the assistant must cite what it finds, and must refuse rather than
 * invent when it has nothing to cite.
 */
import { describe, expect, it } from "vitest";
import { answer, retrieve } from "@/lib/devi-gyan";

describe("retrieval", () => {
  it("finds and cites passages about a Navadurga form", () => {
    const passages = retrieve("Who is Kalaratri?");
    expect(passages.length).toBeGreaterThan(0);
    for (const p of passages) {
      expect(p.citation.title.length).toBeGreaterThan(0);
      expect(p.citation.href.length).toBeGreaterThan(0);
      expect(p.citation.verification.length).toBeGreaterThan(0);
      expect(p.text.length).toBeGreaterThan(0);
    }
  });

  it("returns verses with their chapter location and verified status", () => {
    // a Devanagari query resolves to individual verses; the citation then
    // carries the chapter locator and the imported-edition verification status
    const passages = retrieve("या देवी सर्वभूतेषु");
    const verse = passages.find((p) => p.citation.locator.includes("Devi Mahatmya"));
    expect(verse, "no verse passage returned").toBeTruthy();
    expect(verse!.citation.verification).toBe("verified");
    expect(verse!.text).toMatch(/[\u0900-\u097F]/);
  });

  it("marks editorial content as unreviewed rather than as scripture", () => {
    const passages = retrieve("Who is Maa Durga?");
    const editorial = passages.filter((p) => p.citation.kind === "topic");
    expect(editorial.length).toBeGreaterThan(0);
    for (const e of editorial) {
      expect(e.citation.verification.toLowerCase()).toMatch(/editorial|awaiting|review/);
    }
  });

  it("returns nothing for a query with no match", () => {
    expect(retrieve("zzzqqxxvvv")).toEqual([]);
  });

  it("orders passages by descending score", () => {
    const passages = retrieve("Durga Mahishasura");
    for (let i = 1; i < passages.length; i++) {
      expect(passages[i].score).toBeLessThanOrEqual(passages[i - 1].score);
    }
  });
});

describe("guardrails", () => {
  it("answers an ordinary question and attaches disclaimers", async () => {
    const a = await answer("Who is Kalaratri?");
    expect(a.refused).toBe(false);
    expect(a.passages.length).toBeGreaterThan(0);
    expect(a.disclaimers.length).toBeGreaterThan(0);
    expect(a.disclaimers.join(" ")).toMatch(/not promise|no one can guarantee/i);
  });

  it("refuses a medical question instead of answering it", async () => {
    const a = await answer("Will chanting this mantra cure my illness?");
    expect(a.refused).toBe(true);
    expect(a.passages).toEqual([]);
    expect(a.refusalReason).toMatch(/health|professional/i);
  });

  it("refuses pregnancy, financial and legal questions", async () => {
    for (const q of [
      "Will this puja help me get pregnant?",
      "Which lottery numbers should I chant for?",
      "Should I file a lawsuit over my inheritance?",
    ]) {
      const a = await answer(q);
      expect(a.refused, q).toBe(true);
    }
  });

  it("refuses rather than guessing when the corpus has nothing", async () => {
    const a = await answer("zzzqqxxvvv unrelated gibberish");
    expect(a.refused).toBe(true);
    expect(a.refusalReason).toMatch(/nothing in this app/i);
  });

  it("warns explicitly when a guarantee is requested", async () => {
    const a = await answer("Will it guarantee me a job if I chant daily?");
    expect(a.disclaimers.join(" ")).toMatch(/no one can guarantee/i);
  });

  it("runs in retrieval mode with no provider configured", async () => {
    const a = await answer("What is Ghatasthapana?");
    expect(a.mode).toBe("retrieval");
    expect(a.synthesis).toBeNull();
  });

  it("trims and echoes the question it was asked", async () => {
    const a = await answer("   Who is Katyayani?   ");
    expect(a.question).toBe("Who is Katyayani?");
  });
});
