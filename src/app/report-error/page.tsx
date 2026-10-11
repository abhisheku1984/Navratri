"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Notice, PageHeader } from "@/components/ui";

const KINDS = [
  { id: "scripture", label: "Scripture text", note: "A wrong verse, a missing pada, a wrong number" },
  { id: "translation", label: "Translation", note: "A mistranslation or a broken attribution" },
  { id: "fact", label: "Factual claim", note: "A Peetha identification, a date, a location" },
  { id: "attribution", label: "Attribution or licence", note: "A missing source, a rights concern" },
  { id: "sensitivity", label: "Religious sensitivity", note: "Something that reads as dismissive or wrong" },
  { id: "accessibility", label: "Accessibility barrier", note: "Something you cannot reach, read or hear" },
  { id: "bug", label: "Technical bug", note: "Something broken in the app" },
];

export default function ReportErrorPage() {
  const [kind, setKind] = useState("scripture");
  const [where, setWhere] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // No backend endpoint is wired in this build, so the report is composed for
    // the user to send rather than silently discarded.
    setSent(true);
  }

  const body = [
    `Type: ${KINDS.find((k) => k.id === kind)?.label ?? kind}`,
    `Where: ${where}`,
    ``,
    detail,
    ``,
    source ? `Source that shows the correct reading: ${source}` : "",
  ].filter(Boolean).join("\n");

  return (
    <>
      <PageHeader eyebrow="Corrections" title="Report an error"
                  sub="Especially in the scripture. A wrong verse is worse than a missing one, and this app would rather remove a passage than leave an incorrect one standing." />

      <Notice tone="info" title="What happens to a report">
        <p>
          This build has no reporting backend, so nothing is silently swallowed: the form composes
          your report and shows it to you to send to whoever maintains the deployment. Wiring it to
          an inbox is a single POST endpoint.
        </p>
        <p className="mt-2">
          You do not need an account and you do not need to give your name.
        </p>
      </Notice>

      {!sent ? (
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">What kind of problem is it?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {KINDS.map((k) => (
                <label key={k.id}
                       className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"
                       style={{ borderColor: kind === k.id ? "var(--gold)" : "var(--line)",
                                background: kind === k.id ? "var(--accent-soft)" : "transparent" }}>
                  <input type="radio" name="kind" className="mt-0.5" checked={kind === k.id}
                         onChange={() => setKind(k.id)} />
                  <span>
                    <span className="block text-sm font-semibold">{k.label}</span>
                    <span className="muted block text-xs">{k.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Where is it?</span>
            <input value={where} onChange={(e) => setWhere(e.target.value)} required
                   placeholder="e.g. Chapter 5, verse 5.14 — or the page URL"
                   className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">What is wrong?</span>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} required rows={6}
                      placeholder="Quote what the app shows, and what you believe it should show."
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Is there a source that shows the correct reading? <span className="muted">(optional)</span>
            </span>
            <input value={source} onChange={(e) => setSource(e.target.value)}
                   placeholder="Edition, page, verse — anything checkable"
                   className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </label>

          <button type="submit" className="btn btn-primary" disabled={!where || !detail}>
            Compose report
          </button>
        </form>
      ) : (
        <Card className="mt-8 p-6">
          <h2 className="display mb-3 text-xl font-semibold">Your report</h2>
          <p className="muted mb-3 text-sm">
            Copy this and send it to whoever maintains this deployment. Nothing has been
            transmitted.
          </p>
          <textarea readOnly value={body} rows={10}
                    className="w-full rounded-xl border px-4 py-3 font-mono text-xs outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface-3)" }} />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(body)}>
              Copy to clipboard
            </button>
            <button className="btn btn-ghost" onClick={() => setSent(false)}>
              Edit it
            </button>
            <Link href="/sources" className="btn btn-ghost">Check the source registry</Link>
          </div>
        </Card>
      )}

      <section className="mt-10" aria-labelledby="workflow">
        <h2 id="workflow" className="display mb-3 text-2xl font-semibold">
          How a correction is handled
        </h2>
        <Card className="p-6">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>Scripture reports are treated as urgent.</strong> If a verse cannot be
              confirmed against the named edition, it is removed rather than left standing with a
              caveat.
            </li>
            <li>
              <strong>Factual reports are checked against the source registry.</strong> If the
              claim cannot be sourced, it is either removed or downgraded to
              &ldquo;awaiting review&rdquo;.
            </li>
            <li>
              <strong>Genuine disagreement is not &ldquo;fixed&rdquo; by picking a side.</strong> If
              two traditions differ, the record is updated to show both.
            </li>
            <li>
              <strong>The reviewer and date are recorded</strong> on the source, so the next reader
              can see when it was last checked and by whom.
            </li>
          </ol>
        </Card>
      </section>
    </>
  );
}
