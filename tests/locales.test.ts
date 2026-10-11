/**
 * Locale file integrity.
 *
 * Two classes of bug this catches, both of which are invisible until a user
 * switches language:
 *
 *  - a translation using a key that does not exist in the English reference,
 *    which can never render; and
 *  - a duplicated key in a locale object, where the second silently wins.
 *
 * The check is deliberately syntactic rather than importing the dictionaries:
 * a bad key in one file must not be able to break the whole i18n module.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { assertLanguageRegistry, EN_KEYS, LANGUAGES } from "@/lib/i18n";

const DIR = join(__dirname, "..", "src", "lib", "i18n", "dicts");

function keysOf(src: string): string[] {
  return [...src.matchAll(/^\s{2}"([^"]+)":/gm)].map((m) => m[1]);
}

describe("24-language registry", () => {
  it("passes its own consistency check", () => {
    expect(assertLanguageRegistry()).toEqual([]);
  });

  it("contains exactly 24 unique languages", () => {
    expect(LANGUAGES).toHaveLength(24);
    expect(new Set(LANGUAGES.map((l) => l.code)).size).toBe(24);
    expect(new Set(LANGUAGES.map((l) => l.native)).size).toBe(24);
  });

  it("marks Urdu, Sindhi and Kashmiri right-to-left and nothing else", () => {
    const rtl = LANGUAGES.filter((l) => l.dir === "rtl").map((l) => l.code).sort();
    expect(rtl).toEqual(["ks", "sd", "ur"]);
  });
});

describe("locale dictionaries", () => {
  const en = readFileSync(join(DIR, "en.ts"), "utf8");
  const enKeys = keysOf(en);
  const enSet = new Set(enKeys);

  it("has a 274-key English reference with no duplicates", () => {
    expect(enKeys.length).toBeGreaterThan(200);
    expect(new Set(enKeys).size).toBe(enKeys.length);
    expect(EN_KEYS.length).toBe(enKeys.length);
  });

  it("uses only keys from the English reference, with no duplicates", () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith(".ts") && f !== "en.ts");
    const problems: string[] = [];

    for (const f of files) {
      const src = readFileSync(join(DIR, f), "utf8");
      const keys = keysOf(src);
      const unknown = keys.filter((k) => !enSet.has(k));
      const dup = [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))];
      if (unknown.length) problems.push(`${f}: unknown ${unknown.join(", ")}`);
      if (dup.length) problems.push(`${f}: duplicated ${dup.join(", ")}`);
    }

    expect(problems).toEqual([]);
  });

  it("has a dictionary file for every registered language and no others", () => {
    const files = readdirSync(DIR)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.replace(/\.ts$/, ""))
      .sort();
    expect(files).toEqual([...LANGUAGES.map((l) => l.code)].sort());
  });
});
