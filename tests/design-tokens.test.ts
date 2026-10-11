import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design-token integrity: every colour the app renders must exist, and every
 * text/background pairing must clear WCAG.
 *
 * Both of these were real defects that a typecheck and a green build cannot
 * catch. Seven custom properties were referenced by components and defined
 * nowhere, so those declarations silently rendered no colour at all — including
 * the splash screen background and the reader's active-script indicator. And
 * light-theme gold measured 2.40:1 on ivory, failing as text, as a button fill
 * and as a border.
 *
 * A CSS custom property that resolves to nothing produces no error anywhere:
 * the browser just drops the declaration. Only measuring catches it.
 */

const ROOT = join(__dirname, "..");
const CSS = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

/* ------------------------------------------------------------------ parsing */

function parseBlock(selector: string): Record<string, string> {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = CSS.match(new RegExp(esc + "\\s*\\{([^}]*)\\}", "s"));
  if (!m) throw new Error(`selector not found in globals.css: ${selector}`);
  const out: Record<string, string> = {};
  for (const [, name, value] of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(tsx?|css)$/.test(entry)) yield full;
  }
}

/* ----------------------------------------------------------- colour maths */

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const channel = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG 2.1 contrast ratio, 1:1 to 21:1. */
function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ------------------------------------------------------------- the checks */

const light = parseBlock(":root");
const dark = parseBlock('[data-theme="dark"]');

/**
 * Tokens set on <html> at runtime by useApplySettings, so they legitimately
 * have no value in the stylesheet.
 */
const RUNTIME = new Set(["--text-scale", "--verse-scale", "--verse-line"]);

/** Tailwind's @theme block publishes these under a --color- prefix. */
const NAMESPACED = /^(--color-|--font-|--radius-|--shadow-)/;

describe("design tokens are all defined", () => {
  const used = new Map<string, string[]>();
  for (const file of walk(join(ROOT, "src"))) {
    if (file.endsWith("globals.css")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/var\((--[\w-]+)/g)) {
      const name = m[1];
      if (RUNTIME.has(name) || NAMESPACED.test(name)) continue;
      const rel = relative(ROOT, file);
      const list = used.get(name) ?? [];
      list.push(rel);
      used.set(name, list);
    }
  }

  it("finds usages to check", () => {
    // Guards against the test silently passing over an empty set — e.g. if the
    // source layout moves and the walk finds nothing. The app currently uses 17
    // distinct custom properties; assert a floor well below that so adding or
    // removing a token does not break the guard, but an empty scan does.
    expect(used.size).toBeGreaterThanOrEqual(10);
  });

  it("defines every custom property a component references, in light mode", () => {
    const missing = [...used.keys()].filter((n) => !(n in light)).sort();
    expect(
      missing.map((n) => `${n} (used in ${used.get(n)!.join(", ")})`),
    ).toEqual([]);
  });

  it("defines every custom property a component references, in dark mode", () => {
    // Dark overrides only some tokens and inherits the rest, so a token may
    // legitimately live only in :root — but it must exist in one of them.
    const missing = [...used.keys()]
      .filter((n) => !(n in light) && !(n in dark))
      .sort();
    expect(missing).toEqual([]);
  });

  it("resolves every token to a concrete colour, not another undefined var", () => {
    for (const [name, value] of Object.entries(light)) {
      const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
      for (const ref of refs) {
        expect(ref, `${name} refers to undefined ${ref}`).toBeDefined();
        expect(
          ref in light || ref in dark,
          `${name} -> ${ref} is defined nowhere`,
        ).toBe(true);
      }
    }
  });
});

/**
 * Pairings the interface actually renders. Each entry names where it appears,
 * because "gold on surface" alone does not tell a future reader why it matters.
 */
const PAIRINGS: { label: string; fg: string; bg: string; min: number }[] = [
  // 4.5:1 — WCAG 2.1 AA for body text.
  { label: "body text on page", fg: "--ink", bg: "--surface", min: 4.5 },
  { label: "body text on raised card", fg: "--ink", bg: "--surface-2", min: 4.5 },
  { label: "body text on tinted panel", fg: "--ink", bg: "--surface-3", min: 4.5 },
  { label: "secondary text", fg: "--ink-2", bg: "--surface", min: 4.5 },
  { label: "muted captions", fg: "--muted", bg: "--surface", min: 4.5 },
  { label: "muted on card", fg: "--muted", bg: "--surface-2", min: 4.5 },
  { label: "muted on tinted panel", fg: "--muted", bg: "--surface-3", min: 4.5 },
  { label: "links and accents", fg: "--accent", bg: "--surface", min: 4.5 },
  { label: "gold eyebrow text", fg: "--gold", bg: "--surface", min: 4.5 },
  { label: "label on gold button", fg: "--surface", bg: "--gold", min: 4.5 },
  { label: "text on gold-soft fill", fg: "--ink", bg: "--gold-soft", min: 4.5 },
  { label: "accent on accent-soft chip", fg: "--accent", bg: "--accent-soft", min: 4.5 },
  { label: "warn/error text", fg: "--maroon-500", bg: "--surface", min: 4.5 },
  // The reader's active script tab paints --surface text on an --accent fill.
  // It was --ivory-100, which works in light mode (7.48:1) but collapses to
  // 1.57:1 in dark mode where --accent inverts to a pale gold. --surface tracks
  // the theme, so it is correct in both.
  { label: "script toggle label", fg: "--surface", bg: "--accent", min: 4.5 },

  // 3:1 — WCAG 2.1 AA for meaningful non-text UI boundaries.
  { label: "gold focus ring / border", fg: "--gold", bg: "--surface", min: 3.0 },
  { label: "warn border", fg: "--maroon-400", bg: "--surface", min: 3.0 },
  { label: "form control border", fg: "--line-strong", bg: "--surface", min: 3.0 },
  { label: "crimson border", fg: "--crimson", bg: "--surface", min: 3.0 },
];

/**
 * Deliberately NOT held to 3:1.
 *
 * `--line` is used for card edges, section rules and dividers. Those separate
 * content visually but identify no interactive component, so WCAG 2.1 SC
 * 1.4.11 does not apply to them. Every control boundary uses `--line-strong`
 * instead, which is asserted above.
 *
 * Recorded here so the exemption is a decision on the record rather than a
 * failing test someone quietly deleted.
 */
const DECORATIVE_ONLY = ["--line"];

describe("WCAG contrast", () => {
  describe("light theme", () => {
    for (const p of PAIRINGS) {
      it(`${p.label} clears ${p.min}:1`, () => {
        const fg = light[p.fg];
        const bg = light[p.bg];
        expect(fg, `${p.fg} undefined`).toBeTruthy();
        expect(bg, `${p.bg} undefined`).toBeTruthy();
        const ratio = contrast(fg, bg);
        expect(
          ratio,
          `${p.fg} (${fg}) on ${p.bg} (${bg}) = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(p.min);
      });
    }
  });

  describe("dark theme", () => {
    for (const p of PAIRINGS) {
      it(`${p.label} clears ${p.min}:1`, () => {
        // Dark overrides only some tokens; fall back to :root as CSS does.
        const fg = dark[p.fg] ?? light[p.fg];
        const bg = dark[p.bg] ?? light[p.bg];
        expect(fg, `${p.fg} undefined`).toBeTruthy();
        expect(bg, `${p.bg} undefined`).toBeTruthy();
        const ratio = contrast(fg, bg);
        expect(
          ratio,
          `${p.fg} (${fg}) on ${p.bg} (${bg}) = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(p.min);
      });
    }
  });
});

describe("decorative vs interactive boundaries", () => {
  /** Index just past the '>' closing the JSX opening tag at `start`. */
  function tagEnd(text: string, start: number): number {
    let depth = 0;
    let quote: string | null = null;
    for (let i = start; i < text.length; i += 1) {
      const c = text[i];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === "{") {
        depth += 1;
      } else if (c === "}") {
        depth -= 1;
      } else if (c === ">" && depth === 0) {
        return i + 1;
      }
    }
    return text.length;
  }

  let scanned = 0;
  const offenders: { file: string; line: number; tag: string }[] = [];
  for (const file of walk(join(ROOT, "src"))) {
    if (!file.endsWith(".tsx")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/<(input|textarea|select)\b/g)) {
      scanned += 1;
      const seg = text.slice(m.index, tagEnd(text, m.index!));
      if (DECORATIVE_ONLY.some((tok) => seg.includes(`var(${tok})`))) {
        offenders.push({
          file: relative(ROOT, file),
          line: text.slice(0, m.index).split("\n").length,
          tag: m[1],
        });
      }
    }
  }

  it("scans a meaningful number of form controls", () => {
    // The app has ~40. Guards against the walk silently finding none, which
    // would make the check below pass for the wrong reason.
    expect(scanned).toBeGreaterThan(20);
  });

  it("borders every form control with --line-strong, never the decorative --line", () => {
    // A control edge is the visual information that identifies the component,
    // so SC 1.4.11's 3:1 applies. --line is 1.35:1 and would make the field
    // boundary effectively invisible.
    expect(offenders.map((c) => `${c.file}:${c.line} <${c.tag}>`)).toEqual([]);
  });

  it("keeps the decorative token visibly lighter than the control token", () => {
    // If someone later raises --line to control strength, the distinction this
    // test encodes stops meaning anything. Assert the separation is real.
    const decorative = contrast(light["--line"], light["--surface"]);
    const control = contrast(light["--line-strong"], light["--surface"]);
    expect(decorative).toBeLessThan(3);
    expect(control).toBeGreaterThanOrEqual(3);
  });
});

describe("high-contrast mode", () => {
  it("raises muted text to the secondary-ink contrast", () => {
    const ratio = contrast(light["--ink-2"], light["--surface"]);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it("raises field borders to a clearly visible contrast", () => {
    const ratio = contrast(light["--ink-2"], light["--surface"]);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

describe("the contrast maths itself", () => {
  it("returns 21:1 for black on white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for identical colours", () => {
    expect(contrast("#8a611c", "#8a611c")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrast("#8a611c", "#fffefb")).toBeCloseTo(
      contrast("#fffefb", "#8a611c"),
      10,
    );
  });

  it("matches a published reference value", () => {
    // #777777 on #ffffff is the canonical 4.48:1 example, just under AA.
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });
});
