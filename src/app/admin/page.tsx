"use client";

/**
 * Content review console.
 *
 * This is a *review* surface, not a content editor. It shows what provenance
 * each record actually carries, lets a reviewer record a verdict, and exports
 * those verdicts in the shape of the `content_review` table.
 *
 * Two things it deliberately does not do:
 *
 *   - It cannot edit the corpus. Content is imported, verified by
 *     `verify:scripture`, and committed. Editing it from a browser would
 *     bypass that.
 *   - A verdict recorded here does NOT change a record's verification status.
 *     A judgement entered on one device by one person is not the corpus being
 *     verified, and the interface says so.
 *
 * There is no authentication in this build, so the console is read-mostly by
 * necessity: it can annotate locally and export, but it cannot publish. A
 * deployment that wants real administration needs auth in front of it.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { buildReviewItems, summarise, type ReviewCollection, type ReviewItem, type ReviewState } from "@/lib/review";
import { Card, Chip, EmptyState, Notice, PageHeader, Stat, VerificationBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui";

const STATE_ORDER: ReviewState[] = [
  "awaiting-review",
  "awaiting-verification",
  "tradition-recorded",
  "partially-verified",
  "verified-with-caveats",
  "verified",
];

const COLLECTIONS: { id: ReviewCollection; label: string }[] = [
  { id: "scripture", label: "Scripture" },
  { id: "angas", label: "Auxiliary" },
  { id: "navadurga", label: "Navadurga" },
  { id: "peethas", label: "Peethas" },
  { id: "temples", label: "Temples" },
  { id: "mantras", label: "Mantras" },
  { id: "knowledge", label: "Knowledge" },
  { id: "stories", label: "Stories" },
  { id: "glossary", label: "Glossary" },
  { id: "sources", label: "Sources" },
];

const VERDICT_TONE: Record<string, "gold" | "default" | "warn" | "muted"> = {
  approved: "gold",
  "needs-work": "warn",
  rejected: "muted",
};

export default function AdminPage() {
  const { state, hydrated, setReviewVerdict, clearReviewVerdict } = useUser();

  const [collection, setCollection] = useState<ReviewCollection | "all">("all");
  const [onlyOutstanding, setOnlyOutstanding] = useState(false);
  const [q, setQ] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => buildReviewItems(), []);
  const summary = useMemo(() => summarise(items), [items]);
  const verdicts = state.reviewVerdicts;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (collection !== "all" && it.collection !== collection) return false;
      if (onlyOutstanding && it.state !== "awaiting-review" && it.state !== "awaiting-verification")
        return false;
      if (!needle) return true;
      return [it.title, it.sub ?? "", it.provenance ?? "", it.id]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [items, collection, onlyOutstanding, q]);

  const reviewedCount = Object.keys(verdicts).length;
  const outstanding =
    summary.byState["awaiting-review"] + summary.byState["awaiting-verification"];

  const record = (it: ReviewItem, verdict: "approved" | "needs-work" | "rejected") => {
    setReviewVerdict({
      recordId: it.id,
      reviewer: reviewer.trim() || "anonymous reviewer",
      reviewedAt: new Date().toISOString(),
      verdict,
      notes: notes[it.id]?.trim() || undefined,
    });
  };

  /** Verdicts in the shape of the `content_review` table, for import. */
  const exportPayload = () => {
    const rows = Object.values(verdicts).map((v) => ({
      // The table stores the collection and the record key separately.
      table_name: v.recordId.split(":")[0],
      record_id: v.recordId.split(":").slice(1).join(":"),
      reviewer: v.reviewer,
      reviewed_at: v.reviewedAt,
      verdict: v.verdict,
      notes: v.notes ?? null,
    }));
    return JSON.stringify(
      { exported_at: new Date().toISOString(), reviewer: reviewer.trim() || null, rows },
      null,
      2,
    );
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Content review" }]} />

      <PageHeader
        eyebrow="Administration"
        title="Content review"
        sub="What provenance every record in this app actually carries, and what still needs a qualified reviewer."
      >
        <div className="flex flex-wrap gap-3">
          <Stat label="Records" value={String(summary.total)} hint="across ten collections" />
          <Stat label="Awaiting review" value={String(outstanding)} hint="no qualified reviewer yet" />
          <Stat
            label="No status field"
            value={String(summary.statusAbsent)}
            hint="absence is not verification"
          />
          <Stat
            label="Flagged as sample"
            value={String(summary.sample)}
            hint="labelled in the interface"
          />
        </div>
      </PageHeader>

      <div className="mb-6 space-y-4">
        <Notice tone="warn" title="Recording a verdict does not verify anything">
          A judgement entered here is stored on this device, under your name, as
          a note for the maintainers. It does not change the record&apos;s own
          verification status and it is not published anywhere. Changing that
          status is a separate act, made in the content source and committed —
          so that every claim of verification has a diff behind it.
        </Notice>

        <Notice title="Why so much is awaiting review">
          Scripture is imported from identified editions and checked on every
          build. Everything around it — the explanations, stories, glossary
          entries and Navadurga profiles — is authored for this app by people
          who are not qualified scholars of the tradition. It is marked{" "}
          <strong>awaiting review</strong> because that is what it is. Filling
          that gap needs a reviewer, not a script.
        </Notice>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card>
          <h2 className="font-display text-lg">Verification state</h2>
          <ul className="mt-3 space-y-2">
            {STATE_ORDER.map((st) => {
              const n = summary.byState[st] ?? 0;
              const pct = summary.total ? Math.round((n / summary.total) * 100) : 0;
              return (
                <li key={st} className="flex items-center gap-3 text-sm">
                  <span className="w-44 shrink-0">
                    <VerificationBadge status={st} />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--surface-3)]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--gold)" }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right tabular-nums text-[color:var(--muted)]">
                    {n} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg">Export verdicts</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {hydrated ? (
              <>
                {reviewedCount === 0
                  ? "No verdicts recorded yet."
                  : `${reviewedCount} verdict${reviewedCount === 1 ? "" : "s"} recorded on this device.`}
              </>
            ) : (
              "Loading…"
            )}
          </p>

          <label htmlFor="reviewer" className="mt-3 block text-xs font-semibold">
            Your name
          </label>
          <input
            id="reviewer"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="Who is reviewing"
            className="mt-1 w-full rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
          />

          <button
            type="button"
            onClick={copyExport}
            disabled={reviewedCount === 0}
            className="mt-3 w-full rounded-full bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy as content_review rows"}
          </button>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Formatted for the <code>content_review</code> table. Send it to the
            maintainers; nothing is uploaded from here.
          </p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="review-search" className="sr-only">
          Search records
        </label>
        <input
          id="review-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search records…"
          className="min-w-[12rem] flex-1 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyOutstanding}
            onChange={(e) => setOnlyOutstanding(e.target.checked)}
          />
          Outstanding only
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-1" role="group" aria-label="Filter by collection">
        <button
          type="button"
          onClick={() => setCollection("all")}
          aria-pressed={collection === "all"}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            collection === "all"
              ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
              : "border-[color:var(--line)] text-[color:var(--muted)]"
          }`}
        >
          All ({summary.total})
        </button>
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCollection(c.id)}
            aria-pressed={collection === c.id}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              collection === c.id
                ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
                : "border-[color:var(--line)] text-[color:var(--muted)]"
            }`}
          >
            {c.label} ({summary.byCollection[c.id] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No records match"
          body="Clear the search or choose another collection."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((it) => {
            const v = verdicts[it.id];
            return (
              <li
                key={it.id}
                className="rounded-xl border border-[color:var(--line)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {it.href ? (
                        <Link href={it.href} className="link-underline font-semibold">
                          {it.title}
                        </Link>
                      ) : (
                        <span className="font-semibold">{it.title}</span>
                      )}
                      <VerificationBadge status={it.state} />
                      {it.sample && <Chip tone="muted">Sample</Chip>}
                      {it.statusAbsent && <Chip tone="warn">No status field</Chip>}
                      {it.confidence && <Chip>confidence: {it.confidence}</Chip>}
                      {v && (
                        <Chip tone={VERDICT_TONE[v.verdict] ?? "default"}>
                          {v.verdict} · {v.reviewer}
                        </Chip>
                      )}
                    </div>
                    {it.sub && (
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{it.sub}</p>
                    )}
                    <p className="mt-1 font-mono text-[0.7rem] text-[color:var(--muted)]">
                      {it.id}
                    </p>

                    {it.provenance && (
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Provenance: </span>
                        {it.provenance}
                      </p>
                    )}
                    {it.verification && (
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        <span className="font-semibold">Checked: </span>
                        {it.verification}
                      </p>
                    )}
                    {it.caveats && it.caveats.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {it.caveats.map((c, i) => (
                          <li key={i} className="text-sm text-[color:var(--muted)]">
                            — {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[color:var(--line)] pt-3">
                  <label className="min-w-[10rem] flex-1 text-xs">
                    <span className="font-semibold">Note</span>
                    <input
                      value={notes[it.id] ?? ""}
                      onChange={(e) =>
                        setNotes((n) => ({ ...n, [it.id]: e.target.value }))
                      }
                      placeholder="What should change"
                      className="mt-1 w-full rounded-lg border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--gold)]"
                    />
                  </label>
                  {(["approved", "needs-work", "rejected"] as const).map((verdict) => (
                    <button
                      key={verdict}
                      type="button"
                      onClick={() => record(it, verdict)}
                      aria-pressed={v?.verdict === verdict}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        v?.verdict === verdict
                          ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
                          : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--gold)]"
                      }`}
                    >
                      {verdict}
                    </button>
                  ))}
                  {v && (
                    <button
                      type="button"
                      onClick={() => clearReviewVerdict(it.id)}
                      className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--muted)]"
                    >
                      clear
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
