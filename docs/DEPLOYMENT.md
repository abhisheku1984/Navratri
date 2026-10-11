# Deployment

## What you are deploying

A Next.js 15 App Router application. At build time it pre-renders 179 static
pages — every chapter, Navadurga form, Peetha, temple, mantra and story is
static HTML. There is one dynamic route, `POST /api/devi-gyan`, and it is
optional: the app is fully functional without it.

No database is required to run the site. Content is read from `src/content`
through `src/lib/content/index.ts`, and user state (settings, bookmarks,
reading position, journal) lives in the browser under the localStorage key
`navratri.state.v1`.

## Build and run

```bash
npm ci
npm run build
npm start            # serves on 0.0.0.0:3000
```

Node 20.9 or newer. The build has been verified on Node 22.22.3.

## Verification before you ship

```bash
npm run verify
```

That runs, in order:

1. `verify:scripture` — asserts 13 chapters, 656 verse units, 700 traditional
   verses matching the source colophon, 6 auxiliary recitations, and 21
   `ya devi` verses. Exits non-zero on any mismatch.
2. `typecheck` — `tsc --noEmit`.
3. `lint` — `eslint .` against the flat config in `eslint.config.mjs`.
4. `test` — the Vitest suite (239 tests).

Do not deploy without a green `npm run verify`. The scripture check in
particular exists because the importer has silently dropped verse padas before
while leaving all the counts looking correct.

## Environment variables

All four are optional. The app runs with none of them set.

| Variable | Where read | Default | Purpose |
|---|---|---|---|
| `DEVI_GYAN_API_KEY` | `src/lib/devi-gyan.ts` (server only) | unset | Enables provider-mode synthesis in the assistant. |
| `DEVI_GYAN_ENDPOINT` | `src/lib/devi-gyan.ts` (server only) | unset | Chat-completions URL. Required alongside the key. |
| `DEVI_GYAN_MODEL` | `src/lib/devi-gyan.ts` (server only) | unset | Model name. Required alongside the key. |
| `DATABASE_URL` | `db/seed.mjs` only | unset | Postgres connection for the optional database path. |

Notes that matter:

- **The Devi Gyan variables must be set on the server only.** They are read
  inside a route handler and inside `answer()`, which runs server-side. If you
  prefix any of them with `NEXT_PUBLIC_` you will publish the key to the client
  bundle. They are deliberately not prefixed.
- **If the key is unset, the assistant still works.** It falls back to
  retrieval mode: it returns cited passages from the curated content and writes
  no prose of its own. This is the mode the app ships in, and it is not a
  degraded state — nothing is generated, so nothing can be invented.
- **If the key is set but `DEVI_GYAN_ENDPOINT` or `DEVI_GYAN_MODEL` is
  missing, it falls back to retrieval mode** rather than failing.
- **`DATABASE_URL` is not read by the application.** Nothing in `src/` connects
  to Postgres. It is used by the seed script only.

## Static hosting

Because 178 of 179 routes are static, you can export the site and serve it
from any object store or CDN. Two caveats:

- `POST /api/devi-gyan` will not exist on a pure static host. The Devi Gyan
  page degrades to ordinary search, which is already functional.
- The map on `/shakti-peethas` and `/temples` loads Leaflet and its tiles from
  a CDN at runtime. In low-data mode, or where that CDN is unreachable, both
  pages render a list instead. Neither page depends on the map to be usable.

## Self-hosting the map tiles

The app currently uses the default Leaflet tile source. If you self-host,
replace the tile URL in `src/components/interactive.tsx` (`PeethaMap`) and
record the tile provider's attribution requirement — OpenStreetMap tiles
require visible credit.

## Fonts

No `next/font/google` is used. Devanagari and Latin render from the system font
stack declared in `src/app/globals.css`. This is deliberate: a build in a
network-restricted environment must not fail on a font fetch, and a Devanagari
webfont is a 200 KB+ download the reading experience does not need. If you add
one, self-host it and subset it.

## Database (optional)

Only if you want server-side sync of bookmarks and progress, or a Postgres FTS
index instead of the in-memory one.

```bash
createdb navratri
psql "$DATABASE_URL" -f db/schema.sql
node db/seed.mjs --dry-run | psql "$DATABASE_URL"
```

`db/schema.sql` has been validated against the PostgreSQL parser. It is not
wired into the application; see `docs/INCOMPLETE.md`.

## Health and observability

`GET /api/health` is the liveness probe. Use it rather than `GET /`: the home
page is static and returns 200 once the build exists, so it says nothing about
whether the content set loaded.

The health endpoint does real work. It re-reads the imported content and
asserts the same invariants `verify:scripture` enforces at build time — 13
chapters, 656 verse units covering the colophon's 700 traditional verses,
verse text actually present in every chapter, 6 auxiliary recitations, 9
Navadurga forms, the Peetha, temple, mantra, story, glossary and quiz records,
and a non-empty search index. That means a deployment whose content was
truncated or corrupted at install reports itself broken instead of quietly
serving incomplete pages.

Responses:

| HTTP | `status` | Meaning |
|---|---|---|
| 200 | `ok` | Every check passed. |
| 503 | `degraded` | At least one check failed. `checks.results` names each failure with a detail line. |

The body carries `checks.results` (one entry per check, each with `ok` and a
human-readable `detail`), the declared language codes, uptime, and how long the
check took. It is served with `Cache-Control: no-store` so a CDN cannot hand a
monitor a stale result.

It exposes no configuration values. `deviGyan.configured` is a boolean —
whether `DEVI_GYAN_API_KEY` is present — and never the key itself; a test
asserts the key does not appear anywhere in the serialized response.

There are no metrics or tracing beyond this. If your platform needs them, wire
them into your own reverse proxy rather than widening this endpoint's surface.
