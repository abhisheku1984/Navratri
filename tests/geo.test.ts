import { describe, expect, it } from "vitest";
import {
  buildItinerary,
  formatKm,
  haversineKm,
  isLatLng,
  suggestOrder,
  type Stop,
} from "@/lib/geo";

/**
 * The planner's one claim about the world is a distance. These tests check it
 * against figures that can be verified independently, and check that the
 * ordering helpers never lose or duplicate a stop.
 */

const stop = (id: string, lat: number, lon: number, label = id): Stop => ({
  id,
  label,
  lat,
  lon,
});

describe("haversineKm", () => {
  it("returns zero for identical points", () => {
    expect(haversineKm({ lat: 26.17, lon: -91.7 }, { lat: 26.17, lon: -91.7 })).toBe(0);
  });

  it("is symmetric", () => {
    const a = { lat: 26.17, lon: -91.7 }; // Kamakhya, Guwahati
    const b = { lat: 22.3, lon: 73.2 }; // Ambaji region, Gujarat
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 9);
  });

  it("measures one degree of latitude as about 111 km", () => {
    // A degree of latitude is ~111.19 km on a sphere of this radius. This is
    // the standard sanity check for the formula.
    const d = haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 });
    expect(d).toBeCloseTo(111.19, 0);
  });

  it("measures one degree of longitude as zero at the equator offset by latitude", () => {
    // At the poles, a degree of longitude spans no ground distance at all.
    const d = haversineKm({ lat: 90, lon: 0 }, { lat: 90, lon: 90 });
    expect(d).toBeCloseTo(0, 6);
  });

  it("shrinks a degree of longitude towards the poles", () => {
    const atEquator = haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 });
    const at60 = haversineKm({ lat: 60, lon: 0 }, { lat: 60, lon: 1 });
    // cos(60°) = 0.5, so the higher-latitude leg is half as long.
    expect(at60).toBeCloseTo(atEquator / 2, 1);
  });

  it("gives roughly half the circumference for antipodal points", () => {
    // Pi * R is half the great-circle circumference, about 20,015 km.
    const d = haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 });
    expect(d).toBeCloseTo(Math.PI * 6371.0088, 3);
  });

  it("does not return NaN for antipodal points despite rounding", () => {
    const d = haversineKm({ lat: 12.34, lon: 56.78 }, { lat: -12.34, lon: -123.22 });
    expect(Number.isNaN(d)).toBe(false);
    expect(d).toBeGreaterThan(19_000);
  });

  it("agrees with a known Indian city pair", () => {
    // Delhi to Kolkata is commonly given as about 1,300 km great-circle.
    const d = haversineKm({ lat: 28.6139, lon: 77.209 }, { lat: 22.5726, lon: 88.3639 });
    expect(d).toBeGreaterThan(1200);
    expect(d).toBeLessThan(1400);
  });

  it("handles southern and western hemispheres", () => {
    // Crossing the equator and the prime meridian must not sign-flip.
    const d = haversineKm({ lat: -10, lon: -10 }, { lat: 10, lon: 10 });
    expect(d).toBeGreaterThan(3000);
    expect(d).toBeLessThan(3200);
  });
});

describe("isLatLng", () => {
  it("accepts valid coordinates", () => {
    expect(isLatLng({ lat: 26.17, lon: -91.7 })).toBe(true);
    expect(isLatLng({ lat: 0, lon: 0 })).toBe(true);
    expect(isLatLng({ lat: -90, lon: 180 })).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    expect(isLatLng({ lat: 91, lon: 0 })).toBe(false);
    expect(isLatLng({ lat: 0, lon: 181 })).toBe(false);
  });

  it("rejects missing, null and non-numeric values", () => {
    expect(isLatLng(null)).toBe(false);
    expect(isLatLng(undefined)).toBe(false);
    expect(isLatLng({})).toBe(false);
    expect(isLatLng({ lat: null, lon: 0 })).toBe(false);
    expect(isLatLng({ lat: "26.17", lon: -91.7 })).toBe(false);
    expect(isLatLng({ lat: NaN, lon: 0 })).toBe(false);
  });
});

describe("buildItinerary", () => {
  it("produces one leg fewer than there are stops", () => {
    const it = buildItinerary([stop("a", 0, 0), stop("b", 1, 0), stop("c", 2, 0)]);
    expect(it.legs).toHaveLength(2);
    expect(it.stops).toHaveLength(3);
  });

  it("sums legs into the total", () => {
    const it = buildItinerary([stop("a", 0, 0), stop("b", 1, 0), stop("c", 3, 0)]);
    const manual = it.legs.reduce((s, l) => s + l.km, 0);
    expect(it.totalKm).toBeCloseTo(manual, 9);
  });

  it("computes a straight line as the sum of its parts", () => {
    // Three collinear stops one degree apart: total should be two degrees.
    const it = buildItinerary([stop("a", 0, 0), stop("b", 1, 0), stop("c", 2, 0)]);
    expect(it.totalKm).toBeCloseTo(2 * 111.19, 0);
  });

  it("handles empty and single-stop itineraries without throwing", () => {
    expect(buildItinerary([]).totalKm).toBe(0);
    expect(buildItinerary([]).legs).toHaveLength(0);

    const single = buildItinerary([stop("a", 0, 0)]);
    expect(single.legs).toHaveLength(0);
    expect(single.totalKm).toBe(0);
    expect(single.stops).toHaveLength(1);
  });

  it("reports a repeated stop as a zero-length leg", () => {
    const it = buildItinerary([stop("a", 0, 0), stop("a", 0, 0)]);
    expect(it.legs).toHaveLength(1);
    expect(it.legs[0].km).toBe(0);
  });

  it("names both endpoints on every leg", () => {
    const it = buildItinerary([stop("a", 0, 0), stop("b", 1, 0)]);
    expect(it.legs[0].from.id).toBe("a");
    expect(it.legs[0].to.id).toBe("b");
  });
});

describe("suggestOrder", () => {
  const zigzag: Stop[] = [
    stop("a", 0, 0),
    stop("b", 50, 50),
    stop("c", 1, 0),
    stop("d", 51, 50),
  ];

  it("never loses or duplicates a stop", () => {
    const ordered = suggestOrder(zigzag);
    expect(ordered).toHaveLength(zigzag.length);
    expect(new Set(ordered.map((s) => s.id)).size).toBe(zigzag.length);
  });

  it("produces a shorter route than the input order for a zigzag", () => {
    const naive = buildItinerary(zigzag).totalKm;
    const suggested = buildItinerary(suggestOrder(zigzag)).totalKm;
    expect(suggested).toBeLessThan(naive);
  });

  it("groups the two clusters together", () => {
    const ordered = suggestOrder(zigzag).map((s) => s.id);
    // a and c are one cluster; b and d are another. Each pair must be adjacent.
    expect(Math.abs(ordered.indexOf("a") - ordered.indexOf("c"))).toBe(1);
    expect(Math.abs(ordered.indexOf("b") - ordered.indexOf("d"))).toBe(1);
  });

  it("honours the requested starting stop", () => {
    const ordered = suggestOrder(zigzag, "b");
    expect(ordered[0].id).toBe("b");
  });

  it("falls back to the first stop for an unknown start id", () => {
    const ordered = suggestOrder(zigzag, "no-such-id");
    expect(ordered[0].id).toBe("a");
  });

  it("handles empty and single-stop input", () => {
    expect(suggestOrder([])).toEqual([]);
    expect(suggestOrder([stop("a", 0, 0)])).toHaveLength(1);
  });

  it("does not mutate its input", () => {
    const input = [...zigzag];
    suggestOrder(input);
    expect(input.map((s) => s.id)).toEqual(zigzag.map((s) => s.id));
  });

  it("finds the exact optimum on a small case the heuristic could miss", () => {
    // Nearest neighbour from `a` would jump to `b` (10 away) and then be forced
    // into `c` (30 away), totalling 40. The optimum is a -> c -> b, totalling 30.
    const traps: Stop[] = [stop("a", 0, 0), stop("b", 40, 0), stop("c", 10, 0)];
    const ordered = suggestOrder(traps).map((s) => s.id);
    expect(ordered).toEqual(["a", "c", "b"]);
    expect(buildItinerary(suggestOrder(traps)).totalKm).toBeCloseTo(40 * 111.19, 0);
  });

  it("falls back to nearest neighbour above nine stops", () => {
    // Twelve stops in two clusters, deliberately interleaved so the input order
    // zigzags between them and is far from optimal. (An earlier version of this
    // test listed the stops already sorted by latitude, which made the "naive"
    // order optimal and the comparison meaningless.)
    const north: Stop[] = [];
    const far: Stop[] = [];
    for (let i = 0; i < 6; i += 1) north.push(stop(`n${i}`, i, 0));
    for (let i = 0; i < 6; i += 1) far.push(stop(`f${i}`, 40 + i, 0));

    const many: Stop[] = [];
    for (let i = 0; i < 6; i += 1) many.push(north[i], far[i]);
    expect(many).toHaveLength(12);

    const ordered = suggestOrder(many);
    expect(ordered).toHaveLength(12);
    expect(new Set(ordered.map((s) => s.id)).size).toBe(12);

    const naive = buildItinerary(many).totalKm;
    const suggested = buildItinerary(ordered).totalKm;
    expect(suggested).toBeLessThan(naive);

    // The optimum here is the span of the points: 0 to 45 degrees of latitude,
    // because each cluster is contiguous along one meridian.
    expect(suggested).toBeCloseTo(45 * 111.19, 0);
  });
});

describe("formatKm", () => {
  it("switches to metres below a kilometre", () => {
    expect(formatKm(0.25)).toBe("250 m");
    expect(formatKm(0.999)).toBe("999 m");
  });

  it("shows one decimal for short distances", () => {
    expect(formatKm(1)).toBe("1.0 km");
    expect(formatKm(9.87)).toBe("9.9 km");
  });

  it("rounds and groups larger distances", () => {
    expect(formatKm(1234.5)).toBe("1,235 km");
  });

  it("uses an em dash for impossible values", () => {
    expect(formatKm(-1)).toBe("—");
    expect(formatKm(NaN)).toBe("—");
    expect(formatKm(Infinity)).toBe("—");
  });
});
