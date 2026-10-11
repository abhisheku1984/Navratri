/**
 * Low-precision solar and lunar position algorithms.
 *
 * Source of the mathematics: Jean Meeus, *Astronomical Algorithms* (2nd ed.),
 * ch. 22 (Julian Day), ch. 25 (solar coordinates, low accuracy) and ch. 47
 * (lunar position, truncated series). The truncated series used here give
 * roughly 0.01° accuracy for the Sun and ~0.3° for the Moon, which is well
 * inside the margin needed to place a tithi boundary to the minute on almost
 * every day, and to the hour on boundary days.
 *
 * Deliberately free of any Node/browser API so the same module can run on the
 * server, in the browser, and under the test runner.
 */

const RAD = Math.PI / 180;

const sind = (d: number) => Math.sin(d * RAD);
const cosd = (d: number) => Math.cos(d * RAD);
const norm360 = (d: number) => ((d % 360) + 360) % 360;

/** Julian Day Number for an instant expressed in UTC. */
export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function jdToUtc(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

/** Julian centuries since J2000.0 (used by the solar series). */
function centuriesT(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/**
 * Apparent geocentric ecliptic longitude of the Sun, in degrees.
 * Meeus ch. 25 "low accuracy" plus the nutation/aberration correction.
 */
export function solarLongitude(jd: number): number {
  const T = centuriesT(jd);
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sind(M) +
    (0.019993 - 0.000101 * T) * sind(2 * M) +
    0.000289 * sind(3 * M);
  const trueLong = L0 + C;
  // apparent longitude: correct for nutation in longitude and aberration
  const omega = 125.04 - 1934.136 * T;
  return norm360(trueLong - 0.00569 - 0.00478 * sind(omega));
}

/**
 * Apparent geocentric ecliptic longitude of the Moon, in degrees.
 * Meeus ch. 47, table 47.A. NOTE: this series takes T in Julian *centuries*,
 * unlike the VSOP-style series that take millennia.
 */
export function lunarLongitude(jd: number): number {
  const T = centuriesT(jd);
  const Lp =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    (T * T * T) / 538841 -
    (T * T * T * T) / 65194000;
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868);
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T - (T * T * T) / 69699);
  const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000);

  // principal periodic terms (Meeus table 47.A, λ, in 1e-6 degrees)
  const terms: [number, number][] = [
    [6288774, sind(Mp)],
    [1274027, sind(2 * D - Mp)],
    [658314, sind(2 * D)],
    [213618, sind(2 * Mp)],
    [-185116, sind(M)],
    [-114332, sind(2 * F)],
    [58793, sind(2 * D - 2 * Mp)],
    [57066, sind(2 * D - M - Mp)],
    [53322, sind(2 * D + Mp)],
    [45758, sind(2 * D - M)],
    [-40923, sind(M - Mp)],
    [-34720, sind(D)],
    [-30383, sind(M + Mp)],
    [15327, sind(2 * D - 2 * F)],
    [-12528, sind(Mp + 2 * F)],
    [10980, sind(Mp - 2 * F)],
    [10675, sind(4 * D - Mp)],
    [10034, sind(3 * Mp)],
    [8548, sind(4 * D - 2 * Mp)],
    [-7888, sind(2 * D + M - Mp)],
  ];

  let lambda = Lp;
  for (const [coef, s] of terms) lambda += (coef / 1e6) * s;

  const omega = 125.04452 - 1934.136261 * centuriesT(jd);
  return norm360(lambda - 0.00478 * sind(omega));
}

/**
 * Lunar latitude in degrees (used only for eclipse-adjacent diagnostics and
 * for the optional "Moon sign" display).
 */
export function lunarLatitude(jd: number): number {
  const T = centuriesT(jd);
  const D = norm360(297.8501921 + 445267.1114034 * T);
  const M = norm360(357.5291092 + 35999.0502909 * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T);
  const F = norm360(93.272095 + 483202.0175233 * T);
  let beta =
    5128122 * sind(F) +
    280602 * sind(Mp + F) +
    277693 * sind(Mp - F) +
    173237 * sind(2 * D - F) +
    55413 * sind(2 * D - Mp + F) +
    46271 * sind(2 * D - Mp - F);
  beta += 0 * M;
  return beta / 1e6;
}

/** Elongation of the Moon from the Sun, 0–360°. */
export function elongation(jd: number): number {
  return norm360(lunarLongitude(jd) - solarLongitude(jd));
}

/**
 * Approximate UTC instant of sunrise for a location, using the standard
 * NOAA solar-noon formulation. Accurate to a few minutes, which is enough to
 * decide which tithi is in force "at sunrise".
 */
export function sunriseUtc(date: Date, lat: number, lon: number): Date {
  const jd = Math.floor(julianDay(new Date(Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12))));
  const T = centuriesT(jd);
  const L0 = norm360(280.46646 + 36000.76983 * T);
  const g = norm360(357.52911 + 35999.05029 * T);
  const lambdaSun = norm360(L0 + 1.9148 * sind(g) + 0.02 * sind(2 * g));
  const epsilon = 23.4397 - 0.0130 * T / 10;
  const decl = Math.asin(sind(epsilon) * sind(lambdaSun)) / RAD;

  const zenith = 90.833;
  const cosH =
    (cosd(zenith) - sind(lat) * sind(decl)) / (cosd(lat) * cosd(decl));
  if (cosH > 1) return new Date(NaN); // polar night
  if (cosH < -1) return new Date(NaN); // midnight sun
  const H = Math.acos(cosH) / RAD; // degrees

  const solarNoonUtcHours = 12 - lon / 15;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) +
      (solarNoonUtcHours - H / 15) * 3600000,
  );
}

/** Local solar midnight expressed in UTC, for a given UTC-offset day. */
export function localMidnightUtc(y: number, m: number, d: number, offsetHours: number): Date {
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - offsetHours * 3600000);
}
