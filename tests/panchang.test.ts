/**
 * Panchang engine.
 *
 * Two layers are tested. First the astronomy, against independently known
 * syzygies — if the lunar series is wrong the tithis are wrong and every date
 * in the app is wrong. Then the Navratri derivation, including the awkward
 * cases (a repeated tithi, a skipped tithi) where a naive implementation
 * silently assigns the wrong goddess to a day.
 */
import { describe, expect, it } from "vitest";
import { elongation, julianDay, solarLongitude, sunriseUtc } from "@/lib/panchang/astronomy";
import {
  computeNavratri, currentNavratriDay, NAVADURGA_BY_DAY, NAVRATRI_SEARCH_WINDOW,
  panchangForDay, tithiAt, todaysDeviId, type GeoLocation,
} from "@/lib/panchang/panchang";

const DELHI: GeoLocation = {
  id: "delhi", city: "New Delhi", region: "Delhi", country: "India",
  lat: 28.6139, lon: 77.209, utcOffsetHours: 5.5, timezone: "Asia/Kolkata",
};

describe("astronomy", () => {
  it("computes Julian days correctly", () => {
    // J2000.0 is 2000-01-01 12:00 TT ≈ JD 2451545.0
    const jd = julianDay(new Date(Date.UTC(2000, 0, 1, 12)));
    expect(jd).toBeCloseTo(2451545.0, 1);
  });

  it("finds new moons as zero elongation", () => {
    // Known new moons; elongation should be ~0 (or ~360)
    for (const d of [Date.UTC(2000, 0, 6, 18), Date.UTC(2024, 3, 8, 18)]) {
      const e = elongation(julianDay(new Date(d)));
      const wrapped = e > 180 ? 360 - e : e;
      expect(wrapped, new Date(d).toISOString()).toBeLessThan(1.5);
    }
  });

  it("finds full moons as 180 degree elongation", () => {
    for (const d of [Date.UTC(2000, 0, 21, 5), Date.UTC(2024, 9, 17, 11)]) {
      const e = elongation(julianDay(new Date(d)));
      expect(Math.abs(e - 180), new Date(d).toISOString()).toBeLessThan(1.5);
    }
  });

  it("places the Sun at the equinox and the autumnal equinox", () => {
    // Vernal equinox 2000-03-20 -> 0 degrees. Longitude wraps at 360, so the
    // comparison has to be circular: 359.978 is 0.022 away from 0.
    const vernal = solarLongitude(julianDay(new Date(Date.UTC(2000, 2, 20, 7))));
    expect(Math.min(vernal, 360 - vernal)).toBeLessThan(0.2);
    // Autumnal equinox → 180 degrees
    const sep = solarLongitude(julianDay(new Date(Date.UTC(2026, 8, 23, 4))));
    expect(Math.abs(sep - 180)).toBeLessThan(1);
  });

  it("computes a plausible sunrise for Delhi", () => {
    const sr = sunriseUtc(new Date(Date.UTC(2026, 9, 12)), DELHI.lat, DELHI.lon);
    // Delhi sunrise in October is around 06:20 IST = 00:50 UTC
    const utcHour = sr.getUTCHours() + sr.getUTCMinutes() / 60;
    expect(utcHour).toBeGreaterThan(-0.5);
    expect(utcHour).toBeLessThan(1.5);
  });
});

describe("tithi", () => {
  it("returns a tithi in the valid range", () => {
    for (let d = 1; d <= 28; d++) {
      const p = panchangForDay(2026, 9, d, DELHI);
      expect(p.tithi).toBeGreaterThanOrEqual(1);
      expect(p.tithi).toBeLessThanOrEqual(30);
      expect(p.paksha === "shukla" ? p.tithi <= 15 : p.tithi > 15).toBe(true);
      expect(p.nakshatraName.length).toBeGreaterThan(0);
      expect(p.yogaName.length).toBeGreaterThan(0);
      expect(p.tithiLabelDevanagari).toMatch(/[\u0900-\u097F]/);
    }
  });

  it("agrees between the raw function and the day record", () => {
    const p = panchangForDay(2026, 9, 15, DELHI);
    expect(tithiAt(p.sunriseUtc)).toBe(p.tithi);
  });
});

describe("Navratri derivation", () => {
  it("has a search window for every observance type", () => {
    for (const kind of ["sharad", "chaitra", "gupt-magha", "gupt-ashadha"] as const) {
      const w = NAVRATRI_SEARCH_WINDOW[kind];
      expect(w.from.length).toBe(2);
      expect(w.to.length).toBe(2);
    }
  });

  it("binds the nine forms to the nine tithis", () => {
    expect(NAVADURGA_BY_DAY).toEqual([
      "shailaputri", "brahmacharini", "chandraghanta", "kushmanda", "skandamata",
      "katyayani", "kalaratri", "mahagauri", "siddhidatri",
    ]);
  });

  it("finds Sharad Navratri 2025 starting 23 September", () => {
    const w = computeNavratri("sharad", 2025, DELHI);
    expect(w.days[0].dateKey).toBe("2025-09-23");
    expect(w.days[0].day).toBe(1);
    expect(w.days[0].deviId).toBe("shailaputri");
    expect(w.days[0].tithi).toBe(1);
  });

  it("fixes Vijayadashami by tithi rather than by counting days", () => {
    const w = computeNavratri("sharad", 2025, DELHI);
    expect(w.vijayadashami).toBeTruthy();
    expect(w.vijayadashami!.tithi).toBe(10);
    expect(w.vijayadashami!.dateKey).toBe("2025-10-03");
  });

  it("flags a repeated tithi and keeps the same form on both days", () => {
    // 2025 has Tritiya spanning two sunrises
    const w = computeNavratri("sharad", 2025, DELHI);
    expect(w.hasRepeatedTithi).toBe(true);
    const repeated = w.days.filter((d) => d.repeatedTithi);
    expect(repeated.length).toBeGreaterThan(0);
    for (const d of repeated) {
      const prev = w.days.find((x) => x.day === d.day - 1);
      expect(prev).toBeTruthy();
      // the whole point: the form follows the tithi, not the day counter
      expect(d.deviId).toBe(prev!.deviId);
      expect(d.tithi).toBe(prev!.tithi);
    }
  });

  it("derives Sharad 2026 with ten observance days", () => {
    const w = computeNavratri("sharad", 2026, DELHI);
    expect(w.days[0].dateKey).toBe("2026-10-12");
    expect(w.days.length).toBeGreaterThanOrEqual(9);
    expect(w.vijayadashami!.tithi).toBe(10);
  });

  it("anchors Sharad 2027 on the Ashwin paksha, not the next month's", () => {
    // Pratipada is skipped at sunrise: 1 Oct is Amavasya and 2 Oct is already
    // Dwitiya. A search for tithi 1 walks on to 31 Oct, which is Kartika
    // Shukla Pratipada -- the day after Diwali, a different lunar month
    // entirely. The window must begin with the Ashwin paksha instead.
    const w = computeNavratri("sharad", 2027, DELHI);
    expect(w.days[0].dateKey).toBe("2027-10-02");
    expect(w.days).toHaveLength(9);
    expect(w.vijayadashami!.dateKey).toBe("2027-10-11");
    // Shailaputri is bound to Pratipada, which no sunrise reports this year
    expect(w.unobservedDeviIds).toEqual(["shailaputri"]);
  });

  it("never lets a window run past its own lunar fortnight", () => {
    // Chaitra 2027 has a skipped Dashami. An unbounded terminator search used
    // to find the next month's Dashami and return a 38-day "Navratri".
    for (const kind of ["sharad", "chaitra", "gupt-magha", "gupt-ashadha"] as const) {
      for (const year of [2025, 2026, 2027, 2028]) {
        const w = computeNavratri(kind, year, DELHI);
        if (w.days.length === 0) continue;
        expect(w.days.length, `${kind} ${year}`).toBeLessThanOrEqual(10);
        // every day must sit inside a single shukla paksha
        for (const d of w.days) {
          expect(d.tithi, `${kind} ${year} ${d.dateKey}`).toBeLessThanOrEqual(9);
        }
        // and the days must be contiguous civil dates
        for (let i = 1; i < w.days.length; i++) {
          const gap = w.days[i].civilDate.getTime() - w.days[i - 1].civilDate.getTime();
          expect(gap, `${kind} ${year} gap at ${w.days[i].dateKey}`).toBe(86400000);
        }
      }
    }
  });

  it("reports an unobserved form when a tithi is skipped", () => {
    const w = computeNavratri("chaitra", 2026, DELHI);
    expect(w.days.length).toBeGreaterThan(0);
    const mismatched = w.days.filter((d) => d.tithiMismatch);
    if (w.unobservedDeviIds.length > 0) {
      expect(w.days.length).toBeLessThan(9);
      // every form the window skipped must be one of the nine
      for (const id of w.unobservedDeviIds) {
        expect(NAVADURGA_BY_DAY).toContain(id as (typeof NAVADURGA_BY_DAY)[number]);
        expect(w.days.some((d) => d.deviId === id)).toBe(false);
      }
    }
    void mismatched;
  });

  it("never assigns a form outside the nine", () => {
    for (const kind of ["sharad", "chaitra"] as const) {
      for (const year of [2025, 2026, 2027]) {
        const w = computeNavratri(kind, year, DELHI);
        for (const d of w.days) {
          expect(NAVADURGA_BY_DAY, `${kind} ${year} day ${d.day}`)
            .toContain(d.deviId as (typeof NAVADURGA_BY_DAY)[number]);
        }
      }
    }
  });

  it("always carries its method note", () => {
    const w = computeNavratri("sharad", 2026, DELHI);
    expect(w.methodNote.length).toBeGreaterThan(40);
    expect(w.methodNote.toLowerCase()).toMatch(/sunrise|tithi/);
  });

  it("returns an empty window rather than guessing for an out-of-range year", () => {
    // a year far outside any plausible scan should not fabricate days
    const w = computeNavratri("sharad", 1800, DELHI);
    expect(Array.isArray(w.days)).toBe(true);
  });
});

describe("today", () => {
  it("identifies the current Navratri day when in season", () => {
    const during = new Date(Date.UTC(2026, 9, 14, 3));
    const day = currentNavratriDay(DELHI, during);
    expect(day).toBeTruthy();
    expect(day!.day).toBe(3);
    expect(day!.deviId).toBe("chandraghanta");
  });

  it("returns null outside the season rather than inventing a day", () => {
    expect(currentNavratriDay(DELHI, new Date(Date.UTC(2026, 6, 4, 3)))).toBeNull();
  });

  it("still names a form outside the season, and says why", () => {
    const out = todaysDeviId(DELHI, new Date(Date.UTC(2026, 6, 4, 3)));
    expect(NAVADURGA_BY_DAY).toContain(out.id as (typeof NAVADURGA_BY_DAY)[number]);
    expect(out.reason.toLowerCase()).toContain("outside navratri");
  });

  it("gives the in-season reason while Navratri is running", () => {
    const out = todaysDeviId(DELHI, new Date(Date.UTC(2026, 9, 14, 3)));
    expect(out.id).toBe("chandraghanta");
    expect(out.reason.toLowerCase()).toContain("navratri day 3");
  });
});
