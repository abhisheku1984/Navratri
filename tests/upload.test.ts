import { describe, expect, it } from "vitest";
import { analyseText, classifyFile, normaliseText, MAX_UPLOAD_BYTES } from "@/lib/upload";

describe("normaliseText", () => {
  it("changes only whitespace, never verse characters", () => {
    const verse = "ॐ नमश्चण्डिकायै ॥ १ ॥";
    const out = normaliseText(`\uFEFF${verse}   \r\n\r\n\r\n\r\nnext\t\n`);
    expect(out).toContain(verse);
    expect(out).toBe(`${verse}\n\nnext\n`);
  });

  it("composes Unicode to NFC so identical glyphs compare equal", () => {
    const decomposed = "क\u093C"; // क + nukta, not yet composed
    expect(normaliseText(decomposed)).toBe(decomposed.normalize("NFC") + "\n");
  });
});

describe("analyseText", () => {
  it("detects a Devanagari text and counts danda verse markers", () => {
    const text = [
      "अध्याय १",
      "मधुकैटभवधो नाम प्रथमोऽध्यायः",
      "ॐ नमश्चण्डिकायै ॥ १ ॥",
      "ॐ विशुद्धज्ञानदेहाय ॥ २ ॥",
      "॥ ३ ॥",
    ].join("\n");
    const a = analyseText(text);
    expect(a.script).toBe("devanagari");
    expect(a.verseMarkers).toBe(3);
    expect(a.warnings).toEqual([]);
  });

  it("detects ITRANS-style verse markers and dotted numbering", () => {
    const text = "|| 1.1 ||\nnamaste ||\n|| 1.2 ||\nmore ||";
    const a = analyseText(text);
    expect(a.script).toBe("latin");
    expect(a.verseMarkers).toBe(2);
  });

  it("finds chapter headings and their line numbers", () => {
    const text = "intro\nchapter 2\nverse\nadhyAyaH 3 here\n";
    const a = analyseText(text);
    expect(a.chapterHeadings.map((h) => h.line)).toEqual([2, 4]);
  });

  it("warns when there are letters but no verse markers", () => {
    const a = analyseText("just some prose with no markers");
    expect(a.verseMarkers).toBe(0);
    expect(a.warnings.join(" ")).toMatch(/No verse markers/);
  });

  it("reports an empty input clearly", () => {
    const a = analyseText("   \n\n  ");
    expect(a.script).toBe("none");
    expect(a.warnings.join(" ")).toMatch(/No Devanagari or Latin/);
  });

  it("counts non-empty lines without counting the trailing newline", () => {
    const a = analyseText("a\n\nb\n");
    expect(a.lines).toBe(3);
    expect(a.nonEmptyLines).toBe(2);
  });
});

describe("classifyFile", () => {
  it("routes text, markdown, and PDF files", () => {
    expect(classifyFile("durga.txt", "")).toBe("text");
    expect(classifyFile("notes.MD", "")).toBe("text");
    expect(classifyFile("durga700.itx", "")).toBe("text");
    expect(classifyFile("scan.pdf", "")).toBe("pdf");
    expect(classifyFile("image.png", "image/png")).toBe("unsupported");
  });

  it("keeps the size cap at 5 MB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(5 * 1024 * 1024);
  });
});
