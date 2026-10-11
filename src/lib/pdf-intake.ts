/**
 * PDF intake: what is this file, and what may this app do with it?
 *
 * Runs entirely in the browser — the file is read from the reader's own disk
 * with `File.arrayBuffer()`, inspected in memory, and never sent anywhere.
 * There is deliberately no server endpoint for this: a scripture PDF a reader
 * happens to own is their business, and the app's job is to tell them honestly
 * what it can and cannot do with it.
 *
 * The scan is structural, not a faithful reader. It reports:
 *
 *  - whether the PDF is readable at all (encrypted? damaged? scanned images?),
 *  - whether a text layer exists (content streams with text operators),
 *  - a character census by script over whatever text could be extracted,
 *  - hints at what the text is (Devanagari scripture keywords, IAST marks),
 *  - and the embedded metadata the file carries.
 *
 * Text extraction from a PDF is approximate by nature — an embedded Devanagari
 * font can store glyph indices rather than Unicode, and this module says so
 * rather than pretending its sample is the document. The *verdicts* are
 * therefore built on the structural facts plus the reader's own declaration
 * about where the file came from and what they want done with it.
 */

export type IntakeRights = "public-domain" | "my-own-text" | "copyrighted" | "unknown";
export type IntakeSource = "own-scan" | "public-domain-edition" | "purchased-edition" | "website" | "unknown";
export type IntakePurpose = "read" | "align" | "translate" | "reproduce" | "narrate" | "index";

export interface IntakeDeclaration {
  source: IntakeSource;
  rights: IntakeRights;
  purpose: IntakePurpose;
}

export type IntakeOutcome = "yes" | "review" | "no" | "blocked";

export interface IntakeVerdict {
  /** Short label of the use, in the reader's words. */
  use: string;
  outcome: IntakeOutcome;
  reason: string;
}

export interface PdfScan {
  /** Header looked like a PDF at all. */
  isPdf: boolean;
  version: string | null;
  bytes: number;
  pages: number | null;
  encrypted: boolean;
  textLayer: "text" | "images-only" | "encrypted" | "unknown";
  streams: number;
  streamsInflated: number;
  textOperators: number;
  images: number;
  fonts: string[];
  metadata: { title?: string; author?: string; producer?: string; created?: string };
  extractedChars: number;
  sample: string;
  /** Script census over the readable text sample. */
  scripts: Record<string, number>;
  /**
   * Script census over font `ToUnicode` maps: four-hex-digit code points in the
   * file. This is the only reliable way to see Devanagari in a PDF whose text is
   * stored as glyph ids — the sample itself extracts as glyph noise.
   */
  scriptHints: Record<string, number>;
  /** Number of /ToUnicode maps: a text layer that *can* be mapped to Unicode. */
  toUnicodeMaps: number;
  diacritics: boolean;
  keywords: string[];
  /** True when content streams could not be decompressed here: structural only. */
  structuralOnly: boolean;
  warnings: string[];
}

const SCRIPT_RANGES: { name: string; re: RegExp }[] = [
  { name: "Devanagari", re: /[\u0900-\u097F]/g },
  { name: "Bengali", re: /[\u0980-\u09FF]/g },
  { name: "Gurmukhi", re: /[\u0A00-\u0A7F]/g },
  { name: "Gujarati", re: /[\u0A80-\u0AFF]/g },
  { name: "Odia", re: /[\u0B00-\u0B7F]/g },
  { name: "Tamil", re: /[\u0B80-\u0BFF]/g },
  { name: "Telugu", re: /[\u0C00-\u0C7F]/g },
  { name: "Kannada", re: /[\u0C80-\u0CFF]/g },
  { name: "Malayalam", re: /[\u0D00-\u0D7F]/g },
  { name: "Perso-Arabic", re: /[\u0600-\u06FF\u0750-\u077F]/g },
  { name: "Latin", re: /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/g },
];

/** Words that identify a Shakta / Navratri text, in Devanagari and Latin. */
const KEYWORDS: { word: string; label: string }[] = [
  { word: "दुर्गा", label: "दुर्गा / Durga" },
  { word: "देवी", label: "देवी / Devi" },
  { word: "सप्तशती", label: "सप्तशती / Saptashati" },
  { word: "चण्डी", label: "चण्डी / Chandi" },
  { word: "चंडी", label: "चंडी / Chandi" },
  { word: "महात्म्य", label: "महात्म्य / Mahatmya" },
  { word: "कवच", label: "कवच / Kavacham" },
  { word: "स्तोत्र", label: "स्तोत्र / Stotra" },
  { word: "मन्त्र", label: "मन्त्र / Mantra" },
  { word: "मंत्र", label: "मंत्र / Mantra" },
  { word: "अध्याय", label: "अध्याय / Adhyaya (chapter)" },
  { word: "चालीसा", label: "चालीसा / Chalisa" },
  { word: "आरती", label: "आरती / Aarti" },
  { word: "नवरात्रि", label: "नवरात्रि / Navratri" },
  { word: "शक्ति", label: "शक्ति / Shakti" },
  { word: "durga", label: "durga" },
  { word: "devi", label: "devi" },
  { word: "saptashati", label: "saptashati" },
  { word: "saptasati", label: "saptasati" },
  { word: "chandi", label: "chandi" },
  { word: "chandipath", label: "chandipath" },
  { word: "mahatmya", label: "mahatmya" },
  { word: "kavach", label: "kavach" },
  { word: "kavacha", label: "kavacha" },
  { word: "stotra", label: "stotra" },
  { word: "chalisa", label: "chalisa" },
  { word: "navratri", label: "navratri" },
  { word: "navaratri", label: "navaratri" },
  { word: "aarti", label: "aarti" },
  { word: "argala", label: "argala" },
  { word: "kilaka", label: "kilaka" },
  { word: "markandeya", label: "markandeya" },
];

const DIACRITICS = /[āīūṛṝḷḹēōṃḥśṣṭḍṇñṅ]/;

const LATIN1 = new TextDecoder("latin1");
const UTF8 = new TextDecoder("utf-8", { fatal: false });

/** Inflate zlib streams, when the runtime can. Returns null when it cannot. */
async function inflate(data: Uint8Array): Promise<Uint8Array | null> {
  const DS = (globalThis as { DecompressionStream?: typeof DecompressionStream })
    .DecompressionStream;
  if (!DS) return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DS("deflate"));
    const out = await new Response(stream).arrayBuffer();
    return new Uint8Array(out);
  } catch {
    return null;
  }
}

/** Undo PDF literal-string escapes. */
function unescapePdfString(s: string): string {
  return s
    .replace(/\\([nrtbf])/g, (_, c) =>
      c === "n" ? "\n" : c === "r" ? "\r" : c === "t" ? "\t" : c === "b" ? "\b" : "\f")
    .replace(/\\(\d{1,3})/g, (_, oct: string) => String.fromCharCode(parseInt(oct, 8) & 0xff))
    .replace(/\\(.)/g, "$1");
}

/** Pull the text-showing literals out of a decompressed content stream. */
function textFromContentStream(content: string): string {
  const parts: string[] = [];
  // BT … ET blocks, plus any bare Tj/TJ outside them (some generators omit BT).
  const blocks = content.match(/BT[\s\S]*?ET/g) ?? [content];
  for (const block of blocks) {
    for (const m of block.matchAll(/\((?:\\.|[^\\()])*\)/g)) {
      parts.push(unescapePdfString(m[0].slice(1, -1)));
    }
    if (!parts.length) {
      for (const m of block.matchAll(/\[((?:[^[\]]|\\.)*)\]\s*TJ/g)) {
        const inner = m[1];
        for (const lit of inner.matchAll(/\((?:\\.|[^\\()])*\)/g)) {
          parts.push(unescapePdfString(lit[0].slice(1, -1)));
        }
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function infoValue(src: string, key: string): string | undefined {
  const m = src.match(new RegExp(`/${key}\\s*\\(((?:\\\\.|[^\\\\()])*)\\)`));
  return m ? unescapePdfString(m[1]).trim() || undefined : undefined;
}

/**
 * Inspect a PDF. Never throws: an unreadable file produces a scan with
 * `isPdf: false` and a warning, which the UI can state plainly.
 */
export async function scanPdf(bytes: Uint8Array): Promise<PdfScan> {
  const warnings: string[] = [];
  const head = LATIN1.decode(bytes.slice(0, 1024));
  const versionMatch = head.match(/%PDF-(\d\.\d)/);
  const isPdf = Boolean(versionMatch);

  if (!isPdf) {
    return {
      isPdf: false, version: null, bytes: bytes.byteLength, pages: null,
      encrypted: false, textLayer: "unknown", streams: 0, streamsInflated: 0,
      textOperators: 0, images: 0, fonts: [], metadata: {}, extractedChars: 0,
      sample: "", scripts: {}, scriptHints: {}, toUnicodeMaps: 0,
      diacritics: false, keywords: [],
      structuralOnly: true,
      warnings: ["This file does not begin with a PDF header, so it is not a PDF the app can inspect."],
    };
  }

  const all = LATIN1.decode(bytes);
  const encrypted = /\/Encrypt\b/.test(all);
  if (encrypted) {
    warnings.push(
      "The file declares /Encrypt, so its streams are encrypted. The app cannot read it, and will not guess.",
    );
  }

  // Page count: prefer the page tree /Count, fall back to /Type /Page objects.
  const counts = [...all.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  const pageObjects = all.match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
  const pages = counts.length ? Math.max(...counts) : pageObjects > 0 ? pageObjects : null;

  const images = all.match(/\/Subtype\s*\/Image\b/g)?.length ?? 0;
  const fonts = [
    ...new Set(
      [...all.matchAll(/\/BaseFont\s*\/([#\w+.,-]+)/g)].map((m) => m[1].replace(/^[A-Z]{6}\+/, "")),
    ),
  ].slice(0, 12);

  const metadata = {
    title: infoValue(all, "Title"),
    author: infoValue(all, "Author"),
    producer: infoValue(all, "Producer"),
    created: infoValue(all, "CreationDate"),
  };

  // Content streams. Each `stream … endstream` is inflated when it looks like a
  // content stream (has BT/ET or Tj/TJ markers after decompression).
  let streams = 0;
  let streamsInflated = 0;
  let textOperators = 0;
  const extracted: string[] = [];
  let structuralOnly = false;

  const streamRe = /stream\r?\n?/g;
  let m: RegExpExecArray | null;
  let inspected = 0;
  while ((m = streamRe.exec(all)) !== null && inspected < 400) {
    const start = m.index + m[0].length;
    const end = all.indexOf("endstream", start);
    if (end === -1) break;
    streams += 1;
    inspected += 1;
    const chunk = bytes.subarray(start, end);
    // Skip obviously non-Flate streams (images dominate the byte count).
    const inflated = await inflate(chunk);
    if (inflated) {
      streamsInflated += 1;
      const content = LATIN1.decode(inflated);
      const ops = content.match(/(?:Tj|TJ|'|")\s/g)?.length ?? 0;
      textOperators += ops;
      if (ops > 0 || /BT|ET/.test(content)) {
        const text = textFromContentStream(content);
        if (text) extracted.push(text);
      }
    } else if (!encrypted) {
      structuralOnly = true;
      // Uncompressed content streams are readable directly.
      const content = LATIN1.decode(chunk);
      if (/(Tj|TJ)\s/.test(content)) {
        textOperators += 1;
        const text = textFromContentStream(content);
        if (text) extracted.push(text);
      }
    }
    streamRe.lastIndex = end + 9;
  }

  const extractedText = extracted.join(" ").replace(/\s+/g, " ").trim();
  const sample = extractedText.slice(0, 2000);

  const scripts: Record<string, number> = {};
  for (const { name, re } of SCRIPT_RANGES) {
    const n = extractedText.match(re)?.length ?? 0;
    if (n > 0) scripts[name] = n;
  }

  // Font maps: the reliable signal for Indic scripts in a PDF.
  const scriptHints: Record<string, number> = {};
  for (const m of all.matchAll(/<([0-9A-Fa-f]{4})>/g)) {
    const cp = parseInt(m[1], 16);
    for (const { name, re } of SCRIPT_RANGES) {
      // reuse the range test by checking the single character
      re.lastIndex = 0;
      if (re.test(String.fromCharCode(cp))) {
        scriptHints[name] = (scriptHints[name] ?? 0) + 1;
        break;
      }
    }
  }
  const toUnicodeMaps = all.match(/\/ToUnicode\b/g)?.length ?? 0;

  // Some PDFs store their text as UTF-8 literals; check both decodings so the
  // identity keywords are not missed.
  const allUtf8 = UTF8.decode(bytes);
  const haystack = `${extractedText}\n${allUtf8}`;
  const lower = haystack.toLowerCase();
  const keywords = KEYWORDS.filter((k) =>
    k.word.match(/[\u0900-\u097F]/) ? extractedText.includes(k.word) : lower.includes(k.word),
  ).map((k) => k.label);

  let textLayer: PdfScan["textLayer"] = "unknown";
  if (encrypted) textLayer = "encrypted";
  else if (textOperators > 0) textLayer = "text";
  else if (images > 0) textLayer = "images-only";
  else if (!encrypted) textLayer = "unknown";

  if (Object.keys(scriptHints).length && textOperators > 0) {
    const top = Object.entries(scriptHints).sort((a, b) => b[1] - a[1])[0];
    if (top[0] !== "Latin") {
      warnings.push(
        `The embedded font maps point at ${top[0]} (${top[1]} code points). The text is stored as glyph ids, ` +
          `so the character sample above reads as noise even though the page displays correctly — that is a ` +
          `property of PDFs, not a fault in the file.`,
      );
    }
  }

  if (textLayer === "images-only") {
    warnings.push(
      "No text operators were found, but the file embeds images: this is almost certainly a scan. " +
        "Its text is pixels, not characters — the app cannot read it and will not guess at it.",
    );
  }
  const legacyFont = /(chanakya|krutidev|devlys|agra|shree|shreelipi|walkman|alankar|gandhi|amarujala)/i
    .test(fonts.join(" "));
  if (legacyFont && toUnicodeMaps === 0) {
    warnings.push(
      "This PDF was made with a legacy Hindi font (" +
        fonts.join(", ") +
        ") and carries no ToUnicode map. The pages display correctly, but the text layer stores " +
        "glyph codes, not Unicode — so no app can read it as characters without that font's mapping " +
        "table. This app will not guess a Devanagari text out of glyph codes and present it as scripture.",
    );
  }
  if (structuralOnly) {
    warnings.push(
      "Some content streams could not be decompressed in this browser, so the scan is structural only.",
    );
  }
  if (pages && pages > 1200) {
    warnings.push(`This is a large document (${pages} pages): expect a slow, careful import.`);
  }

  return {
    isPdf, version: versionMatch?.[1] ?? null, bytes: bytes.byteLength, pages, encrypted,
    textLayer, streams, streamsInflated, textOperators, images, fonts, metadata,
    extractedChars: extractedText.length, sample, scripts, scriptHints, toUnicodeMaps,
    diacritics: DIACRITICS.test(extractedText), keywords, structuralOnly, warnings,
  };
}

/* ----------------------------------------------------------------- verdicts */

const RIGHTS_LABEL: Record<IntakeRights, string> = {
  "public-domain": "public domain (copyright expired)",
  "my-own-text": "your own composition or your own scan of your own text",
  copyrighted: "a copyrighted edition",
  unknown: "unknown",
};

/**
 * What the app may do with this file.
 *
 * The rules come from the app's own editorial policy, and they are the same
 * rules applied to the corpus that already ships:
 *
 *  - nothing is published without a named, verifiable source,
 *  - a translation must be a named human rendering, never a machine rendering
 *    of someone else's copyrighted translation,
 *  - no recording is published without the performers' permission,
 *  - comparison work (aligning your copy against ours) never republishes your
 *    text, so it is allowed regardless of rights.
 */
export function evaluateIntake(
  scan: PdfScan,
  d: IntakeDeclaration,
): IntakeVerdict[] {
  const out: IntakeVerdict[] = [];
  const canReadText = scan.textLayer === "text" && !scan.encrypted;
  const identified = scan.keywords.length > 0;

  /* --- the file itself ---------------------------------------------------- */
  if (!scan.isPdf) {
    return [{
      use: "Reading the file at all",
      outcome: "blocked",
      reason: "This is not a PDF. Nothing further can be judged from it.",
    }];
  }
  if (scan.encrypted) {
    return [{
      use: "Reading the file at all",
      outcome: "blocked",
      reason:
        "The PDF is encrypted, so its text cannot be read here. Remove the password (or export an unlocked copy) and try again.",
    }];
  }
  if (scan.textLayer === "images-only") {
    out.push({
      use: "Reading the text",
      outcome: "blocked",
      reason:
        "This is a scan: the pages are images with no text layer. It needs OCR before any text work is possible, and this app will not run an OCR pass and present the result as verified scripture.",
    });
  }

  /* --- read / reference --------------------------------------------------- */
  out.push({
    use: "Read it and answer questions from it (reference only)",
    outcome: canReadText ? "yes" : "blocked",
    reason: canReadText
      ? "You can read it yourself, and quotes you paste here can be discussed. Nothing is uploaded or published: the file never leaves this device."
      : "There is no readable text layer to work from.",
  });

  /* --- alignment against the verified edition ----------------------------- */
  out.push({
    use: "Compare it against our verified Devi Mahatmya edition (verse alignment)",
    outcome: canReadText ? "yes" : "blocked",
    reason: canReadText
      ? "This is comparison work: your copy is read on your device, and only the alignment result (which verses match, where they differ) would be used. Nothing from your file is republished, so copyright does not block this step."
      : "Comparison needs a text layer.",
  });

  /* --- translation -------------------------------------------------------- */
  if (d.purpose === "translate") {
    const ok = d.rights === "public-domain" || d.rights === "my-own-text";
    out.push({
      use: "Translate it into the 24 languages",
      outcome: ok ? "review" : "no",
      reason: ok
        ? "A translation is only published here as a named human rendering, reviewed by a speaker of the target language. Machine output is shown as a draft and never labelled as reviewed."
        : `Your source is declared as ${RIGHTS_LABEL[d.rights]}. Translating a copyrighted edition would create a derivative work of it, so this app will not publish one. A translation made from a public-domain text (for example Pargiter 1904, already in the app) is the alternative.`,
    });
  }

  /* --- reproduction ------------------------------------------------------- */
  if (d.purpose === "reproduce") {
    if (d.rights === "public-domain" || d.rights === "my-own-text") {
      out.push({
        use: "Publish the text in this app",
        outcome: "review",
        reason:
          "Possible, but it goes through the corpus pipeline: the edition must be named, the text verified against its own colophon, and the import committed with its source record. Nothing is published straight from an upload.",
      });
    } else {
      out.push({
        use: "Publish the text in this app",
        outcome: "no",
        reason: `Your source is declared as ${RIGHTS_LABEL[d.rights]}. Reproducing it would be copying someone else's edition. What the app can take instead: the reading, the structure, the citations — and a named link so readers can buy or borrow the original.`,
      });
    }
  }

  /* --- narration ---------------------------------------------------------- */
  if (d.purpose === "narrate") {
    out.push({
      use: "Narrate it (audio)",
      outcome:
        d.rights === "copyrighted" || d.rights === "unknown" ? "no" : "review",
      reason:
        d.rights === "copyrighted" || d.rights === "unknown"
          ? "Narration from a copyrighted text is itself a derivative use. Additionally, no recorded recitation ships with this app without the performer's licence; device speech of text the app may publish is the honest alternative."
          : "Device speech can read text the app is allowed to publish. A recorded human recitation needs a performer licence and a documented rights note before it can ship.",
    });
  }

  /* --- indexing ----------------------------------------------------------- */
  if (d.purpose === "index" || d.purpose === "read") {
    out.push({
      use: "Keep it in your own study notes",
      outcome: "yes",
      reason:
        "Bookmarks, notes and your reading journey live in this browser only, are yours to delete, and are never published.",
    });
  }

  /* --- identity ----------------------------------------------------------- */
  if (!identified && canReadText) {
    out.push({
      use: "Identifying the text",
      outcome: "review",
      reason:
        "No Navratri or Shakta keywords were recognised in what could be read. If it is a scripture, tell me the title and edition; if it is something else, say so and the plan changes.",
    });
  }
  if (scan.structuralOnly) {
    out.push({
      use: "Confidence in this scan",
      outcome: "review",
      reason:
        "Part of the file could not be decompressed here, so treat the character counts as a lower bound. The structural facts (pages, fonts, images, encryption) are reliable.",
    });
  }

  return out;
}

/* ------------------------------------------------------------------ report */

export function buildIntakeReport(args: {
  fileName: string;
  scan: PdfScan;
  declaration: IntakeDeclaration;
  verdicts: IntakeVerdict[];
}): string {
  const { fileName, scan, declaration, verdicts } = args;
  const lines: string[] = [];

  lines.push(`# PDF intake report — ${fileName}`);
  lines.push("");
  lines.push(`Generated in the browser by Navratri (The Divine Shakti). The file was not uploaded.`);
  lines.push("");
  lines.push("## What the file is");
  lines.push(`- PDF version: ${scan.version ?? "unknown"}`);
  lines.push(`- Size: ${(scan.bytes / 1024).toFixed(0)} KB`);
  lines.push(`- Pages: ${scan.pages ?? "not stated in the file"}`);
  lines.push(`- Encrypted: ${scan.encrypted ? "yes" : "no"}`);
  lines.push(`- Text layer: ${scan.textLayer}`);
  lines.push(`- Text operators found: ${scan.textOperators}`);
  lines.push(`- Images: ${scan.images} · Fonts: ${scan.fonts.length ? scan.fonts.join(", ") : "none named"}`);
  lines.push(`- Metadata: ${[scan.metadata.title && `title "${scan.metadata.title}"`, scan.metadata.author && `author "${scan.metadata.author}"`, scan.metadata.producer && `producer "${scan.metadata.producer}"`, scan.metadata.created && `created ${scan.metadata.created}`].filter(Boolean).join(" · ") || "none"}`);
  const scripts = Object.entries(scan.scripts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  lines.push(`- Characters readable in the sample: ${scan.extractedChars}${scripts ? ` (${scripts})` : ""}`);
  const hints = Object.entries(scan.scriptHints)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  if (hints) lines.push(`- Scripts indicated by the font maps: ${hints}`);
  lines.push(`- ToUnicode maps (text can be mapped to characters): ${scan.toUnicodeMaps}`);
  lines.push(`- IAST diacritics in the sample: ${scan.diacritics ? "yes" : "no"}`);
  lines.push(`- Text identified as: ${scan.keywords.length ? scan.keywords.join(", ") : "not identified"}`);
  if (scan.warnings.length) {
    lines.push("");
    lines.push("### Caveats");
    for (const w of scan.warnings) lines.push(`- ${w}`);
  }
  lines.push("");
  lines.push("## What you told the app");
  lines.push(`- Where it came from: ${declaration.source}`);
  lines.push(`- Rights: ${RIGHTS_LABEL[declaration.rights]}`);
  lines.push(`- What you want: ${declaration.purpose}`);
  lines.push("");
  lines.push("## Verdicts");
  for (const v of verdicts) {
    lines.push(`- **${v.outcome.toUpperCase()}** — ${v.use}: ${v.reason}`);
  }
  lines.push("");
  lines.push("## What this app will not do, whatever the file");
  lines.push("- Reproduce a copyrighted edition, or a translation of it, in the app.");
  lines.push("- Publish text whose edition and rights cannot be named.");
  lines.push("- Present OCR or machine output as verified scripture.");
  lines.push("- Ship a recorded recitation without the performer's licence.");
  lines.push("- Upload your file anywhere: the scan above ran on your device.");
  if (scan.sample) {
    lines.push("");
    lines.push("## Sample of the readable text (first 2000 characters)");
    lines.push("");
    lines.push("```");
    lines.push(scan.sample);
    lines.push("```");
  }
  return lines.join("\n");
}
