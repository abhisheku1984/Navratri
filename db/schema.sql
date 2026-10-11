-- ============================================================================
-- NAVRATRI — The Divine Shakti
-- PostgreSQL schema
-- ============================================================================
--
-- The application currently reads normalised JSON from src/content through a
-- single access layer (src/lib/content/index.ts). This schema is the same
-- model expressed relationally, so moving to Postgres means writing an
-- adapter that satisfies those same accessor signatures — not rewriting the
-- UI.
--
-- Three design rules shaped every table:
--
-- 1. NOTHING IS ASSERTED WITHOUT A SOURCE.  Every content table carries
--    source_id and a verification_status. There is no column that lets a row
--    exist without saying where it came from.
--
-- 2. DISAGREEMENT IS STORED, NOT RESOLVED.  peetha_list_membership is a
--    many-to-many join rather than an enum, because a site can belong to the
--    51 tradition and the regional tradition at once and to neither of the 18.
--    body_part_attribution is a table, not a column, because different
--    recensions disagree.
--
-- 3. TRANSLATIONS ARE SEPARATE FROM TEXT.  scripture_verse holds the Sanskrit.
--    verse_translation holds one reading by one named translator. A
--    translation is never written back into the source text, and an absent
--    translation row means the app says so rather than filling the gap.
--
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

CREATE TYPE verification_status AS ENUM (
  'verified',            -- checked against a named edition by a named reviewer
  'partially-verified',  -- some fields checked, others not
  'awaiting-review',     -- authored or imported, no reviewer yet
  'tradition-recorded',  -- accurately records a tradition, which is not a
                         -- factual claim that can be "verified"
  'disputed'             -- sources disagree; both readings are stored
);

CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

CREATE TYPE content_status AS ENUM (
  'draft',
  'in-review',
  'published',
  'withdrawn'
);

CREATE TYPE language_code AS ENUM (
  'hi', 'en', 'sa', 'te', 'bn'
  -- Architecture permits: 'ta','kn','mr','gu','ml','or','pa','as'.
  -- Adding one is a data change, not a schema change.
);

CREATE TYPE navadurga_form AS ENUM (
  'shailaputri', 'brahmacharini', 'chandraghanta', 'kushmanda', 'skandamata',
  'katyayani', 'kalaratri', 'mahagauri', 'siddhidatri'
);

CREATE TYPE charitra AS ENUM ('prathama', 'madhyama', 'uttama');

CREATE TYPE recitation_kind AS ENUM ('purvanga', 'uttaranga');

-- ----------------------------------------------------------------------------
-- PROVENANCE
-- ----------------------------------------------------------------------------

CREATE TABLE source (
  id                  TEXT PRIMARY KEY,
  kind                TEXT NOT NULL CHECK (kind IN (
                        'scripture','translation','stotra','computation',
                        'tradition','editorial')),
  title               TEXT NOT NULL,
  provenance          TEXT,
  author              TEXT,
  published           TEXT,
  edition_note        TEXT,
  local_copy          TEXT,
  digital_copy        TEXT,
  derived_note        TEXT,
  licence             TEXT NOT NULL,
  verification        TEXT,
  status              TEXT NOT NULL DEFAULT 'awaiting-review',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE source IS
  'Every factual record in the app points here. licence is NOT NULL on purpose:
   no source may be used without a recorded licence.';

CREATE TABLE source_person (
  source_id  TEXT NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('transcriber','proofreader','translator','reviewer','editor')),
  name       TEXT NOT NULL,
  PRIMARY KEY (source_id, role, name)
);

CREATE TABLE source_caveat (
  source_id  TEXT NOT NULL REFERENCES source(id) ON DELETE CASCADE,
  position   INT  NOT NULL,
  caveat     TEXT NOT NULL,
  PRIMARY KEY (source_id, position)
);

COMMENT ON TABLE source_caveat IS
  'Honest limitations of a source, surfaced verbatim in the UI. An OCR witness
   that cannot be aligned to verse numbers says so here rather than silently
   presenting prose as if it were verse-by-verse.';

-- ----------------------------------------------------------------------------
-- SCRIPTURE
-- ----------------------------------------------------------------------------

CREATE TABLE scripture_chapter (
  id                        TEXT PRIMARY KEY,
  number                    INT  NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 13),
  slug                      TEXT NOT NULL UNIQUE,
  charitra                  charitra NOT NULL,
  presiding_deity           TEXT NOT NULL,
  title_sanskrit            TEXT NOT NULL,
  title_itrans              TEXT NOT NULL,
  title_iast                TEXT NOT NULL,
  -- Named "editorial" so a reader is never led to think this English title
  -- comes from the Sanskrit.
  title_english_editorial   TEXT NOT NULL,
  markandeya_purana_chapter INT  NOT NULL,
  verse_unit_count          INT  NOT NULL CHECK (verse_unit_count > 0),
  traditional_verse_count   INT  NOT NULL CHECK (traditional_verse_count > 0),
  colophon_devanagari       TEXT,
  svasti_devanagari         TEXT,
  viniyoga_itrans           TEXT,
  viniyoga_devanagari       TEXT,
  dhyana_devanagari         TEXT,
  invocation_devanagari     TEXT,
  source_id                 TEXT NOT NULL REFERENCES source(id),
  verification_status       verification_status NOT NULL DEFAULT 'awaiting-review',
  status                    content_status NOT NULL DEFAULT 'published'
);

COMMENT ON COLUMN scripture_chapter.markandeya_purana_chapter IS
  'Canonical mapping: Devi Mahatmya chapter N is Markandeya Purana chapter N+80.';

CREATE TABLE scripture_verse (
  id            BIGSERIAL PRIMARY KEY,
  chapter_id    TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  -- A printed verse number is a single integer even where one unit covers a
  -- range of traditional verses, so both ends are stored.
  n             INT  NOT NULL,
  n_end         INT  NOT NULL,
  label         TEXT NOT NULL,
  ordinal       INT  NOT NULL,
  speaker       TEXT,
  itrans        TEXT NOT NULL,
  devanagari    TEXT NOT NULL,
  iast          TEXT NOT NULL,
  padas         INT  NOT NULL CHECK (padas >= 1),
  UNIQUE (chapter_id, n)
);

COMMENT ON COLUMN scripture_verse.padas IS
  'Usually 2 or 4. A speaker line such as "vaishya uvAcha" is legitimately 1.';

CREATE INDEX idx_verse_chapter ON scripture_verse (chapter_id, ordinal);

CREATE TABLE auxiliary_recitation (
  id                       TEXT PRIMARY KEY,
  slug                     TEXT NOT NULL UNIQUE,
  title_english            TEXT NOT NULL,
  title_sanskrit           TEXT NOT NULL,
  title_itrans             TEXT NOT NULL,
  title_iast               TEXT NOT NULL,
  kind                     recitation_kind NOT NULL,
  sort_order               INT  NOT NULL,
  note                     TEXT,
  verse_unit_count         INT  NOT NULL CHECK (verse_unit_count > 0),
  traditional_verse_count  INT  NOT NULL CHECK (traditional_verse_count > 0),
  source_id                TEXT NOT NULL REFERENCES source(id),
  verification_status      verification_status NOT NULL DEFAULT 'awaiting-review'
);

CREATE TABLE auxiliary_verse (
  id            BIGSERIAL PRIMARY KEY,
  recitation_id TEXT NOT NULL REFERENCES auxiliary_recitation(id) ON DELETE CASCADE,
  n             INT  NOT NULL,
  n_end         INT  NOT NULL,
  label         TEXT NOT NULL,
  ordinal       INT  NOT NULL,
  itrans        TEXT NOT NULL,
  devanagari    TEXT NOT NULL,
  iast          TEXT NOT NULL,
  padas         INT  NOT NULL CHECK (padas >= 1),
  UNIQUE (recitation_id, n)
);

-- Translations live apart from the source text, one row per reading.
CREATE TABLE translation (
  id                 TEXT PRIMARY KEY,
  language           language_code NOT NULL,
  title              TEXT NOT NULL,
  translator         TEXT NOT NULL,
  work               TEXT NOT NULL,
  copyright_status   TEXT NOT NULL,
  digital_copy       TEXT,
  ocr_uncorrected    BOOLEAN NOT NULL DEFAULT FALSE,
  -- 'chapter' or 'verse'. NULL verse_alignment means the app must NOT show a
  -- verse-by-verse English reading; it shows prose and says why.
  granularity        TEXT NOT NULL CHECK (granularity IN ('chapter','verse')),
  verse_alignment    BOOLEAN,
  source_id          TEXT NOT NULL REFERENCES source(id),
  verification_status verification_status NOT NULL DEFAULT 'awaiting-review'
);

CREATE TABLE translation_chapter (
  translation_id TEXT NOT NULL REFERENCES translation(id) ON DELETE CASCADE,
  chapter_id     TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  -- 'complete' or 'partial_witness'. A partial witness is rendered as an
  -- explicit gap, never padded with invented prose.
  witness_status TEXT NOT NULL CHECK (witness_status IN ('complete','partial_witness')),
  word_count     INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (translation_id, chapter_id)
);

CREATE TABLE translation_paragraph (
  id               BIGSERIAL PRIMARY KEY,
  translation_id   TEXT NOT NULL REFERENCES translation(id) ON DELETE CASCADE,
  chapter_id       TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  position         INT  NOT NULL,
  body             TEXT NOT NULL,
  -- NULL until a qualified reviewer aligns it to a verse range.
  verse_start      INT,
  verse_end        INT,
  reviewer         TEXT,
  reviewed_at      TIMESTAMPTZ
);

COMMENT ON COLUMN translation_paragraph.reviewer IS
  'Machine translation of sacred verse is not published. A paragraph reaches
   readers only after a named reviewer has checked it.';

CREATE TABLE translation_argument (
  translation_id TEXT NOT NULL REFERENCES translation(id) ON DELETE CASCADE,
  chapter_id     TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  position       INT  NOT NULL,
  body           TEXT NOT NULL,
  PRIMARY KEY (translation_id, chapter_id, position)
);

-- ----------------------------------------------------------------------------
-- NAVADURGA
-- ----------------------------------------------------------------------------

CREATE TABLE navadurga_form (
  id                    TEXT PRIMARY KEY,
  slug                  TEXT NOT NULL UNIQUE,
  day                   INT  NOT NULL UNIQUE CHECK (day BETWEEN 1 AND 9),
  form                  navadurga_form NOT NULL UNIQUE,
  name_devanagari       TEXT NOT NULL,
  name_hindi            TEXT NOT NULL,
  name_transliterated   TEXT NOT NULL,
  meaning               TEXT NOT NULL,
  origin_story          TEXT NOT NULL,
  iconography           TEXT NOT NULL,
  colour                TEXT NOT NULL,
  colour_note           TEXT,
  chakra                TEXT,
  planet                TEXT,
  scripture_ref         TEXT,
  family_story          TEXT NOT NULL,
  regional_variation_note TEXT NOT NULL,
  sample_content        BOOLEAN NOT NULL DEFAULT FALSE,
  source_id             TEXT NOT NULL REFERENCES source(id),
  verification_status   verification_status NOT NULL DEFAULT 'awaiting-review'
);

CREATE TABLE navadurga_symbolism (
  form_id    TEXT NOT NULL REFERENCES navadurga_form(id) ON DELETE CASCADE,
  position   INT  NOT NULL,
  attribute  TEXT NOT NULL,
  meaning    TEXT NOT NULL,
  PRIMARY KEY (form_id, position)
);

CREATE TABLE navadurga_quality (
  form_id  TEXT NOT NULL REFERENCES navadurga_form(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  quality  TEXT NOT NULL,
  PRIMARY KEY (form_id, position)
);

CREATE TABLE navadurga_offering (
  form_id  TEXT PRIMARY KEY REFERENCES navadurga_form(id) ON DELETE CASCADE,
  flower   TEXT NOT NULL,
  bhog     TEXT NOT NULL,
  note     TEXT
);

CREATE TABLE navadurga_routine_step (
  form_id  TEXT NOT NULL REFERENCES navadurga_form(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  step     TEXT NOT NULL,
  body     TEXT NOT NULL,
  PRIMARY KEY (form_id, position)
);

-- A verse attributed to a form. `status` distinguishes text imported from a
-- source from text deliberately withheld for want of a reliable source.
CREATE TABLE navadurga_verse (
  form_id      TEXT NOT NULL REFERENCES navadurga_form(id) ON DELETE CASCADE,
  slot         TEXT NOT NULL CHECK (slot IN ('dhyana','kavacham_name','navarna_mantra')),
  devanagari   TEXT,
  transliteration TEXT,
  meaning      TEXT,
  source       TEXT,
  source_file  TEXT,
  note         TEXT,
  status       TEXT NOT NULL CHECK (status IN ('imported','not-included')),
  PRIMARY KEY (form_id, slot)
);

COMMENT ON TABLE navadurga_verse IS
  'Where status = not-included, devanagari is NULL by design. The app states
   the text is not included rather than substituting a similar-looking verse.';

-- ----------------------------------------------------------------------------
-- SHAKTI PEETHAS
-- ----------------------------------------------------------------------------

CREATE TABLE peetha (
  id                     TEXT PRIMARY KEY,
  slug                   TEXT NOT NULL UNIQUE,
  temple_name            TEXT NOT NULL,
  goddess_name           TEXT NOT NULL,
  bhairava               TEXT,
  city                   TEXT NOT NULL,
  region                 TEXT,
  -- Sacred geography is not bounded by modern nation states; sites in
  -- Bangladesh, Nepal, Pakistan and Sri Lanka belong here.
  country                TEXT NOT NULL,
  -- NULL means the location is unresolved. It must never be estimated.
  lat                    NUMERIC(9,6),
  lon                    NUMERIC(9,6),
  coordinate_note        TEXT,
  tradition_note         TEXT NOT NULL,
  story                  TEXT NOT NULL,
  confidence             confidence_level NOT NULL,
  verification_status    verification_status NOT NULL,
  last_checked           DATE,
  verification_note      TEXT,
  -- Both NULL until an official page is confirmed. Inventing a website or a
  -- darshan time would be worse than leaving the field empty.
  official_website       TEXT,
  darshan_timings        TEXT,
  accessibility          TEXT,
  visitor_info_note      TEXT NOT NULL,
  sample_content         BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT peetha_coords_pair CHECK ((lat IS NULL) = (lon IS NULL))
);

CREATE TABLE peetha_tradition_list (
  slug       TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  note       TEXT NOT NULL
);

-- Many-to-many on purpose: there is no single agreed list of Peethas, and a
-- site may appear in several enumerations or none.
CREATE TABLE peetha_list_membership (
  peetha_id  TEXT NOT NULL REFERENCES peetha(id) ON DELETE CASCADE,
  list_slug  TEXT NOT NULL REFERENCES peetha_tradition_list(slug),
  PRIMARY KEY (peetha_id, list_slug)
);

-- A table, not a column: recensions disagree about which part fell where.
CREATE TABLE body_part_attribution (
  id          BIGSERIAL PRIMARY KEY,
  peetha_id   TEXT NOT NULL REFERENCES peetha(id) ON DELETE CASCADE,
  body_part   TEXT NOT NULL,
  ornament    TEXT,
  tradition   TEXT,
  source_id   TEXT REFERENCES source(id),
  -- A NULL source_id is rejected: an attribution with no source is a guess.
  CONSTRAINT attribution_needs_source CHECK (source_id IS NOT NULL)
);

COMMENT ON TABLE body_part_attribution IS
  'Rows exist only where a named source specifies the attribution. Where no
   source specifies one, there is simply no row.';

-- ----------------------------------------------------------------------------
-- TEMPLES
-- ----------------------------------------------------------------------------

CREATE TABLE temple (
  id                 TEXT PRIMARY KEY,
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  city               TEXT NOT NULL,
  region             TEXT,
  country            TEXT NOT NULL,
  lat                NUMERIC(9,6),
  lon                NUMERIC(9,6),
  coordinate_note    TEXT,
  -- A Peetha and a famous Devi temple are different claims. Both are useful;
  -- they must not be collapsed into one undifferentiated list.
  kind               TEXT NOT NULL CHECK (kind IN ('shakti-peetha','major-devi-shrine')),
  note               TEXT NOT NULL,
  -- NULL where the site is not a Peetha.
  peetha_id          TEXT REFERENCES peetha(id) ON DELETE SET NULL,
  official_website   TEXT,
  opening_hours      TEXT,
  contact            TEXT,
  accessibility      TEXT,
  info_status        TEXT NOT NULL DEFAULT 'unverified',
  info_note          TEXT NOT NULL,
  sample_content     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE temple_festival (
  temple_id TEXT NOT NULL REFERENCES temple(id) ON DELETE CASCADE,
  position  INT  NOT NULL,
  festival  TEXT NOT NULL,
  PRIMARY KEY (temple_id, position)
);

-- ----------------------------------------------------------------------------
-- KNOWLEDGE, MANTRAS, STORIES, PUJA
-- ----------------------------------------------------------------------------

CREATE TABLE knowledge_topic (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  title                TEXT NOT NULL,
  title_hi             TEXT NOT NULL,
  tagline              TEXT NOT NULL,
  story                TEXT NOT NULL,
  significance         TEXT NOT NULL,
  source_note          TEXT NOT NULL,
  child_version        TEXT NOT NULL,
  -- Distinguishes scriptural narrative, regional tradition, symbolic reading
  -- and modern historical research.
  claim_class          TEXT NOT NULL CHECK (claim_class IN
                       ('scriptural','tradition','symbolic','historical','mixed')),
  verification_status  verification_status NOT NULL DEFAULT 'awaiting-review',
  status               content_status NOT NULL DEFAULT 'published'
);

CREATE TABLE knowledge_detail (
  topic_id TEXT NOT NULL REFERENCES knowledge_topic(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  heading  TEXT NOT NULL,
  body     TEXT NOT NULL,
  PRIMARY KEY (topic_id, position)
);

CREATE TABLE knowledge_character (
  topic_id TEXT NOT NULL REFERENCES knowledge_topic(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  name     TEXT NOT NULL,
  PRIMARY KEY (topic_id, position)
);

CREATE TABLE knowledge_place (
  topic_id TEXT NOT NULL REFERENCES knowledge_topic(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  name     TEXT NOT NULL,
  PRIMARY KEY (topic_id, position)
);

CREATE TABLE knowledge_reflection (
  topic_id TEXT NOT NULL REFERENCES knowledge_topic(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  question TEXT NOT NULL,
  PRIMARY KEY (topic_id, position)
);

CREATE TABLE knowledge_related (
  topic_id     TEXT NOT NULL REFERENCES knowledge_topic(id) ON DELETE CASCADE,
  related_slug TEXT NOT NULL REFERENCES knowledge_topic(slug) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, related_slug),
  CHECK (topic_id <> related_slug)
);

CREATE TABLE mantra (
  id                  TEXT PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  deva                TEXT NOT NULL,
  iast                TEXT,
  category            TEXT NOT NULL,
  attribution         TEXT NOT NULL,
  meaning             TEXT NOT NULL,
  pronunciation       TEXT NOT NULL,
  -- 'imported' or 'not-included'. A withheld text stays withheld.
  text_status         TEXT NOT NULL CHECK (text_status IN ('imported','not-included')),
  text_status_note    TEXT,
  chapter_ref         TEXT,
  full_text_href      TEXT,
  source_href         TEXT,
  source_id           TEXT REFERENCES source(id),
  verification_status verification_status NOT NULL DEFAULT 'awaiting-review'
);

CREATE TABLE mantra_word_meaning (
  mantra_id TEXT NOT NULL REFERENCES mantra(id) ON DELETE CASCADE,
  position  INT  NOT NULL,
  word      TEXT NOT NULL,
  meaning   TEXT NOT NULL,
  PRIMARY KEY (mantra_id, position)
);

-- Audio is licensed content. A row exists only once a licence is recorded;
-- the app renders "no audio configured" where there is none, and never implies
-- a recording exists that does not.
CREATE TABLE audio_asset (
  id                TEXT PRIMARY KEY,
  kind              TEXT NOT NULL,
  owner_id          TEXT NOT NULL,
  storage_url       TEXT NOT NULL,
  duration_seconds  INT,
  licence           TEXT NOT NULL,
  attribution       TEXT,
  transcript        TEXT,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE story (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  title                TEXT NOT NULL,
  title_hi             TEXT NOT NULL,
  age_label            TEXT NOT NULL,
  minutes              INT  NOT NULL CHECK (minutes > 0),
  short                TEXT NOT NULL,
  long_form            TEXT NOT NULL,
  moral                TEXT NOT NULL,
  source_note          TEXT NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'awaiting-review',
  status               content_status NOT NULL DEFAULT 'published'
);

CREATE TABLE story_illustration_hint (
  story_id TEXT NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  hint     TEXT NOT NULL,
  PRIMARY KEY (story_id, position)
);

CREATE TABLE puja_guide (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  title                TEXT NOT NULL,
  summary              TEXT NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'awaiting-review',
  status               content_status NOT NULL DEFAULT 'published'
);

CREATE TABLE puja_section (
  guide_id TEXT NOT NULL REFERENCES puja_guide(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  heading  TEXT NOT NULL,
  body     TEXT NOT NULL,
  PRIMARY KEY (guide_id, position)
);

CREATE TABLE festival_observance (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL,
  months      TEXT NOT NULL,
  summary     TEXT NOT NULL
);

CREATE TABLE festival_practice (
  observance_id TEXT NOT NULL REFERENCES festival_observance(id) ON DELETE CASCADE,
  position      INT  NOT NULL,
  practice      TEXT NOT NULL,
  PRIMARY KEY (observance_id, position)
);

CREATE TABLE glossary_term (
  id          TEXT PRIMARY KEY,
  english     TEXT NOT NULL,
  devanagari  TEXT NOT NULL,
  definition  TEXT NOT NULL
);

CREATE TABLE quiz (
  id     TEXT PRIMARY KEY,
  title  TEXT NOT NULL,
  topic  TEXT NOT NULL
);

CREATE TABLE quiz_question (
  quiz_id  TEXT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  position INT  NOT NULL,
  question TEXT NOT NULL,
  answer   INT  NOT NULL CHECK (answer >= 0),
  why      TEXT NOT NULL,
  PRIMARY KEY (quiz_id, position)
);

CREATE TABLE quiz_option (
  quiz_id  TEXT NOT NULL,
  position INT  NOT NULL,
  opt_pos  INT  NOT NULL,
  body     TEXT NOT NULL,
  PRIMARY KEY (quiz_id, position, opt_pos),
  FOREIGN KEY (quiz_id, position) REFERENCES quiz_question(quiz_id, position) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- LOCATIONS
-- ----------------------------------------------------------------------------

CREATE TABLE location (
  id                 TEXT PRIMARY KEY,
  city               TEXT NOT NULL,
  region             TEXT NOT NULL,
  country            TEXT NOT NULL,
  lat                NUMERIC(9,6) NOT NULL,
  lon                NUMERIC(9,6) NOT NULL,
  utc_offset_hours   NUMERIC(5,2) NOT NULL,
  timezone           TEXT NOT NULL
);

COMMENT ON TABLE location IS
  'Coordinates and timezone for panchang computation. Festival dates and
  auspicious timings are always COMPUTED for a chosen location and labelled
  with the tradition used. A universal hard-coded muhurat is never stored.';

-- ----------------------------------------------------------------------------
-- SEARCH
-- ----------------------------------------------------------------------------

-- A generated tsvector gives Postgres what src/lib/search.ts does in memory.
-- Both are kept because the in-memory index is what makes search work offline
-- with no server round trip; this one serves a deployment backed by Postgres.
CREATE TABLE search_document (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  title        TEXT NOT NULL,
  sub          TEXT,
  href         TEXT NOT NULL,
  -- Weighted A/B/C so titles outrank body text, matching the in-memory scorer.
  fields       TEXT NOT NULL,
  body         TEXT,
  tsv          tsvector GENERATED ALWAYS AS (
                 setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
                 setweight(to_tsvector('simple', coalesce(fields, '')), 'B') ||
                 setweight(to_tsvector('simple', coalesce(body, '')),   'C')
               ) STORED
);

CREATE INDEX idx_search_tsv ON search_document USING GIN (tsv);

COMMENT ON COLUMN search_document.tsv IS
  '''simple'' config, not ''english'': the corpus is Devanagari and IAST, and
   an English stemmer would mangle it. Diacritic folding and Devanagari stem
   matching are handled at query time by the application.';

-- ----------------------------------------------------------------------------
-- USER DATA
-- ----------------------------------------------------------------------------
--
-- Optional. The app works fully without an account: settings, bookmarks,
-- reading position and the gratitude journal all live in localStorage under
-- navratri.state.v1. These tables exist for a deployment that offers sync.
--
-- The app never asks for birth details. Nothing here stores them, and no
-- feature requires them.

CREATE TABLE app_user (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE,
  display_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  user_id       UUID PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  language      language_code NOT NULL DEFAULT 'en',
  location_id   TEXT REFERENCES location(id),
  theme         TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  contrast      TEXT NOT NULL DEFAULT 'normal' CHECK (contrast IN ('normal','high')),
  motion        TEXT NOT NULL DEFAULT 'auto' CHECK (motion IN ('auto','reduced')),
  text_scale    NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  verse_scale   NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  verse_line    NUMERIC(3,2) NOT NULL DEFAULT 1.9,
  script        TEXT NOT NULL DEFAULT 'devanagari' CHECK (script IN ('devanagari','iast','itrans')),
  low_data      BOOLEAN NOT NULL DEFAULT FALSE,
  audio_rate    NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookmark (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  ref         TEXT NOT NULL,
  label       TEXT NOT NULL,
  href        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref)
);

CREATE TABLE reading_progress (
  user_id      UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  chapter_id   TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  verses_read  INT  NOT NULL DEFAULT 0 CHECK (verses_read >= 0),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);

COMMENT ON TABLE reading_progress IS
  'Records position only. The app never converts this into a merit score, a
   streak reward or any claim of spiritual progress — usage is not devotion.';

CREATE TABLE journal_entry (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE journal_entry IS
  'Private by default. No sharing, no analytics, no model training.';

CREATE TABLE quiz_attempt (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  quiz_id     TEXT NOT NULL REFERENCES quiz(id),
  correct     INT  NOT NULL CHECK (correct >= 0),
  total       INT  NOT NULL CHECK (total > 0),
  taken_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favourite (
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('peethas','temples')),
  ref         TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, ref)
);

COMMENT ON TABLE favourite IS
  'Mirrors state.favourites in the localStorage store. Polymorphic by kind and
   ref, matching bookmark, because a favourite names either a peetha row or a
   temple row and a single foreign key cannot point at both.';

CREATE TABLE recitation_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  chapter_id  TEXT NOT NULL REFERENCES scripture_chapter(id) ON DELETE CASCADE,
  recited_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE recitation_log IS
  'A count of sessions, nothing more. Like reading_progress, it is never
   converted into a merit score, a streak or any claim of spiritual standing.';

CREATE TABLE pilgrimage_stop (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  position     INT  NOT NULL CHECK (position >= 0),
  kind         TEXT NOT NULL CHECK (kind IN ('peetha','temple')),
  ref          TEXT NOT NULL,
  label        TEXT NOT NULL,
  place        TEXT,
  href         TEXT,
  -- Coordinates are copied from the content record when the stop is added, so
  -- an itinerary keeps its shape if the record is later corrected.
  lat          NUMERIC(9,6),
  lon          NUMERIC(9,6),
  added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, position)
);

CREATE INDEX idx_pilgrimage_stop_user ON pilgrimage_stop (user_id, position);

COMMENT ON TABLE pilgrimage_stop IS
  'Mirrors state.itinerary. Coordinates are a snapshot, not a live reference:
   they are approximate centroids stored for map placement and can go stale.
   No travel time or road distance is stored or derived, because neither is
   verified data.';

-- ----------------------------------------------------------------------------
-- CONTENT ADMINISTRATION
-- ----------------------------------------------------------------------------
--
-- User-generated content is disabled until this workflow exists and is
-- staffed. report_error is read-only input; nothing a reader submits is
-- published without review.

CREATE TABLE content_review (
  id              BIGSERIAL PRIMARY KEY,
  table_name      TEXT NOT NULL,
  record_id       TEXT NOT NULL,
  reviewer        TEXT NOT NULL,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  verdict         TEXT NOT NULL CHECK (verdict IN ('approved','needs-work','rejected')),
  notes           TEXT
);

CREATE TABLE report_error (
  id            BIGSERIAL PRIMARY KEY,
  page_href     TEXT NOT NULL,
  quote         TEXT,
  description   TEXT NOT NULL,
  contact       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved      BOOLEAN NOT NULL DEFAULT FALSE,
  resolution    TEXT
);

COMMIT;
