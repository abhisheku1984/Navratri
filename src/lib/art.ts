/**
 * Artwork registry.
 *
 * Every image the app shows is an original, AI-assisted digital rendering
 * produced for this repository (scripts/build-icons.mjs generates the icon set;
 * the devotional paintings live in public/art/). None is licensed or downloaded
 * artwork, and none is presented as a traditional or historical image.
 *
 * The interface labels each one "Contemporary digital rendering" so a reader is
 * never led to believe they are looking at an authentic or centuries-old
 * painting.
 */

/** The nine Navadurga forms, keyed by the slug used across the app. */
export const NAVADURGA_ART: Record<string, string> = {
  shailaputri: "/art/navadurga/shailaputri.jpg",
  brahmacharini: "/art/navadurga/brahmacharini.jpg",
  chandraghanta: "/art/navadurga/chandraghanta.jpg",
  kushmanda: "/art/navadurga/kushmanda.jpg",
  skandamata: "/art/navadurga/skandamata.jpg",
  katyayani: "/art/navadurga/katyayani.jpg",
  kalaratri: "/art/navadurga/kalaratri.jpg",
  mahagauri: "/art/navadurga/mahagauri.jpg",
  siddhidatri: "/art/navadurga/siddhidatri.jpg",
};

/** Shared cinematic imagery. */
export const ART = {
  hero: "/art/durga-hero.jpg",
  maaDurga: "/art/durga-hero.jpg",
  scripture: "/art/durga-hero.jpg",
} as const;

/** Artwork for a Navadurga slug, if we have it. */
export function navadurgaArt(slug: string): string | null {
  return NAVADURGA_ART[slug] ?? null;
}

/**
 * Per-section artwork so pages do not all repeat the same image. Each top-level
 * section is paired with a distinct rendering from the set we created; unknown
 * sections fall back to the hero. Navadurga profiles override this with their
 * own form (see `navadurgaArt`).
 */
export const SECTION_ART: Record<string, string> = {
  "": ART.hero,
  "maa-durga": ART.hero,
  navadurga: ART.hero,
  scripture: NAVADURGA_ART.siddhidatri,
  temples: NAVADURGA_ART.katyayani,
  "shakti-peethas": NAVADURGA_ART.kalaratri,
  calendar: NAVADURGA_ART.chandraghanta,
  puja: NAVADURGA_ART.shailaputri,
  mantras: NAVADURGA_ART.brahmacharini,
  stories: NAVADURGA_ART.kushmanda,
  learn: NAVADURGA_ART.mahagauri,
  "devi-gyan": NAVADURGA_ART.mahagauri,
  saved: NAVADURGA_ART.skandamata,
};

/** Resolve the artwork for a pathname's top-level section. */
export function sectionArt(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return SECTION_ART[seg] ?? ART.hero;
}

/** The honest caption shown with every rendering. */
export const ART_CAPTION = "Contemporary digital rendering";
