/**
 * Scripture integrity check.
 *
 * Run with:  npm run verify:scripture
 *
 * This is deliberately strict. It fails (exit 1) if any chapter is missing, if
 * verse numbering has a gap or a duplicate, if the traditional verse count does
 * not reconcile with the count stated in the source's own colophon, or if any
 * verse is missing a Devanagari rendering.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "src", "content", "scripture");

interface Verse {
  n: number;
  nEnd: number;
  label: string;
  iTrans: string;
  devanagari: string;
  iast: string;
  padas: number;
  speaker: string | null;
}
interface Chapter {
  id: string;
  number: number;
  verseUnitCount: number;
  traditionalVerseCount: number;
  colophonItrans: string | null;
  verses: Verse[];
}

const failures: string[] = [];
const notes: string[] = [];
const fail = (m: string) => failures.push(m);

function load<T>(p: string): T {
  if (!existsSync(p)) fail(`missing file: ${p}`);
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

const DEVANAGARI_RE = /[\u0900-\u097F]/;

console.log("Verifying Durga Saptashati content…\n");

// ---- chapters -------------------------------------------------------------
const dir = join(ROOT, "chapters");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
if (files.length !== 13) fail(`expected 13 chapter files, found ${files.length}`);

let unitTotal = 0;
let traditionalTotal = 0;
const colophonStated: number[] = [];

for (let n = 1; n <= 13; n++) {
  const ch = load<Chapter>(join(dir, `${String(n).padStart(2, "0")}.json`));
  if (ch.number !== n) fail(`ch${n}: number field is ${ch.number}`);

  // numbering must start at 1 and be contiguous
  let expected = 1;
  for (const v of ch.verses) {
    if (v.n !== expected) {
      fail(`ch${n}: verse sequence broke - expected ${expected}, got ${v.n} (label ${v.label})`);
    }
    if (v.nEnd < v.n) fail(`ch${n}: bad range ${v.label}`);
    expected = v.nEnd + 1;
  }
  const maxVerse = ch.verses.length ? ch.verses[ch.verses.length - 1].nEnd : 0;
  if (maxVerse !== ch.traditionalVerseCount) {
    fail(`ch${n}: highest verse number ${maxVerse} != traditionalVerseCount ${ch.traditionalVerseCount}`);
  }

  // declared counts must match the actual array
  if (ch.verseUnitCount !== ch.verses.length) {
    fail(`ch${n}: verseUnitCount ${ch.verseUnitCount} != ${ch.verses.length} verses`);
  }
  if (ch.traditionalVerseCount !== ch.verses.reduce((a, v) => a + (v.nEnd - v.n + 1), 0)) {
    fail(`ch${n}: traditionalVerseCount does not match the sum of its ranges`);
  }

  // content must actually be there
  for (const v of ch.verses) {
    if (!v.devanagari || !DEVANAGARI_RE.test(v.devanagari)) {
      fail(`ch${n} ${v.label}: devanagari missing or not Devanagari script`);
    }
    if (!v.iast) fail(`ch${n} ${v.label}: iast missing`);
    if (!v.iTrans) fail(`ch${n} ${v.label}: iTrans missing`);
  }

  // cross-check against the count the source itself states in its colophon
  if (ch.colophonItrans) {
    const m = ch.colophonItrans.match(/\|\|\s*(\d+)\s*\|\|/);
    if (m) {
      colophonStated[n] = parseInt(m[1], 10);
    } else {
      notes.push(`ch${n}: colophon present but carries no cumulative count`);
    }
  } else {
    notes.push(`ch${n}: this edition prints no evamAditaH colophon (it ends with a svasti verse)`);
  }

  unitTotal += ch.verseUnitCount;
  traditionalTotal += ch.traditionalVerseCount;
}

// the colophons are cumulative; the last one must equal the traditional total
const last = colophonStated[13];
if (last === undefined) {
  fail("chapter 13 has no cumulative colophon to check against");
} else if (last !== traditionalTotal) {
  fail(`colophon total ${last} != computed traditional total ${traditionalTotal}`);
}
for (let n = 2; n <= 13; n++) {
  if (colophonStated[n] !== undefined && colophonStated[n - 1] !== undefined) {
    const implied = colophonStated[n] - colophonStated[n - 1];
    const ch = load<Chapter>(join(dir, `${String(n).padStart(2, "0")}.json`));
    if (implied !== ch.traditionalVerseCount) {
      fail(`ch${n}: colophon delta ${implied} != chapter verse count ${ch.traditionalVerseCount}`);
    }
  }
}

// ---- angas ----------------------------------------------------------------
const angaDir = join(ROOT, "angas");
const expectedAngas = [
  "devi-kavacham", "argala-stotram", "kilaka-stotram", "chandika-dhyana",
  "devi-suktam", "aparadha-kshamapana",
];
for (const slug of expectedAngas) {
  const p = join(angaDir, `${slug}.json`);
  if (!existsSync(p)) { fail(`missing anga: ${slug}`); continue; }
  const a = load<{ verses: Verse[]; verseUnitCount: number }>(p);
  if (!a.verses.length) fail(`anga ${slug}: no verses`);
  for (const v of a.verses) {
    if (!DEVANAGARI_RE.test(v.devanagari)) fail(`anga ${slug} ${v.label}: devanagari missing`);
  }
}

// ---- the famous hymn must be addressable ----------------------------------
const ch5 = load<Chapter>(join(dir, "05.json"));
const yaDevi = ch5.verses.filter((v) => v.devanagari.includes("सर्वभूतेषु"));
if (yaDevi.length < 10) {
  fail(`expected the 'ya devi sarvabhuteshu' series in chapter 5, found ${yaDevi.length} verses`);
}

// ---- report ---------------------------------------------------------------
console.log(`chapters            : ${files.length}`);
console.log(`verse units         : ${unitTotal}`);
console.log(`traditional verses  : ${traditionalTotal}  (source colophon states ${last ?? "n/a"})`);
console.log(`angas               : ${expectedAngas.length}`);
console.log(`'ya devi' verses    : ${yaDevi.length}  (${yaDevi[0]?.label} … ${yaDevi[yaDevi.length - 1]?.label})`);
if (notes.length) {
  console.log("\nnotes:");
  for (const n of notes) console.log(`  · ${n}`);
}
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures.slice(0, 40)) console.error(`  ✗ ${f}`);
  if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
  process.exit(1);
}
console.log("\n✓ scripture content verified");
