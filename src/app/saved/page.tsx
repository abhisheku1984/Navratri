"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { getChapters } from "@/lib/content";
import { Card, EmptyState, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Journal } from "@/components/interactive";

export default function SavedPage() {
  const { state, toggleBookmark, hydrated } = useUser();

  const chapters = getChapters();

  const totalVerses = useMemo(
    () => chapters.reduce((n, c) => n + c.verses.length, 0), [chapters]);
  const versesRead = Object.keys(state.progress.scripture).length;
  const pct = totalVerses ? Math.round((versesRead / totalVerses) * 100) : 0;

  const reading = useMemo(
    () => Object.entries(state.progress.chapters)
      .filter(([, v]) => v > 0)
      .map(([id, v]) => {
        const ch = chapters.find((c) => c.id === id);
        return { id, ratio: v, chapter: ch, last: state.progress.scripture[id] };
      })
      .sort((a, b) => b.ratio - a.ratio),
    [state.progress, chapters]);

  if (!hydrated) {
    return <PageHeader eyebrow="Yours" title="Saved" sub="Loading your bookmarks from this device…" />;
  }

  return (
    <>
      <PageHeader eyebrow="Yours" title="Saved and progress"
                  sub="Bookmarks, where you left off, and a private journal. All of it lives in this browser and nothing is uploaded." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bookmarks" value={String(state.bookmarks.length)} />
        <Stat label="Verses opened" value={String(versesRead)} hint={`of ${totalVerses}`} />
        <Stat label="Overall" value={`${pct}%`} hint="A reading statistic, nothing more" />
        <Stat label="Journal entries" value={String(state.journal.length)} />
      </div>

      <Card className="mt-4 p-4">
        <p className="text-sm leading-relaxed">
          <strong>What this number means:</strong> it records which verses you have opened in this
          browser. It is a bookmark for your own convenience. It is not a measure of devotion, of
          merit, or of anything spiritual, and it is not compared with anyone else&rsquo;s.
        </p>
      </Card>

      {/* ------------------------------------------------------- continue */}
      <section className="mt-10" aria-labelledby="continue">
        <SectionHeading eyebrow="Pick up where you left off" title="Continue reading" />
        <h2 id="continue" className="sr-only">Continue reading</h2>
        {reading.length === 0 ? (
          <EmptyState title="You have not opened a chapter yet"
                      body="Start anywhere — the index explains the three charitras and the order they are usually read in."
                      action={<Link href="/scripture" className="btn btn-primary">Open the Saptashati</Link>} />
        ) : (
          <ul className="space-y-3">
            {reading.map(({ id, ratio, chapter, last }) => (
              <li key={id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="min-w-[12rem] flex-1">
                      <Link href={`/scripture/${chapter?.number ?? ""}`}
                            className="display text-lg font-semibold hover:underline">
                        {chapter?.titleSanskrit ?? id}
                      </Link>
                      <p className="muted text-xs">
                        {chapter?.presidingDeity}
                        {last && <> · last verse <span className="font-mono">{last}</span></>}
                      </p>
                    </div>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full"
                         style={{ background: "var(--surface-3)" }}>
                      <div className="h-full rounded-full"
                           style={{ width: `${Math.round(ratio * 100)}%`, background: "var(--gold)" }} />
                    </div>
                    <span className="muted font-mono text-xs">{Math.round(ratio * 100)}%</span>
                    {last && (
                      <Link href={`/scripture/${chapter?.number}#${last}`}
                            className="btn btn-ghost !px-3 !py-1.5 text-xs">
                        Resume
                      </Link>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------- bookmarks */}
      <section className="mt-10" aria-labelledby="bookmarks">
        <SectionHeading eyebrow="Marked" title="Bookmarks" />
        <h2 id="bookmarks" className="sr-only">Bookmarks</h2>
        {state.bookmarks.length === 0 ? (
          <EmptyState title="Nothing saved yet"
                      body="Use the ♡ on any verse, chapter, Peetha, temple, mantra or story. It collects here." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.bookmarks.map((b) => (
              <li key={b.href}>
                <Card className="flex h-full flex-col p-5">
                  <span className="chip mb-2 self-start">{b.kind}</span>
                  <Link href={b.href} className="flex-1 font-semibold hover:underline">
                    {b.label}
                  </Link>
                  <p className="muted mt-1 text-xs">
                    Saved {new Date(b.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  <button className="muted mt-3 self-start text-xs underline"
                          onClick={() => toggleBookmark(b)}>
                    Remove
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --------------------------------------------------------- journal */}
      <section className="mt-10" aria-labelledby="journal-heading">
        <SectionHeading eyebrow="Private" title="Prayer journal"
                        sub="Nothing is pre-filled and nothing is shared. Writing here is optional." />
        <h2 id="journal-heading" className="sr-only">Prayer journal</h2>
        <Journal />
      </section>
    </>
  );
}
