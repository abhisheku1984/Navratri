"use client";

import { useMemo, useState } from "react";
import { Card, Chip, Notice, SectionHeading, Stat } from "@/components/ui";
import {
  analyseText, classifyFile, MAX_UPLOAD_BYTES, type UploadAnalysis,
} from "@/lib/upload";

const SCRIPT_LABEL: Record<UploadAnalysis["script"], string> = {
  devanagari: "Devanagari",
  latin: "Latin / ITRANS / IAST",
  mixed: "Mixed",
  none: "No letters found",
};

const PREVIEW_LINES = 40;

export function UploadTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState(false);

  const analysis = useMemo(() => (raw ? analyseText(raw) : null), [raw]);

  function reset() {
    setFileName(null);
    setRaw("");
    setError(null);
    setPdf(false);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPdf(false);
    const kind = classifyFile(file.name, file.type);
    if (kind === "pdf") {
      setFileName(file.name);
      setRaw("");
      setPdf(true);
      return;
    }
    if (kind === "unsupported") {
      setError(`"${file.name}" is not a text file. Choose a .txt, .md or .itx file, or paste the text below.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("That file is larger than 5 MB. Split it into chapters and upload each part.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setRaw(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => setError("The file could not be read. Try again, or paste the text.");
    reader.readAsText(file, "utf-8");
  }

  function download() {
    if (!analysis) return;
    const blob = new Blob([analysis.normalised], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName ?? "durga-saptashati").replace(/\.[^.]+$/, "") + ".normalised.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="grid gap-6">
      <Card className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="Step 1"
          title="Choose your text"
          sub="Pick a plain text file (.txt, .md, or ITRANS .itx), or paste the text straight into the box below. It is read on this device only."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label
            className="btn btn-primary cursor-pointer justify-center text-center"
            htmlFor="upload-file"
          >
            Choose a file
          </label>
          <input
            id="upload-file"
            type="file"
            accept=".txt,.text,.md,.itx,text/plain,text/markdown,application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button type="button" className="btn btn-ghost justify-center" onClick={reset}
                  disabled={!raw && !pdf && !fileName}>
            Clear
          </button>
        </div>

        {fileName && (
          <p className="muted mt-4 text-sm">
            Loaded: <strong style={{ color: "var(--ink)" }}>{fileName}</strong>
          </p>
        )}

        {error && (
          <div className="mt-4" role="alert">
            <Notice tone="warn" title="Could not use this file">
              <p>{error}</p>
            </Notice>
          </div>
        )}

        {pdf && (
          <div className="mt-4">
            <Notice tone="caution" title="PDF files are not read in the browser">
              <p>
                This page cannot extract text from a PDF or OCR a scanned page. If the PDF has
                selectable text, open it, select all, copy, and paste it into the box below. If
                it is a scan, attach the PDF to your chat with the assistant so it can be
                processed there.
              </p>
            </Notice>
          </div>
        )}

        <label htmlFor="upload-paste" className="mb-2 mt-6 block text-sm font-semibold">
          Or paste text
        </label>
        <textarea
          id="upload-paste"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setFileName(null); setPdf(false); }}
          rows={8}
          spellCheck={false}
          placeholder="Paste Durga Saptashati text here, in Devanagari, ITRANS or IAST…"
          className="deva w-full rounded-xl border p-3 text-base leading-relaxed outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)", color: "var(--ink)" }}
        />
      </Card>

      {analysis && analysis.words > 0 && (
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Step 2" title="What the page found"
            sub="A structural check only. These are raw counts, not verified verse totals: the scripture importer and npm run verify:scripture are the authority. Nothing has been changed or published." />

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Lines" value={String(analysis.nonEmptyLines)} hint="Non-empty" />
            <Stat label="Words" value={String(analysis.words)} hint="Whitespace-separated" />
            <Stat label="Verse markers" value={String(analysis.verseMarkers)} hint="Raw count of ॥ n ॥ / || n.m || marks" />
            <Stat label="Chapter headings" value={String(analysis.chapterHeadings.length)}
                  hint="Raw count; TeX sources repeat headings" />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <Chip tone="gold">{SCRIPT_LABEL[analysis.script]}</Chip>
            <Chip>{analysis.devanagariChars} Devanagari letters</Chip>
            <Chip>{analysis.latinChars} Latin letters</Chip>
          </div>

          {analysis.warnings.length > 0 && (
            <div className="mb-5 grid gap-3">
              {analysis.warnings.map((w) => (
                <Notice key={w} tone="warn"><p>{w}</p></Notice>
              ))}
            </div>
          )}

          {analysis.chapterHeadings.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold">Chapter headings found</h3>
              <ol className="deva muted grid gap-1 text-sm">
                {analysis.chapterHeadings.map((h) => (
                  <li key={`${h.line}-${h.text}`}>
                    <span className="tabular-nums" style={{ color: "var(--gold)" }}>line {h.line}</span>{" "}
                    {h.text}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <h3 className="mb-2 text-sm font-semibold">Preview (first {PREVIEW_LINES} lines)</h3>
          <pre className="deva max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border p-4 text-sm leading-relaxed"
               style={{ borderColor: "var(--line)", background: "var(--surface-3)", color: "var(--ink)" }}>
            {analysis.normalised.split("\n").slice(0, PREVIEW_LINES).join("\n")}
          </pre>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={download}>
              Download cleaned text
            </button>
            <span className="muted text-xs">
              Only whitespace is tidied. Verse characters are left exactly as you wrote them.
            </span>
          </div>
        </Card>
      )}

      <Notice tone="info" title="What happens to your file">
        <p>
          The text is handled in this browser tab and is not uploaded to the site. Nothing is saved
          to a server or to your account, and nothing you upload is published. Once you download the
          cleaned copy, you can pass it to the assistant to be placed into the scripture content.
        </p>
      </Notice>
    </div>
  );
}
