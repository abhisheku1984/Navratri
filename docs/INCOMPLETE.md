# Incomplete and externally dependent features

This document exists so that nobody — including a future maintainer who did not
write this code — mistakes an intention for an implementation. Every item below
is either not built, built only partly, or dependent on something outside this
repository.

The rule applied throughout: **if it is not implemented and tested, the app
says so rather than implying it works.**

## Not implemented at all

### Audio — recitation, pronunciation and meditation
No audio ships. Not one recording. The reasons are licensing, not effort:
recitations of the Durga Saptashati and of individual mantras are performances
with rights holders, and the app will not present unlicensed recordings as if
they were free to use.

`AudioPlayer` in `src/components/interactive.tsx` renders an explicit "no audio
configured" card. The `audio_asset` table exists in `db/schema.sql` and requires
a non-null `licence` column, so audio cannot be added without recording its
licence.

Consequences, stated plainly:
- The "pronunciation guide" on mantra and Navadurga pages is **text only**.
- The audio/meditation section of the home page offers nothing to play.
- Read-aloud is **not implemented** (see below).

### Read-aloud
**Implemented with the device's own speech synthesis** (`src/components/speech.tsx`).
No recording ships with the app — recitation audio needs rights holders'
permission, and none is granted — so read-aloud uses `speechSynthesis`, which
needs no licensing and no network. A button appears on each scripture verse
(reads the Devanagari with the closest Hindi voice) and on each story (reads
the full retelling). Voice selection and text normalisation are covered by
tests; browsers without speech support get an explanatory disabled control.

**Not verifiable here:** actual pronunciation. Quality is entirely the device's
voices; Devanagari only sounds right with a Hindi-capable voice installed. The
UI says "read aloud with your device's voice" and never implies a human
recitation.


### Voice search
Not implemented.

### Offline / PWA
**Implemented as opt-in "selected offline".** A web manifest and a service
worker (`public/sw.js`) ship in `public/`, original icons are generated from the
app's own SVG ornament by `scripts/build-icons.mjs`, and the layout wires in the
manifest and icon links. The worker is registered only when the reader switches
"Offline reading" on in Settings, so the default experience stays a plain
server-rendered site.

Caching policy, asserted by test: content-hashed `/_next/static/` and `/icons/`
are cache-first; same-origin page navigations are network-first with cache
fallback (fresh online, last copy offline); the health endpoint is never cached;
cross-origin requests are never intercepted. A message protocol (`CACHE_URLS`,
`CACHE_DROP`, `CACHED_LIST`) lets a reader pin or drop specific pages — the
scripture reader offers a "Pin Chapter N for offline" button.

**What could not be verified here, stated plainly: actual offline behaviour.**
There is no browser in this sandbox, so the worker's cache behaviour, install
prompts and pin round-trips were not exercised end-to-end — only the artefacts'
coherence (manifest fields, icon existence, worker parseability, the strategy
strings) and the client/provider logic were tested. Treat offline as implemented
but not yet browser-verified. Pinning while online and opening a page once is
the reliable path, and the UI says so.

### Downloadable reading packs
Not implemented.

### Accounts and sync
Not implemented. There is no authentication, no session, no user table in use.
`app_user` and friends exist in the schema but nothing reads or writes them.

This is why **no personal information is ever requested**. No birth details, no
email, no location permission. The location selector is a list of cities with
published coordinates used for panchang computation; it is not geolocation.

### User-generated content
Not implemented, deliberately. There is no comment, review, or publishing path.
`report_error` in the schema is write-only intake; nothing a reader submits is
published anywhere. The prerequisite — a staffed moderation workflow — does not
exist, so the feature does not either.

**The one exception is `/upload`, a browser-only preparation tool.** It reads a
text the reader chooses (.txt, .md, .itx or pasted text) with `FileReader`, shows
a structural analysis (script, verse markers, chapter headings), and offers a
whitespace-normalised download. Nothing is sent to a server, nothing is stored,
and nothing is published or merged into the corpus. The counts it shows are raw
structural counts, not verified verse totals; `npm run verify:scripture` remains
the authority. PDFs are not read in the browser, because text extraction and OCR
need a server-side or offline pipeline.

### Content administration (CMS)
**Partial — a review console, not an editor.** `/admin` aggregates all 190
content records across ten collections, normalises their several incompatible
provenance fields into one state, and lets a reviewer record a verdict with a
note, then export those verdicts as rows for the `content_review` table.

Two limits are deliberate:

- **It cannot edit the corpus.** Content is imported by the Python scripts under
  `scripts/`, checked by `npm run verify:scripture`, and committed. Editing it
  from a browser would bypass that check.
- **A recorded verdict does not change a record's verification status.** A
  judgement entered on one device by one person is not the corpus being
  verified. Changing a status is a separate act made in the content source and
  committed, so every claim of verification has a diff behind it.

There is also **no authentication**, so the console can annotate locally and
export but cannot publish. A deployment that wants real administration needs
auth in front of it — that is the remaining gap, not the interface.

One thing worth knowing about the data: the corpus records provenance in several
different fields invented at different times (`verificationStatus` on Peethas,
`infoStatus` on temples, `textStatus` on mantras, `status` on sources, prose-only
`source`/`sourceNote` elsewhere). **72 of 190 records have no status field at
all.** That absence is reported as awaiting review, never as verified — a
missing field is not a clean bill of health.

### High-contrast and reduced-motion as full features
`settings` exposes both, `useApplySettings()` applies them, and the CSS honours
`prefers-reduced-motion`.

**Contrast ratios are now measured, per pair, in both themes, on every test
run** (`tests/design-tokens.test.ts`). 36 foreground/background pairings are
asserted against WCAG 2.1 AA — 4.5:1 for text, 3:1 for meaningful UI boundaries.
The same test asserts every custom property a component references is actually
defined, which is how the defects below were found.

Still not done: a full assistive-technology audit. Contrast is measured;
keyboard traversal, screen-reader announcements and focus order are designed for
but not tested against real AT. Treat accessibility as "measured and designed
for" rather than "certified".

### Captions
Not applicable — there is no video.

## Implemented, but with limits you should know

### Scripture completeness
**The Sanskrit is complete and verified: 13 chapters, 700 traditional verses
matching the colophon, plus 6 auxiliary recitations (122 verses).**
`npm run verify:scripture` enforces this and fails the build otherwise.

The **English translation is not complete**. It is Pargiter 1904 from an
uncorrected Archive.org OCR witness:
- Chapter 13 is truncated in that witness. It is marked `partial_witness` and
  rendered as an explicit gap, not padded with invented prose.
- The OCR verse numbers are corrupt, so **no verse-level alignment exists**.
  English appears as chapter-level prose. The reader never shows an English
  line beside a specific verse, because that pairing was never verified.
- Spelling artefacts are preserved rather than silently corrected.

There is **no Hindi translation** in the repository. The language switcher
offers Hindi for the interface; scripture Hindi is absent and the UI says so.

### Translations beyond English
Architecture supports them (`translation.language`, `getTranslations(lang)`),
and the enum lists Hindi, Telugu and Bengali. **No non-English translation is
imported.** The setting changes the interface, not the scripture.

### Machine translation
Not used anywhere, by policy. Sacred verse is not published from an unreviewed
machine translation. `translation_paragraph.reviewer` is nullable precisely so
that an unreviewed row is distinguishable.

### Muhurat and festival timing
**No muhurat is hard-coded.** Tithi, nakshatra, yoga and Navratri dates are
computed in `src/lib/panchang/` from astronomical algorithms (Meeus), for the
selected city, and the method is labelled in the UI.

Limits, stated honestly:
- The series are low-precision: roughly 0.01° for the Sun and 0.3° for the Moon.
  Near a tithi boundary this can place the boundary on a different day than a
  high-precision ephemeris would.
- **Longitudes are tropical (nirayana); no ayanamsha is applied.** Traditions
  that use sidereal reckoning can differ. This is disclosed in the sources
  registry, not hidden.
- Auspicious *time windows* (specific muhurats within a day) are **not
  computed**. Only the day is.
- Verified against four independently known syzygies, worst error 0.047°.
- **Skipped (kshaya) tithis are handled, and this was a real bug.** Both the
  anchor and the terminator are confined to a single lunar fortnight. Before
  that was true, a skipped Pratipada sent the scan forward to the *next* lunar
  month's Pratipada — Chaitra 2026 came out as 19 April, a month after the
  festival, and Sharad 2027 as 31 October, which is Kartika Pratipada, the day
  after Diwali. A skipped Dashami was worse still: the terminator walked to the
  following month and returned a thirty-eight day "Navratri". All three are now
  correct and covered by tests.
- What is still true: when Pratipada itself is skipped, no sunrise reports it,
  so the window opens on Dwitiya and Shailaputri is listed as unobserved. That
  is a faithful reading of the sunrise-tithi rule, not a resolution of how a
  given household observes it — follow local custom.

### Shakti Peetha lists
60 sites are catalogued, with the 18 / 51 / 52 / regional enumerations stored as
a many-to-many membership rather than a single list, because **no single
agreed list exists**. Confidence is recorded per site (16 high, 22 medium, 22
low) and disagreement is displayed rather than resolved.

Sites outside modern India are included — Bangladesh, Nepal, Pakistan and Sri
Lanka. Sacred geography is not restricted to current borders.

**Not verified:** official websites, darshan timings, transport details and
opening hours. Every one of these fields is null in the data, and the UI says
the information has not been verified rather than guessing. No coordinates were
invented; every record has one, and any unresolved location is labelled as such
rather than estimated.

### Temple directory
28 temples, with an explicit `kind` distinguishing `shakti-peetha` (16) from
`major-devi-shrine` (12). Not every Devi temple is labelled a Peetha.

Opening hours, contact details and official websites are null and marked
`unverified`.

### Pilgrimage planner
`/plan` builds an ordered itinerary from the Peetha and temple records and
computes the **great-circle distance** between consecutive stops, with a
suggested ordering when one is shorter (exact for nine stops or fewer, nearest
neighbour above that, and documented as a heuristic rather than sold as
optimal). Itineraries persist to localStorage.

**There is still no travel-time estimation, and this is a deliberate refusal,
not an oversight.** Travel time depends on transport, road quality, ferries and
border crossings, none of which this repository has verified data for. Any
figure shown would be invented, so none is shown. Distances are labelled
straight-line on every leg and in a standing notice, because a reader could
otherwise take them for road distances — and road distances are always longer.

What is still absent: turn-by-turn routing, transport options, journey
scheduling, and multi-day itinerary structure (overnight stops, opening-day
constraints). Those need a routing service and verified site data.

### Devi Gyan assistant
Works, with hard limits. It retrieves from the curated content and cites
chapters, verses and publications, distinguishing verified scripture from
editorial commentary. It refuses medical, pregnancy, financial and legal
questions, refuses when retrieval finds nothing, and never promises blessings,
cures or outcomes.

With no provider configured it returns cited passages and writes no prose. That
is the shipped configuration.

The guardrails are enforced in code (`OUT_OF_SCOPE`, `NEEDS_AUTHORITY`), not
merely requested in a prompt. Note that this was a real defect that testing
caught: one loop returned unconditionally and refused *every* question, and a
word-boundary bug meant "pregnant" never matched `pregnan\b`. Both are fixed and
now covered by tests.

### Greeting cards
Implemented as a client-side canvas PNG export on `/share`. The artwork is
generated, not licensed imagery.

### Quizzes and flashcards
Implemented: 3 quizzes, 20 questions, flashcards from the glossary. Scores are
stored locally. **No progress metric is converted into a claim of spiritual
merit**, anywhere, by design.

### Regional coverage
Bengali Durga Puja, Gujarati Garba/Dandiya and South Indian Golu/Bommai Kolu are
covered in the festivals and knowledge content. Coverage is uneven — these are
editorial summaries awaiting scholarly review, not field documentation.

## Externally dependent

Things this repository cannot settle on its own:

| Dependency | Why it is unresolved here |
|---|---|
| **Scholarly review** | Editorial content — stories, explanations, glossary, guides — is authored for this app and marked `awaiting-review`. It needs a qualified reviewer, which is a person, not a script. |
| **Official temple information** | Darshan timings, websites and contact details must come from each temple. Verifying 60+ sites by hand is a research project. |
| **Licensed audio** | Requires permission from rights holders. |
| **Artwork** | Navadurga artwork is generated. Authentic commissioned artwork, or properly licensed reproductions, would need sourcing and clearance. |
| **A licensed Hindi/Telugu/Bengali translation** | Public-domain Hindi commentaries exist but none has been verified as complete and clean enough to import. |
| **Live map tiles** | Requires a tile provider and its attribution terms. |
| **A complete, alignable English witness** | Would need a clean digital edition of a translation whose verse numbering matches, which the Pargiter OCR is not. |

## Known defects and open questions

Recorded so they are not rediscovered as surprises:

- **Windows with fewer than nine forms.** Where a tithi is skipped the window
  genuinely observes eight forms, not nine, and `unobservedDeviIds` names the
  missing one — Shailaputri for Chaitra 2026 and Sharad 2027, Chandra-ghanta for
  Chaitra 2025. The UI states this rather than silently renumbering.
- **Chaitra 2027 has a skipped Dashami**, so no Vijayadashami sunrise is
  reported and the window ends at Navami. The method note says so on the page.
- **Search is in-memory only.** The Postgres FTS index in `db/schema.sql` is
  defined but unused. Two implementations of the same interface now exist; they
  will drift.

### Since closed

- **`/api/health`** now exists. It re-reads the imported content set and
  asserts the same invariants `verify:scripture` enforces at build time,
  returning 503 with the failing check named if content is truncated or
  corrupted. It exposes no configuration values — Devi Gyan presence is a
  boolean, never a key. The failure direction was verified by hand against a
  deliberately broken build, not only the success path.
- **Seven undefined CSS custom properties.** `--gold-soft`, `--maroon-300`,
  `--maroon-400`, `--maroon-500`, `--maroon-950`, `--ivory-100` and `--crimson`
  were referenced by components and defined nowhere, so those declarations
  silently rendered no colour at all — including the splash-screen background,
  the skip-link colour and the reader's active-script indicator. A CSS variable
  that resolves to nothing raises no error anywhere; the browser just drops the
  declaration. All seven are now defined in both themes and asserted by test.
- **Light-theme gold failed WCAG in every role it was used in.** `#c9a227` on
  ivory measured 2.40:1 — below 4.5:1 for text, below 3:1 for a border, and
  below 4.5:1 as a button fill. Replaced with `#8a611c` (5.47:1), which clears
  all three. Dark theme was already fine at 12.06:1.
- **The reader's active script tab was unreadable in dark mode.** It painted
  near-white text on `--accent`, which is a dark maroon in light mode (7.48:1,
  fine) but inverts to a pale gold in dark mode — 1.57:1. Now uses `--surface`,
  which tracks the theme: 7.68:1 light, 12.06:1 dark.
- **Form control borders were 1.35:1.** 29 inputs, textareas and selects used
  the decorative `--line` token for their edge. WCAG 2.1 SC 1.4.11 needs 3:1 for
  the visual information that identifies an interactive component. They now use
  a separate `--line-strong` (3.68:1 light, 4.37:1 dark); `--line` stays quiet
  for card edges and rules, where no such requirement applies.
- **CI** runs on push and pull request
  (`.github/workflows/ci.yml`): scripture verification, typecheck, lint, tests,
  then a full production build with no provider key configured — the shipped
  default must build, not merely tolerate a missing key.
