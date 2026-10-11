import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as R from "@/lib/art";

/**
 * A cinematic page with a broken image is worse than a plain one: the frame,
 * vignette and caption all render around a hole. So every path the registry
 * hands to a component must point at a real file on disk.
 */

const ROOT = join(__dirname, "..");
const inPublic = (src: string) => join(ROOT, "public", src.replace(/^\//, ""));

const SLUGS = [
  "shailaputri", "brahmacharini", "chandraghanta", "kushmanda",
  "skandamata", "katyayani", "kalaratri", "mahagauri", "siddhidatri",
];

describe("art registry", () => {
  it("covers all nine Navadurga forms", () => {
    for (const slug of SLUGS) {
      expect(R.NAVADURGA_ART[slug], `no artwork for ${slug}`).toBeTruthy();
    }
  });

  it("every Navadurga artwork exists on disk", () => {
    for (const [slug, src] of Object.entries(R.NAVADURGA_ART)) {
      expect(existsSync(inPublic(src)), `missing ${src} for ${slug}`).toBe(true);
    }
  });

  it("every shared cinematic image exists on disk", () => {
    for (const [key, src] of Object.entries(R.ART)) {
      expect(existsSync(inPublic(src)), `missing ${src} for ${key}`).toBe(true);
    }
  });

  it("the artworks are non-trivial JPEGs, not placeholders", () => {
    for (const src of Object.values(R.NAVADURGA_ART)) {
      const size = statSync(inPublic(src)).size;
      expect(size, `${src} suspiciously small`).toBeGreaterThan(20_000);
    }
  });
});
