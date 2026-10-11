/**
 * Generates the PWA icon set from the same ornament geometry the app renders
 * inline (see src/components/ornament.tsx), in the palette declared in
 * globals.css.
 *
 * Kept as a committed script rather than hand-drawn bitmaps so the icons can be
 * regenerated if the palette changes, and so their provenance is clear: they
 * are original work derived from this repository's own SVG, not licensed or
 * downloaded artwork.
 *
 * Usage: node scripts/build-icons.mjs
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "icons");
mkdirSync(OUT, { recursive: true });

/* Palette — must match the design tokens in src/app/globals.css. */
const MAROON_950 = "#1a070d";
const GOLD = "#e8c86a";
const GOLD_DIM = "#c9a227";

/* 16-petal mandala, constructed as <Mandala petals={16}> does. */
const PETALS = 16;
const petalPaths = Array.from({ length: PETALS }, (_, i) => {
  const a = (360 / PETALS) * i;
  return `<g transform="rotate(${a} 100 100)">
      <path d="M100 22 C 112 48, 112 62, 100 74 C 88 62, 88 48, 100 22 Z"/>
    </g>`;
}).join("\n    ");

/* The OmMark paths, lifted verbatim from the component. */
const OM = `
    <path d="M14 40 c -6 0 -9 -4 -8 -8 c 1 -5 7 -6 11 -3 c 5 4 2 12 -4 13 c -7 1 -12 -5 -10 -12"/>
    <path d="M20 34 c 4 -3 10 -2 12 2 c 2 5 -2 10 -8 10"/>
    <path d="M32 26 c 6 -2 12 2 12 9 c 0 9 -8 14 -16 13"/>
    <path d="M36 18 c 4 -4 11 -2 12 3 c 1 4 -2 7 -6 7"/>
    <circle cx="46" cy="12" r="1.8" fill="${GOLD}" stroke="none"/>`;

/**
 * Maskable icons need the artwork inside the central 80% safe zone, because
 * launchers crop them into circles, squircles and rounded squares.
 */
function buildSvg({ scale = 1 } = {}) {
  const inset = 100 - 100 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${MAROON_950}"/>
  <g transform="translate(${inset} ${inset}) scale(${scale})">
    <g fill="none" stroke="${GOLD_DIM}" stroke-width="1.6" opacity="0.75">
      <circle cx="100" cy="100" r="92"/>
      <circle cx="100" cy="100" r="78"/>
      ${petalPaths}
    </g>
    <g fill="none" stroke="${GOLD}" stroke-width="4.2" stroke-linecap="round"
       transform="translate(58 66) scale(1.32)">
      ${OM}
    </g>
  </g>
</svg>`;
}

const targets = [
  { px: 192, file: "icon-192.png", scale: 1 },
  { px: 512, file: "icon-512.png", scale: 1 },
  // Safe-zone inset for maskable use.
  { px: 512, file: "maskable-512.png", scale: 0.8 },
  { px: 32, file: "favicon-32.png", scale: 1 },
];

for (const t of targets) {
  const svg = buildSvg({ scale: t.scale });
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(t.px, t.px)
    .png()
    .toFile(join(OUT, t.file));
  console.log(`wrote public/icons/${t.file} (${t.px}px)`);
}
