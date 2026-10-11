"use client";

import { useMemo, useState } from "react";
import { getGlossaryCollection, getGlossaryTerms } from "@/lib/content";
import { Card, EmptyState, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Flashcards } from "@/components/interactive";

export default function GlossaryPage() {
  const glossary = getGlossaryTerms();
  const col = getGlossaryCollection();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return glossary;
    return glossary.filter((g) =>
      [g.english, g.devanagari, g.definition].join(" ").toLowerCase().includes(needle));
  }, [glossary, q]);

  const cards = filtered.map((g) => ({
    front: g.devanagari || g.english,
    back: `${g.english}\n${g.definition}`,
  }));

  return (
    <>
      <PageHeader eyebrow="Reference" title={col.title} sub={col.intro} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Terms" value={String(glossary.length)} />
        <Stat label="Showing" value={String(filtered.length)} />
        <Stat label="Sorted" value="A–Z" hint="By English term" />
      </div>

      <div className="card mt-6 p-4">
        <label htmlFor="glossary-q" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
          Filter
        </label>
        <input id="glossary-q" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="tithi, kavacham, ghatasthapana…"
               className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
               style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-8" title="No term matches that"
                    body="Try a shorter fragment, or the Devanagari spelling." />
      ) : (
        <dl className="mt-6 space-y-3">
          {filtered.map((g) => (
            <div key={g.id} id={g.id} className="card scroll-mt-28 p-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <dt className="display text-lg font-semibold">{g.english}</dt>
                {g.devanagari && (
                  <span className="deva text-base" style={{ color: "var(--gold)" }}>
                    {g.devanagari}
                  </span>
                )}
              </div>
              <dd className="mt-2 leading-relaxed">{g.definition}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="mt-12 scroll-mt-28" id="flashcards" aria-labelledby="flashcards-heading">
        <SectionHeading eyebrow="Study" title="Flashcards"
                        sub="Tap a card to turn it over. The deck follows whatever you have filtered above." />
        <h2 id="flashcards-heading" className="sr-only">Flashcards</h2>
        <Card className="p-6">
          <Flashcards cards={cards} />
        </Card>
      </section>
    </>
  );
}
