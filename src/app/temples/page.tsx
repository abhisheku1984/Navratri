"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { getTempleCollection, getTemples } from "@/lib/content";
import { Card, EmptyState, Notice, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Mandala } from "@/components/ornament";
import { FavouriteButton, PeethaMap, type MapMarker } from "@/components/interactive";

const KIND_LABEL: Record<string, string> = {
  "shakti-peetha": "Shakti Peetha",
  "major-devi-shrine": "Devi temple",
};

export default function TempleIndex() {
  const { state } = useUser();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null);

  const temples = getTemples();
  const col = getTempleCollection();
  const favourites = state.favourites.temples;

  const regions = useMemo(() => Array.from(new Set(temples.map((t) => t.region))).sort(), [temples]);
  const kinds = useMemo(() => Array.from(new Set(temples.map((t) => t.kind))).sort(), [temples]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return temples.filter((t) => {
      if (region && t.region !== region) return false;
      if (kindFilter && t.kind !== kindFilter) return false;
      if (!needle) return true;
      return [t.name, t.city, t.region, t.country, t.kind, t.festivals.join(" "), t.note]
        .join(" ").toLowerCase().includes(needle);
    });
  }, [temples, q, region, kindFilter]);

  const plan = useMemo(
    () => favourites
      .map((id) => temples.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [temples, favourites]);

  const markers: MapMarker[] = filtered.map((t) => ({
    id: t.id, name: t.name,
    sub: `${t.city}, ${t.region}, ${t.country}`,
    lat: t.coordinates.lat, lon: t.coordinates.lon, href: `/temples/${t.slug}`,
  }));

  return (
    <>
      <PageHeader eyebrow="Directory" title={col.title} sub={col.intro} />

      <Notice tone="caution" title="These are not all Peethas">
        <p>
          A Shakti Peetha is a site the tradition ties to a part of Sati&rsquo;s body. Most temples
          in this directory are not Peethas and are deliberately not labelled as such. Where a
          temple is also a Peetha, the card says so and links across.
        </p>
        <p className="mt-2">
          <Link href="/shakti-peethas" className="link-underline">The Peetha directory is separate.</Link>
        </p>
      </Notice>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Temples" value={String(temples.length)} />
        <Stat label="Regions" value={String(regions.length)} />
        <Stat label="In your plan" value={String(plan.length)} hint="Pilgrimage list" />
        <Stat label="Verified visitor data" value="0" hint="Confirm locally" />
      </div>

      <div className="card mt-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="temple-search" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Search
            </label>
            <input id="temple-search" value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Temple, city, region…"
                   className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </div>
          <div>
            <label htmlFor="temple-region" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Region
            </label>
            <select id="temple-region" value={region ?? ""}
                    onChange={(e) => setRegion(e.target.value || null)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              <option value="">All regions</option>
              {regions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="temple-kind" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Type
            </label>
            <select id="temple-kind" value={kindFilter ?? ""}
                    onChange={(e) => setKindFilter(e.target.value || null)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              <option value="">All types</option>
              {kinds.map((s) => <option key={s} value={s}>{KIND_LABEL[s] ?? s}</option>)}
            </select>
          </div>
        </div>
        <p className="muted mt-3 text-xs">Showing {filtered.length} of {temples.length} temples.</p>
      </div>

      <section className="mt-8" aria-labelledby="temple-map">
        <SectionHeading eyebrow="Map" title="Where they are"
                        sub="Approximate centroids for orientation. Tiles load in your browser from OpenStreetMap." />
        <h2 id="temple-map" className="sr-only">Map</h2>
        <PeethaMap markers={markers} lowData={state.settings.lowData} height={400} />
      </section>

      <section className="mt-10" aria-labelledby="planner">
        <SectionHeading eyebrow="Pilgrimage planner" title="Your list"
                        sub="Add temples with the star on any card. The list is stored in this browser only and never leaves your device." />
        <h2 id="planner" className="sr-only">Your pilgrimage list</h2>
        {plan.length === 0 ? (
          <EmptyState title="Your pilgrimage list is empty"
                      body="Star the temples you would like to visit. They collect here in the order you added them." />
        ) : (
          <ol className="space-y-3">
            {plan.map((t, i) => (
              <li key={t.id} className="card flex flex-wrap items-center gap-4 p-5">
                <span className="chip shrink-0" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                  Stop {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/temples/${t.slug}`} className="font-semibold hover:underline">{t.name}</Link>
                  <p className="muted text-xs">
                    {t.city}, {t.region}, {t.country} · {KIND_LABEL[t.kind] ?? t.kind}
                  </p>
                </div>
                <span className="muted font-mono text-xs">
                  {t.coordinates.lat.toFixed(3)}, {t.coordinates.lon.toFixed(3)}
                </span>
                <FavouriteButton kind="temples" id={t.id} label={t.name} />
              </li>
            ))}
          </ol>
        )}
        <p className="muted mt-3 text-xs leading-relaxed">
          This planner stores your chosen stops in order. It does not compute travel times or
          distances: those depend on live conditions and a routing service this app does not
          connect to, and a made-up estimate would be worse than none.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="temple-list">
        <SectionHeading eyebrow="Directory" title="Temples" />
        <h2 id="temple-list" className="sr-only">Temples</h2>
        {filtered.length === 0 ? (
          <EmptyState title="No temples match those filters"
                      body="Try clearing the region or type filter."
                      action={<button className="btn btn-ghost"
                                        onClick={() => { setQ(""); setRegion(null); setKindFilter(null); }}>
                                Reset filters
                              </button>} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <li key={t.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Link href={`/temples/${t.slug}`} className="display text-lg font-semibold hover:underline">
                      {t.name}
                    </Link>
                    <Mandala className="h-8 w-8 shrink-0 opacity-25" petals={10} stroke="var(--gold)" />
                  </div>
                  <span className="chip self-start">{KIND_LABEL[t.kind] ?? t.kind}</span>
                  <p className="muted mt-2 text-xs">{t.city}, {t.region}, {t.country}</p>
                  {t.festivals.length > 0 && (
                    <p className="mt-2 text-xs">
                      <span className="muted">Festivals: </span>{t.festivals.join(" · ")}
                    </p>
                  )}
                  <p className="mt-3 flex-1 text-sm leading-relaxed">{t.note}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
                       style={{ borderColor: "var(--line)" }}>
                    <Link href={`/temples/${t.slug}`} className="btn btn-ghost !px-3 !py-1.5 text-xs">Open</Link>
                    <FavouriteButton kind="temples" id={t.id} label={t.name} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
