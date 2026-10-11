/**
 * Content integrity.
 *
 * These are the tests that would catch a silent import regression: verses
 * disappearing, numbering breaking, a collection losing records, or a field
 * the UI depends on going missing. Counts are asserted against the source's
 * own colophon where one exists, not against whatever the importer produced.
 */
import { describe, expect, it } from "vitest";
import {
  getAngas, getChapter, getChapters, getFestivalCollection, getGlossaryTerms,
  getKnowledgeTopics, getLocations, getMantras, getNavadurgaForms, getPeethas,
  getPujaGuides, getQuizzes, getScriptureManifest, getSources, getStories,
  getTempleCollection, getTemples, getTranslation, getTranslationManifest,
} from "@/lib/content";

describe("Durga Saptashati", () => {
  const chapters = getChapters();
  const manifest = getScriptureManifest();

  it("imports all thirteen chapters", () => {
    expect(chapters).toHaveLength(13);
    expect(chapters.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("has a manifest entry for every chapter and vice versa", () => {
    expect(manifest.chapters).toHaveLength(13);
    for (const entry of manifest.chapters) {
      const ch = getChapter(entry.number);
      expect(ch, `chapter ${entry.number}`).toBeTruthy();
      expect(ch!.id).toBe(entry.id);
      expect(ch!.verseUnitCount).toBe(entry.verseUnitCount);
      expect(ch!.traditionalVerseCount).toBe(entry.traditionalVerseCount);
      expect(ch!.markandeyaPuranaChapter).toBe(entry.number + 80);
    }
  });

  it("reconciles the traditional verse total with the source colophon (700)", () => {
    expect(manifest.traditionalVerseTotal).toBe(700);
    const summed = chapters.reduce((n, c) => n + c.traditionalVerseCount, 0);
    expect(summed).toBe(manifest.traditionalVerseTotal);
  });

  it("reconciles verse unit totals between manifest and chapters", () => {
    const summed = chapters.reduce((n, c) => n + c.verseUnitCount, 0);
    expect(summed).toBe(manifest.verseUnitTotal);
    for (const c of chapters) {
      expect(c.verses, `chapter ${c.number}`).toHaveLength(c.verseUnitCount);
    }
  });

  it("numbers verses continuously with no gaps or duplicates", () => {
    for (const c of chapters) {
      const seen = new Set<number>();
      for (const v of c.verses) {
        expect(v.n, `ch${c.number} ${v.label}`).toBeGreaterThanOrEqual(1);
        expect(v.nEnd).toBeGreaterThanOrEqual(v.n);
        expect(seen.has(v.n), `duplicate ${v.label}`).toBe(false);
        seen.add(v.n);
        // a range must be reflected in the label, e.g. "5.14-16"
        if (v.nEnd > v.n) expect(v.label).toContain("-");
        else expect(v.label).not.toContain("-");
      }
      // verses may span a range (5.14-16), so the next unit starts at nEnd+1;
      // the check is contiguity, not a step of exactly one
      let cursor = 1;
      for (const v of c.verses) {
        expect(v.n, `ch${c.number} expected next unit at ${cursor}`).toBe(cursor);
        cursor = v.nEnd + 1;
      }
      expect(cursor - 1, `ch${c.number} last verse number`).toBeGreaterThan(0);
    }
  });

  it("carries real Sanskrit text, not placeholders, in every verse", () => {
    const devanagari = /[\u0900-\u097F]/;
    for (const c of chapters) {
      for (const v of c.verses) {
        // a full shloka is far longer; the shortest legitimate units are
        // speaker lines like "वैश्य उवाच" (10 chars), so the floor is set just
        // above what a placeholder or an empty split could produce
        expect(v.devanagari.length, `${v.label} devanagari`).toBeGreaterThan(4);
        expect(devanagari.test(v.devanagari), `${v.label} not Devanagari`).toBe(true);
        expect(v.iast.length, `${v.label} iast`).toBeGreaterThan(4);
        // Anything shorter than a pada must be a speaker line, not a lost
        // fragment: "राजोवाच" (the king said) and "वैश्य उवाच" are real
        // single-line units in the text, and they always carry उवाच.
        if (v.devanagari.length < 20) {
          // "ऋषिरुवाच", "राजोवाच" (sandhi for राजन् + उवाच), "देवा ऊचुः".
          // Match on वाच / ऊचुः so the sandhi forms are caught too.
          expect(
            v.devanagari.includes("वाच") || v.devanagari.includes("ऊचुः"),
            `${v.label} is short (${v.devanagari.length}) but is not a speaker line: ${v.devanagari}`,
          ).toBe(true);
        }
        // most verses are 2 or 4 padas; a speaker line ("vaishya uvAcha")
        // is legitimately a single pada, so only insist on at least one
        expect(v.padas, `${v.label} padas`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("contains the 'ya devi' litany in chapter 5 as 21 verses", () => {
    const ch5 = getChapter(5)!;
    const yaDevi = ch5.verses.filter((v) => v.devanagari.includes("या देवी सर्वभूतेषु"));
    expect(yaDevi).toHaveLength(21);
    expect(yaDevi[0].label).toBe("5.14-16");
    expect(yaDevi[yaDevi.length - 1].label).toBe("5.74-76");
  });

  it("assigns every chapter to a charitra and presiding deity", () => {
    const byCharitra: Record<string, number[]> = {};
    for (const c of chapters) {
      expect(["prathama", "madhyama", "uttama"]).toContain(c.charitra);
      expect(c.presidingDeity.length).toBeGreaterThan(0);
      (byCharitra[c.charitra] ??= []).push(c.number);
    }
    expect(byCharitra.prathama).toEqual([1]);
    expect(byCharitra.madhyama).toEqual([2, 3, 4]);
    expect(byCharitra.uttama).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
});

describe("auxiliary recitations", () => {
  it("imports all six angas with verses", () => {
    const angas = getAngas();
    expect(angas).toHaveLength(6);
    for (const a of angas) {
      expect(a.verses.length, a.slug).toBeGreaterThan(0);
      expect(a.verses).toHaveLength(a.verseUnitCount);
      expect(["purvanga", "uttaranga"]).toContain(a.kind);
    }
  });

  it("has the Devi Kavacham at 60 verses naming the nine forms", () => {
    const kavacham = getAngas().find((a) => a.slug === "devi-kavacham")!;
    expect(kavacham.verses).toHaveLength(60);
    // verses 3-5 are the in-source authority for the nine names and their order.
    // They appear inflected ("chandraghaNTeti", "kAlarAtrishca"), so match stems.
    const names = kavacham.verses.slice(2, 5).map((v) => v.devanagari).join(" ");
    for (const stem of ["शैलपुत्री", "ब्रह्मचारिणी", "चन्द्रघण्ट", "कूष्माण्ड",
                        "स्कन्दमात", "कात्यायनी", "कालरात्रि", "महागौरी", "सिद्धिदात्री"]) {
      expect(names, `missing ${stem}`).toContain(stem);
    }
    expect(names).toContain("नवदुर्गाः प्रकीर्तिताः");
  });
});

describe("translations", () => {
  const trManifest = getTranslationManifest();

  it("has a translation for all thirteen chapters", () => {
    expect(trManifest).toBeTruthy();
    expect(trManifest!.chapters).toHaveLength(13);
    for (let n = 1; n <= 13; n++) expect(getTranslation(n), `chapter ${n}`).toBeTruthy();
  });

  it("labels chapter 13 as a partial witness rather than passing it off as complete", () => {
    const t13 = getTranslation(13)!;
    expect(t13.witness.status).toBe("partial_witness");
    expect(trManifest!.chapters.find((c) => c.chapter === 13)!.status).toBe("partial_witness");
    expect(t13.paragraphs.length).toBeLessThan(5);
  });

  it("offers no verse-level alignment, and says so", () => {
    for (let n = 1; n <= 13; n++) {
      expect(getTranslation(n)!.witness.verseAlignment).toBeNull();
    }
    expect(trManifest!.verseAlignment).toBeNull();
    expect(trManifest!.granularity).toBe("chapter");
  });

  it("records the translator and public-domain status on every chapter", () => {
    for (let n = 1; n <= 13; n++) {
      const w = getTranslation(n)!.witness;
      expect(w.translator).toBe("F. Eden Pargiter");
      expect(w.copyrightStatus).toBe("public_domain");
      expect(w.ocrUncorrected).toBe(true);
    }
  });
});

describe("Navadurga", () => {
  const forms = getNavadurgaForms();

  it("has all nine forms, one per day, in the traditional order", () => {
    expect(forms).toHaveLength(9);
    expect(forms.map((f) => f.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(forms.map((f) => f.slug)).toEqual([
      "shailaputri", "brahmacharini", "chandraghanta", "kushmanda", "skandamata",
      "katyayani", "kalaratri", "mahagauri", "siddhidatri",
    ]);
  });

  it("gives every form an imported dhyana verse and a Kavacham name reference", () => {
    for (const f of forms) {
      expect(f.dhyanaVerse.devanagari, `${f.slug} dhyana`).toBeTruthy();
      expect(f.dhyanaVerse.devanagari!).toMatch(/[\u0900-\u097F]/);
      expect(f.kavachamNameVerse.verse).toBeGreaterThanOrEqual(3);
      expect(f.kavachamNameVerse.devanagari, `${f.slug} kavacham`).toBeTruthy();
      expect(f.navarnaMantra.devanagari).toContain("चामुण्डायै");
    }
  });

  it("carries the full per-form template the product requires", () => {
    for (const f of forms) {
      expect(f.originStory.length, `${f.slug} origin`).toBeGreaterThan(80);
      expect(f.iconography.length).toBeGreaterThan(40);
      expect(f.symbolism.length).toBeGreaterThan(0);
      expect(f.offering.flower.length).toBeGreaterThan(0);
      expect(f.offering.bhog.length).toBeGreaterThan(0);
      expect(f.colour.length).toBeGreaterThan(0);
      expect(f.qualities.length).toBeGreaterThan(0);
      expect(f.familyStory.length, `${f.slug} family story`).toBeGreaterThan(80);
      expect(f.fiveMinuteRoutine.length).toBeGreaterThan(0);
      // regional variation must be acknowledged, not flattened
      expect(f.regionalVariationNote.length).toBeGreaterThan(0);
    }
  });
});

describe("Shakti Peethas", () => {
  const peethas = getPeethas();

  it("catalogues the full directory across more than one country", () => {
    expect(peethas).toHaveLength(60);
    const countries = new Set(peethas.map((p) => p.location.country));
    expect(countries.size).toBeGreaterThan(1);
    expect(countries.has("India")).toBe(true);
    // sacred geography is not restricted to modern India
    for (const c of ["Bangladesh", "Nepal", "Pakistan", "Sri Lanka"]) {
      expect(countries.has(c), `${c} missing`).toBe(true);
    }
  });

  it("records which list each site belongs to, from a defined set", () => {
    const col = getPeethas.length ? undefined : undefined;
    void col;
    for (const p of peethas) {
      expect(p.lists.length, p.id).toBeGreaterThan(0);
      for (const l of p.lists) expect(["18", "51", "52", "regional"]).toContain(l);
      expect(p.traditionNote.length, `${p.id} tradition`).toBeGreaterThan(0);
    }
  });

  it("keeps disputed identifications visible instead of resolving them", () => {
    const low = peethas.filter((p) => p.confidence === "low");
    expect(low.length).toBeGreaterThan(0);
    for (const p of low) {
      expect(["low", "medium", "high"]).toContain(p.confidence);
      expect(p.verificationStatus.note.length).toBeGreaterThan(0);
    }
  });

  it("does not invent visitor data", () => {
    for (const p of peethas) {
      expect(p.officialWebsite, p.id).toBeNull();
      expect(p.darshanTimings, p.id).toBeNull();
      expect(p.visitorInfoNote.length).toBeGreaterThan(0);
    }
  });

  it("has a unique id and slug per site", () => {
    expect(new Set(peethas.map((p) => p.id)).size).toBe(peethas.length);
    expect(new Set(peethas.map((p) => p.slug)).size).toBe(peethas.length);
  });
});

describe("temples", () => {
  const temples = getTemples();

  it("distinguishes Peethas from ordinary Devi temples", () => {
    const col = getTempleCollection();
    expect(temples.length).toBeGreaterThan(20);
    const kinds = new Set(temples.map((t) => t.kind));
    expect(kinds.has("shakti-peetha")).toBe(true);
    expect(kinds.has("major-devi-shrine")).toBe(true);
    // the two must not be collapsed into one undifferentiated list
    expect(temples.filter((t) => t.kind === "major-devi-shrine").length).toBeGreaterThan(0);
    expect(col.title.length).toBeGreaterThan(0);
  });

  it("leaves unverified visitor fields empty rather than estimating", () => {
    for (const t of temples) {
      expect(t.infoStatus).toBe("unverified");
      expect(t.openingHours, t.slug).toBeNull();
      expect(t.infoNote.length).toBeGreaterThan(0);
    }
  });
});

describe("editorial collections", () => {
  it("has a populated knowledge library following the topic template", () => {
    const topics = getKnowledgeTopics();
    expect(topics.length).toBeGreaterThanOrEqual(6);
    for (const t of topics) {
      expect(t.story.length).toBeGreaterThan(80);
      expect(t.detail.length).toBeGreaterThan(0);
      expect(t.significance.length).toBeGreaterThan(40);
      expect(t.source.length, `${t.slug} source`).toBeGreaterThan(0);
      expect(t.childVersion.length).toBeGreaterThan(40);
      expect(t.reflection.length).toBeGreaterThan(0);
    }
    // related links must resolve
    const slugs = new Set(topics.map((t) => t.slug));
    for (const t of topics) for (const r of t.related) expect(slugs.has(r), r).toBe(true);
  });

  it("marks withheld mantra texts instead of fabricating them", () => {
    const mantras = getMantras();
    const withheld = mantras.filter((m) => m.textStatus === "not-included");
    expect(withheld.length).toBeGreaterThan(0);
    for (const m of withheld) {
      expect(m.textStatusNote, `${m.slug} must explain itself`).toBeTruthy();
      expect(m.textStatusNote!.length).toBeGreaterThan(20);
    }
    // every anga entry points at its full imported text
    for (const m of mantras.filter((x) => x.category === "anga")) {
      expect(m.fullTextRef, m.slug).toBeTruthy();
    }
  });

  it("bundles no audio, because none is licensed", () => {
    for (const m of getMantras()) expect(m.audio, m.slug).toBeNull();
  });

  it("labels every story as a retelling with a named source", () => {
    const stories = getStories();
    expect(stories.length).toBeGreaterThanOrEqual(4);
    for (const s of stories) {
      expect(s.short.length).toBeGreaterThan(80);
      expect(s.long.length).toBeGreaterThan(s.short.length);
      expect(s.sourceNote.length, `${s.slug} source`).toBeGreaterThan(0);
      expect(s.minutes).toBeGreaterThan(0);
    }
  });

  it("has puja guides, quizzes, glossary terms, festivals and locations", () => {
    expect(getPujaGuides().length).toBeGreaterThanOrEqual(4);
    expect(getQuizzes().length).toBeGreaterThanOrEqual(3);
    expect(getGlossaryTerms().length).toBeGreaterThanOrEqual(15);
    expect(getFestivalCollection().observances.length).toBeGreaterThanOrEqual(4);
    expect(getLocations().locations.length).toBeGreaterThanOrEqual(5);
    for (const l of getLocations().locations) {
      expect(Number.isFinite(l.lat)).toBe(true);
      expect(Number.isFinite(l.lon)).toBe(true);
      expect(l.timezone.length).toBeGreaterThan(0);
    }
  });

  it("never presents fasting as compulsory", () => {
    const fasting = getPujaGuides().find((g) => g.slug === "fasting")!;
    const body = fasting.sections.map((s) => s.body).join(" ").toLowerCase();
    expect(body).toMatch(/not (a requirement|compulsory|obligatory|required)|never compulsory/);
    expect(body).toMatch(/pregnan|diabet|medication|doctor|elderly|children/);
  });
});

describe("sources registry", () => {
  it("records provenance and a status for every source", () => {
    const sources = getSources();
    expect(sources.length).toBeGreaterThanOrEqual(5);
    for (const s of sources) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.status.length, s.id).toBeGreaterThan(0);
      // a source either names where it came from or admits it was authored here
      expect(s.provenance || s.author, `${s.id} has no provenance`).toBeTruthy();
    }
  });

  it("carries the scripture source's licence restriction forward", () => {
    const durga = getSources().find((s) => s.id === "durga700")!;
    expect(durga.licence).toBeTruthy();
    expect(durga.licence!.toLowerCase()).toMatch(/commercial|permission/);
    expect(durga.people!.proofreaders.length).toBeGreaterThan(0);
  });
});
