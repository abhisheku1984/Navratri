import Link from "next/link";
import { notFound } from "next/navigation";
import { getNavadurgaForm, getNavadurgaForms } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, DefinitionList, Notice, OrnamentRule, PageHeader, SampleBadge,
} from "@/components/ui";
import { Mandala, Trident } from "@/components/ornament";
import { AudioPlayer, BookmarkButton } from "@/components/interactive";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getNavadurgaForms().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const f = getNavadurgaForm(slug);
  return { title: f ? `${f.nameTransliterated} — Navadurga day ${f.day}` : "Form not found" };
}

export default async function NavadurgaDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const f = getNavadurgaForm(slug);
  if (!f) notFound();
  const all = getNavadurgaForms();
  const prev = all.find((x) => x.day === f.day - 1);
  const next = all.find((x) => x.day === f.day + 1);
  const href = `/navadurga/${f.slug}`;

  return (
    <>
      <Breadcrumbs items={[
        { label: "Navadurga", href: "/navadurga" },
        { label: `${f.nameTransliterated}` },
      ]} />

      <PageHeader eyebrow={`Navadurga · Day ${f.day}`} title={f.nameDevanagari}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{f.nameTransliterated}</Chip>
          <Chip>{f.nameHindi}</Chip>
          <SampleBadge />
          <BookmarkButton kind="topic" ref_={f.slug} label={`${f.nameDevanagari} (day ${f.day})`} href={href} />
        </div>
        <p className="muted mt-3 text-lg">{f.meaning}</p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <section aria-labelledby="origin">
            <h2 id="origin" className="display mb-3 text-xl font-semibold">Origin and narrative</h2>
            <p className="text-[1.02rem] leading-[1.85]">{f.originStory}</p>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="icon">
            <h2 id="icon" className="display mb-3 text-xl font-semibold">Iconography</h2>
            <p className="leading-relaxed">{f.iconography}</p>

            <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--gold)" }}>Symbolism</h3>
            <dl className="space-y-3">
              {f.symbolism.map((s) => (
                <div key={s.attribute} className="card p-4">
                  <dt className="font-semibold">{s.attribute}</dt>
                  <dd className="muted mt-1 text-sm leading-relaxed">{s.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="mantra">
            <h2 id="mantra" className="display mb-3 text-xl font-semibold">Mantra</h2>

            <Card className="mb-4 p-6">
              <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.16em]">
                Navarna mantra — common to all nine forms
              </p>
              <p className="verse-deva text-2xl">{f.navarnaMantra.devanagari}</p>
              <p className="verse-iast mt-1.5">{f.navarnaMantra.transliteration}</p>
              <p className="muted mt-3 text-sm leading-relaxed">{f.navarnaMantra.meaning}</p>
              <p className="muted mt-2 text-xs">{f.navarnaMantra.note}</p>
            </Card>

            <Card className="mb-4 p-6">
              <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.16em]">
                Dhyana verse · {f.dhyanaVerse.status}
              </p>
              {f.dhyanaVerse.devanagari ? (
                <p className="verse-deva whitespace-pre-line">{f.dhyanaVerse.devanagari}</p>
              ) : (
                <p className="muted text-sm">
                  Not yet imported. This app will not transcribe a verse from memory.
                </p>
              )}
              <p className="muted mt-3 text-xs">{f.dhyanaVerse.source}</p>
              <p className="muted mt-1 text-xs">{f.dhyanaVerse.note}</p>
            </Card>

            <div className="mb-4">
              <AudioPlayer track={{ url: null, title: `${f.nameTransliterated} dhyana` }} />
            </div>

            <Card className="p-5">
              <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.16em]">
                {f.kavachamNameVerse.source}
              </p>
              <p className="verse-deva whitespace-pre-line">
                {f.kavachamNameVerse.devanagari ?? "Not available"}
              </p>
              <p className="muted mt-3 text-xs">
                Imported and verified — the nine names come from the same edition as the rest of
                the scripture library.
              </p>
            </Card>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="routine">
            <h2 id="routine" className="display mb-3 text-xl font-semibold">
              A five-minute daily routine
            </h2>
            <ol className="space-y-2.5">
              {f.fiveMinuteRoutine.map((s, i) => (
                <li key={i} className="card flex gap-4 p-4">
                  <span className="chip shrink-0" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                    {s.step}
                  </span>
                  <span className="text-sm leading-relaxed">{s.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="family">
            <h2 id="family" className="display mb-3 text-xl font-semibold">
              A story for the family
            </h2>
            <Card className="p-6">
              <p className="text-[1.02rem] leading-[1.9]">{f.familyStory}</p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                A retelling written for this app. For the underlying source, see{" "}
                <Link href="/scripture" className="link-underline">the Saptashati</Link> and the{" "}
                <Link href="/stories" className="link-underline">stories section</Link>.
              </p>
            </Card>
          </section>
        </div>

        {/* ------------------------------------------------------------ aside */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden p-6 text-center">
            <Mandala className="absolute -right-10 -top-10 h-40 w-40 opacity-15"
                     petals={f.day + 7} stroke="var(--gold)" spin />
            <Trident className="relative mx-auto h-14 w-14" />
            <p className="deva relative mt-3 text-xl font-semibold">{f.nameDevanagari}</p>
            <p className="muted relative text-xs">{f.nameTransliterated}</p>
          </Card>

          <Card className="p-5">
            <DefinitionList items={[
              ["Day", `Day ${f.day} of Navratri`],
              ["Colour", f.colour],
              ["Flower", f.offering.flower],
              ["Bhog", f.offering.bhog],
              ["Chakra", f.chakra],
              ["Planet", f.planet],
            ]} />
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.14em]">Qualities</p>
            <ul className="flex flex-wrap gap-1.5">
              {f.qualities.map((q) => <li key={q}><span className="chip">{q}</span></li>)}
            </ul>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.14em]">Scripture</p>
            <p className="text-sm leading-relaxed">{f.scriptureRef}</p>
            <Link href="/scripture/angas/devi-kavacham"
                  className="link-underline mt-3 inline-block text-sm">
              Read the Devi Kavacham
            </Link>
          </Card>
        </aside>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Notice tone="caution" title={f.colourNote ? "Colour and offering" : "Regional variation"}>
          {f.colourNote}
        </Notice>
        <Notice tone="info" title="Traditions differ">
          {f.regionalVariationNote}
        </Notice>
      </div>

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6"
           style={{ borderColor: "var(--line)" }} aria-label="Nine forms">
        {prev ? (
          <Link href={`/navadurga/${prev.slug}`} className="card px-4 py-3 text-sm">
            <span className="muted block text-xs">← Day {prev.day}</span>
            <span className="deva font-semibold">{prev.nameDevanagari}</span>
          </Link>
        ) : <span />}
        <Link href="/navadurga" className="btn btn-ghost">All nine forms</Link>
        {next ? (
          <Link href={`/navadurga/${next.slug}`} className="card px-4 py-3 text-right text-sm">
            <span className="muted block text-xs">Day {next.day} →</span>
            <span className="deva font-semibold">{next.nameDevanagari}</span>
          </Link>
        ) : (
          <Link href="/calendar" className="card px-4 py-3 text-right text-sm">
            <span className="muted block text-xs">Day 10 →</span>
            <span className="font-semibold">Vijayadashami</span>
          </Link>
        )}
      </nav>
    </>
  );
}
