/**
 * Pilgrimage geometry.
 *
 * Everything here is derived from the coordinates already stored on each
 * Peetha and temple record. Nothing is looked up, estimated or guessed.
 *
 * The one number this module produces is **great-circle distance** — the
 * shortest path over the surface of a sphere. That is real, verifiable
 * arithmetic. It is *not* a road distance and it is *not* a travel time:
 *
 *   - Road distance is always longer, often a great deal longer, because roads
 *     follow terrain, rivers and borders.
 *   - Travel time depends on the mode of transport, road quality, ferries,
 *     border crossings and traffic — none of which this repository has data
 *     for.
 *
 * Producing a travel time here would mean inventing one. We deliberately do
 * not. Callers must present these figures as straight-line distance and say so
 * in the interface.
 */

/** Mean Earth radius in kilometres (IUGG mean radius, 6371.0088 km). */
import type { ItineraryStop } from "@/lib/types";

export const EARTH_RADIUS_KM = 6371.0088;

export interface LatLng {
  lat: number;
  lon: number;
}

/**
 * A stop on an itinerary.
 *
 * Re-exported from the shared user-state types so the persisted shape and the
 * shape this module computes over are literally the same type, and cannot
 * drift apart.
 */
export type Stop = ItineraryStop;
export type { ItineraryStop };

export interface Leg {
  from: Stop;
  to: Stop;
  /** Great-circle distance in kilometres. */
  km: number;
}

export interface Itinerary {
  stops: Stop[];
  legs: Leg[];
  /** Sum of the legs, in kilometres. */
  totalKm: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two points, using the haversine formula.
 *
 * Haversine rather than the spherical law of cosines because it stays
 * numerically stable for very short separations, where the cosine of a
 * near-zero angle loses precision in floating point.
 */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  // Clamp: rounding can push the argument a hair past 1 for antipodal points,
  // which would make asin return NaN.
  const clamped = Math.min(1, Math.max(0, h));
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(clamped));
}

/** True when the value is a usable latitude/longitude pair. */
export function isLatLng(v: unknown): v is LatLng {
  if (typeof v !== "object" || v === null) return false;
  const { lat, lon } = v as Partial<LatLng>;
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/** Build the leg list and total for an ordered set of stops. */
export function buildItinerary(stops: Stop[]): Itinerary {
  const legs: Leg[] = [];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const from = stops[i];
    const to = stops[i + 1];
    legs.push({ from, to, km: haversineKm(from, to) });
  }
  const totalKm = legs.reduce((sum, l) => sum + l.km, 0);
  return { stops, legs, totalKm };
}

/**
 * Order stops by nearest neighbour from a chosen starting stop.
 *
 * This is a heuristic, not an optimal tour: nearest neighbour can be
 * arbitrarily worse than the best possible ordering. It is good enough to
 * turn an arbitrary pile of temples into a sane sequence, and it is honest
 * about being an approximation — which matters more here than shaving a few
 * kilometres. For nine or fewer stops an exact solution is cheap, so we use
 * one and only fall back to the heuristic for larger sets.
 */
export function suggestOrder(stops: Stop[], startId?: string): Stop[] {
  if (stops.length <= 1) return [...stops];

  if (stops.length <= 9) return exactOrder(stops, startId);

  const remaining = new Set(stops);
  const start =
    (startId ? stops.find((s) => s.id === startId) : undefined) ?? stops[0];

  const ordered: Stop[] = [start];
  remaining.delete(start);

  while (remaining.size > 0) {
    const last = ordered[ordered.length - 1];
    let nearest: Stop | null = null;
    let best = Infinity;
    for (const cand of remaining) {
      const d = haversineKm(last, cand);
      if (d < best) {
        best = d;
        nearest = cand;
      }
    }
    if (!nearest) break;
    ordered.push(nearest);
    remaining.delete(nearest);
  }

  return ordered;
}

/**
 * Exact shortest open path by brute force over permutations.
 *
 * 9! is 362,880 permutations, which is fast enough to run in the browser on a
 * click. Above that we hand off to nearest neighbour. The start is fixed, so
 * only the remaining stops permute.
 */
function exactOrder(stops: Stop[], startId?: string): Stop[] {
  const start = (startId ? stops.find((s) => s.id === startId) : undefined) ?? stops[0];
  const rest = stops.filter((s) => s !== start);

  let bestOrder: Stop[] = [];
  let bestTotal = Infinity;

  const path: Stop[] = [];
  const used = new Array<boolean>(rest.length).fill(false);

  const walk = () => {
    if (path.length === rest.length) {
      let total = 0;
      let prev: LatLng = start;
      for (const s of path) {
        total += haversineKm(prev, s);
        prev = s;
      }
      if (total < bestTotal) {
        bestTotal = total;
        bestOrder = [...path];
      }
      return;
    }
    for (let i = 0; i < rest.length; i += 1) {
      if (used[i]) continue;
      used[i] = true;
      path.push(rest[i]);
      walk();
      path.pop();
      used[i] = false;
    }
  };

  walk();
  return [start, ...bestOrder];
}

/** Round to a sensible precision for display, avoiding floating-point dust. */
export function formatKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("en-IN")} km`;
}
