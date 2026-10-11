#!/usr/bin/env python3
"""
Import the Durga Saptashati / Devi Mahatmyam from the proofread ITRANS edition
`scripts/sources/durga700.itx` into normalised JSON under `src/content/scripture`.

Source edition
--------------
  File        : scripts/sources/durga700.itx
  Provenance  : Sanskrit Documents (sanskritdocuments.org), doc_devii/durga700
  Transcribed : K. Shankaran, Kirk Wortman, Dhruba Chakroborty, Ahto Jarve
  Proofread   : Sunder Hattangadi, Kirk Wortman
  Latest rev. : February 26, 2024 (as stated in the file header)

The Devanagari and IAST renderings are *derived mechanically* from the ITRANS
transliteration using the `indic-transliteration` library. No verse text is
composed, paraphrased or repaired by this script.

Usage:
    python3 scripts/import_scripture.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    from indic_transliteration import sanscript
except ImportError:  # pragma: no cover
    sys.exit(
        "indic-transliteration is required.\n"
        "  pip install -r scripts/requirements.txt"
    )

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "sources" / "durga700.itx"
OUT_CHAPTERS = ROOT / "src" / "content" / "scripture" / "chapters"
OUT_ANGAS = ROOT / "src" / "content" / "scripture" / "angas"

# --------------------------------------------------------------------------
# Editorial metadata. Sanskrit titles are taken from the source file itself;
# only the *English gloss* and the charitra grouping are editorial and are
# flagged as such in the generated JSON.
# --------------------------------------------------------------------------
CHAPTER_META = {
    1: dict(charitra="prathama", charitra_label="Prathama Charitra",
            presiding="Mahakali", slug="madhu-kaitabha-vadha",
            english="Slaying of Madhu and Kaitabha"),
    2: dict(charitra="madhyama", charitra_label="Madhyama Charitra",
            presiding="Mahalakshmi", slug="mahishasura-sainya-vadha",
            english="Slaying of Mahishasura's armies"),
    3: dict(charitra="madhyama", charitra_label="Madhyama Charitra",
            presiding="Mahalakshmi", slug="mahishasura-vadha",
            english="Slaying of Mahishasura"),
    4: dict(charitra="madhyama", charitra_label="Madhyama Charitra",
            presiding="Mahalakshmi", slug="shakradi-stuti",
            english="The hymn of praise by Indra and the gods"),
    5: dict(charitra="uttama", charitra_label="Uttama Charitra",
            presiding="Mahasaraswati", slug="devi-duta-samvada",
            english="The Goddess's dialogue with the messenger"),
    6: dict(charitra="uttama", charitra_label="Uttama Charitra",
            presiding="Mahasaraswati", slug="dhumnalochana-vadha",
            english="Slaying of Dhumralochana"),
    7: dict(charitra="uttama", charitra_label="Uttama Charitra",
            presiding="Mahasaraswati", slug="chanda-munda-vadha",
            english="Slaying of Chanda and Munda"),
    8: dict(charitra="uttama", charitra_label="Uttama Charitra",
            presiding="Mahasaraswati", slug="raktabija-vadha",
            english="Slaying of Raktabija"),
    9: dict(charitra="uttama", charitra_label="Uttama Charitra",
            presiding="Mahasaraswati", slug="nishumbha-vadha",
            english="Slaying of Nishumbha"),
    10: dict(charitra="uttama", charitra_label="Uttama Charitra",
             presiding="Mahasaraswati", slug="shumbha-vadha",
             english="Slaying of Shumbha"),
    11: dict(charitra="uttama", charitra_label="Uttama Charitra",
             presiding="Mahasaraswati", slug="narayani-stuti",
             english="The Narayani Stuti"),
    12: dict(charitra="uttama", charitra_label="Uttama Charitra",
             presiding="Mahasaraswati", slug="bhagavati-vakya",
             english="The words of the Blessed Goddess"),
    13: dict(charitra="uttama", charitra_label="Uttama Charitra",
             presiding="Mahasaraswati", slug="suratha-vaishya-vara-pradana",
             english="The granting of boons to Suratha and the Vaishya"),
}

ANGA_META = {
    "argalAstotram": dict(id="argala-stotram", slug="argala-stotram",
                          title_en="Argala Stotram",
                          order=2, kind="purvanga",
                          note="Recited before the main path in the Navangam sequence."),
    "kIlakastotram": dict(id="kilaka-stotram", slug="kilaka-stotram",
                          title_en="Kilaka Stotram",
                          order=3, kind="purvanga",
                          note="Recited before the main path in the Navangam sequence."),
    "devI kavacham": dict(id="devi-kavacham", slug="devi-kavacham",
                          title_en="Devi Kavacham",
                          order=1, kind="purvanga",
                          note="The 'armour' hymn; recited first in the Navangam sequence."),
    "shrIchaNDikAdhyAnam": dict(id="chandika-dhyana", slug="chandika-dhyana",
                                title_en="Chandika Dhyana",
                                order=0, kind="purvanga",
                                note="Meditation verses placed at the head of the text."),
    "aparAdhakShamApaNastotram": dict(id="aparadha-kshamapana", slug="aparadha-kshamapana",
                                      title_en="Aparadha Kshamapana Stotram",
                                      order=98, kind="uttaranga",
                                      note="Prayer for forgiveness of errors in recitation; recited at the close."),
    "devIsUktam": dict(id="devi-suktam", slug="devi-suktam",
                       title_en="Devi Suktam (Rig Veda 10.125)",
                       order=97, kind="uttaranga",
                       note="Vak Sukta of the Rig Veda, recited in the Devi path."),
}

VERSE_RE_CH = re.compile(r"\|\|\s*(\d+)\\?\.\s*(\d+)(?:\s*-\s*(\d+))?\s*\|{1,2}\s*$")
VERSE_RE_SIMPLE = re.compile(r"\|\|\s*(\d+)\s*\|{1,2}\.?\s*$")
SECTION_RE = re.compile(r"^\\section\{\|\|\s*(.*?)\s*\|\|\}\s*$")

# Sanskrit ordinals used in chapter titles that carry no leading digit
# (e.g. "nArAyaNIstutirnAmaikAdasho.adhyAyaH" = chapter 11).
ORDINAL_TO_NUMBER = {
    "prathama": 1, "dvitIya": 2, "tR^itIya": 3, "chaturtha": 4,
    "pa~nchama": 5, "ShaShTha": 6, "saptama": 7, "aShTama": 8,
    "navama": 9, "dashama": 10, "ekAdasha": 11, "dvAdasha": 12,
    "trayodasha": 13,
}


TEX_MACRO_RE = re.compile(
    r"^\\(engtitle|itxtitle|endtitles|def|let|pagenumbering|parindent|portraitwide|begin|end|use|documentstyle)\b"
)
LINE_BREAK_RE = re.compile(r"^\.\s*")


def to_deva(itrans: str) -> str:
    return sanscript.transliterate(itrans, sanscript.ITRANS, sanscript.DEVANAGARI)


def to_iast(itrans: str) -> str:
    return sanscript.transliterate(itrans, sanscript.ITRANS, sanscript.IAST)


def clean(itrans: str) -> str:
    """Normalise TeX artefacts that are not part of the ITRANS text itself."""
    t = itrans
    t = t.replace("\\,", " ")
    t = t.replace("\\.", ".")
    t = t.replace("\\|", "|")
    t = t.replace("\\-", "-")
    t = t.replace("##", "")
    t = re.sub(r"[ \t]+", " ", t)
    return LINE_BREAK_RE.sub("", t.strip()).strip()



def read_sections() -> list[tuple[str, list[str]]]:
    raw = SRC.read_text(encoding="utf-8")
    lines = raw.splitlines()

    # skip the TeX preamble
    try:
        start = next(i for i, l in enumerate(lines) if "\\begin{document}" in l) + 1
    except StopIteration:
        start = 0

    sections: list[tuple[str, list[str]]] = []
    cur_title = "_PRELUDE_"
    cur: list[str] = []
    i = start
    while i < len(lines):
        line = lines[i]
        i += 1
        stripped = line.strip()
        if not stripped or stripped.startswith("%"):
            if cur and cur[-1] != "":
                cur.append("")
            continue
        m = SECTION_RE.match(stripped)
        if m:
            sections.append((cur_title, cur))
            cur_title, cur = m.group(1).strip(), []
            continue
        if "\\end{document}" in stripped:
            continue
        if TEX_MACRO_RE.match(stripped):
            continue
        # TeX soft hyphen: join to next line with no space
        joined = stripped
        while joined.endswith("\\-") and i < len(lines):
            joined = joined[:-2].rstrip() + lines[i].strip()
            i += 1
        cur.append(joined)
    sections.append((cur_title, cur))
    return sections


SPEAKER_RE = re.compile(r"^(?:OM\s+)?(?:aiM\s*|hrIM\s*|klIM\s*)?([A-Za-z^\'.]+uvAcha)\s*$")


def split_head(lines: list[str]) -> tuple[list[str], list[str]]:
    """Separate the pre-verse front matter from the first verse's own text.

    Front matter (viniyoga / dhyana / invocation) ends at the last line that
    terminates with a bare ``||`` and carries no verse number; anything after
    that belongs to verse 1.
    """
    idx = -1
    for i, ln in enumerate(lines):
        if re.search(r"\|\|\s*$", ln):
            idx = i
    if idx == -1:
        return [], lines
    return lines[: idx + 1], lines[idx + 1 :]


def split_verses(body: list[str], numbered: bool) -> tuple[list[dict], list[str], str | None, str | None]:
    """Return (verses, prelude_lines, evamAditaH_colophon, svasti_colophon).

    A verse is a run of lines terminated by `|| C.V||`. Every line of the run
    belongs to the verse, including the first pada, so lines are buffered until
    the terminator is seen and only then assigned.
    """
    verses: list[dict] = []
    prelude: list[str] = []
    colophon: str | None = None
    svasti: list[str] = []
    buf: list[str] = []

    for line in body:
        text = clean(line)
        if not text:
            continue
        m = VERSE_RE_CH.search(text) if numbered else VERSE_RE_SIMPLE.search(text)

        if m:
            ch = int(m.group(1)) if numbered else 0
            num = int(m.group(2)) if numbered else int(m.group(1))
            n_end = int(m.group(3)) if (numbered and m.group(3)) else num
            if n_end < num:
                sys.exit(f"[fatal] malformed verse range {ch}.{num}-{n_end}")
            term_text = text[: m.start()].strip().rstrip("|").strip()
            parts = buf + ([term_text] if term_text else [])
            if not verses:
                prelude, parts = split_head(parts)
            full = "\n".join(x for x in parts if x)
            buf = []
            first_line = full.split("\n")[0].strip()
            sm = SPEAKER_RE.match(first_line)
            verses.append(dict(
                chapter=ch, n=num, nEnd=n_end, iTrans=full,
                speaker=sm.group(1) if sm else None,
                padas=[x for x in full.split("\n") if x.strip()],
            ))
            continue

        buf.append(text)

    # whatever is left after the last verse is the traditional end matter
    if not verses:
        prelude = buf
    else:
        for t in buf:
            if re.search(r"evamAditaH", t):
                colophon = t
            elif re.search(r"svasti|samAptam", t):
                svasti.append(t)
    return verses, prelude, colophon, (" ".join(svasti) if svasti else None)


def _dhyana_to_verses(lines: list[str]) -> list[dict]:
    """Split the Chandika Dhyana at the `athavA` ("alternatively") marker.

    These verses carry no numbers in the source, so they are emitted as two
    unnumbered blocks rather than being re-numbered editorially.
    """
    blocks: list[list[str]] = [[]]
    for ln in lines:
        if ln.strip().lower() == "athava":
            blocks.append([])
            continue
        blocks[-1].append(ln)
    out = []
    for i, blk in enumerate(blocks, start=1):
        text = "\n".join(x.strip() for x in blk if x.strip())
        if text.strip():
            out.append(dict(chapter=0, n=i, nEnd=i, iTrans=text, speaker=None,
                            padas=[q for q in text.split("\n") if q.strip()]))
    return out


def extract_prelude_blocks(prelude: list[str]) -> dict:

    """Split front matter into viniyoga / dhyana / invocation blocks."""
    blocks: dict[str, list[str]] = {"viniyoga": [], "dhyana": [], "invocation": []}
    mode = "invocation"
    for line in prelude:
        if line.strip() == "viniyogaH":
            mode = "viniyoga"
            continue
        if "dhyAnam" in line:
            mode = "dhyana"
            continue
        if "namashchaNDikAyai" in line:
            mode = "invocation"
        blocks[mode].append(line)
    out: dict[str, str] = {}
    for k, v in blocks.items():
        joined = "\n".join(x.strip() for x in v if x.strip())
        if joined.strip():
            out[k] = joined
    return out


def main() -> int:
    sections = read_sections()
    OUT_CHAPTERS.mkdir(parents=True, exist_ok=True)
    OUT_ANGAS.mkdir(parents=True, exist_ok=True)

    chapters: dict[int, list[dict]] = {}
    angas: dict[str, list[str]] = {}
    prelude_text: list[str] = []

    preludes: dict = {}

    for title, body in sections:
        if title == "_PRELUDE_":
            prelude_text = [clean(b) for b in body if clean(b)]
            continue
        low = title.lower()
        mnum = re.match(r"^(\d+)\\?\.\s*(.+)$", title)

        # Is this one of the 13 chapters?  Titles are either "N. <name>" or,
        # for chapter 11, "<name> ... ekAdasho.adhyAyaH" with no leading digit.
        if mnum and "adhyAyaH" in title:
            num = int(mnum.group(1))
        elif "adhyAyaH" in title:
            num = next(
                (n for k, n in ORDINAL_TO_NUMBER.items() if k.lower() in low),
                None,
            )
            if num is None:
                # last resort: read the chapter number off the first verse
                v, _, _, _ = split_verses(body, numbered=True)
                num = v[0]["chapter"] if v else None
        else:
            num = None

        if num is not None:
            verses, prel, colophon, svasti = split_verses(body, numbered=True)
            chapters[num] = verses
            preludes[num] = (prel, colophon, svasti, title)
        elif any(a.lower() in low for a in ANGA_META):
            key = next(a for a in ANGA_META if a.lower() in low)
            verses, prel, _, _ = split_verses(body, numbered=False)
            angas[key] = verses
            preludes[key] = (prel, None, None, title)
        else:
            # e.g. the "devI mAhAtmyam" banner section: keep as front matter
            prelude_text.extend(clean(b) for b in body if clean(b))

    # ---- carve the Chandika Dhyana out of the front matter into its own anga ----
    def _find(pred):
        return next((i for i, l in enumerate(prelude_text) if pred(l)), -1)

    d_start = _find(lambda l: "shrIchaNDikAdhyAnam" in l)
    d_end = _find(lambda l: "shrIdurgAyai" in l)
    if d_start != -1:
        dhyana_lines = prelude_text[d_start + 1 : d_end if d_end != -1 else len(prelude_text)]
        angas["shrIchaNDikAdhyAnam"] = _dhyana_to_verses(dhyana_lines)
        preludes["shrIchaNDikAdhyAnam"] = ([], None, None, "shrIchaNDikAdhyAnam")
        prelude_text = prelude_text[: d_start + 1] + prelude_text[d_end if d_end != -1 else len(prelude_text) :]

    # ---- write chapters ----
    total_units = 0
    total_traditional = 0
    index = []
    for num in sorted(chapters):
        if num not in CHAPTER_META:
            sys.exit(f"[fatal] chapter {num} found in source but has no editorial metadata")
        meta = CHAPTER_META[num]
        verses = chapters[num]
        prel, colophon, svasti, raw_title = preludes.get(num, ([], None, None, ""))
        prelude_blocks = extract_prelude_blocks(prel)
        title_itrans = re.sub(r"^\d+\\?\.\s*", "", raw_title)
        vlist = []
        for v in verses:
            vlist.append({
                "n": v["n"],
                "nEnd": v.get("nEnd", v["n"]),
                "label": f"{num}.{v['n']}" if v.get("nEnd", v["n"]) == v["n"] else f"{num}.{v['n']}-{v['nEnd']}",
                "speaker": v["speaker"],
                "iTrans": v["iTrans"],
                "devanagari": to_deva(v["iTrans"]),
                "iast": to_iast(v["iTrans"]),
                "padas": len(v["padas"]),
            })
        doc = {
            "id": f"ch-{num:02d}",
            "number": num,
            "slug": meta["slug"],
            "charitra": meta["charitra"],
            "charitraLabel": meta["charitra_label"],
            "presidingDeity": meta["presiding"],
            "titleSanskrit": to_deva(title_itrans),
            "titleItrans": title_itrans,
            "titleIast": to_iast(title_itrans),
            "titleEnglishEditorial": meta["english"],
            "markandeyaPuranaChapter": 80 + num,
            "verseUnitCount": len(vlist),
            "traditionalVerseCount": sum(v.get("nEnd", v["n"]) - v["n"] + 1 for v in vlist),
            "colophonItrans": colophon,
            "colophonDevanagari": to_deva(colophon) if colophon else None,
            "svastiItrans": svasti,
            "svastiDevanagari": to_deva(svasti) if svasti else None,
            "viniyoga": {
                "iTrans": prelude_blocks.get("viniyoga"),
                "devanagari": to_deva(prelude_blocks["viniyoga"]) if prelude_blocks.get("viniyoga") else None,
            },
            "dhyana": {
                "iTrans": prelude_blocks.get("dhyana"),
                "devanagari": to_deva(prelude_blocks["dhyana"]) if prelude_blocks.get("dhyana") else None,
            },
            "invocation": {
                "iTrans": prelude_blocks.get("invocation"),
                "devanagari": to_deva(prelude_blocks["invocation"]) if prelude_blocks.get("invocation") else None,
            },
            "sourceRef": "durga700",
            "verses": vlist,
        }
        total_units += len(vlist)
        total_traditional += doc["traditionalVerseCount"]
        (OUT_CHAPTERS / f"{num:02d}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        index.append({
            "id": doc["id"], "number": num, "slug": meta["slug"],
            "titleSanskrit": doc["titleSanskrit"], "titleIast": doc["titleIast"],
            "titleEnglish": meta["english"], "charitra": meta["charitra"],
            "charitraLabel": meta["charitra_label"],
            "presidingDeity": meta["presiding"], "verseUnitCount": len(vlist),
            "traditionalVerseCount": doc["traditionalVerseCount"],
            "markandeyaPuranaChapter": doc["markandeyaPuranaChapter"],
        })
        print(f"  chapter {num:>2}: {len(vlist):>3} units / {doc['traditionalVerseCount']:>3} verses  ({meta['english']})")

    # ---- write angas ----
    anga_index = []
    for key, verses in angas.items():
        meta = ANGA_META[key]
        prel = preludes.get(key, ([], None, None, ""))[0]
        prelude_blocks = extract_prelude_blocks(prel)
        vlist = [{
            "n": v["n"], "label": str(v["n"]), "speaker": v["speaker"],
            "iTrans": v["iTrans"], "devanagari": to_deva(v["iTrans"]),
            "iast": to_iast(v["iTrans"]), "padas": len(v["padas"]),
        } for v in verses]
        doc = {
            "id": meta["id"], "slug": meta["slug"], "titleEnglish": meta["title_en"],
            "titleSanskrit": to_deva(key), "titleItrans": key, "titleIast": to_iast(key),
            "kind": meta["kind"], "order": meta["order"], "note": meta["note"],
            "verseUnitCount": len(vlist),
            "traditionalVerseCount": sum(v.get("nEnd", v["n"]) - v["n"] + 1 for v in vlist),
            "viniyoga": {
                "iTrans": prelude_blocks.get("viniyoga"),
                "devanagari": to_deva(prelude_blocks["viniyoga"]) if prelude_blocks.get("viniyoga") else None,
            },
            "dhyana": {
                "iTrans": prelude_blocks.get("dhyana"),
                "devanagari": to_deva(prelude_blocks["dhyana"]) if prelude_blocks.get("dhyana") else None,
            },
            "sourceRef": "durga700",
            "verses": vlist,
        }
        (OUT_ANGAS / f"{meta['slug']}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        anga_index.append({
            "id": doc["id"], "slug": meta["slug"], "titleEnglish": meta["title_en"],
            "titleSanskrit": doc["titleSanskrit"], "kind": meta["kind"],
            "order": meta["order"], "verseUnitCount": len(vlist),
        })
        print(f"  anga {meta['slug']:<26}: {len(vlist):>3} verses")

    manifest = {
        "textId": "durga-saptashati",
        "titleSanskrit": to_deva("shrIdurgAsaptashatI / devI mAhAtmyam"),
        "titleIast": "Śrī Durgā Saptāśatī / Devī Māhātmyam",
        "titleEnglish": "Durga Saptashati (Devi Mahatmya)",
        "chapters": index,
        "angas": sorted(anga_index, key=lambda a: a["order"]),
        "preludeItrans": prelude_text,
        "preludeDevanagari": [to_deva(p) for p in prelude_text],
        "verseUnitTotal": total_units,
        "traditionalVerseTotal": total_traditional,
        "source": {
            "id": "durga700",
            "file": "scripts/sources/durga700.itx",
            "provenance": "Sanskrit Documents (sanskritdocuments.org), doc_devii/durga700",
            "transcribers": ["K. Shankaran", "Kirk Wortman", "Dhruba Chakroborty", "Ahto Jarve"],
            "proofreaders": ["Sunder Hattangadi", "Kirk Wortman"],
            "editionNote": "ITRANS source dated February 26, 2024 (per file header).",
            "derivedRendering": "Devanagari and IAST produced mechanically from ITRANS with indic-transliteration.",
        },
    }
    (ROOT / "src" / "content" / "scripture" / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"\nTOTAL units: {total_units}  traditional verse count: {total_traditional}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
