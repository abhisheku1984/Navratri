# NAVRATRI — The Divine Shakti

*Discover Maa Durga. Explore Sacred Scriptures. Experience the Power of Shakti.*

A digital library and pilgrimage companion for the study of Maa Durga, the Durga
Saptashati, and the Shakti Peethas.

## What this is

Not a landing page. It is a working application: real navigation, a complete
imported scripture with a verse-level reader, a 60-site Peetha directory with an
interactive map, a computed panchang, a full-text search across the whole
corpus, bookmarks, reading progress, quizzes, flashcards and a citation-first
assistant.

179 routes pre-render at build time. It runs with no database, no API key and no
environment variables set.

```bash
npm ci
npm run verify     # scripture check + typecheck + lint + 239 tests
npm run build
npm start          # 0.0.0.0:3000
```

## The content, and what is actually verified

The complete Durga Saptashati is imported: **13 chapters, 656 verse units, 700
traditional verses matching the source colophon**, plus 6 auxiliary recitations
(Devi Kavacham, Argala, Kilaka, Devi Suktam, Aparadha Kshamapana, Chandika
Dhyana). `npm run verify:scripture` enforces these counts and fails the build on
any mismatch.

Sanskrit is imported from a volunteer transcription of the Markandeya Purana;
the English is F. Eden Pargiter, 1904, public domain. Both are attributed on
`/sources`.

Where the record is incomplete, the app says so rather than papering over it:

- **Chapter 13 of the English witness is truncated.** It is marked
  `partial_witness` and rendered as an explicit gap. No prose is invented to
  fill it.
- **There is no verse-level English alignment.** The OCR verse numbers are
  corrupt, so English appears as chapter-level prose. The reader never places an
  English line beside a verse that was never verified against it.
- **No audio ships.** Not one recording. `AudioPlayer` renders an explicit "no
  audio configured" card rather than implying playback exists.
- **Temple websites, darshan timings and opening hours are null**, because they
  have not been verified. Inventing them would be worse than leaving them empty.

`docs/INCOMPLETE.md` is the full and deliberately unflattering list.

## Three positions this app takes

**There is no single agreed list of Shakti Peethas.** The 18, 51, 52 and
regional enumerations are stored as a many-to-many membership, not an enum. A
site can belong to several lists or none. Body-part attributions are a separate
table with a `tradition` column, because recensions disagree. Sites in
Bangladesh, Nepal, Pakistan and Sri Lanka are included — sacred geography is not
bounded by modern nation states.

**No muhurat is hard-coded.** Tithi, nakshatra and Navratri dates are computed
from astronomical algorithms for the selected city, and the method is labelled in
the UI. The limits are disclosed too: low-precision series, tropical rather than
sidereal longitude, and day-level rather than intra-day timing.

**Progress is never merit.** Reading position and quiz scores are stored
locally. Nothing anywhere converts app usage into a claim of spiritual progress,
a streak reward, or a promise of blessing.

## Devi Gyan

A retrieval-first assistant. It searches the curated content, cites specific
chapters, verses and publications, and distinguishes verified scripture from
editorial commentary. It refuses medical, pregnancy, financial and legal
questions, refuses when retrieval finds nothing, and never promises cures or
outcomes.

With no provider configured — the shipped state — it returns cited passages and
writes no prose of its own. That is not a degraded mode: nothing generated means
nothing invented.

The guardrails live in code, not only in a prompt. Two real defects here were
caught by tests and are worth recording: a guardrail loop that returned
unconditionally and so refused *every* question, and a word-boundary bug that
meant `pregnan\b` never matched "pregnant".

## Search

Runs entirely in the browser against a bundled index. Nothing you type is sent
anywhere, and it works with the network down.

It searches Devanagari and Latin together, which required two normalisations
with traps worth knowing about:

- Diacritic folding is restricted to the Latin combining-marks range. Unicode's
  `\p{Diacritic}` also covers Devanagari signs — using it turns `शब्दिता` into
  `शबदिता` and destroys the script this app exists to search.
- Devanagari queries are stemmed, because `कालरात्री` is not a substring of the
  `कालरात्रिश्च` that appears in the Kavacham. The *query* is reduced; the
  imported text is never altered.

## Layout

```
src/content/      normalised JSON — the corpus, 944 KB
src/lib/          content access layer, search, i18n, panchang, user state
src/components/   ornaments, UI primitives, reader, interactive widgets
src/app/          37 route files
scripts/          Python importers, scripture verifier, icon generator
db/               schema.sql and a dependency-free seed script
docs/             DATA_MODEL, DEPLOYMENT, INCOMPLETE
tests/            239 tests
```

Content is reachable only through `src/lib/content/index.ts`. That indirection
is what lets the same data come from Postgres later without touching a component.

## Documentation

- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — the content model, and why
  disagreement and absence are stored deliberately
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — build, environment variables,
  hosting, the optional database
- [`docs/INCOMPLETE.md`](docs/INCOMPLETE.md) — what is not built, what is
  partial, and what depends on the outside world

## Licence

The underlying Sanskrit of the Markandeya Purana is public domain. The
volunteer transcription carries a restriction: it is for personal study and
research, and is not to be reposted or used commercially without permission.
That restriction is recorded in the sources registry and surfaced on `/sources`.

Pargiter's 1904 translation is public domain. Editorial content — stories,
explanations, glossary, guides — is authored for this application and is marked
`awaiting-review`. It has not been through independent scholarly review.

Application code is unlicensed pending a decision by the maintainer.
