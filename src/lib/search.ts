/**
 * Global search over the whole content library.
 *
 * A plain inverted index built once per process from the normalised content.
 * It indexes Devanagari and Latin together, so "kalaratri", "कालरात्रि" and
 * "5.14" all resolve. No external service and no API key, and nothing the user
 * types leaves the device.
 *
 * Deliberately simple: the corpus is ~1 MB and the query volume is a single
 * user typing. A database FTS index is the production path (see
 * db/schema.sql), and this module defines the interface it must satisfy.
 */
import {
  getAngas, getChapters, getGlossaryTerms, getKnowledgeTopics, getMantras,
  getNavadurgaForms, getPeethas, getQuizzes, getStories, getTemples,
} from "@/lib/content";

export type SearchKind =
  | "chapter" | "verse" | "anga" | "navadurga" | "peetha" | "temple"
  | "mantra" | "story" | "topic" | "glossary" | "festival";

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  /** Secondary line: subtitle, verse label, location. */
  sub?: string;
  /** The matched excerpt, already trimmed to a window around the match. */
  excerpt: string;
  href: string;
  score: number;
}

interface Doc {
  kind: SearchKind;
  id: string;
  title: string;
  sub?: string;
  href: string;
  /** Names, titles and other identifying text, searched with a high weight. */
  fields: string[];
  /**
   * Long-form prose: verse Devanagari and IAST, a story's full text, an
   * editorial explanation. Searched, but weighted below `fields` so that a
   * name or a title still outranks a passing mention deep in a paragraph.
   *
   * This field is what makes verse-level search work at all. A verse has no
   * title of its own — only its text — so without it the 656 verses in the
   * index are searchable by number and by nothing else.
   */
  body?: string;
}

let _docs: Doc[] | null = null;

function excerptFrom(text: string, q: string, width = 150): string {
  const flat = text.replace(/\s+/g, " ").trim();
  // locate the match on folded text, then slice the original so the excerpt
  // still shows real diacritics and real Devanagari
  const i = fold(flat).indexOf(fold(q));
  if (i === -1) return flat.slice(0, width) + (flat.length > width ? "…" : "");
  const start = Math.max(0, i - 50);
  const end = Math.min(flat.length, i + width);
  return (start > 0 ? "…" : "") + flat.slice(start, end) + (end < flat.length ? "…" : "");
}

/** Relative weight of a body match against a field match. */
const BODY_WEIGHT = 0.35;

/**
 * Diacritic folding, restricted to the Latin combining-marks block.
 *
 * IAST carries marks that a plain keyboard does not produce: "devī" is typed
 * "devi", "Kālarātri" is typed "kalaratri". Folding both the index and the
 * query makes those queries work.
 *
 * The range is deliberately narrow. Unicode's \p{Diacritic} class also covers
 * Devanagari signs — folding with it turns "शब्दिता" into "शबदिता" and
 * destroys exactly the script this app exists to search. Devanagari is left
 * untouched here, so "कालरात्री" still matches "कालरात्री".
 *
 * A genuine transliteration-scheme difference is not folded: IAST "ṣ" and
 * ITRANS "sh" are different systems, and conflating them would blur the
 * distinction between śa, ṣa and sa. The scripture reader offers both scripts
 * side by side rather than guessing which scheme the user meant.
 */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * A second, looser Latin fold used only as a fallback.
 *
 * The verse text is stored in IAST ("sarvabhūteṣu"), but readers type the
 * popular romanisation ("sarvabhuteshu"), and the app's own mantra slug uses
 * that spelling. Without this, a perfectly reasonable query finds nothing.
 *
 * It collapses "sh" to "s", which merges śa, ṣa and sa. That is a real loss
 * of phonetic precision, so it is a fallback scored below an exact fold: if
 * the precise spelling matches, that score wins and the loose one adds
 * nothing. Devanagari is unaffected — it contains no Latin "sh".
 */
function looseFold(s: string): string {
  return fold(s).replace(/sh/g, "s");
}

const DEVANAGARI = /[\u0900-\u097F]/;
/** Dependent vowel signs, virama, anusvara and nukta — the inflectional tail. */
const DEVA_TAIL = /[\u0901-\u0903\u093A-\u094D\u0951-\u0957\u0962\u0963]+$/;

/**
 * Candidate stems for a Devanagari token, longest first.
 *
 * Sanskrit is heavily inflected and the same word reaches the index in many
 * shapes. The Navadurga name is stored as कालरात्रि, the Kavacham verse reads
 * कालरात्रिश्च, the dhyana verse कालरात्रिर्भयङ्करी — and a reader types
 * कालरात्री. None of those is a literal substring of another, so exact
 * matching finds nothing.
 *
 * Rather than alter the imported text to suit the search, the *query* is
 * reduced: the inflectional tail (vowel signs, virama, anusvara) is stripped
 * and the remaining stem is matched as a prefix. That resolves all four
 * spellings to one stem without inventing a reading the source does not have.
 *
 * Only Devanagari tokens are stemmed. Latin IAST has real ambiguity in its
 * endings and a crude stem would blur distinct words.
 */
function devaStems(token: string): string[] {
  if (!DEVANAGARI.test(token)) return [];
  const stems: string[] = [];
  let s = token;
  // strip at most three trailing marks so a short stem cannot collapse to noise
  for (let i = 0; i < 3; i++) {
    const next = s.replace(DEVA_TAIL, "");
    if (next === s) break;
    s = next;
    if (s.length >= 4) stems.push(s);
  }
  return stems;
}

export function buildIndex(): Doc[] {
  if (_docs) return _docs;
  const docs: Doc[] = [];

  for (const c of getChapters()) {
    docs.push({
      kind: "chapter", id: c.id, title: `Chapter ${c.number}: ${c.titleEnglishEditorial}`,
      sub: `${c.charitraLabel} · ${c.presidingDeity} · ${c.traditionalVerseCount} verses`,
      href: `/scripture/${c.number}`,
      fields: [
        `chapter ${c.number} ${c.slug} ${c.titleEnglishEditorial} ${c.titleSanskrit} ${c.titleIast} ${c.charitraLabel} ${c.presidingDeity}`,
        c.titleItrans,
      ],
      body: `${c.viniyoga.devanagari ?? ""} ${c.dhyana.devanagari ?? ""}`,
    });
    for (const v of c.verses) {
      docs.push({
        kind: "verse", id: `${c.id}:${v.label}`, title: `Verse ${v.label}`,
        sub: `Chapter ${c.number} · ${c.titleEnglishEditorial}`,
        href: `/scripture/${c.number}#${v.label}`,
        fields: [`${v.label} ${c.number}.${v.n}`],
        // the verse text itself: Devanagari for Devanagari queries,
        // IAST for transliterated ones
        body: `${v.devanagari} ${v.iast}`,
      });
    }
  }

  for (const a of getAngas()) {
    docs.push({
      kind: "anga", id: a.id, title: a.titleEnglish,
      sub: `${a.kind === "purvanga" ? "Purvanga" : "Uttaranga"} · ${a.verseUnitCount} verses`,
      href: `/scripture/angas/${a.slug}`,
      fields: [`${a.titleEnglish} ${a.titleSanskrit} ${a.titleIast} ${a.titleItrans}`, a.note],
      body: a.verses.map((v) => `${v.devanagari} ${v.iast}`).join(" "),
    });
  }

  for (const f of getNavadurgaForms()) {
    docs.push({
      kind: "navadurga", id: f.id, title: `${f.nameDevanagari} · ${f.nameTransliterated}`,
      sub: `Day ${f.day} · ${f.meaning}`,
      href: `/navadurga/${f.slug}`,
      fields: [
        `${f.nameDevanagari} ${f.nameHindi} ${f.nameTransliterated} ${f.meaning} day ${f.day} ${f.colour}`,
      ],
      body: `${f.originStory} ${f.iconography} ${f.qualities.join(" ")} ` +
            `${f.dhyanaVerse.devanagari ?? ""} ${f.navarnaMantra.transliteration} ` +
            `${f.familyStory} ${f.regionalVariationNote}`,
    });
  }

  for (const p of getPeethas()) {
    docs.push({
      kind: "peetha", id: p.id, title: p.templeName,
      sub: `${p.goddessName} · ${p.location.city}, ${p.location.country}`,
      href: `/shakti-peethas/${p.slug}`,
      fields: [
        `${p.templeName} ${p.goddessName} ${p.bhairava ?? ""} ${p.associatedBodyPart ?? ""} ` +
        `${p.location.city} ${p.location.region} ${p.location.country} ${p.lists.join(" ")}`,
      ],
      body: `${p.traditionNote} ${p.story}`,
    });
  }

  for (const t of getTemples()) {
    docs.push({
      kind: "temple", id: t.id, title: t.name,
      sub: `${t.city}, ${t.country} · ${t.kind === "shakti-peetha" ? "Shakti Peetha" : "Devi temple"}`,
      href: `/temples/${t.slug}`,
      fields: [`${t.name} ${t.city} ${t.region} ${t.country} ${t.kind} ${t.festivals.join(" ")}`],
      body: t.note,
    });
  }

  for (const m of getMantras()) {
    docs.push({
      kind: "mantra", id: m.slug, title: m.title,
      sub: `${m.category} · ${m.deva}`,
      href: `/mantras/${m.slug}`,
      fields: [`${m.title} ${m.deva} ${m.iast} ${m.category} ${m.attribution}`],
      body: `${m.meaning} ${m.pronunciation} ` +
            m.wordMeaning.map(([a, b]) => `${a} ${b}`).join(" "),
    });
  }

  for (const s of getStories()) {
    docs.push({
      kind: "story", id: s.slug, title: s.title,
      sub: `${s.titleHi} · ages ${s.age} · ${s.minutes} min`,
      href: `/stories/${s.slug}`,
      fields: [`${s.title} ${s.titleHi} ${s.age} ${s.moral}`],
      body: `${s.short} ${s.long} ${s.sourceNote}`,
    });
  }

  for (const t of getKnowledgeTopics()) {
    docs.push({
      kind: "topic", id: t.slug, title: t.title,
      sub: `${t.titleHi} · ${t.tagline}`,
      href: `/maa-durga/${t.slug}`,
      fields: [`${t.title} ${t.titleHi} ${t.tagline} ${t.characters.join(" ")} ${t.places.join(" ")}`],
      body: `${t.story} ${t.detail.map(([a, b]) => `${a} ${b}`).join(" ")} ` +
            `${t.significance} ${t.childVersion} ${t.source}`,
    });
  }

  for (const g of getGlossaryTerms()) {
    docs.push({
      kind: "glossary", id: g.id, title: g.english,
      sub: `${g.devanagari} · ${g.definition}`,
      href: `/learn/glossary#${g.id}`,
      fields: [`${g.english} ${g.devanagari}`],
      body: g.definition,
    });
  }

  for (const q of getQuizzes()) {
    for (const question of q.questions) {
      docs.push({
        kind: "festival", id: `${q.id}:${question.q.slice(0, 16)}`, title: question.q,
        sub: q.title, href: `/learn/quiz/${q.id}`,
        fields: [question.q, question.options.join(" ")],
        body: question.why,
      });
    }
  }

  _docs = docs;
  return docs;
}

/**
 * Cheap token overlap score; exact substring matches dominate.
 *
 * Fields are weighted by position, the first strongest. Body matches score
 * a fraction of a field match so that "Kamakhya" still puts the Peetha above
 * an editorial page that happens to mention it.
 */
function scoreDoc(doc: Doc, foldedQuery: string, tokens: string[]): number {
  let score = 0;

  // a stem match is worth less than an exact one, so an exact spelling always wins
  const stemScore = (haystack: string, token: string): number => {
    for (const stem of devaStems(token)) {
      if (haystack.includes(stem)) return 8;
    }
    return 0;
  };

  doc.fields.forEach((field, i) => {
    const weight = 1 / (1 + i * 0.6);
    const fl = fold(field);
    if (!fl) return;
    if (fl.includes(foldedQuery)) score += 40 * weight;
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (fl.includes(t)) score += 12 * weight;
      else if (fl.split(/\s+/).some((w) => w.startsWith(t))) score += 6 * weight;
      else score += stemScore(fl, t) * weight;
    }
  });

  if (doc.body) {
    const bl = fold(doc.body);
    if (bl.includes(foldedQuery)) score += 40 * BODY_WEIGHT;
    const loose = looseFold(doc.body);
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (bl.includes(t)) score += 12 * BODY_WEIGHT;
      else if (loose.includes(looseFold(t))) score += 9 * BODY_WEIGHT;
      else score += stemScore(bl, t) * BODY_WEIGHT;
    }
  }

  const title = fold(doc.title);
  if (title.includes(foldedQuery)) score += 30;
  if (doc.sub && fold(doc.sub).includes(foldedQuery)) score += 10;
  return score;
}

export function search(query: string, limit = 40): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const docs = buildIndex();
  // tokens are folded so that "devi" matches "devī" and vice versa
  const tokens = fold(q).split(/\s+/).filter(Boolean);
  const foldedQuery = tokens.join(" ");
  const hits: SearchHit[] = [];

  for (const d of docs) {
    const s = scoreDoc(d, foldedQuery, tokens);
    if (s <= 0) continue;
    hits.push({
      kind: d.kind, id: d.id, title: d.title, sub: d.sub,
      href: d.href, score: s,
      excerpt: excerptFrom(`${d.fields.join(" ")} ${d.body ?? ""}`, tokens[0] ?? q),
    });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const h of hits) {
    if (out.length >= limit) break;
    const key = `${h.kind}:${h.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

/**
 * Counts for the result-type filter row.
 *
 * With no query it counts the whole index (the "what can I search" state).
 * With a query it counts actual matches per kind, which is what the filter
 * chips display.
 */
export function searchCounts(query = ""): { total: number; byKind: Record<string, number> } {
  const q = query.trim();
  if (!q) {
    const docs = buildIndex();
    const byKind: Record<string, number> = {};
    for (const d of docs) byKind[d.kind] = (byKind[d.kind] ?? 0) + 1;
    return { total: docs.length, byKind };
  }
  const byKind: Record<string, number> = {};
  let total = 0;
  for (const h of search(q, 5000)) {
    byKind[h.kind] = (byKind[h.kind] ?? 0) + 1;
    total += 1;
  }
  return { total, byKind };
}
