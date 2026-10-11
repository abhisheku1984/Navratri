import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnga, getAngas } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, Notice, OrnamentRule, PageHeader, VerseBlock,
} from "@/components/ui";
import { OmMark } from "@/components/ornament";
import { BookmarkButton, ReadingProgress, VerseAnchor } from "@/components/interactive";
import { ReaderControls, VerseJump } from "@/components/reader";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAngas().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const a = getAnga(slug);
  return { title: a ? a.titleEnglish : "Recitation not found" };
}

export default async function AngaPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const a = getAnga(slug);
  if (!a) notFound();
  const href = `/scripture/angas/${a.slug}`;
  const labels = a.verses.map((v) => v.label);
  const others = getAngas().filter((x) => x.slug !== a.slug);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Durga Saptashati", href: "/scripture" },
        { label: a.titleEnglish },
      ]} />

      <PageHeader eyebrow={a.kind === "purvanga" ? "Purvanga — before the path" : "Uttaranga — after the path"}
                  title={a.titleSanskrit}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{a.titleIast}</Chip>
          <Chip>{a.verses.length} verses</Chip>
          <BookmarkButton kind="anga" ref_={a.slug} label={a.titleEnglish} href={href} />
        </div>
        <p className="mt-3 text-lg font-medium">{a.titleEnglish}</p>
      </PageHeader>

      <ReaderControls chapterId={a.slug} verseCount={a.verses.length} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <ReadingProgress chapterId={a.slug} verseLabels={labels} />

          <Notice tone="caution" title="Sequence is not fixed">
            {a.note}
          </Notice>

          {a.verses.length > 0 ? (
            <section aria-label={`Verses of ${a.titleEnglish}`}>
              <h2 className="sr-only">Verses</h2>
              <ol id="verse-list" className="mt-6 space-y-5">
                {a.verses.map((v) => (
                  <li key={v.label}>
                    <VerseAnchor chapterId={a.slug} label={v.label}>
                      <div className="group relative">
                        <VerseBlock label={v.label} devanagari={v.devanagari} iast={v.iast}
                                    padas={v.padas} speaker={v.speaker} />
                        <div className="absolute right-0 top-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                          <BookmarkButton kind="verse" ref_={`${a.slug}:${v.label}`}
                                          label={`${a.titleEnglish} ${v.label}`}
                                          href={`${href}#${v.label}`} />
                        </div>
                      </div>
                    </VerseAnchor>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <Notice tone="caution" title="Text not yet imported">
              This recitation is listed so the sequence is visible, but no verified text has been
              imported for it yet. It will not be transcribed from memory.
            </Notice>
          )}

          <OrnamentRule className="my-8" />

          <Card className="p-6">
            <h2 className="display mb-2 text-lg font-semibold">How it is used</h2>
            <p className="muted leading-relaxed">
              In the Navangam sequence this text is recited {a.kind === "purvanga"
                ? "before the main path, as a preparation"
                : "after the main path, as a closing"}
              . The Devanagari above is imported from the same edition as the thirteen chapters, so
              its verse numbering has been checked for continuity.
            </p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5"><VerseJump labels={labels} /></Card>
          <Card className="relative overflow-hidden p-5">
            <OmMark className="absolute -right-4 -top-4 h-24 w-24 opacity-10" />
            <p className="muted relative mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Verses</p>
            <p className="relative display text-2xl font-semibold">{a.verses.length}</p>
            <p className="muted relative mt-1 text-xs">
              {a.kind === "purvanga" ? "Recited before the path" : "Recited after the path"}
            </p>
          </Card>
          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Other recitations</p>
            <ul className="space-y-1.5 text-sm">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/scripture/angas/${o.slug}`} className="link-underline">{o.titleEnglish}</Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
