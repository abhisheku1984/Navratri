# Upgrade report — The Divine Navadurga Experience

Six-part report in the format the brief asked for. Written against the tip of
`arena/806f477c-navratri`. `npm run verify` and `npm run build`
are green; a production server is running for the live preview.

## 1. What was preserved

- **The scripture corpus, untouched and verified.** Devi Mahatmya in the
  imported Devanagari/ITRANS edition — 13 chapters, 656 verse units, 700
  traditional verses — plus six auxiliary recitations (Devi Kavacham, Argala,
  Kilaka, Devi Suktam, Aparadha Kshamapana, Chandika Dhyana) and F. E. Pargiter's
  1904 English prose. `npm run verify:scripture` still passes.
- **The existing app.** Peetha directory (60 records), temples, mantras, stories,
  quizzes, glossary, panchang/calendar, global search, plan/saved/journey views,
  admin, upload, offline/PWA support, share, accessibility page — all still in
  place and still passing their tests.
- **The design system and cinematic identity.** Saffron/crimson/maroon/gold/ivory
  tokens, mandala/lotus/diya ornaments, cinematic artwork, WCAG-checked
  pairings — the design-token and contrast tests still pass unchanged.
- **The original Devi Gyan assistant's retrieval layer** — its guardrails,
  citation strings and refusal behaviour were extended (KB branch, language
  parameter) rather than rewritten.
- Tests grew from ~239 to **273**, with none deleted.

## 2. What was newly implemented

- **24 languages, no duplicates** (the corrected list: Sanskrit once, Urdu once,
  Kashmiri once, Sindhi added as its own entry — validated by
  `assertLanguageRegistry()` and `tests/locales.test.ts`). Native names, scripts,
  fonts, samples, RTL for Urdu/Sindhi/Kashmiri, and a persistent selector that
  updates the interface. Interface coverage is published per language, not
  estimated: en 274/274, hi 274/274 (reviewed), a second tier at ≈157 keys, and
  smaller verified sets down to 37 keys — every shortfall counted and shown.
- **Honest fallback everywhere.** Untranslated strings fall back to the English
  reference and are reported; nothing is silently half-translated.
- **The opening blessing in 24 languages.** The Hindi text from the brief is
  stored verbatim as `sourceText`; 16 languages carry authored translations and
  7 are marked *draft* on screen. The disclosure states it is app-written
  devotional narration, not scripture, and no claim is made that the Goddess
  speaks through software. `notAutoplay: true`.
- **A 3:30:3 opening.** The cinematic intro always shows a working Skip control,
  respects `prefers-reduced-motion`, records that it has been seen (and never
  replays itself), and is replayable from Settings on demand.
- **Narration built for matching languages.** `planVoice()` classifies all 24
  languages as native / labelled-substitute (Sanskrit←Hindi; Kashmiri, Sindhi←Urdu;
  Manipuri←Bengali) / unavailable, with a printed reason. The player has
  play/pause, stop, replay, 0.75–1.5× speeds, volume, captions, transcript with
  seeking, voice selection, keyboard controls, and no autoplay. Where the app
  cannot narrate, it says so and shows text instead of reading the wrong accent.
- **A curated knowledge base (54 articles, ten sections, A–J)** answering the
  50-question launch matrix — every article source-tagged, honesty-labelled
  (scripture vs regional custom vs interpretation vs history), with named
  sources, key points, related links and a Hindi translation.
- **The Question Explorer** (`/questions`): all 50 questions in their sections,
  searchable, filterable, each opening the article that answers it or a refined
  question in the guide.
- **The AI guide** (`/guide`, also `/devi-gyan`): retrieval always precedes
  generation; links from the KB are indexed and cited; the assistant refuses when
  the corpus cannot answer (score threshold, out-of-scope, guarantee, authority);
  answers can be listened to, copied, rated helpful/not-helpful; three follow-ups
  are offered; citations open in a new tab so the conversation survives; the
  conversation is held in the tab only, with a Clear control and a privacy note.
- **New pages with real content:** Navratri guide, Day-by-day, Knowledge Base
  index and 54 article pages, Question Explorer, Listening library, Ask-the-guide,
  My Learning Journey — plus the Settings coverage matrix and Audio section
  showing per-language interface and article counts and this device's voices.
- **`docs/AUDIO.md`** stating exactly what ships, what does not, and how to light
  up a speech service later.

## 3. What was tested successfully

- `npm run verify` — scripture verification, typecheck, ESLint, **273 tests in 15
  files**, all passing. New suites: `tests/kb.test.ts` (citations point only at
  sources that exist, every link resolves to a real route, all 50 questions
  covered, Hindi bodies present on all 54 documents) and `tests/locales.test.ts`
  (24 unique languages, key parity against the English reference, RTL set,
  dictionary-file ↔ registry agreement).
- `npm run build` — production build green; all new routes prerendered,
  including the 54 knowledge-base articles and both re-exported routes.
- Live smoke test against the production server: 17 routes returned 200
  (`/`, `/navratri`, `/navratri/day-by-day`, `/questions`, `/kb`,
  `/kb/nine-forms-of-navadurga`, `/listen`, `/guide`, `/journey`, `/settings`,
  `/navadurga`, `/puja`, `/scripture`, `/search`, `/maa-durga`, `/sources`,
  `/about`).
- API smoke test: `/api/tts` reports `configured: false` and device mode (no
  false claims); `/api/devi-gyan` with `{"question":"What is ghatasthapana?","lang":"hi"}`
  returned KB passages with citations.

## 4. Fully functional integrations

- **Device speech synthesis** — real, offline, no key: narration works now on any
  device that has a voice for the language.
- **Local retrieval-augmented answering** — the guide searches the app's own
  corpus and cites it; this works with no external service at all.
- **Persistence** — language, audio preferences and the learning journey are
  stored in the browser only.
- **Search** — the KB is now part of the global index, in every language a
  document has been translated into.

## 5. Integrations that need credentials or an external service

- **Answer synthesis** (prose instead of passages): set `DEVI_GYAN_API_KEY`,
  `DEVI_GYAN_ENDPOINT`, `DEVI_GYAN_MODEL` on the server. Without them the guide
  is retrieval-only by design — it shows the cited passages and says why.
- **Server speech synthesis** (a chosen voice provider instead of the device's):
  set `TTS_PROVIDER`, `TTS_API_KEY`, and `TTS_VOICE_MAP` (plus `TTS_ENDPOINT` /
  `TTS_MODEL` for a custom service). Until then `/api/tts` answers 501 and names
  the variables — it does not pretend to work.
- **Embeddings / vector search**: not connected. Retrieval is a multilingual
  keyword index (Devanagari-aware, diacritic-folding, entity-first ranking) over
  a ~1 MB corpus, which is honest and fast at this scale; swapping in embeddings
  is the documented next step for a larger corpus.

## 6. Known limitations and remaining work

- **Knowledge-base article bodies are translated into Hindi only** (all 54), as are the
  six story retellings and the six per-form articles for the later forms.
  Interface strings and the opening blessing exist in all 24 languages; other
  article translations are marked *not translated yet* on each page rather than
  machine-filled.
- **The 50 questions are shown in English.** Their answer articles localise.
- **No recorded recitation ships.** Sanskrit narrated by a speech engine is
  *spoken*, not chanted; the UI says so.
- **Legacy content pages** (scripture reader, Peetha pages, some directory pages)
  still render their surrounding interface in English; the language system is in
  place for them but they have not all been wired yet.
- **The evaluation loop is local**: feedback is recorded on the device to order
  future answers, not aggregated server-side.
- **The exact wording of the 50 questions** was written from the section brief in
  the master prompt; if the brief's list differs word-for-word, send it and the
  questions file can be aligned in a single pass.


## Appendix — content-language round (the "everything is still English" fix)

The first delivery translated the interface but not enough of the *reading
experience*, and the chapter reader put its English witness above the
selected-language text. Fixed in the following round:

| Defect | Fix |
| --- | --- |
| Chapter page led with "Chapter 1 in English" | `src/components/chapter-reading.tsx`: the selected-language narrative now comes first, the English witness is labelled as an English-only edition text (`EnglishWitnessNote`), and a `ContentAvailability` card names the languages the narrative exists in. |
| No selected-language narration on the chapter | `ChapterVersesAudio` narrates the Devanagari verses with a Sanskrit/Hindi voice and names the voice; the narrative and the English witness each have their own player, each reading the language it is showing. |
| Navadurga form pages had no Hindi text | New knowledge-base articles for Skandamata, Katyayani, Kalaratri, Mahagauri and Siddhidatri (54 articles total), and `FormStory` renders each form's story in the selected language with narration. |
| Stories were English-only | Contemporary Hindi renderings (`shortHi`/`longHi`) for all six stories, read by `StoryReader` with narration and an availability card. |
| Readers could not tell which language a page was in | `src/components/content-language.tsx`: `ContentAvailability` (+ `SwitchTo`, `EnglishWitnessNote`) is now on story, form, topic, ritual, mantra and chapter pages; it names what exists, what is being shown, and offers a one-click switch. |
| No guardrail against silent gaps | `tests/kb.test.ts` now asserts a per-form article for every form slug, Hindi bodies on all of them, narratives for all 13 chapters in Hindi and English, and paired Hindi/English story renderings — 278 tests, all passing. |

Still English-only by design, and said so on the page: the Pargiter (1904)
witness translation, the Maa Durga knowledge topics, the ritual guides and the
mantra entries. Those pages now state which languages they exist in and point at
the Hindi material instead of leaving the reader to guess.


## Appendix — the uploaded Gita Press PDF, and what was done with it

The reader uploaded `durga-saptashati-hindi.pdf` (159 pages, 466 KB, produced
2013 by iText 5.4.0b) to `main` and asked for the app to carry something similar.
What the file actually is, established by reading it:

- a **Gita Press, Gorakhpur** edition — the publisher's own notice ("प्रकाशकीय
  निवेदन") says the Hindi translation is published by Gita Press;
- Sanskrit mula with Hindi anuvada, plus shloka-sangraha, Durga Ashtottara
  shata-nama stotra, patha-vidhi, Devi Kavacha, Argala, Kilaka, Vedo-ukta
  Ratri Sukta, Tantrokta Ratri Sukta, Devi Atharvashirsha, Navarna-vidhi and
  Saptashati-nyasa;
- its text layer is a **legacy Chanakya font with no ToUnicode map**, so the
  character codes are glyph indices. Reading it required the font-specific
  mapping, not ordinary extraction — this is exactly the case the `/upload` page
  now names on screen instead of guessing.

**Decision.** The Sanskrit verses are public domain and the app already carries
them (verified, 656 verse units). The **Hindi translation is Gita Press's
copyrighted work and was not copied into the app**, in line with the project's
own rule ("no unauthorised reproduction of copyrighted books"). What was built
instead:

1. **`/upload`** — a PDF intake page. Drop any PDF; it reports pages, text layer,
   fonts, images, metadata, a script census, whether the file uses a legacy Hindi
   font with no ToUnicode map, then gives a verdict per intended use (read,
   compare, translate, publish, narrate) under the app's publishing rules, and
   offers the report as a download or a journal entry. Nothing is uploaded; the
   file is read on the reader's device.
2. **Original Hindi arth** — `src/content/scripture/arth-hi/01.json`, written
   from the Sanskrit for this app, rendered under each verse of chapter 1 with
   the basis stated on the page. It is the app's own rendering, not a copy of any
   published translation, and it is kept in its own file so a rendering can never
   quietly alter a verified verse.

Chapters 2–13 remain to be written the same way.
