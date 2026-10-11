#!/usr/bin/env python3
"""
Import F. Eden Pargiter's 1904 English translation of the Devi Mahatmya from
`scripts/sources/devi_mahatmya_pargiter_1904.txt` into per-chapter JSON files.

The witness is uncorrected OCR from Archive.org, therefore:

  * Only CHAPTER-level (canto-level) prose is produced. Verse-level alignment
    is deliberately NOT attempted: the OCR verse numbers are demonstrably
    corrupt (values such as 472 and 618 appear inside Canto LXXXI) and mapping
    them onto the Sanskrit verse numbering would fabricate a correspondence
    that cannot be verified.
  * The translation text is reproduced verbatim. No spelling is silently
    "fixed", because a silent correction is indistinguishable from an error.

Usage:
    python3 scripts/import_pargiter.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "sources" / "devi_mahatmya_pargiter_1904.txt"
OUT = ROOT / "src" / "content" / "scripture" / "translations" / "en-pargiter-1904"

ROMAN_TO_CHAPTER = {
    "LXXXI": 1, "LXXXII": 2, "LXXXIII": 3, "LXXXIV": 4, "LXXXV": 5,
    "LXXXVI": 6, "LXXXVII": 7, "LXXXVIII": 8, "LXXXIX": 9, "XC": 10,
    "XCI": 11, "XCII": 12, "XCIII": 13,
}
# OCR corruption of the roman numerals actually seen in the witness
OCR_ROMAN_FIX = {"XCtll": "XCIII", "XClll": "XCIII", "XCIll": "XCIII",
                 "XCiII": "XCIII", "XCtli": "XCIII", "XCIII": "XCIII"}

# tolerant of OCR corruption of the word "Canto" itself (seen as "CAKTO")
CANTO_RE = re.compile(r"(?im)\bC[A-Z]{1,3}T[O0]\s+([A-Za-z]{2,9})\s*\.?")
# page running heads, e.g. "488 CANTO LXXXV." - repeated at the top of
# every printed page and therefore NOT canto boundaries.
RUNNING_HEAD_RE = re.compile(r"(?im)^[ \t]*(?:\d{1,4}[ \t]+)?C[A-Z]{1,3}T[O0][ \t]+[A-Za-z]{2,9}[ \t]*\.?,?[ \t]*$")
PAGE_NUM_RE = re.compile(r"^\d{1,4}$")
INVOCATION_RE = re.compile(r"^Om\s*[!|l]?\s*Reverence", re.IGNORECASE)


def paragraphs_from(lines: list[str]) -> list[str]:
    """Reflow hard-wrapped OCR lines into readable paragraphs.

    The witness stores every printed line as its own paragraph, so lines are
    joined and then re-split at sentence boundaries. This is a purely
    typographic transformation and never alters wording.
    """
    text = " ".join(l.strip() for l in lines if l.strip())
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    out: list[str] = []
    buf: list[str] = []
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        buf.append(sentence)
        joined = " ".join(buf)
        if len(joined) > 420:
            out.append(joined)
            buf = []
    if buf:
        out.append(" ".join(buf))
    return out


def main() -> int:
    raw = SRC.read_text(encoding="utf-8", errors="replace")
    body = "\n".join(l for l in raw.splitlines() if not l.startswith("#"))

    def resolve(raw_roman: str) -> int | None:
        for cand in (raw_roman, raw_roman.replace("l", "I"), raw_roman.upper(),
                     raw_roman.replace("l", "I").upper()):
            if cand in OCR_ROMAN_FIX:
                return ROMAN_TO_CHAPTER.get(OCR_ROMAN_FIX[cand])
            if cand in ROMAN_TO_CHAPTER:
                return ROMAN_TO_CHAPTER[cand]
        return None

    # First occurrence of each chapter is the real canto boundary; later
    # occurrences are page running heads.
    marks: list[tuple[int, int]] = []
    seen: set[int] = set()
    for m in CANTO_RE.finditer(body):
        chapter = resolve(m.group(1))
        if chapter is None or chapter in seen:
            continue
        seen.add(chapter)
        marks.append((m.start(), chapter))
    marks.sort()
    for i in range(1, len(marks)):
        if marks[i][1] < marks[i - 1][1]:
            sys.exit(f"[fatal] canto order broken at {marks[i]} - OCR too damaged")

    if not marks:
        sys.exit("[fatal] no canto markers found - is the source file intact?")

    OUT.mkdir(parents=True, exist_ok=True)
    index = []
    found: dict[int, str] = {}

    for i, (start, chapter) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(body)
        found[chapter] = body[start:end]

    for chapter in range(1, 14):
        if chapter not in found:
            index.append({"chapter": chapter, "status": "missing",
                          "reason": "canto marker not found in the OCR witness"})
            print(f"  chapter {chapter:>2}: MISSING")
            continue

        chunk = found[chapter]
        chunk = CANTO_RE.sub("", chunk, count=1)      # the canto heading itself
        chunk = RUNNING_HEAD_RE.sub("", chunk)        # every page running head
        lines = [l.strip() for l in chunk.splitlines()]
        lines = [l for l in lines if l and not PAGE_NUM_RE.match(l)]
        # strip OCR running heads (short, mostly-capital lines)
        lines = [l for l in lines
                 if not (len(l) < 40 and sum(c.isupper() for c in l) > 0.7 * max(len(l), 1))]

        inv = next((i for i, l in enumerate(lines) if INVOCATION_RE.match(l)), None)
        argument = paragraphs_from(lines[:inv]) if inv is not None else []
        translation = paragraphs_from(lines[inv:] if inv is not None else lines)

        doc = {
            "chapter": chapter,
            "language": "en",
            "translationId": "pargiter-1904",
            "paragraphs": translation,
            "argument": argument,
            "wordCount": sum(len(p.split()) for p in translation),
            "witness": {
                "translator": "F. Eden Pargiter",
                "work": "The Markandeya Purana (Bibliotheca Indica, Asiatic Society of Bengal, 1904)",
                "copyrightStatus": "public_domain",
                "digitalCopy": "Archive.org cu31924022991974 (OCR text)",
                "ocrUncorrected": True,
                "verseAlignment": None,
            },
        }
        (OUT / f"{chapter:02d}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        status = "imported" if doc["wordCount"] >= 200 else "partial_witness"
        doc["witness"]["status"] = status
        (OUT / f"{chapter:02d}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        index.append({"chapter": chapter, "status": status,
                      "paragraphs": len(translation),
                      "wordCount": doc["wordCount"]})
        print(f"  chapter {chapter:>2}: {len(translation):>3} paragraphs, "
              f"{doc['wordCount']:>5} words")

    manifest = {
        "translationId": "pargiter-1904",
        "language": "en",
        "title": "The Markandeya Purana - Devi Mahatmya (Pargiter, 1904)",
        "copyrightStatus": "public_domain",
        "granularity": "chapter",
        "verseAlignment": None,
        "ocrUncorrected": True,
        "chapters": index,
        "notes": [
            "Chapter-level prose only. Verse-level alignment is intentionally absent.",
            "OCR is uncorrected; spelling artefacts from the 1904 witness are preserved.",
            "Canto XCIII is truncated in this witness; chapter 13 may be incomplete.",
        ],
    }
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
