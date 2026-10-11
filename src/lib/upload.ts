/**
 * Analysis of a text the reader has chosen from their own device.
 *
 * Everything here runs in the browser. The file is never sent anywhere: the
 * upload page reads it with FileReader, shows this analysis, and offers the
 * normalised text back as a download. Nothing is published, and the corpus is
 * not changed — that stays with the import scripts and their verification.
 *
 * Normalisation is whitespace-only: line endings, a leading byte-order mark,
 * trailing spaces, runs of blank lines and Unicode composition (NFC). No verse
 * character is altered, so a Devanagari or ITRANS text comes back identical in
 * content.
 */

export type ScriptKind = "devanagari" | "latin" | "mixed" | "none";

export interface ChapterHeading {
  /** 1-based line number in the normalised text. */
  line: number;
  text: string;
}

export interface UploadAnalysis {
  bytesApprox: number;
  lines: number;
  nonEmptyLines: number;
  words: number;
  script: ScriptKind;
  devanagariChars: number;
  latinChars: number;
  /** Danda-delimited verse markers, e.g. "॥ १ ॥", "|| 12.3 ||", "॥ 7 ॥". */
  verseMarkers: number;
  chapterHeadings: ChapterHeading[];
  normalised: string;
  warnings: string[];
}

const DEVANAGARI = /[\u0900-\u097F]/g;
const LATIN = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/g;
const NUMERAL = "[0-9\u0966-\u096F]";
const VERSE_MARKER = new RegExp(
  `(?:॥|\\|\\|)\\s*${NUMERAL}+(?:\\\\?[.\\-–]${NUMERAL}+)*\\s*(?:॥|\\|\\|)`,
  "g",
);
const CHAPTER_HEADING =
  /अध्याय|adhy[aā]y|adhyAy|chapter\s+\d+|^\s*\d+\s*[.)]?\s*(prathama|dvitIya|tR\^itIya|chaturtha|pa~nchama|ShaShTha|saptama|aShTama|navama|dashama|ekAdasha|dvAdasha|trayodasha)/i;

/** Remove only presentation noise; keep every verse character. */
export function normaliseText(raw: string): string {
  let t = raw.replace(/^\uFEFF/, "");
  t = t.replace(/\r\n?/g, "\n");
  t = t.normalize("NFC");
  t = t
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim() + "\n";
}

function countMatches(re: RegExp, s: string): number {
  return (s.match(re) ?? []).length;
}

export function analyseText(raw: string): UploadAnalysis {
  const normalised = normaliseText(raw);
  const lines = normalised.split("\n");
  // The trailing newline adds one empty element; do not count it as a line.
  const lineCount = normalised.endsWith("\n") ? lines.length - 1 : lines.length;

  const dev = countMatches(DEVANAGARI, normalised);
  const lat = countMatches(LATIN, normalised);
  const total = dev + lat;
  let script: ScriptKind = "none";
  if (total > 0) {
    const devShare = dev / total;
    if (devShare >= 0.8) script = "devanagari";
    else if (devShare <= 0.2) script = "latin";
    else script = "mixed";
  }

  const chapterHeadings: ChapterHeading[] = [];
  lines.forEach((text, i) => {
    if (CHAPTER_HEADING.test(text)) {
      chapterHeadings.push({ line: i + 1, text: text.trim() });
    }
  });

  const warnings: string[] = [];
  if (total === 0) {
    warnings.push("No Devanagari or Latin letters were found. Is this an image-only or empty file?");
  }
  if (script === "mixed") {
    warnings.push("The text mixes Devanagari and Latin script heavily. Check that it is one edition.");
  }
  const verseMarkers = countMatches(VERSE_MARKER, normalised);
  if (total > 0 && verseMarkers === 0) {
    warnings.push("No verse markers such as ॥ 1 ॥ or || 1.1 || were found, so verses cannot be counted.");
  }

  return {
    bytesApprox: new TextEncoder().encode(raw).length,
    lines: lineCount,
    nonEmptyLines: lines.filter((l) => l.trim() !== "").length,
    words: normalised.split(/\s+/).filter(Boolean).length,
    script,
    devanagariChars: dev,
    latinChars: lat,
    verseMarkers,
    chapterHeadings,
    normalised,
    warnings,
  };
}

/** Largest text the page will read, to keep the tab responsive. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type UploadKind = "text" | "pdf" | "unsupported";

export function classifyFile(name: string, type: string): UploadKind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") || type === "application/pdf") return "pdf";
  const TEXT_EXT = [".txt", ".text", ".md", ".itx"];
  if (TEXT_EXT.some((ext) => lower.endsWith(ext)) || type.startsWith("text/")) return "text";
  return "unsupported";
}
