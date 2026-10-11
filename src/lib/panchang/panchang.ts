/**
 * Panchang computation: tithi, nakshatra, yoga, and the Navratri calendar.
 *
 * Everything here is *computed* from the astronomical series in `astronomy.ts`.
 * No festival date and no muhurat is hard-coded: the module derives them for
 * the location and timezone the devotee has selected, and every result carries
 * the method note that must be displayed next to it.
 */
import {
  elongation,
  julianDay,
  lunarLongitude,
  solarLongitude,
  sunriseUtc,
} from "./astronomy";

export interface GeoLocation {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  utcOffsetHours: number;
  timezone: string;
}

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Purnima",
] as const;

export const TITHI_NAMES_DEVANAGARI = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी",
  "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
  "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
] as const;

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

export const METHOD_NOTE =
  "Computed from low-precision solar/lunar longitudes (Meeus, Astronomical " +
  "Algorithms, ch. 25 and 47). Tithi is evaluated at local sunrise. Results can " +
  "differ by up to one day from a specific published panchang near a tithi " +
  "boundary, and from traditions that use a different ayanamsha or day-start " +
  "convention.";

/** Tithi number 1–30 for an instant. 1–15 shukla paksha, 16–30 krishna paksha. */
export function tithiAt(date: Date): number {
  return Math.floor(elongation(julianDay(date)) / 12) + 1;
}

export function isShuklaPaksha(tithi: number): boolean {
  return tithi >= 1 && tithi <= 15;
}

export function tithiLabel(tithi: number): string {
  const paksha = isShuklaPaksha(tithi) ? "Shukla" : "Krishna";
  if (tithi === 30) return "Amavasya";
  const idx = isShuklaPaksha(tithi) ? tithi - 1 : tithi - 16;
  return `${paksha} ${TITHI_NAMES[idx]}`;
}

export function tithiLabelDevanagari(tithi: number): string {
  const paksha = isShuklaPaksha(tithi) ? "शुक्ल" : "कृष्ण";
  if (tithi === 30) return "अमावस्या";
  const idx = isShuklaPaksha(tithi) ? tithi - 1 : tithi - 16;
  return `${paksha} ${TITHI_NAMES_DEVANAGARI[idx]}`;
}

export function nakshatraAt(date: Date): number {
  return Math.floor(lunarLongitude(julianDay(date)) / (360 / 27)) + 1;
}

export function yogaAt(date: Date): number {
  const jd = julianDay(date);
  return Math.floor(((solarLongitude(jd) + lunarLongitude(jd)) % 360) / (360 / 27)) + 1;
}

export function sunLongitudeAt(date: Date): number {
  return solarLongitude(julianDay(date));
}

/**
 * Local sunrise for a calendar day, expressed as a UTC instant.
 * Falls back to 06:00 local if the location is in polar night / midnight sun.
 */
export function sunriseFor(y: number, m: number, d: number, loc: GeoLocation): Date {
  const local = new Date(Date.UTC(y, m, d, 0, 0, 0) - loc.utcOffsetHours * 3600000);
  const sr = sunriseUtc(local, loc.lat, loc.lon);
  if (Number.isNaN(sr.getTime())) {
    return new Date(Date.UTC(y, m, d, 0, 0, 0) - (loc.utcOffsetHours - 6) * 3600000);
  }
  return sr;
}

export interface DayPanchang {
  dateKey: string;          // YYYY-MM-DD in the selected location's civil date
  date: Date;               // sunrise instant (UTC)
  sunriseUtc: Date;
  tithi: number;
  tithiLabel: string;
  tithiLabelDevanagari: string;
  paksha: "shukla" | "krishna";
  nakshatra: number;
  nakshatraName: string;
  yoga: number;
  yogaName: string;
  sunLongitude: number;
}

export function panchangForDay(y: number, m: number, d: number, loc: GeoLocation): DayPanchang {
  const sr = sunriseFor(y, m, d, loc);
  const t = tithiAt(sr);
  const n = nakshatraAt(sr);
  const yo = yogaAt(sr);
  return {
    dateKey: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    date: sr,
    sunriseUtc: sr,
    tithi: t,
    tithiLabel: tithiLabel(t),
    tithiLabelDevanagari: tithiLabelDevanagari(t),
    paksha: isShuklaPaksha(t) ? "shukla" : "krishna",
    nakshatra: n,
    nakshatraName: NAKSHATRA_NAMES[n - 1],
    yoga: yo,
    yogaName: YOGA_NAMES[yo - 1],
    sunLongitude: sunLongitudeAt(sr),
  };
}

/** UTC instant at which a given tithi begins, searched within a day. */
export function tithiStartWithin(from: Date, to: Date, target: number): Date | null {
  const stepMs = 15 * 60000;
  let prev = tithiAt(from);
  for (let t = from.getTime() + stepMs; t <= to.getTime(); t += stepMs) {
    const cur = tithiAt(new Date(t));
    if (prev !== target && cur === target) {
      // refine by bisection
      let lo = t - stepMs;
      let hi = t;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (tithiAt(new Date(mid)) === target) hi = mid; else lo = mid;
      }
      return new Date(hi);
    }
    prev = cur;
  }
  return null;
}

export type NavratriKind = "sharad" | "chaitra" | "gupt-magha" | "gupt-ashadha";

/**
 * Gregorian search window (inclusive) for the shukla Pratipada that opens each
 * observance. A plain calendar window is used deliberately: it needs no
 * ayanamsha choice and no solar-ingress convention, so the same code gives the
 * same answer for every tradition, and the astronomically computed tithi does
 * the real work.
 */
export const NAVRATRI_SEARCH_WINDOW: Record<NavratriKind, { from: [number, number]; to: [number, number] }> = {
  sharad: { from: [8, 15], to: [10, 5] },        // Sep 15 - Nov 5
  chaitra: { from: [2, 10], to: [3, 20] },       // Mar 10 - Apr 20
  "gupt-magha": { from: [0, 10], to: [1, 20] },  // Jan 10 - Feb 20
  "gupt-ashadha": { from: [5, 10], to: [6, 25] },// Jun 10 - Jul 25
};

export interface NavratriDay {
  day: number;                 // sequential day of the observance, 1..n
  deviId: string;              // navadurga id
  dateKey: string;
  civilDate: Date;             // local civil midnight, UTC-normalised
  sunriseUtc: Date;
  tithi: number;
  tithiLabel: string;
  nakshatra: number;
  nakshatraName: string;
  /** The sunrise tithi repeats the previous day's, so the same form is kept. */
  repeatedTithi: boolean;
  /**
   * True when the sequential day number and the tithi ordinal diverge, which
   * happens after a tithi has been skipped (kshaya tithi).
   */
  tithiMismatch: boolean;
}

export interface NavratriWindow {
  kind: NavratriKind;
  year: number;
  location: GeoLocation;
  days: NavratriDay[];
  vijayadashami: NavratriDay | null;
  /**
   * Forms that receive no day of their own because a tithi was skipped
   * (kshaya tithi) and the window has fewer than nine civil days.
   */
  unobservedDeviIds: string[];
  /** Set when a tithi spanned two sunrises and the window has ten civil days. */
  hasRepeatedTithi: boolean;
  methodNote: string;
}

export const NAVADURGA_BY_DAY = [
  "shailaputri", "brahmacharini", "chandraghanta", "kushmanda", "skandamata",
  "katyayani", "kalaratri", "mahagauri", "siddhidatri",
] as const;

/**
 * Find the Navratri window for a year and observance type.
 *
 * Method:
 *   1. Day 1 is the first civil day in the search window whose tithi *at local
 *      sunrise* is shukla Pratipada (Ghatasthapana).
 *   2. Vijayadashami is the first later day whose sunrise tithi is shukla
 *      Dashami — it is fixed by tithi, never by counting days.
 *   3. The civil days between them are the Navratri days. Usually nine. A tithi
 *      may straddle two sunrises (ten days: the repeated day keeps the same
 *      form) or be skipped entirely, a kshaya tithi (eight days: one form has
 *      no day of its own). Both are flagged rather than silently smoothed over,
 *      because families resolve them differently and the app should not pretend
 *      there is a single answer.
 */
export function computeNavratri(kind: NavratriKind, year: number, loc: GeoLocation): NavratriWindow {
  const win = NAVRATRI_SEARCH_WINDOW[kind];
  const pad = (n: number) => String(n).padStart(2, "0");
  const keyOf = (d: Date) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  // Start one day before the window opens. The anchor is detected as a change
  // of paksha, so the first scanned day needs a predecessor to compare
  // against — without it a window that happens to open exactly on a paksha
  // transition can never anchor. Chaitra 2027 in Delhi opens on one.
  const start = new Date(Date.UTC(year, win.from[0], win.from[1] - 1));
  const winStartKey = keyOf(new Date(Date.UTC(year, win.from[0], win.from[1])));
  // scan past the window: the Dashami that ends the observance can fall up to
  // a fortnight after the last day of the search window.
  const end = new Date(Date.UTC(year, win.to[0], win.to[1] + 15));
  const winEndKey = keyOf(new Date(Date.UTC(year, win.to[0], win.to[1])));

  const scan: DayPanchang[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
    const d = new Date(t);
    scan.push(panchangForDay(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), loc));
  }

  // The scan runs past the window because the Dashami that *ends* the
  // observance can fall after the last day of the window. That extension is
  // for the terminator only. Anchoring anywhere in it is how this engine came
  // to report Chaitra 2026 on 19 April, a month after the festival.
  let anchorLimit = scan.length - 1;
  for (let i = scan.length - 1; i >= 0; i--) {
    if (scan[i].dateKey <= winEndKey) { anchorLimit = i; break; }
  }

  // -- anchor ----------------------------------------------------------------
  // The first day of the first shukla paksha at or after the window opens.
  //
  // Anchoring on "the first sunrise whose tithi is 1" is wrong, because a
  // search window wider than a lunar month can contain two Pratipadas and the
  // scan silently takes whichever comes first. It is wrong a second way when
  // Pratipada is a kshaya (skipped) tithi — it begins and ends between two
  // sunrises, so no sunrise reports it at all. Chaitra 2026 in Delhi is that
  // case: Amavasya on 20 March runs straight to Dwitiya on 21 March, and a
  // Pratipada search walks on to the next month's.
  //
  // Detecting the paksha transition instead fixes both. In a normal year the
  // first shukla sunrise *is* Pratipada; when Pratipada is skipped it is
  // Dwitiya, the window begins there, and Shailaputri is reported as
  // unobserved rather than the whole festival being moved a month.
  const anchorIdx = scan.findIndex(
    (p, i) => i > 0 && i <= anchorLimit && p.dateKey >= winStartKey &&
    p.paksha === "shukla" && scan[i - 1].paksha === "krishna",
  );
  if (anchorIdx === -1) {
    return {
      kind, year, location: loc, days: [], vijayadashami: null,
      unobservedDeviIds: [...NAVADURGA_BY_DAY], hasRepeatedTithi: false,
      methodNote: METHOD_NOTE,
    };
  }

  // -- terminator ------------------------------------------------------------
  // Everything from here on stays inside the anchor's own shukla paksha. An
  // unbounded forward search for Dashami walks out of the lunar month when
  // Dashami is itself skipped — Chaitra 2027 in Delhi runs tithi 9 straight to
  // 11 — and finds the next month's Dashami, which produced a thirty-eight day
  // "Navratri".
  let pakshaEnd = anchorIdx;
  while (pakshaEnd + 1 < scan.length && scan[pakshaEnd + 1].paksha === "shukla") {
    pakshaEnd++;
  }
  const dashamiIdx = scan.findIndex(
    (p, i) => i > anchorIdx && i <= pakshaEnd && p.tithi === 10,
  );

  // Navratri is nine tithis. The days end at Navami whether or not a Dashami
  // sunrise follows, so a skipped Dashami shortens nothing that was there.
  let lastDay = anchorIdx;
  while (lastDay + 1 <= pakshaEnd && scan[lastDay + 1].tithi <= 9) lastDay++;

  if (dashamiIdx === -1) {
    const days = buildDays(scan, anchorIdx, lastDay + 1);
    const used = new Set(days.map((d) => d.deviId));
    return {
      kind, year, location: loc, days, vijayadashami: null,
      unobservedDeviIds: NAVADURGA_BY_DAY.filter((id) => !used.has(id)),
      hasRepeatedTithi: days.some((d) => d.repeatedTithi),
      methodNote:
        METHOD_NOTE +
        " Dashami is a skipped (kshaya) tithi at this location this year, so no " +
        "Vijayadashami sunrise is reported; the window ends at Navami.",
    };
  }

  const days = buildDays(scan, anchorIdx, lastDay + 1);
  const used = new Set(days.map((d) => d.deviId));

  const v = scan[dashamiIdx];
  const vijayadashami: NavratriDay = {
    day: days.length + 1,
    deviId: "vijayadashami",
    dateKey: v.dateKey,
    civilDate: new Date(Date.UTC(
      Number(v.dateKey.slice(0, 4)), Number(v.dateKey.slice(5, 7)) - 1, Number(v.dateKey.slice(8, 10)))),
    sunriseUtc: v.sunriseUtc,
    tithi: v.tithi,
    tithiLabel: v.tithiLabel,
    nakshatra: v.nakshatra,
    nakshatraName: v.nakshatraName,
    repeatedTithi: false,
    tithiMismatch: false,
  };

  return {
    kind,
    year,
    location: loc,
    days,
    vijayadashami,
    unobservedDeviIds: NAVADURGA_BY_DAY.filter((id) => !used.has(id)),
    hasRepeatedTithi: days.some((d) => d.repeatedTithi),
    methodNote: METHOD_NOTE,
  };
}

/**
 * Turn the scanned sunrises between two indices into observance days.
 *
 * Shared by the normal path and the skipped-Dashami path so both produce
 * identical day records rather than two implementations that can drift.
 */
function buildDays(scan: DayPanchang[], fromIdx: number, toIdx: number): NavratriDay[] {
  const days: NavratriDay[] = [];
  for (let i = fromIdx, seq = 1; i < toIdx; i++, seq++) {
    const p = scan[i];
    const prev = i > fromIdx ? scan[i - 1] : null;
    const repeated = prev !== null && prev.tithi === p.tithi;
    const mismatch = !repeated && prev !== null && p.tithi !== prev.tithi + 1;
    // The Navadurga form is bound to the tithi, not to a running day count, so
    // a tithi that spans two sunrises keeps the same form on both days (the
    // convention used by published Indian calendars).
    const deviId = NAVADURGA_BY_DAY[Math.min(Math.max(p.tithi, 1), 9) - 1];
    days.push({
      day: seq,
      deviId,
      dateKey: p.dateKey,
      civilDate: new Date(Date.UTC(
        Number(p.dateKey.slice(0, 4)), Number(p.dateKey.slice(5, 7)) - 1, Number(p.dateKey.slice(8, 10)))),
      sunriseUtc: p.sunriseUtc,
      tithi: p.tithi,
      tithiLabel: p.tithiLabel,
      nakshatra: p.nakshatra,
      nakshatraName: p.nakshatraName,
      repeatedTithi: repeated,
      tithiMismatch: mismatch,
    });
  }
  return days;
}

/** Which Navratri day (1–9) is today, or null when it is not Navratri. */
export function currentNavratriDay(loc: GeoLocation, now: Date): NavratriDay | null {
  const year = now.getUTCFullYear();
  for (const kind of ["sharad", "chaitra"] as NavratriKind[]) {
    const w = computeNavratri(kind, year, loc);
    const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    const hit = w.days.find((d) => d.dateKey === key);
    if (hit) return hit;
  }
  return null;
}

/** Today's Navadurga form: by Navratri day when in season, else by tithi. */
export function todaysDeviId(loc: GeoLocation, now: Date): { id: string; reason: string } {
  const nd = currentNavratriDay(loc, now);
  if (nd) return { id: nd.deviId, reason: `Navratri day ${nd.day} (${nd.tithiLabel})` };
  const p = panchangForDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), loc);
  const t = isShuklaPaksha(p.tithi) ? p.tithi : p.tithi - 15;
  const idx = Math.min(Math.max(t, 1), 9) - 1;
  return {
    id: NAVADURGA_BY_DAY[idx],
    reason: `Outside Navratri: form associated with ${p.tithiLabel}`,
  };
}

export function formatInTimezone(utc: Date, timeZone: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat("en-IN", { timeZone, ...opts }).format(utc);
  } catch {
    return new Intl.DateTimeFormat("en-IN", opts).format(utc);
  }
}
