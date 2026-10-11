/**
 * Content review — the administrative view of what is verified and what is not.
 *
 * This module exists because the corpus records its provenance in several
 * different fields, invented at different times: Peethas carry a
 * `verificationStatus` object, temples an `infoStatus` string, mantras a
 * `textStatus`, sources a `status`, and knowledge topics, stories and glossary
 * terms carry only a prose `source` or `sourceNote` with no status at all.
 *
 * The important consequence: **most editorial content has no verification
 * status field.** That absence is not "verified". It means nobody has reviewed
 * it, and this module reports it as `awaiting-review` rather than letting a
 * missing field read as a clean bill of health.
 *
 * Nothing here writes to the corpus. Review verdicts are recorded separately,
 * against a record id, in the same shape as the `content_review` table.
 */

import {
  getAngas,
  getChapters,
  getGlossaryTerms,
  getKnowledgeTopics,
  getMantras,
  getNavadurgaForms,
  getPeethas,
  getSources,
  getStories,
  getTemples,
} from "@/lib/content";
import type { ReviewVerdict } from "@/lib/types";

/** Which collection a reviewable record came from. */
export type ReviewCollection =
  | "scripture"
  | "angas"
  | "navadurga"
  | "peethas"
  | "temples"
  | "mantras"
  | "knowledge"
  | "stories"
  | "glossary"
  | "sources";

/**
 * How much the app can claim about a record.
 *
 * `verified` is only ever assigned where the content itself asserts it *and*
 * the corpus says how it was checked. Everything editorial lands in
 * `awaiting-review`.
 */
export type ReviewState =
  | "verified"
  | "verified-with-caveats"
  | "partially-verified"
  | "tradition-recorded"
  | "awaiting-verification"
  | "awaiting-review";

export interface ReviewItem {
  /** Stable identifier, namespaced by collection: `peethas:kamakhya`. */
  id: string;
  collection: ReviewCollection;
  title: string;
  /** Short locator, e.g. city or category. */
  sub?: string;
  /** Deep link into the public site. */
  href?: string;
  state: ReviewState;
  /** Provenance: where the material came from, as recorded. */
  provenance?: string;
  /** What was checked and how, where such a note exists. */
  verification?: string;
  /** Known limitations, as recorded. Never invented here. */
  caveats?: string[];
  /** True when the record is explicitly flagged as sample content. */
  sample: boolean;
  /** True when the record has no status field at all. */
  statusAbsent: boolean;
  confidence?: "high" | "medium" | "low";
}

/** Statuses the corpus is allowed to assert, in descending order of strength. */
const KNOWN_STATES: ReviewState[] = [
  "verified",
  "verified-with-caveats",
  "partially-verified",
  "tradition-recorded",
  "awaiting-verification",
  "awaiting-review",
];

/**
 * Narrow a free-text status to a known state.
 *
 * Unrecognised values are NOT upgraded to something stronger, and are not
 * silently dropped either: the caller keeps the raw string for display. Only an
 * exact match confers a state.
 */
export function narrowState(raw: unknown): ReviewState | null {
  if (typeof raw !== "string") return null;
  return (KNOWN_STATES as string[]).includes(raw) ? (raw as ReviewState) : null;
}

/**
 * Build the full review list.
 *
 * Deterministic and side-effect free, so it can be used both by the admin page
 * and by tests.
 */
export function buildReviewItems(): ReviewItem[] {
  const items: ReviewItem[] = [];

  for (const c of getChapters()) {
    items.push({
      id: `scripture:${c.id}`,
      collection: "scripture",
      title: `Chapter ${c.number}: ${c.titleEnglishEditorial}`,
      sub: `${c.traditionalVerseCount} verses · ${c.charitraLabel}`,
      href: `/scripture/${c.number}`,
      state: "verified",
      provenance: c.sourceRef,
      verification:
        "verify:scripture asserts chapter count, verse-unit continuity and the 700-verse colophon total on every build.",
      caveats: c.colophonDevanagari
        ? [`Colophon: ${c.colophonDevanagari}`]
        : undefined,
      sample: false,
      statusAbsent: false,
    });
  }

  for (const a of getAngas()) {
    items.push({
      id: `angas:${a.slug}`,
      collection: "angas",
      title: a.titleEnglish,
      sub: `${a.kind} · ${a.traditionalVerseCount} verses`,
      href: `/scripture/angas/${a.slug}`,
      // Angas carry a sourceRef but no status field.
      state: "awaiting-review",
      provenance: a.sourceRef,
      caveats: a.note ? [a.note] : undefined,
      sample: false,
      statusAbsent: true,
    });
  }

  for (const f of getNavadurgaForms()) {
    items.push({
      id: `navadurga:${f.slug}`,
      collection: "navadurga",
      title: f.nameTransliterated,
      sub: `Day ${f.day} · ${f.nameDevanagari}`,
      href: `/navadurga/${f.slug}`,
      // Editorial profiles. The name and mantra are traditional; the prose
      // around them is authored for this app and unreviewed.
      state: "awaiting-review",
      provenance: f.scriptureRef,
      sample: Boolean(f.sampleContent),
      statusAbsent: true,
      caveats: f.regionalVariationNote ? [f.regionalVariationNote] : undefined,
    });
  }

  for (const p of getPeethas()) {
    const vs = p.verificationStatus;
    items.push({
      id: `peethas:${p.slug}`,
      collection: "peethas",
      title: p.templeName,
      sub: [p.location?.city, p.location?.country].filter(Boolean).join(", "),
      href: `/shakti-peethas/${p.slug}`,
      state: narrowState(vs?.status) ?? "awaiting-review",
      provenance: p.traditionNote,
      verification: vs?.note,
      sample: Boolean(p.sampleContent),
      statusAbsent: !vs,
      confidence: p.confidence,
      caveats: vs?.lastChecked ? undefined : ["Location never re-checked against a primary source."],
    });
  }

  for (const t of getTemples()) {
    items.push({
      id: `temples:${t.slug}`,
      collection: "temples",
      title: t.name,
      sub: [t.city, t.region].filter(Boolean).join(", "),
      href: `/temples/${t.slug}`,
      // infoStatus is free text ("unverified"), not a VerificationStatus.
      state: narrowState(t.infoStatus) ?? "awaiting-verification",
      provenance: t.note,
      verification: t.infoNote,
      sample: Boolean(t.sampleContent),
      statusAbsent: !t.infoStatus,
      caveats: [
        "Opening hours, official website and contact details are null: unverified.",
      ],
    });
  }

  for (const m of getMantras()) {
    items.push({
      id: `mantras:${m.slug}`,
      collection: "mantras",
      title: m.title,
      sub: m.category,
      href: `/mantras/${m.slug}`,
      // textStatus values are things like "verified-traditional" and
      // "not-included", which are not VerificationStatus values.
      state:
        m.textStatus === "verified-traditional"
          ? "tradition-recorded"
          : m.textStatus === "not-included"
            ? "awaiting-verification"
            : "awaiting-review",
      provenance: m.attribution,
      sample: false,
      statusAbsent: !m.textStatus,
      caveats:
        m.textStatus === "not-included"
          ? ["Full text deliberately not included; attribution only."]
          : undefined,
    });
  }

  for (const k of getKnowledgeTopics()) {
    items.push({
      id: `knowledge:${k.slug}`,
      collection: "knowledge",
      title: k.title,
      sub: k.tagline,
      href: `/maa-durga/${k.slug}`,
      state: "awaiting-review",
      provenance: k.source,
      sample: false,
      statusAbsent: true,
    });
  }

  for (const s of getStories()) {
    items.push({
      id: `stories:${s.slug}`,
      collection: "stories",
      title: s.title,
      sub: s.age ? `For ${s.age}` : undefined,
      href: `/stories/${s.slug}`,
      state: "awaiting-review",
      provenance: s.sourceNote,
      sample: false,
      statusAbsent: true,
    });
  }

  for (const g of getGlossaryTerms()) {
    items.push({
      id: `glossary:${g.id}`,
      collection: "glossary",
      title: g.english ?? g.devanagari ?? g.id,
      sub: g.devanagari,
      href: "/learn/glossary",
      state: "awaiting-review",
      sample: false,
      statusAbsent: true,
    });
  }

  for (const src of getSources()) {
    items.push({
      id: `sources:${src.id}`,
      collection: "sources",
      title: src.title,
      sub: src.kind,
      href: "/sources",
      state: narrowState(src.status) ?? "awaiting-verification",
      provenance: src.provenance ?? src.author,
      verification: src.verification,
      sample: false,
      statusAbsent: !src.status,
      caveats: src.caveats,
    });
  }

  return items;
}

/** Tally of review states, for the summary cards. */
export function summarise(items: ReviewItem[]): {
  total: number;
  byState: Record<ReviewState, number>;
  byCollection: Record<ReviewCollection, number>;
  /** Records with no status field at all — the weakest provenance. */
  statusAbsent: number;
  /** Records explicitly flagged as sample content. */
  sample: number;
} {
  const byState = {
    verified: 0,
    "verified-with-caveats": 0,
    "partially-verified": 0,
    "tradition-recorded": 0,
    "awaiting-verification": 0,
    "awaiting-review": 0,
  } as Record<ReviewState, number>;

  const byCollection = {} as Record<ReviewCollection, number>;

  let statusAbsent = 0;
  let sample = 0;

  for (const it of items) {
    byState[it.state] = (byState[it.state] ?? 0) + 1;
    byCollection[it.collection] = (byCollection[it.collection] ?? 0) + 1;
    if (it.statusAbsent) statusAbsent += 1;
    if (it.sample) sample += 1;
  }

  return { total: items.length, byState, byCollection, statusAbsent, sample };
}

// The verdict shape lives with the other persisted user state, so the review
// console and the store cannot drift apart.
export type { ReviewVerdict };
