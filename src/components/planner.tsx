"use client";

/**
 * Pilgrimage planner.
 *
 * Build an ordered list of Peethas and temples, see the straight-line distance
 * between consecutive stops, and let the app suggest a shorter ordering.
 *
 * What this deliberately does NOT do is estimate travel time. Time depends on
 * transport, road quality, ferries and border crossings, none of which this
 * repository has verified data for — so any figure shown would be invented.
 * The distances below are great-circle distances computed from the coordinates
 * stored on each record, and the interface says so every time it shows one.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { getPeethas, getTemples } from "@/lib/content";
import {
  buildItinerary,
  formatKm,
  suggestOrder,
  type ItineraryStop,
} from "@/lib/geo";
import { Card, Chip, EmptyState, Notice } from "@/components/ui";

type Candidate = {
  id: string;
  label: string;
  place: string;
  lat: number;
  lon: number;
  href: string;
  kind: "peetha" | "temple";
  /** Secondary text used for filtering. */
  haystack: string;
};

/**
 * Flatten both content sets into one selectable list.
 *
 * A site can appear in both — Kamakhya is a Peetha and a temple entry — so
 * duplicates are collapsed by coordinate, keeping the Peetha record because it
 * carries the fuller profile. The `kind` on each candidate is what makes that
 * visible to the reader rather than silently dropped.
 */
function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  for (const p of getPeethas()) {
    const c = p.coordinates;
    if (!c || typeof c.lat !== "number" || typeof c.lon !== "number") continue;
    const place = [p.location?.city, p.location?.region, p.location?.country]
      .filter(Boolean)
      .join(", ");
    const key = `${c.lat.toFixed(3)},${c.lon.toFixed(3)}`;
    seen.add(key);
    out.push({
      id: `peetha-${p.slug}`,
      label: p.templeName,
      place,
      lat: c.lat,
      lon: c.lon,
      href: `/shakti-peethas/${p.slug}`,
      kind: "peetha",
      haystack: [p.templeName, p.goddessName, place, (p.lists ?? []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  }

  for (const t of getTemples()) {
    const c = t.coordinates;
    if (!c || typeof c.lat !== "number" || typeof c.lon !== "number") continue;
    const key = `${c.lat.toFixed(3)},${c.lon.toFixed(3)}`;
    // Skip when the same site is already offered from the Peetha list.
    if (seen.has(key)) continue;
    const place = [t.city, t.region, t.country].filter(Boolean).join(", ");
    out.push({
      id: t.id ?? `temple-${t.slug}`,
      label: t.name,
      place,
      lat: c.lat,
      lon: c.lon,
      href: `/temples/${t.slug}`,
      kind: "temple",
      haystack: [t.name, t.city, t.region, t.country, t.kind, (t.festivals ?? []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    });
  }

  return out;
}

export function ItineraryPlanner() {
  const { state, hydrated, toggleItineraryStop, setItinerary, moveItineraryStop } =
    useUser();

  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "peetha" | "temple">("all");

  const candidates = useMemo(() => buildCandidates(), []);
  const saved = state.itinerary;

  const itinerary = useMemo(() => buildItinerary(saved), [saved]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return candidates.filter((c) => {
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (!needle) return true;
      return c.haystack.includes(needle);
    });
  }, [candidates, q, kindFilter]);

  const selected = useMemo(() => new Set(saved.map((s) => s.id)), [saved]);

  const toStop = (c: Candidate): ItineraryStop => ({
    id: c.id,
    label: c.label,
    place: c.place,
    lat: c.lat,
    lon: c.lon,
    href: c.href,
    kind: c.kind,
  });

  const ordered = suggestOrder(saved);
  const suggestedTotal = buildItinerary(ordered).totalKm;
  const saving = itinerary.totalKm - suggestedTotal;
  const canImprove = saved.length > 2 && saving > 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="space-y-4">
        <Notice tone="info" title="These are straight-line distances">
          Each figure is the great-circle distance between two sites, computed
          from their stored coordinates. It is not a road distance and not a
          travel time. Real journeys are longer — roads follow terrain, rivers
          and borders — and how long one takes depends on transport, road
          quality and crossings. This app has no verified data for any of that,
          so it does not guess.
        </Notice>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="planner-search" className="sr-only">
            Search temples and Peethas
          </label>
          <input
            id="planner-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, city, region…"
            className="min-w-[12rem] flex-1 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <div className="flex gap-1" role="group" aria-label="Filter by list">
            {(["all", "peetha", "temple"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKindFilter(k)}
                aria-pressed={kindFilter === k}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  kindFilter === k
                    ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)] text-[color:var(--ink)]"
                    : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--gold)]"
                }`}
              >
                {k === "all" ? "All" : k === "peetha" ? "Peethas" : "Temples"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No sites match that"
            body="Try a different name, city or region, or clear the filter."
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {filtered.map((c) => {
              const isOn = selected.has(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggleItineraryStop(toStop(c))}
                    aria-pressed={isOn}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isOn
                        ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
                        : "border-[color:var(--line)] hover:border-[color:var(--gold)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                        isOn
                          ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--surface)]"
                          : "border-[color:var(--line)]"
                      }`}
                    >
                      {isOn ? "✓" : "+"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{c.label}</span>
                      <span className="block truncate text-xs text-[color:var(--muted)]">
                        {c.place}
                      </span>
                      <span className="mt-1 block">
                        <Chip>{c.kind === "peetha" ? "Shakti Peetha" : "Devi temple"}</Chip>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Card className="lg:sticky lg:top-20">
        <h2 className="font-display text-lg">Your itinerary</h2>

        {!hydrated ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">Loading saved plan…</p>
        ) : saved.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Select sites from the list to build a route. Your plan is stored on
            this device only.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <ol className="space-y-2">
              {saved.map((s, i) => {
                const leg = itinerary.legs[i];
                return (
                  <li key={s.id}>
                    <div className="flex items-start gap-2 rounded-lg border border-[color:var(--line)] p-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--gold-soft)] text-[11px] font-semibold"
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        {s.href ? (
                          <Link
                            href={s.href}
                            className="link-underline block truncate text-sm font-semibold"
                          >
                            {s.label}
                          </Link>
                        ) : (
                          <span className="block truncate text-sm font-semibold">{s.label}</span>
                        )}
                        {s.place && (
                          <span className="block truncate text-xs text-[color:var(--muted)]">
                            {s.place}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => moveItineraryStop(s.id, -1)}
                          disabled={i === 0}
                          aria-label={`Move ${s.label} earlier`}
                          className="rounded border border-[color:var(--line)] px-1.5 text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItineraryStop(s.id, 1)}
                          disabled={i === saved.length - 1}
                          aria-label={`Move ${s.label} later`}
                          className="rounded border border-[color:var(--line)] px-1.5 text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleItineraryStop(s)}
                          aria-label={`Remove ${s.label}`}
                          className="rounded border border-[color:var(--line)] px-1.5 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    </div>
                    {leg && (
                      <p className="py-1 pl-7 text-xs text-[color:var(--muted)]">
                        ↓ {formatKm(leg.km)} straight line
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>

            <dl className="space-y-1 border-t border-[color:var(--line)] pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[color:var(--muted)]">Stops</dt>
                <dd>{saved.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--muted)]">Legs</dt>
                <dd>{itinerary.legs.length}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total straight-line distance</dt>
                <dd>{formatKm(itinerary.totalKm)}</dd>
              </div>
            </dl>

            {canImprove && (
              <button
                type="button"
                onClick={() => setItinerary(ordered)}
                className="w-full rounded-full bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] transition-opacity hover:opacity-90"
              >
                Use shorter order ({formatKm(suggestedTotal)}, saves{" "}
                {formatKm(saving)})
              </button>
            )}

            <button
              type="button"
              onClick={() => setItinerary([])}
              className="w-full rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--muted)] hover:border-[color:var(--crimson)]"
            >
              Clear itinerary
            </button>
          </div>
        )}

        <p className="mt-4 border-t border-[color:var(--line)] pt-3 text-xs text-[color:var(--muted)]">
          Coordinates are approximate centroids stored for map placement, not
          surveyed positions, and they are copied into your plan when you add a
          stop. Opening hours, routes and access are not verified — check with
          the temple before travelling.
        </p>
      </Card>
    </div>
  );
}
