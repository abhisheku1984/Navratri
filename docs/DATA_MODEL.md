# Data model

## The short version

Content lives as normalised JSON in `src/content/`. Everything reads it through
one module, `src/lib/content/index.ts`. Nothing in the UI touches the JSON
directly.

That single indirection is what makes the database path possible: `db/schema.sql`
expresses the same model relationally, and moving to Postgres means writing an
adapter that satisfies the same accessor signatures — not rewriting components.

## Why JSON and not the database, today

Two reasons, both practical:

1. **Client components.** The calendar, the Peetha and temple directories,
   search and the glossary are client components. A `node:fs` read cannot be
   bundled for the browser. Static JSON imports work in both places, and let the
   bundler drop what a route never asks for.
2. **Serverless with no writable filesystem.** Static imports mean the corpus is
   versioned into the build.

The trade-off is bundle size: a client-rendered filterable directory ships its
directory. `/shakti-peethas` carries 281 KB first-load JS. Search, which must
index the whole corpus locally, carries 276 KB. That is the cost of search that
works with no server and no network.

## The three rules behind every table

### 1. Nothing is asserted without a source

Every content record carries a source, a verification status, and — where a
check happened — a reviewer and a date. In the schema, `source.licence` is
`NOT NULL`: no source may be used without a recorded licence.

### 2. Disagreement is stored, not resolved

Where traditions differ, the model holds both readings.

- `peetha_list_membership` is many-to-many, not an enum. A site can belong to
  the 51 tradition and the regional tradition at once, and to neither of the 18.
- `body_part_attribution` is a table with a `tradition` column, not a column on
  `peetha`. Different recensions disagree about which part fell where; a single
  column would force a false choice.
- `knowledge_topic.claim_class` separates scriptural narrative, regional
  tradition, symbolic reading and historical research.

### 3. Translations are separate from text

`scripture_verse` holds Sanskrit. `verse_translation` / `translation_paragraph`
hold one reading by one named translator. A translation is never written back
into the source text, and an absent translation row means the app says so rather
than filling the gap.

`translation_paragraph.verse_start` and `verse_end` are nullable *on purpose*.
They stay null until a qualified reviewer aligns the prose to a verse range. The
Pargiter OCR has corrupt verse numbers, so those columns are null for all 198
imported paragraphs — which is exactly why the reader shows English as
chapter-level prose and never beside a specific verse.

## Absence is meaningful

Several columns are null by design, and the UI renders the absence as a
statement rather than a blank:

| Field | Null means |
|---|---|
| `peetha.official_website`, `darshan_timings` | Not verified. Never estimated. |
| `temple.opening_hours`, `contact` | Not verified. |
| `navadurga_verse.devanagari` where `status = 'not-included'` | The text is deliberately withheld for want of a reliable source. |
| `peetha.lat` / `lon` | Location unresolved. The map says so instead of plotting a guess. |
| `translation_paragraph.reviewer` | No qualified review yet. |

There is a `CHECK` constraint pairing `lat` and `lon` so a half-populated
coordinate cannot exist.

## Content that must never be invented

The importer and the schema both refuse to guess:

- No verse is generated to fill a gap in a translation. Chapter 13 of the
  English witness is truncated; it is marked `partial_witness` and rendered as
  an explicit gap.
- No mantra text is substituted for a similar-looking one. Two mantras carry
  `text_status = 'not-included'` with a note explaining why.
- No audio row can exist without a licence.
- No muhurat is stored. Timings are computed per location at request time.

## Verification status vocabulary

| Status | Meaning |
|---|---|
| `verified` | Checked against a named edition by a named reviewer. |
| `partially-verified` | Some fields checked, others not. |
| `awaiting-review` | Authored or imported; no reviewer yet. |
| `tradition-recorded` | Accurately records a tradition. Not a factual claim that can be "verified". |
| `disputed` | Sources disagree; both readings are stored. |

`tradition-recorded` is the important one. Most Peetha attributions are not
propositions with a truth value — they are what a tradition holds. Marking them
"unverified" would be misleading in the other direction, implying they are
doubtful rather than that they are of a different kind.

## Access layer

`src/lib/content/index.ts` is the only entry point. Its accessors return typed
collections and single records:

```ts
getChapters() / getChapter(nOrSlug) / getManifestEntry(n) / getChapterIndex()
getAngas() / getAnga(slug)
getTranslations(lang) / getTranslation(chapter)
getNavadurgaForms() / getNavadurgaForm(slug) / getNavadurgaByDay(day)
getPeethas() / getPeetha(slug) / getPeethaCollection()
getTemples() / getTemple(slug)
getKnowledgeTopics() / getKnowledgeTopic(slug)
getMantras() / getMantra(slug)
getStories() / getStory(slug)
getPujaGuides() / getPujaGuide(slug)
getGlossaryTerms() / getQuizzes() / getQuiz(id)
getFestivals() / getLocations() / getSources()
```

**A warning learned the hard way:** changing an accessor's return type from a
collection to an array silently breaks consumers. `getQuizzes()` returning an
array broke `search.ts`, which expected `.quizzes`, and nothing failed until
`tsc` ran. If you change a signature, run `npm run typecheck` before you trust
anything.

## Search

Two implementations of one interface, and they will drift:

- `src/lib/search.ts` — in-memory, bundled, works offline. This is what the app
  uses.
- `search_document.tsv` — a Postgres generated `tsvector`, defined but unused.

The in-memory scorer matches three ways, in descending weight:

1. **Fields** (names, titles, labels) — weighted by position.
2. **Body** (verse text, editorial prose) — weighted at 0.35 of a field match,
   so a title outranks a passing mention.
3. **Folded and stemmed fallbacks.**

Two normalisations make Indic search work, and both have traps worth recording:

- **Diacritic folding** is restricted to the Latin combining-marks block
  (`\u0300-\u036f`). Unicode's `\p{Diacritic}` class *also covers Devanagari
  signs* — folding with it turns `शब्दिता` into `शबदिता` and destroys the
  script the app exists to search.
- **Devanagari stemming** strips the inflectional tail from the *query*, not the
  index. `कालरात्री` (nominative) is not a substring of `कालरात्रिश्च`
  (Kavacham) or `कालरात्रिर्भयङ्करी` (dhyana), so exact matching finds nothing.
  Reducing the query resolves all of them without altering the imported text.

A looser Latin fold maps `sh` → `s` as a *fallback only*, so ITRANS
"sarvabhuteshu" finds IAST "sarvabhūteṣu". It merges śa, ṣa and sa, which is a
real loss of precision — hence scored below an exact match.

## Panchang

`src/lib/panchang/` computes tithi, nakshatra, yoga and Navratri dates from
astronomical algorithms. Nothing is hard-coded.

The derivation rules that took the most iteration to get right:

- **Day 1 is the first sunrise of the first shukla paksha inside the window.**
  It is *not* "the first sunrise whose tithi is 1". That phrasing fails twice:
  a window wider than a lunar month contains two Pratipadas and silently takes
  whichever comes first, and a skipped (kshaya) Pratipada is never reported by
  any sunrise at all. The anchor is therefore detected as a *change of paksha*,
  which is correct in both cases.
- **Vijayadashami is the Dashami of that same paksha — determined by tithi,
  never by counting, and never sought past the end of the fortnight.** Counting
  breaks whenever a tithi repeats or is skipped; an unbounded search for Dashami
  walks into the next lunar month when Dashami is itself skipped.
- **The Navadurga form follows the tithi, not a running day counter.** A counter
  puts every subsequent form off by one after a repeated tithi.
- The observance is nine tithis, so the days end at Navami whether or not a
  Dashami sunrise follows.
- The scan extends one day *before* the window (so the first day has a
  predecessor to compare against) and fifteen days *past* it (so a late Dashami
  is still found). The later extension is for the terminator only — anchoring
  inside it is how the engine once reported Chaitra 2026 a month late.

`NavratriWindow.unobservedDeviIds` reports forms the window genuinely does not
observe. Chaitra 2026 and Sharad 2027 both skip Pratipada, so Shailaputri is
unobserved in each — eight forms, not nine. The UI states this rather than
renumbering, and Chaitra 2027's skipped Dashami is reported in the method note.

## Seeding

```bash
node db/seed.mjs --dry-run > seed.sql     # inspect
node db/seed.mjs --dry-run | psql "$DATABASE_URL"
```

The seed script has no dependencies and applies quoting that escapes single
quotes per the SQL standard. It emits `ON CONFLICT DO NOTHING`, so it is
re-runnable.

Row counts it currently produces, which match the verified corpus: 13 chapters,
656 verses, 6 auxiliary recitations, 122 auxiliary verses, 9 Navadurga forms,
60 Peethas, 28 temples, 10 knowledge topics, 11 mantras, 6 stories, 4 puja
guides, 41 glossary terms, 20 quiz questions, 18 locations.

One shape difference to watch: **auxiliary verses have no `nEnd` field** and
their `n` and `padas` arrive as strings from the importer, unlike chapter verses
where both are integers. The seed script coerces them.
