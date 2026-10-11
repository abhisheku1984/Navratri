import Link from "next/link";
import { notFound } from "next/navigation";
import { getMantra, getMantras } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, DefinitionList, Notice, OrnamentRule, PageHeader,
} from "@/components/ui";
import { Mandala, OmMark } from "@/components/ornament";
import { AudioPlayer, BookmarkButton } from "@/components/interactive";
import { ContentAvailability } from "@/components/content-language";

const STATUS_LABEL: Record<string, string> = {
  verified: "Verified against the imported edition",
  "verified-traditional": "Traditional text, widely attested",
  "not-included": "Text deliberately not included",
};

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getMantras().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = getMantra(slug);
  return { title: m ? m.title : "Text not found" };
}

export default async function MantraDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = getMantra(slug);
  if (!m) notFound();
  const href = `/mantras/${m.slug}`;
  const related = getMantras().filter((x) => x.slug !== m.slug && x.category === m.category);
  const withheld = m.textStatus === "not-included";

  const facts: [string, string | null | undefined][] = [
    ["Category", m.category],
    ["Status", STATUS_LABEL[m.textStatus] ?? m.textStatus],
    ["Full text present", withheld ? "No — withheld" : "Yes"],
    ["Audio", m.audio ? "Configured" : "None licensed"],
  ];
  if (m.chapterRef) {
    facts.push([
      "In the Saptashati",
      `Ch. ${m.chapterRef.chapter}, ${m.chapterRef.verses} (${m.chapterRef.count} verses)`,
    ]);
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Mantra library", href: "/mantras" }, { label: m.title }]} />

      <PageHeader eyebrow={m.category} title={m.title}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{STATUS_LABEL[m.textStatus] ?? m.textStatus}</Chip>
          {withheld && <Chip tone="crimson">Full text withheld</Chip>}
          <BookmarkButton kind="mantra" ref_={m.slug} label={m.title} href={href} />
        </div>
        <p className="muted mt-2 text-sm">{m.attribution}</p>
      </PageHeader>

      {/* Names the language this page is actually in, and what exists in others. */}
      <ContentAvailability
        className="mb-8"
        available={["en"]}
        rendering="en"
        what="this entry"
        altNotes={[
          { lang: "hi", text: "हिन्दी में उपलब्ध: नौ रूपों की कथाएँ, अध्याय-कथाएँ और सामान्य प्रश्नों के लेख।", href: "/kb" },
        ]}
      />


      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <section aria-labelledby="meaning">
            <h2 id="meaning" className="display mb-3 text-xl font-semibold">What it is</h2>
            <p className="text-[1.02rem] leading-[1.9]">{m.meaning}</p>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="text">
            <h2 id="text" className="display mb-3 text-xl font-semibold">The text</h2>
            {withheld ? (
              <Notice tone="caution" title="Not reproduced here">
                <p>{m.textStatusNote ?? m.attribution}</p>
                <p className="mt-2">
                  What is shown on this page is the <em>name</em> of this text and a description of
                  it, never its content. This app will not transcribe a verse from memory and
                  present it as scripture. When a public-domain or licensed edition is added to the
                  project&rsquo;s collection, the text appears here with its edition named.
                </p>
              </Notice>
            ) : (
              <Card className="p-6">
                <p className="verse-deva whitespace-pre-line">{m.deva}</p>
                <p className="verse-iast mt-4 border-t pt-4"
                   style={{ borderColor: "var(--line)" }}>{m.iast}</p>
              </Card>
            )}
          </section>

          {m.wordMeaning.length > 0 && (
            <>
              <OrnamentRule className="my-9" />
              <section aria-labelledby="word">
                <h2 id="word" className="display mb-3 text-xl font-semibold">Word by word</h2>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {m.wordMeaning.map(([w, sense]) => (
                    <div key={w} className="card p-4">
                      <dt className="deva font-semibold">{w}</dt>
                      <dd className="muted mt-1 text-sm leading-relaxed">{sense}</dd>
                    </div>
                  ))}
                </dl>
                <p className="muted mt-3 text-xs leading-relaxed">
                  Bīja syllables are not lexical words and are not translated. Where a gloss says
                  so, that is the honest answer rather than an invented meaning.
                </p>
              </section>
            </>
          )}

          <OrnamentRule className="my-9" />

          <section aria-labelledby="pron">
            <h2 id="pron" className="display mb-3 text-xl font-semibold">Pronunciation</h2>
            <Card className="p-6">
              <p className="font-mono text-lg">{m.pronunciation}</p>
              <p className="muted mt-3 text-sm leading-relaxed">
                A rough guide in Latin letters. It cannot carry Sanskrit quantity or aspiration
                properly — hearing a recitation from your own tradition is better than any
                transcription, which is one reason a licensed audio track belongs here.
              </p>
            </Card>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="listen">
            <h2 id="listen" className="display mb-3 text-xl font-semibold">Listen</h2>
            <AudioPlayer track={{
              url: m.audio?.url ?? null,
              title: m.title,
              licence: m.audio?.licence,
            }} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden p-6 text-center">
            <OmMark className="absolute -right-4 -top-4 h-24 w-24 opacity-10" />
            <Mandala className="absolute -left-10 -bottom-10 h-40 w-40 opacity-10"
                     petals={16} stroke="var(--gold)" spin />
            <p className="deva relative text-lg font-semibold">{m.deva}</p>
          </Card>

          <Card className="p-5">
            <DefinitionList items={facts} />
          </Card>

          {m.fullTextRef && (
            <Card className="p-5">
              <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Full text</p>
              <p className="text-sm leading-relaxed">
                The complete imported text is readable verse by verse, with progress and bookmarks.
              </p>
              <Link href={m.fullTextRef} className="btn btn-primary mt-3">Read it</Link>
            </Card>
          )}

          {m.chapterRef && (
            <Card className="p-5">
              <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                Scripture location
              </p>
              <p className="text-sm leading-relaxed">
                Chapter {m.chapterRef.chapter}, {m.chapterRef.verses} — {m.chapterRef.count} verses
                in the imported edition.
              </p>
              <Link href={`/scripture/${m.chapterRef.chapter}`} className="btn btn-ghost mt-3">
                Open the chapter
              </Link>
            </Card>
          )}

          {m.sourceRef && (
            <Card className="p-5">
              <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Source</p>
              <p className="text-sm leading-relaxed">{m.sourceRef}</p>
              <Link href="/sources" className="link-underline mt-3 inline-block text-sm">
                Source registry
              </Link>
            </Card>
          )}

          {related.length > 0 && (
            <Card className="p-5">
              <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                Other {m.category === "anga" ? "recitations" : `${m.category}s`}
              </p>
              <ul className="space-y-1.5 text-sm">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/mantras/${r.slug}`} className="link-underline">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
