import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, getChapters, getManifestEntry, getTranslation } from "@/lib/content";
import { ChapterStory } from "@/components/story";
import {
  Breadcrumbs, Card, Chip, DefinitionList, EmptyState, ErrorState, OrnamentRule,
  PageHeader, SectionHeading, VerseBlock,
} from "@/components/ui";
import { Mandala } from "@/components/ornament";
import { BookmarkButton, ReadingProgress, VerseAnchor } from "@/components/interactive";
import { ReaderControls, VerseJump } from "@/components/reader";
import { OfflinePinButton } from "@/components/offline";
import { ReadAloudButton } from "@/components/speech";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getChapters().map((c) => ({ chapter: String(c.number) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ chapter: string }> },
) {
  const { chapter } = await params;
  const ch = getChapter(Number(chapter));
  return { title: ch ? `Chapter ${ch.number}: ${ch.titleEnglishEditorial}` : "Chapter not found" };
}

export default async function ChapterPage(
  { params }: { params: Promise<{ chapter: string }> },
) {
  const { chapter } = await params;
  const n = Number(chapter);
  if (!Number.isInteger(n) || n < 1 || n > 13) notFound();

  const ch = getChapter(n);
  const entry = getManifestEntry(n);
  const translation = getTranslation(n);
  if (!ch || !entry) notFound();

  const prev = n > 1 ? getChapter(n - 1) : null;
  const next = n < 13 ? getChapter(n + 1) : null;
  const href = `/scripture/${n}`;
  const labels = ch.verses.map((v) => v.label);
  const w = translation?.witness;
  /** True when the OCR witness survived only in part; surfaced, never papered over. */
  const partial = w?.status === "partial_witness";

  return (
    <>
      <Breadcrumbs items={[
        { label: "Durga Saptashati", href: "/scripture" },
        { label: `Chapter ${n}` },
      ]} />

      <PageHeader eyebrow={`Chapter ${n} · ${entry.charitraLabel}`} title={ch.titleSanskrit}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{ch.titleIast}</Chip>
          <Chip>{entry.traditionalVerseCount} verses</Chip>
          <Chip>Presiding: {ch.presidingDeity}</Chip>
          <BookmarkButton kind="chapter" ref_={`chapter-${n}`} label={`Chapter ${n} · ${entry.titleEnglish}`} href={href} />
        </div>
        <p className="mt-3 text-lg font-medium">{entry.titleEnglish}</p>
      </PageHeader>

      <ReaderControls chapterId={ch.id} verseCount={ch.verses.length} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <ReadingProgress chapterId={ch.id} verseLabels={labels} />

          <Card className="mb-6 p-5">
            <p className="muted mb-3 text-[0.68rem] uppercase tracking-[0.14em]">
              Front matter in this edition
            </p>
            <dl className="space-y-3">
              {ch.viniyoga.devanagari && (
                <div>
                  <dt className="muted text-xs">Viniyoga</dt>
                  <dd className="verse-deva mt-1 whitespace-pre-line">{ch.viniyoga.devanagari}</dd>
                </div>
              )}
              {ch.dhyana.devanagari && (
                <div>
                  <dt className="muted text-xs">Dhyana</dt>
                  <dd className="verse-deva mt-1 whitespace-pre-line">{ch.dhyana.devanagari}</dd>
                </div>
              )}
              {ch.invocation.devanagari && (
                <div>
                  <dt className="muted text-xs">Invocation</dt>
                  <dd className="verse-deva mt-1 whitespace-pre-line">{ch.invocation.devanagari}</dd>
                </div>
              )}
              {!ch.viniyoga.devanagari && !ch.dhyana.devanagari && !ch.invocation.devanagari && (
                <dd className="muted text-sm">
                  This edition prints no separate front matter for this chapter.
                </dd>
              )}
            </dl>
          </Card>

          <section aria-label={`Verses of chapter ${n}`}>
            <h2 className="sr-only">Verses</h2>
            <ol id="verse-list" className="space-y-5">
              {ch.verses.map((v) => (
                <li key={v.label}>
                  <VerseAnchor chapterId={ch.id} label={v.label}>
                    <div className="group relative">
                      <VerseBlock
                        label={v.label}
                        devanagari={v.devanagari}
                        iast={v.iast}
                        range={v.n !== v.nEnd}
                        padas={v.padas}
                        speaker={v.speaker}
                      />
                      <div className="absolute right-0 top-0 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <ReadAloudButton text={v.devanagari} lang="sa" label={`verse ${v.label} in Devanagari`} />
                        <BookmarkButton kind="verse" ref_={`${ch.id}:${v.label}`}
                                        label={`Ch ${n} v ${v.label}`} href={`${href}#${v.label}`} />
                      </div>
                    </div>
                  </VerseAnchor>
                </li>
              ))}
            </ol>
          </section>

          <OrnamentRule className="my-8" />

          {translation && (
            <section aria-labelledby="translation">
              <SectionHeading eyebrow="Translation" title={`Chapter ${n} in English`} />
              <h2 id="translation" className="sr-only">English translation</h2>

              {partial && (
                <ErrorState title="This chapter's English translation is incomplete">
                  <p>
                    The OCR witness for this canto is truncated, so only{" "}
                    {translation.paragraphs.length} paragraph
                    {translation.paragraphs.length === 1 ? "" : "s"} survived. The Sanskrit above is
                    complete. Rather than generate the missing prose, the app says plainly that it
                    is missing.
                  </p>
                  <p className="mt-2">
                    A complete public-domain translation of this canto exists in other editions and
                    is a documented import — see the source registry.
                  </p>
                </ErrorState>
              )}

              <Card className="mb-4 p-6">
                <div className="space-y-4">
                  {translation.paragraphs.map((p, i) => (
                    <p key={i} className="leading-[1.9]">{p}</p>
                  ))}
                </div>
              </Card>
            </section>
          )}

          <section aria-labelledby="story" className="mt-8">
            <SectionHeading eyebrow="कथा · Story" title={`अध्याय ${n} की कथा`} />
            <h2 id="story" className="sr-only">Chapter {n} story</h2>
            <ChapterStory n={n} />
          </section>

          {translation && partial && translation.paragraphs.length === 0 && (
            <EmptyState title="No English text for this chapter"
                        body="The witness is too damaged to import. The Sanskrit is complete." />
          )}

          {/* cross references */}
          <section className="mt-8" aria-labelledby="xref">
            <h2 id="xref" className="display mb-3 text-xl font-semibold">Cross-references</h2>
            <Card className="p-5">
              <DefinitionList items={[
                ["Charitra", entry.charitraLabel],
                ["Markandeya Purana", `Chapter ${entry.markandeyaPuranaChapter}`],
                ["Presiding deity", ch.presidingDeity],
                ["Verses", `${ch.verses.length} units · ${entry.traditionalVerseCount} traditional`],
                ["Edition", ch.sourceRef],
              ]} />
              <div className="mt-4 flex flex-wrap gap-2.5">
                {ch.id === "chapter-5" && (
                  <Link href="/scripture/angas/devi-suktam" className="btn btn-ghost">
                    The Ya Devi litany context
                  </Link>
                )}
                {ch.id === "chapter-11" && (
                  <Link href="/scripture/angas/devi-suktam" className="btn btn-ghost">
                    Narayani Stuti and the Devi Suktam
                  </Link>
                )}
                <Link href="/scripture/plans" className="btn btn-ghost">Reading plans</Link>
                <Link href="/sources" className="btn btn-ghost">Source registry</Link>
              </div>
            </Card>
          </section>

          <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6"
               style={{ borderColor: "var(--line)" }} aria-label="Chapters">
            {prev ? (
              <Link href={`/scripture/${prev.number}`} className="card px-4 py-3 text-sm">
                <span className="muted block text-xs">← Chapter {prev.number}</span>
                <span className="deva font-semibold">{prev.titleSanskrit}</span>
              </Link>
            ) : <span />}
            <Link href="/scripture" className="btn btn-ghost">Index</Link>
            {next ? (
              <Link href={`/scripture/${next.number}`} className="card px-4 py-3 text-right text-sm">
                <span className="muted block text-xs">Chapter {next.number} →</span>
                <span className="deva font-semibold">{next.titleSanskrit}</span>
              </Link>
            ) : <span />}
          </nav>
        </div>

        {/* ---------------------------------------------------------- aside */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <VerseJump labels={labels} />
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">In this chapter</p>
            <p className="text-sm leading-relaxed">{entry.titleEnglish}</p>
            <p className="muted mt-2 text-xs">
              {entry.charitraLabel} · Markandeya Purana {entry.markandeyaPuranaChapter}
            </p>
            <div className="mt-4">
              <OfflinePinButton path={`/scripture/${n}`} label={`Chapter ${n}`} />
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
            <Mandala className="absolute -right-8 -top-8 h-32 w-32 opacity-15"
                     petals={n + 8} stroke="var(--gold)" spin />
            <p className="muted relative mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
              Recitation
            </p>
            <p className="relative text-sm leading-relaxed">
              The traditional path is read as a whole over nine days, one charitra per day. Reading
              a single chapter on its own is also customary. No particular speed is required.
            </p>
            <Link href="/puja/chandi-path" className="link-underline relative mt-3 inline-block text-sm">
              Chandi Path guide
            </Link>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Angas</p>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/scripture/angas/devi-kavacham" className="link-underline">Devi Kavacham</Link></li>
              <li><Link href="/scripture/angas/argala-stotram" className="link-underline">Argala Stotram</Link></li>
              <li><Link href="/scripture/angas/kilaka-stotram" className="link-underline">Kilaka Stotram</Link></li>
              <li><Link href="/scripture/angas/devi-suktam" className="link-underline">Devi Suktam</Link></li>
              <li><Link href="/scripture/angas/aparadha-kshamapana" className="link-underline">Aparadha Kshamapana</Link></li>
              <li><Link href="/scripture/angas/chandika-dhyana" className="link-underline">Chandika Dhyana</Link></li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
