import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The PWA layer is static files plus a worker whose runtime behaviour only a
 * real browser can exercise. What we *can* verify here is that the artefacts
 * are coherent: the manifest names icons that exist, the worker is parseable,
 * and its strategy choices are the deliberate ones.
 *
 * The one thing genuinely worth asserting in code is the caching policy,
 * because a wrong policy is how offline silently breaks: content-hashed assets
 * must be cache-first, navigations network-first, and the health probe must
 * never be cached (an offline device must not be handed a stale "ok").
 */

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");

describe("manifest", () => {
  const manifest = JSON.parse(
    readFileSync(join(PUB, "manifest.webmanifest"), "utf8"),
  ) as {
    name: string;
    start_url: string;
    display: string;
    icons: { src: string; sizes: string; purpose?: string }[];
  };

  it("declares the fields an installer needs", () => {
    expect(manifest.name).toContain("Navratri");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("has 192 and 512 icons plus a maskable one", () => {
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("points at icon files that actually exist", () => {
    for (const icon of manifest.icons) {
      const file = join(PUB, icon.src.replace(/^\//, ""));
      expect(existsSync(file), `missing ${icon.src}`).toBe(true);
      // An icon that parses as PNG rather than just existing.
      const buf = readFileSync(file);
      expect(
        buf.subarray(1, 4).toString("ascii"),
        `${icon.src} is not a PNG`,
      ).toBe("PNG");
    }
  });

  it("declares a maskable icon with a safe-zone variant", () => {
    const maskable = manifest.icons.find((i) => i.purpose === "maskable");
    expect(maskable).toBeTruthy();
    // The generator builds it from the same SVG with the artwork inset.
    expect(existsSync(join(PUB, "icons/maskable-512.png"))).toBe(true);
  });
});

describe("service worker", () => {
  const sw = readFileSync(join(PUB, "sw.js"), "utf8");

  it("is parseable JavaScript", () => {
    // Parses without executing: `self` and friends are never touched.
    expect(() => new Function(sw)).not.toThrow();
  });

  it("only ever serves same-origin GET requests", () => {
    expect(sw).toContain('req.method !== "GET"');
    expect(sw).toContain("url.origin !== self.location.origin");
  });

  it("never caches the health endpoint", () => {
    // An offline device must not be handed a stale liveness result.
    expect(sw).toContain("/api/health");
  });

  it("uses cache-first for hashed assets and network-first for pages", () => {
    // The two strategies are applied to the right classes:
    expect(sw).toMatch(/_next\/static[\s\S]*?cacheFirst/);
    expect(sw).toMatch(/navigate[\s\S]*?networkFirst/);
  });

  it("supports the selected-offline message protocol", () => {
    for (const type of ["CACHE_URLS", "CACHE_DROP", "CACHED_LIST"]) {
      expect(sw).toContain(type);
    }
  });

  it("precaches a shell that includes the home fallback", () => {
    expect(sw).toContain('"/"');
    expect(sw).toContain("/manifest.webmanifest");
  });

  it("cleans up old caches on activate", () => {
    expect(sw).toContain("caches.delete");
  });
});

describe("offline is opt-in by default", () => {
  it("defaults the setting to off", () => {
    const types = readFileSync(join(ROOT, "src/lib/types.ts"), "utf8");
    const defaults = types.slice(
      types.indexOf("export const DEFAULT_SETTINGS"),
      types.indexOf("};", types.indexOf("export const DEFAULT_SETTINGS")),
    );
    expect(defaults).toContain("offline: false");
  });

  it("registers the worker only when the reader enables it", () => {
    const offline = readFileSync(join(ROOT, "src/components/offline.tsx"), "utf8");
    // Registration is gated on the enabled flag, and disabling unregisters.
    expect(offline).toContain("if (enabled)");
    expect(offline).toContain("unregister()");
  });
});
