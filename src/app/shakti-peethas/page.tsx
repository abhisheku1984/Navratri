"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { getPeethaCollection, getPeethas } from "@/lib/content";
import {
  Card, ConfidenceBadge, EmptyState, Notice, PageHeader, SectionHeading, Stat,
} from "@/components/ui";
import { Mandala } from "@/components/ornament";
import { FavouriteButton, PeethaMap, type MapMarker } from "@/components/interactive";

export default function PeethaIndex() {
  const { state } = useUser();
  const [q, setQ] = useState("");
  const [listFilter, setListFilter] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [onlyFavourites, setOnlyFavourites] = useState(false);

  const peethas = getPeethas();
  const col = getPeethaCollection();
  const listDefs = Object.entries(col.lists);

  const countries = useMemo(
    () => Array.from(new Set(peethas.map((p) => p.location.country))).sort(), [peethas]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return peethas.filter((p) => {
      if (listFilter && !p.lists.includes(listFilter)) return false;
      if (country && p.location.country !== country) return false;
      if (onlyFavourites && !state.favourites.peethas.includes(p.id)) return false;
      if (!needle) return true;
      return [p.templeName, p.goddessName, p.bhairava ?? "", p.associatedBodyPart ?? "",
              p.location.city, p.location.region, p.location.country, p.traditionNote, p.story]
        .join(" ").toLowerCase().includes(needle);
    });
  }, [peethas, q, listFilter, country, onlyFavourites, state.favourites.peethas]);

  // A record may legitimately have no coordinates: where a location is
  // unresolved the field stays null rather than being given a plausible value.
  const withCoords = filtered.filter((p) => p.coordinates);
  const markers: MapMarker[] = withCoords.map((p) => ({
    id: p.id,
    name: `${p.templeName} — ${p.goddessName}`,
    sub: `${p.location.city}, ${p.location.country}`,
    lat: p.coordinates!.lat,
    lon: p.coordinates!.lon,
    href: `/shakti-peethas/${p.slug}`,
  }));

  const byCountry = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of peethas) m[p.location.country] = (m[p.location.country] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [peethas]);

  return (
    <>
      <PageHeader eyebrow="Sacred geography" title={col.title} sub={col.intro} />

      <Notice tone="caution" title="There is no single agreed list">
        <p>
          Different texts give different numbers of Peethas and they do not agree with each other.
          The same site appears under different names, and several identifications are genuinely
          contested — two towns in different regions both claim the same body part, with textual
          support on both sides.
        </p>
        <p className="mt-2">
          This directory therefore keeps the disagreement. Each record carries the list it appears
          in, the tradition that names it, and a confidence mark. Where a part is attributed by one
          tradition and disputed by another, both are shown.
        </p>
        <p className="mt-2">
          The list also crosses modern borders — sites in Bangladesh, Nepal, Pakistan and Sri Lanka
          are as much part of the tradition as any in India, and this directory does not restrict
          sacred geography to one country&rsquo;s map.
        </p>
      </Notice>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sites catalogued" value={String(peethas.length)} />
        <Stat label="Countries" value={String(byCountry.length)}
              hint={byCountry.map(([c, n]) => `${c} ${n}`).join(" · ")} />
        <Stat label="Lower-confidence records"
              value={String(peethas.filter((p) => p.confidence !== "high").length)}
              hint="Disputed or tradition-only" />
        <Stat label="Verified visitor data" value="0" hint="None published here" />
      </div>

      {/* ---------------------------------------------------------- filters */}
      <div className="card mt-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="peetha-search" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Search
            </label>
            <input id="peetha-search" value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Name, goddess, city, body part…"
                   className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </div>
          <div>
            <label htmlFor="peetha-country" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Country
            </label>
            <select id="peetha-country" value={country ?? ""}
                    onChange={(e) => setCountry(e.target.value || null)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              <option value="">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={onlyFavourites}
                   onChange={(e) => setOnlyFavourites(e.target.checked)} />
            My pilgrimage list
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="muted mr-1 text-[0.68rem] uppercase tracking-[0.14em]">Tradition</span>
          <button className="chip" aria-pressed={!listFilter}
                  style={{ borderColor: !listFilter ? "var(--gold)" : "var(--line)" }}
                  onClick={() => setListFilter(null)}>
            All
          </button>
          {listDefs.map(([id, def]) => (
            <button key={id} className="chip" aria-pressed={listFilter === id}
                    title={def.note}
                    style={{ borderColor: listFilter === id ? "var(--gold)" : "var(--line)" }}
                    onClick={() => setListFilter(listFilter === id ? null : id)}>
              {def.label}
            </button>
          ))}
        </div>

        <p className="muted mt-3 text-xs">
          Showing {filtered.length} of {peethas.length} sites.
        </p>
      </div>

      {/* -------------------------------------------------------------- map */}
      <section className="mt-8" aria-labelledby="map-heading">
        <SectionHeading eyebrow="Map" title="Where they are"
                        sub="Coordinates are approximate centroids for orientation, not surveyed temple locations. Tiles load in your browser from OpenStreetMap." />
        <h2 id="map-heading" className="sr-only">Map</h2>
        <PeethaMap markers={markers} lowData={state.settings.lowData} />
        <p className="muted mt-2 text-xs">
          {withCoords.length === filtered.length
            ? "The map is a convenience. Every site is reachable from the list below without it."
            : `${withCoords.length} of ${filtered.length} sites are plotted. The rest have no
               resolved location and appear in the list only — a missing pin is a statement about
               the sources, not a bug.`}
        </p>
      </section>

      {/* ------------------------------------------------------------- list */}
      <section className="mt-10" aria-labelledby="list-heading">
        <SectionHeading eyebrow="Directory" title="The Peethas" />
        <h2 id="list-heading" className="sr-only">The Peethas</h2>

        {filtered.length === 0 ? (
          <EmptyState title="No sites match those filters"
                      body="Try clearing the tradition filter, or search for a city or a goddess name."
                      action={<button className="btn btn-ghost"
                                        onClick={() => { setQ(""); setListFilter(null); setCountry(null); setOnlyFavourites(false); }}>
                                 Reset filters
                               </button>} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <li key={p.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/shakti-peethas/${p.slug}`}
                            className="display text-lg font-semibold hover:underline">
                        {p.templeName}
                      </Link>
                    </div>
                    <Mandala className="h-8 w-8 shrink-0 opacity-25" petals={10} stroke="var(--gold)" />
                  </div>

                  <p className="deva text-sm" style={{ color: "var(--gold)" }}>{p.goddessName}</p>

                  <p className="muted mt-2 text-xs">
                    {p.location.city}, {p.location.region}, {p.location.country}
                  </p>

                  {p.associatedBodyPart && (
                    <p className="mt-2 text-xs">
                      <span className="muted">Attributed part: </span>{p.associatedBodyPart}
                    </p>
                  )}

                  <p className="mt-3 flex-1 text-sm leading-relaxed">{p.story}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.lists.map((l) => (
                      <span key={l} className="chip">
                        {col.lists[l]?.label ?? l}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
                       style={{ borderColor: "var(--line)" }}>
                    <ConfidenceBadge confidence={p.confidence} />
                    <div className="flex gap-1.5">
                      <FavouriteButton kind="peethas" id={p.id} label={p.templeName} />
                      <Link href={`/shakti-peethas/${p.slug}`} className="btn btn-ghost !px-3 !py-1.5 text-xs">
                        Open
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="The traditions" title="The lists this directory draws on" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {listDefs.map(([id, def]) => (
            <li key={id}>
              <Card className="h-full p-5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="chip">{def.label}</span>
                  <span className="muted text-xs">
                    {peethas.filter((p) => p.lists.includes(id)).length} sites here
                  </span>
                </div>
                <p className="muted text-sm leading-relaxed">{def.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="Not the same thing" title="Peethas and other Devi temples" />
        <p className="muted mb-4 text-sm leading-relaxed">
          A Shakti Peetha is a site the tradition associates with a part of Sati&rsquo;s body. Many
          great Devi temples are not Peethas and are not labelled as such here. Calling every Devi
          temple a Peetha flattens a distinction the tradition itself maintains.
        </p>
        <Link href="/temples" className="btn btn-ghost">Temple directory</Link>
      </section>
    </>
  );
}
