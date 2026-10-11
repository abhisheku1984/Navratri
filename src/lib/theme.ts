/**
 * Per-section cinematic theming.
 *
 * Every page shares one Devi Durga backdrop (see `backdrop.tsx`), but each
 * top-level section gets its own accent colour, soft-accent fill, backdrop
 * tint and display serif so the whole app reads as themed "per page".
 *
 * Accents are supplied for both light and dark palettes and chosen at render
 * time from the user's theme, keeping small-text contrast intact in each mode.
 * Display fonts are restricted to widely-available serifs (no font CDN) so the
 * build never depends on a network it cannot reach.
 */

export interface SectionTheme {
  /** Accent for the light palette (dark enough for small text on cream). */
  light: string;
  lightSoft: string;
  /** Accent for the dark palette (bright enough on near-black). */
  dark: string;
  darkSoft: string;
  /** Hue used to tint the shared cinematic backdrop on this section. */
  tint: string;
  /** Display serif for headings on this section. */
  display: string;
}

const SERIF_ELEGANT = '"Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
const SERIF_CLASSIC = 'Georgia, "Times New Roman", "Noto Serif Devanagari", serif';
const SERIF_PALATINO = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
const SERIF_GARAMOND = '"EB Garamond", Garamond, "Cormorant Garamond", Georgia, serif';

const DEFAULT: SectionTheme = {
  light: "#8d3446",
  lightSoft: "#f7e3e5",
  dark: "#e8c86a",
  darkSoft: "#2e0d16",
  tint: "#8d3446",
  display: SERIF_ELEGANT,
};

const THEMES: Record<string, SectionTheme> = {
  "": DEFAULT, // home
  "maa-durga": {
    light: "#96253f", lightSoft: "#f9e0e6",
    dark: "#f2a9b8", darkSoft: "#300d16",
    tint: "#a02c4a", display: SERIF_ELEGANT,
  },
  "navadurga": {
    light: "#8a4a12", lightSoft: "#f8ead9",
    dark: "#f0b46a", darkSoft: "#2e1a0a",
    tint: "#b4651a", display: SERIF_PALATINO,
  },
  "scripture": {
    light: "#5a3585", lightSoft: "#efe6f7",
    dark: "#c9a8f0", darkSoft: "#201231",
    tint: "#6a3f9d", display: SERIF_CLASSIC,
  },
  "shakti-peethas": {
    light: "#14604f", lightSoft: "#e0f1ec",
    dark: "#7fd6bd", darkSoft: "#0a241e",
    tint: "#177a63", display: SERIF_CLASSIC,
  },
  "temples": {
    light: "#8a5a14", lightSoft: "#f7ecd9",
    dark: "#e6c07a", darkSoft: "#2e2008",
    tint: "#a3701f", display: SERIF_PALATINO,
  },
  "calendar": {
    light: "#274f7c", lightSoft: "#e3ecf6",
    dark: "#9cc4f0", darkSoft: "#0e1c2e",
    tint: "#35608f", display: SERIF_CLASSIC,
  },
  "puja": {
    light: "#a03a17", lightSoft: "#fae6dd",
    dark: "#f5a97f", darkSoft: "#301208",
    tint: "#b8481f", display: SERIF_ELEGANT,
  },
  "mantras": {
    light: "#6d2a6d", lightSoft: "#f5e3f5",
    dark: "#e0a0e0", darkSoft: "#260926",
    tint: "#83378a", display: SERIF_GARAMOND,
  },
  "stories": {
    light: "#256b3a", lightSoft: "#e2f2e6",
    dark: "#96d9a8", darkSoft: "#0a2412",
    tint: "#2f7d48", display: SERIF_GARAMOND,
  },
  "learn": {
    light: "#31508b", lightSoft: "#e5eaf7",
    dark: "#a4bcf2", darkSoft: "#101a2e",
    tint: "#3c5c9c", display: SERIF_CLASSIC,
  },
  "devi-gyan": {
    light: "#31508b", lightSoft: "#e5eaf7",
    dark: "#a4bcf2", darkSoft: "#101a2e",
    tint: "#3c5c9c", display: SERIF_CLASSIC,
  },
};

/**
 * Resolve the theme for a pathname by its first path segment.
 * Unknown or utility sections fall back to the default crimson theme.
 */
export function routeTheme(pathname: string): SectionTheme {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return THEMES[seg] ?? DEFAULT;
}

/** CSS custom properties to apply on a section root for the given mode. */
export function themeVars(theme: SectionTheme, dark: boolean): Record<string, string> {
  return {
    "--accent": dark ? theme.dark : theme.light,
    "--accent-soft": dark ? theme.darkSoft : theme.lightSoft,
    "--tint": theme.tint,
    "--font-display": theme.display,
  };
}
