"use client";

/**
 * Question Explorer — the 50 launch questions in ten sections.
 *
 * Every card opens the curated article that answers the question, and every
 * card also offers the same question (rephrased for retrieval) to the AI guide.
 * The explorer never answers a question itself: it routes to content that can
 * be read, listened to and checked, which is the whole point of the exercise.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { getLaunchQuestionMatrix, getLaunchQuestionSections, getKbDocument } from "@/lib/content";
import { askGuideHref } from "@/lib/kb";
import { Card, Chip, EmptyState, PageHeader, SectionHeading } from "@/components/ui";
import { OrnamentRule } from "@/components/ornament";

const SECTIONS = getLaunchQuestionSections();
const QUESTIONS = getLaunchQuestionMatrix();

export default function QuestionsPage() {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QUESTIONS.filter((x) => {
      if (section && x.section !== section) return false;
      if (!q) return true;
      const doc = x.doc ? getKbDocument(x.doc) : null;
      return (
        x.text.toLowerCase().includes(q) ||
        x.id.toLowerCase() === q ||
        x.ask.toLowerCase().includes(q) ||
        (doc?.summary.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, section]);

  const bySection = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const x of filtered) {
      const arr = map.get(x.section) ?? [];
      arr.push(x);
      map.set(x.section, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Question Explorer"
        sub="Fifty questions in ten sections. Open a question for the article that answers it, or send it to the AI guide — every answer is grounded in the same source-tagged corpus."
      />

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_2fr]">
        <label className="block">
          <span className="text-sm font-medium">Search the questions</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="fasting, Kalaratri, Bengal, mantras…"
            className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div>
          <span className="text-sm font-medium">Sections</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSection("")}
              className={`rounded-full border px-3 py-1 text-xs ${
                section === "" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              All ({QUESTIONS.length})
            </button>
            {SECTIONS.map((s) => (
              <button
                key={s.letter}
                type="button"
                onClick={() => setSection(s.letter === section ? "" : s.letter)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  section === s.letter ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {s.letter} · {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No question matches that"
            body="Try a shorter word, or browse the sections. The full corpus is also searchable from the top bar."
            action={<Link href="/search" className="text-[var(--accent)] hover:underline">Search all content →</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {bySection.map(([letter, items]) => {
            const meta = SECTIONS.find((s) => s.letter === letter);
            return (
              <section key={letter} id={`section-${letter}`}>
                <SectionHeading
                  eyebrow={`Section ${letter}`}
                  title={meta?.title ?? letter}
                  sub={meta?.intro}
                />
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {items.map((x) => (
                    <Card key={x.id} className="flex h-full flex-col">
                      <div className="flex items-center gap-2">
                        <Chip>{x.id}</Chip>
                        {x.doc && <Chip>Article</Chip>}
                        {x.href && <Chip>Guide page</Chip>}
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">{x.text}</h3>
                      <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm">
                        {x.doc && (
                          <Link href={`/kb/${x.doc}`} className="text-[var(--accent)] hover:underline">
                            Read the article →
                          </Link>
                        )}
                        {x.href && !x.doc && (
                          <Link href={x.href} className="text-[var(--accent)] hover:underline">
                            Open the page →
                          </Link>
                        )}
                        <Link href={askGuideHref(x.ask)} className="text-[var(--muted)] hover:underline">
                          Ask the guide →
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <OrnamentRule className="my-10" />

      <p className="text-sm text-[var(--muted)]">
        Questions here are shown in English; the articles they open carry translated titles,
        summaries and bodies where a reviewed translation exists, and every article says which
        language you are actually reading. Questions about personal religious decisions are routed
        to the app&rsquo;s guidance boundary instead of being answered by an app.
      </p>
    </>
  );
}
