"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { getFestivals, getFestivalCollection, getLocations, getNavadurgaForms } from "@/lib/content";
import {
  computeNavratri, currentNavratriDay, formatInTimezone, panchangForDay,
  type NavratriKind,
} from "@/lib/panchang/panchang";
import { Card, Chip, EmptyState, Notice, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Mandala } from "@/components/ornament";

const WINDOWS: { id: NavratriKind; label: string }[] = [
  { id: "sharad", label: "Sharad Navratri" },
  { id: "chaitra", label: "Chaitra Navratri" },
  { id: "gupt-magha", label: "Magha Gupt Navratri" },
  { id: "gupt-ashadha", label: "Ashadha Gupt Navratri" },
];

const YEAR_OFFSETS = [-1, 0, 1, 2, 3];

export default function CalendarPage() {
  const { state, setSettings } = useUser();
  const locations = getLocations();
  const festivals = getFestivals();
  const festCol = getFestivalCollection();
  const forms = getNavadurgaForms();

  const [locId, setLocId] = useState(state.settings.locationId);
  const [windowId, setWindowId] = useState<NavratriKind>("sharad");
  const [yearOffset, setYearOffset] = useState(0);

  const loc = locations.locations.find((l) => l.id === locId) ?? locations.locations[0];
  const currentYear = new Date().getUTCFullYear();
  const baseYear = currentYear + yearOffset;

  const w = useMemo(() => computeNavratri(windowId, baseYear, loc), [windowId, baseYear, loc]);
  const day = currentNavratriDay(loc, new Date());

  const around = useMemo(() => {
    const now = new Date();
    return [-1, 0, 1].map((offset) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
      return {
        offset,
        p: panchangForDay(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), loc),
      };
    });
  }, [loc]);

  const formFor = (deviId: string) => forms.find((f) => f.slug === deviId) ?? null;
  const hhmm = (d: Date) => formatInTimezone(d, loc.timezone, { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <PageHeader eyebrow="Panchang" title="Festival calendar"
                  sub="Every date on this page is computed for the city you choose, at local sunrise. Nothing is hard-coded." />

      <Notice tone="caution" title="Read the method before you rely on a date">
        <p>{w.methodNote}</p>
        <p className="mt-2">
          The underlying astronomy uses low-precision solar and lunar longitudes. That is accurate
          enough for a tithi boundary in most cases, but <strong>not</strong> enough to guarantee
          the same answer as a published panchang on a day when the tithi changes close to sunrise.
          Where your observance depends on an exact boundary, follow your family or temple panchang.
        </p>
      </Notice>

      {/* ---------------------------------------------------------- controls */}
      <div className="card mt-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="cal-loc" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Location
            </label>
            <select id="cal-loc" value={locId}
                    onChange={(e) => { setLocId(e.target.value); setSettings({ locationId: e.target.value }); }}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              {locations.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.city}, {l.region}, {l.country} ({l.timezone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cal-window" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Season
            </label>
            <select id="cal-window" value={windowId}
                    onChange={(e) => setWindowId(e.target.value as NavratriKind)}
                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              {WINDOWS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cal-year" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
              Year
            </label>
            <select id="cal-year" value={yearOffset} onChange={(e) => setYearOffset(Number(e.target.value))}
                    className="rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              {YEAR_OFFSETS.map((y) => <option key={y} value={y}>{currentYear + y}</option>)}
            </select>
          </div>
        </div>
        <p className="muted mt-3 text-xs">
          {loc.city} · {loc.lat.toFixed(4)}°, {loc.lon.toFixed(4)}° · UTC
          {loc.utcOffsetHours >= 0 ? "+" : ""}{loc.utcOffsetHours}
        </p>
      </div>

      {/* ------------------------------------------------------- today strip */}
      <section className="mt-8" aria-labelledby="three-days">
        <SectionHeading eyebrow="Around today" title="Tithi now" />
        <h2 id="three-days" className="sr-only">Around today</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {around.map(({ p, offset }) => (
            <Card key={offset} raised={offset === 0} className="p-5">
              <p className="muted text-[0.68rem] uppercase tracking-[0.14em]">
                {offset === 0 ? "Today" : offset === -1 ? "Yesterday" : "Tomorrow"}
              </p>
              <p className="display mt-1 text-lg font-semibold">
                {formatInTimezone(p.sunriseUtc, loc.timezone,
                  { weekday: "short", day: "numeric", month: "short" })}
              </p>
              <p className="deva mt-2 text-base">{p.tithiLabelDevanagari}</p>
              <p className="muted text-sm">{p.tithiLabel} ({p.paksha})</p>
              <p className="muted mt-2 text-xs">
                {p.nakshatraName} · Sunrise {hhmm(p.sunriseUtc)}
              </p>
            </Card>
          ))}
        </div>

        {day ? (
          <Card raised className="mt-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="muted text-[0.68rem] uppercase tracking-[0.14em]">
                  Navratri is being observed
                </p>
                <p className="display text-xl font-semibold">
                  Day {day.day} · {formFor(day.deviId)?.nameDevanagari ?? day.deviId}
                </p>
                <p className="muted mt-1 text-sm">
                  {day.tithiLabel}
                  {day.repeatedTithi && " · tithi repeats from yesterday"}
                  {day.tithiMismatch && " · day number and tithi have diverged"}
                </p>
              </div>
              <Link href={`/navadurga/${day.deviId}`} className="btn btn-primary">
                Today&rsquo;s form
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="mt-3 p-5">
            <p className="display text-lg font-semibold">It is not Navratri today</p>
            <p className="muted mt-1 text-sm">
              The tithi now is {around[1].p.tithiLabel}. The nine days begin on Ghatasthapana,
              computed below for {loc.city}.
            </p>
          </Card>
        )}
      </section>

      {/* ------------------------------------------------------- the window */}
      <section className="mt-10" aria-labelledby="window">
        <SectionHeading eyebrow={`${w.kind} ${w.year}`}
                        title={WINDOWS.find((x) => x.id === w.kind)?.label ?? w.kind}
                        sub={`${w.days.length} observance days in ${loc.city}.`} />
        <h2 id="window" className="sr-only">Observance window</h2>

        {w.days.length === 0 ? (
          <EmptyState title="No window found for that year"
                      body="No sunrise in the search window fell on Shukla Pratipada at this location. Try another year, or another season." />
        ) : (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Ghatasthapana"
                    value={formatInTimezone(w.days[0].civilDate, loc.timezone,
                      { day: "numeric", month: "short" })}
                    hint={w.days[0].tithiLabel} />
              <Stat label="Vijayadashami"
                    value={w.vijayadashami
                      ? formatInTimezone(w.vijayadashami.sunriseUtc, loc.timezone,
                          { day: "numeric", month: "short" })
                      : "not found"}
                    hint={w.vijayadashami?.tithiLabel ?? "outside the scan"} />
              <Stat label="Observance days" value={String(w.days.length)}
                    hint="One per civil sunrise, not per tithi" />
              <Stat label="Repeated tithi" value={w.hasRepeatedTithi ? "Yes" : "No"}
                    hint={w.hasRepeatedTithi ? "One form is observed twice" : "Clean sequence"} />
            </div>

            <ol className="space-y-3">
              {w.days.map((d) => {
                const f = formFor(d.deviId);
                const civil = formatInTimezone(d.civilDate, loc.timezone, {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                });
                const isNavami = d.tithi === 9;
                return (
                  <li key={d.dateKey}>
                    <Card className="flex flex-wrap items-center gap-4 p-5">
                      <span className="chip shrink-0"
                            style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                        Day {d.day}
                      </span>
                      <div className="min-w-[10rem] flex-1">
                        <p className="font-semibold">{civil}</p>
                        <p className="muted text-xs">
                          {d.tithiLabel} · {d.nakshatraName} · Sunrise {hhmm(d.sunriseUtc)}
                        </p>
                      </div>
                      <div className="min-w-[9rem] flex-1">
                        <p className="deva font-semibold">{f?.nameDevanagari ?? d.deviId}</p>
                        <p className="muted text-xs">{f?.nameTransliterated ?? d.deviId}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.repeatedTithi && <Chip tone="gold">Tithi repeats</Chip>}
                        {d.tithiMismatch && <Chip tone="crimson">Tithi skipped</Chip>}
                        {isNavami && <Chip tone="crimson">Mahanavami</Chip>}
                      </div>
                      {f && (
                        <Link href={`/navadurga/${f.slug}`}
                              className="btn btn-ghost !px-3 !py-1.5 text-xs">Profile</Link>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ol>

            {w.unobservedDeviIds.length > 0 && (
              <Notice tone="caution" title="A form is not observed at this location this year">
                A tithi was skipped at sunrise in {loc.city}, so{" "}
                {w.unobservedDeviIds.map((id) => formFor(id)?.nameTransliterated ?? id).join(", ")}{" "}
                has no day of its own here. Households in this region observe that form on a
                different day, or on the preceding day, depending on custom. Follow your local
                practice — this app records the fact rather than inventing a resolution.
              </Notice>
            )}
          </>
        )}
      </section>

      {/* --------------------------------------------------------- festivals */}
      <section className="mt-10" aria-labelledby="festivals">
        <SectionHeading eyebrow="Beyond the nine days" title={festCol.title} sub={festCol.intro} />
        <h2 id="festivals" className="sr-only">Related observances</h2>
        {festCol.editorialNote && <Notice tone="caution">{festCol.editorialNote}</Notice>}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {festivals.map((f) => (
            <li key={f.slug}>
              <Card className="h-full p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="chip">{f.kind}</span>
                  <span className="chip">{f.months}</span>
                </div>
                <p className="display text-lg font-semibold">{f.name}</p>
                <p className="mt-2 text-sm leading-relaxed">{f.summary}</p>
                <ul className="muted mt-3 space-y-1 border-t pt-3 text-xs"
                    style={{ borderColor: "var(--line)" }}>
                  {f.practices.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="Guides" title="How it is kept" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/puja/ghatasthapana", "Ghatasthapana", "Opening the nine days"],
            ["/puja/daily-puja", "Daily puja", "A five-minute form"],
            ["/puja/fasting", "Fasting", "Never compulsory"],
            ["/puja/ashtami-navami", "Ashtami to Dashami", "The closing days"],
          ].map(([href, title, note]) => (
            <Link key={href} href={href} className="card p-5 transition-transform hover:-translate-y-0.5">
              <div className="mb-2 flex items-center gap-2">
                <Mandala className="h-7 w-7 opacity-40" petals={10} stroke="var(--gold)" />
                <p className="display font-semibold">{title}</p>
              </div>
              <p className="muted text-sm">{note}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
