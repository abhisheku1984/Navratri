"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { search, searchCounts, type SearchKind } from "@/lib/search";
import { EmptyState, LoadingBlock, PageHeader, Stat } from "@/components/ui";

const KINDS: { id: SearchKind; label: string }[] = [
  { id: "verse", label: "Verses" },
  { id: "chapter", label: "Chapters" },
  { id: "navadurga", label: "Forms" },
  { id: "peetha", label: "Peethas" },
  { id: "temple", label: "Temples" },
  { id: "mantra", label: "Mantras" },
  { id: "topic", label: "Knowledge" },
  { id: "story", label: "Stories" },
  { id: "glossary", label: "Glossary" },
];

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [kind, setKind] = useState<SearchKind | null>(null);
  const [draft, setDraft] = useState(q);

  const counts = useMemo(() => searchCounts(q), [q]);
  const hits = useMemo(() => search(q, 60).filter((h) => !kind || h.kind === kind), [q, kind]);

  return (
    <>
      <PageHeader eyebrow="Search" title="Find anything"
                  sub="Goddess names, verse text and numbers, chapter titles, temples, Peethas, stories, mantras, festivals and glossary terms — searched in Devanagari, Hindi and English." />

      <form
        className="mt-6 flex flex-wrap gap-2.5"
        role="search"
        onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(draft)}`); }}
      >
        <label htmlFor="global-q" className="sr-only">Search</label>
        <input
          id="global-q"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Try: ya devi, Mahishasura, Kamakhya, 5.14, Ghatasthapana"
          className="min-w-[14rem] flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
          autoFocus
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {q ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <button className="chip" aria-pressed={!kind}
                    style={{ borderColor: !kind ? "var(--gold)" : "var(--line)" }}
                    onClick={() => setKind(null)}>
              All ({counts.total})
            </button>
            {KINDS.filter((k) => counts.byKind[k.id] > 0).map((k) => (
              <button key={k.id} className="chip" aria-pressed={kind === k.id}
                      style={{ borderColor: kind === k.id ? "var(--gold)" : "var(--line)" }}
                      onClick={() => setKind(kind === k.id ? null : k.id)}>
                {k.label} ({counts.byKind[k.id]})
              </button>
            ))}
          </div>

          {hits.length === 0 ? (
            <EmptyState className="mt-8" title={`Nothing matched “${q}”`}
                        body="Verse search matches the Sanskrit and its transliteration. Try a shorter word, or the Devanagari spelling, or search for a goddess or temple name instead." />
          ) : (
            <ol className="mt-6 space-y-3">
              {hits.map((h) => (
                <li key={`${h.kind}:${h.id}`}>
                  <Link href={h.href} className="card block p-5 transition-transform hover:-translate-y-0.5">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="chip">{KINDS.find((k) => k.id === h.kind)?.label ?? h.kind}</span>
                      {h.sub && <span className="muted text-xs">{h.sub}</span>}
                    </div>
                    <p className={h.kind === "verse" ? "verse-deva text-base" : "display text-lg font-semibold"}>
                      {h.title}
                    </p>
                    {h.excerpt && (
                      <p className="muted mt-1.5 text-sm leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: highlight(h.excerpt, q) }} />
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <p className="muted mt-4 text-xs">
            Showing {hits.length} of {counts.total} matches. Search runs entirely in your browser
            against the shipped corpus — nothing you type is sent anywhere.
          </p>
        </>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Verses indexed" value="656" hint="Across 13 chapters" />
          <Stat label="Sites indexed" value="103" hint="60 Peethas, 43 temples" />
          <Stat label="Languages" value="3" hint="Sanskrit, Hindi, English" />
          <Stat label="Sent to a server" value="None" hint="Local index only" />
        </div>
      )}
    </>
  );
}

function highlight(excerpt: string, q: string): string {
  const escaped = excerpt.replace(/[&<>]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
  const term = q.trim();
  if (!term) return escaped;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${safe})`, "gi"),
    '<mark style="background:var(--accent-soft);color:inherit">$1</mark>');
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Preparing the index…" />}>
      <SearchResults />
    </Suspense>
  );
}
