"use client";

/**
 * PDF intake UI.
 *
 * Drop a PDF; the app says what it is, what it may do with it, and what it will
 * not do. Everything runs in the browser — there is no upload endpoint, and the
 * component says so on screen, because "your file never leaves your device" is
 * a claim a reader should be able to check (`network` tab, no request).
 *
 * The reader's declaration (where the file came from, who holds rights, what
 * they want) is required before verdicts are shown: the app cannot know the
 * copyright status of a scan, and pretending to would be worse than asking.
 */
import { useCallback, useRef, useState } from "react";
import {
  buildIntakeReport, evaluateIntake, scanPdf,
  type IntakeDeclaration, type IntakePurpose, type IntakeRights, type IntakeSource,
  type IntakeVerdict, type PdfScan,
} from "@/lib/pdf-intake";
import { useUser } from "@/lib/user";
import { Card, Chip, Notice, SectionHeading } from "@/components/ui";

const OUTCOME_STYLE: Record<IntakeVerdict["outcome"], { label: string; color: string; icon: string }> = {
  yes: { label: "Can do", color: "#2f855a", icon: "●" },
  review: { label: "Possible with review", color: "var(--gold)", icon: "◐" },
  no: { label: "Will not do", color: "var(--crimson, #9b2c2c)", icon: "✕" },
  blocked: { label: "Blocked by the file", color: "var(--crimson, #9b2c2c)", icon: "○" },
};

const SOURCES: { value: IntakeSource; label: string }[] = [
  { value: "own-scan", label: "I scanned or photographed it myself" },
  { value: "public-domain-edition", label: "A public-domain edition (copyright expired)" },
  { value: "purchased-edition", label: "An edition I bought (Gita Press, temple, publisher…)" },
  { value: "website", label: "Downloaded from a website or group" },
  { value: "unknown", label: "I am not sure where it came from" },
];

const RIGHTS: { value: IntakeRights; label: string }[] = [
  { value: "public-domain", label: "Public domain (published long ago, copyright expired)" },
  { value: "my-own-text", label: "My own composition, or my own scan of a text I own" },
  { value: "copyrighted", label: "A copyrighted edition, someone else's work" },
  { value: "unknown", label: "I do not know" },
];

const PURPOSES: { value: IntakePurpose; label: string }[] = [
  { value: "read", label: "Read and study it" },
  { value: "align", label: "Compare it with the app's verified edition" },
  { value: "translate", label: "Have it translated into the languages here" },
  { value: "reproduce", label: "Publish its text in this app" },
  { value: "narrate", label: "Have it read aloud / recorded as audio" },
  { value: "index", label: "Keep it in my own study notes" },
];

export function PdfIntake() {
  const { addJournal } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<PdfScan | null>(null);
  const [declaration, setDeclaration] = useState<IntakeDeclaration>({
    source: "own-scan", rights: "unknown", purpose: "read",
  });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const verdicts = scan ? evaluateIntake(scan, declaration) : [];

  const inspect = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setSaved(false);
    setCopied(false);
    setFileName(file.name);
    try {
      if (file.size > 80 * 1024 * 1024) {
        throw new Error("That file is larger than 80 MB. Open it in a PDF reader and export a smaller copy.");
      }
      const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      const magic = String.fromCharCode(...head);
      if (!magic.startsWith("%PDF")) {
        throw new Error(
          "That does not look like a PDF (the file does not start with %PDF). " +
            "If it is a Word document or a photo, export it as a PDF first.",
        );
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      setScan(await scanPdf(bytes));
    } catch (e) {
      setScan(null);
      setError(e instanceof Error ? e.message : "The file could not be read.");
    } finally {
      setBusy(false);
    }
  }, []);

  const report = scan && fileName
    ? buildIntakeReport({ fileName, scan, declaration, verdicts })
    : "";

  const download = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fileName ?? "intake").replace(/\.pdf$/i, "")}-intake-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void inspect(f);
          }}
          className="rounded-xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: "var(--line-strong)" }}
        >
          <p className="text-lg font-semibold">Drop a PDF here</p>
          <p className="muted mx-auto mt-2 max-w-xl text-sm leading-relaxed">
            Any PDF — a scan of a Saptashati, a chalisa booklet, a page you photographed, a
            translation. The app inspects it <strong>on your device</strong> and tells you what it
            can and cannot do with it. There is no upload: nothing is sent to this site or to
            anyone else.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? "Reading the file…" : "Choose a PDF"}
            </button>
            {fileName && <Chip>{fileName}</Chip>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void inspect(f);
            }}
          />
          <p className="muted mt-3 text-xs">
            Files stay on your device. This page works offline, and no file is stored by this app.
          </p>
        </div>

        {error && (
          <Notice tone="warn" title="Could not inspect that file">
            <p>{error}</p>
          </Notice>
        )}
      </Card>

      {scan && (
        <>
          <section aria-labelledby="what">
            <SectionHeading eyebrow="Step 1" title="What the file is" />
            <h2 id="what" className="sr-only">What the file is</h2>
            <Card className="p-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="muted text-xs uppercase tracking-wide">Pages</dt><dd className="mt-0.5">{scan.pages ?? "not stated in the file"}</dd></div>
                <div><dt className="muted text-xs uppercase tracking-wide">Size</dt><dd className="mt-0.5">{(scan.bytes / 1024).toFixed(0)} KB</dd></div>
                <div><dt className="muted text-xs uppercase tracking-wide">Text layer</dt><dd className="mt-0.5">{scan.textLayer}</dd></div>
                <div><dt className="muted text-xs uppercase tracking-wide">Text found</dt><dd className="mt-0.5">{scan.extractedChars} characters</dd></div>
                <div><dt className="muted text-xs uppercase tracking-wide">Images</dt><dd className="mt-0.5">{scan.images}</dd></div>
                <div><dt className="muted text-xs uppercase tracking-wide">Fonts</dt><dd className="mt-0.5">{scan.fonts.length || "none named"}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="muted text-xs uppercase tracking-wide">Scripts in the readable sample</dt>
                  <dd className="mt-0.5">
                    {Object.entries(scan.scripts).length
                      ? Object.entries(scan.scripts).sort((a, b) => b[1] - a[1])
                          .map(([k, v]) => `${k} (${v})`).join(" · ")
                      : "nothing readable was extracted"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="muted text-xs uppercase tracking-wide">Looks like</dt>
                  <dd className="mt-0.5">
                    {scan.keywords.length
                      ? scan.keywords.join(" · ")
                      : "not identified as a Shakta / Navratri text from the readable sample"}
                  </dd>
                </div>
                {(scan.metadata.title || scan.metadata.author || scan.metadata.producer) && (
                  <div className="sm:col-span-2">
                    <dt className="muted text-xs uppercase tracking-wide">Embedded metadata</dt>
                    <dd className="mt-0.5">
                      {[scan.metadata.title, scan.metadata.author, scan.metadata.producer]
                        .filter(Boolean).join(" · ")}
                    </dd>
                  </div>
                )}
              </dl>

              {scan.warnings.map((w) => (
                <p key={w} className="muted mt-3 border-t pt-3 text-xs leading-relaxed" style={{ borderColor: "var(--line)" }}>
                  {w}
                </p>
              ))}

              {scan.sample && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Show a sample of the readable text
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{scan.sample}</p>
                  <p className="muted mt-2 text-xs">
                    Extraction from a PDF is approximate: an embedded Indic font can store glyph
                    codes rather than Unicode, so this sample is a check, not the document.
                  </p>
                </details>
              )}
            </Card>
          </section>

          <section aria-labelledby="declare">
            <SectionHeading
              eyebrow="Step 2"
              title="Tell the app where it came from"
              sub="No app can know the copyright status of a scan. The verdict below depends on your answer, and on the app's own publishing rules."
            />
            <h2 id="declare" className="sr-only">Where it came from</h2>
            <Card className="p-6">
              <div className="grid gap-5 lg:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Where is it from?</span>
                  <select
                    value={declaration.source}
                    onChange={(e) => setDeclaration((d) => ({ ...d, source: e.target.value as IntakeSource }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
                  >
                    {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">Who holds the rights?</span>
                  <select
                    value={declaration.rights}
                    onChange={(e) => setDeclaration((d) => ({ ...d, rights: e.target.value as IntakeRights }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
                  >
                    {RIGHTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold">What do you want done?</span>
                  <select
                    value={declaration.purpose}
                    onChange={(e) => setDeclaration((d) => ({ ...d, purpose: e.target.value as IntakePurpose }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
                  >
                    {PURPOSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
              </div>
            </Card>
          </section>

          <section aria-labelledby="verdict">
            <SectionHeading
              eyebrow="Step 3"
              title="What this app can do with it — and what it will not"
              sub="The same rules that govern everything already published here: a named source, a human translation, no recording without a licence, nothing reproduced from a copyrighted edition."
            />
            <h2 id="verdict" className="sr-only">Verdicts</h2>
            <ul className="space-y-3">
              {verdicts.map((v) => {
                const style = OUTCOME_STYLE[v.outcome];
                return (
                  <li key={v.use}>
                    <Card className="p-5">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span aria-hidden style={{ color: style.color }}>{style.icon}</span>
                        <span style={{ color: style.color }}>{style.label}</span>
                        <span className="text-[var(--ink)]">— {v.use}</span>
                      </p>
                      <p className="muted mt-2 text-sm leading-relaxed">{v.reason}</p>
                    </Card>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                className="chip"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(report);
                    setCopied(true);
                  } catch { /* clipboard blocked: the download below still works */ }
                }}
              >
                {copied ? "Report copied ✓" : "Copy the report"}
              </button>
              <button className="chip" onClick={download}>Download the report (.md)</button>
              <button
                className="chip"
                onClick={() => {
                  addJournal(report, "PDF intake report");
                  setSaved(true);
                }}
              >
                {saved ? "Saved to your journal ✓" : "Save it in my journal"}
              </button>
            </div>
            <p className="muted mt-2 text-xs leading-relaxed">
              Paste or attach this report (or the PDF itself) to continue: the report lists exactly
              what the app needs — the edition, the rights, and which of the allowed steps you want.
            </p>
          </section>
        </>
      )}

      {!scan && !busy && !error && (
        <Notice tone="info" title="What happens after you drop a file">
          <p>
            The app reports the structure (pages, text layer, fonts, images, metadata), reads a
            sample of the text if there is one, and then gives a verdict for each use — read,
            compare, translate, publish, narrate — based on your declaration and this app&rsquo;s
            publishing rules. A scanned image with no text layer is reported as needing OCR rather
            than being quietly guessed at.
          </p>
        </Notice>
      )}
    </div>
  );
}
