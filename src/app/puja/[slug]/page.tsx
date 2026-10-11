import Link from "next/link";
import { notFound } from "next/navigation";
import { getPujaGuide, getPujaGuides } from "@/lib/content";
import {
  Breadcrumbs, Card, Notice, OrnamentRule, PageHeader,
} from "@/components/ui";
import { Diya, Mandala } from "@/components/ornament";
import { BookmarkButton } from "@/components/interactive";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPujaGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const g = getPujaGuide(slug);
  return { title: g ? g.title : "Guide not found" };
}

/**
 * Sections are rendered generically from the content model rather than
 * hard-coded, so a new guide — or a corrected one — needs no code change.
 * Two sections get extra treatment because they carry safety information.
 */
const SAFETY_HEADINGS = /safety|fire|flame|lamp/i;
const FAST_HEADINGS = /fast|necessary note|health/i;

export default async function PujaDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const g = getPujaGuide(slug);
  if (!g) notFound();
  const others = getPujaGuides().filter((x) => x.slug !== g.slug);
  const href = `/puja/${g.slug}`;

  return (
    <>
      <Breadcrumbs items={[{ label: "Puja guides", href: "/puja" }, { label: g.title }]} />

      <PageHeader eyebrow="Practice" title={g.title}>
        <BookmarkButton kind="topic" ref_={g.slug} label={g.title} href={href} />
        <p className="muted mt-3 text-lg">{g.summary}</p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          {g.sections.map((s, i) => {
            const safety = SAFETY_HEADINGS.test(s.heading);
            const fasting = FAST_HEADINGS.test(s.heading);
            const paras = s.body.split(/\n(?=\d+\.)/).filter(Boolean);

            return (
              <section key={s.heading} aria-labelledby={`sec-${i}`}>
                {i > 0 && <OrnamentRule className="my-9" />}
                <h2 id={`sec-${i}`} className="display mb-3 text-xl font-semibold">{s.heading}</h2>

                {safety && (
                  <Notice tone="caution" title="Fire, children and the elderly">
                    {s.body}
                  </Notice>
                )}

                {fasting && (
                  <Notice tone="caution" title="Fasting is never compulsory">
                    {s.body}
                  </Notice>
                )}

                {!safety && !fasting && (
                  <Card className="p-6">
                    {paras.length > 1 ? (
                      <ol className="list-decimal space-y-2.5 pl-5 leading-[1.9]">
                        {paras.map((p, j) => <li key={j}>{p.replace(/^\d+\.\s*/, "")}</li>)}
                      </ol>
                    ) : (
                      <div className="space-y-4">
                        {s.body.split(/\n{2,}/).filter(Boolean).map((p, j) => (
                          <p key={j} className="leading-[1.9]">{p}</p>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

                {safety && (
                  <Card className="mt-3 p-5">
                    <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                      General lamp safety
                    </p>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                      <li>Place the lamp on a non-flammable surface, away from cloth, curtains and hair.</li>
                      <li>Never leave a lit diya unattended, and never overnight in an empty room.</li>
                      <li>Keep it out of reach of children and pets; a small metal tray underneath helps.</li>
                      <li>Let the lamp cool before moving it, and keep the wick no taller than it needs to be.</li>
                    </ul>
                  </Card>
                )}
              </section>
            );
          })}

          <OrnamentRule className="my-9" />

          <Notice tone="caution" title="No universal timing is given here">
            Auspicious timing depends on your latitude, longitude and time zone, and on which
            tradition you follow. This app computes the Navratri dates for the city you select on
            the <Link href="/calendar" className="link-underline">calendar</Link>, and labels the
            method and its limits. It does not publish a single muhurat for everywhere, because
            there is no such thing.
          </Notice>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden p-6 text-center">
            <Mandala className="absolute -right-10 -top-10 h-40 w-40 opacity-15"
                     petals={12} stroke="var(--gold)" spin />
            <Diya className="relative mx-auto h-10 w-14" />
            <p className="relative mt-3 font-semibold">{g.title}</p>
            <p className="muted relative text-xs">{g.sections.length} sections</p>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">On this page</p>
            <ol className="space-y-1.5 text-sm">
              {g.sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#sec-${i}`} className="link-underline">{s.heading}</a>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Other guides</p>
            <ul className="space-y-1.5 text-sm">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/puja/${o.slug}`} className="link-underline">{o.title}</Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Texts used</p>
            <p className="text-sm leading-relaxed">
              The kavacham, argala, kilaka and the Navarna mantra appear across these guides.
            </p>
            <Link href="/mantras" className="link-underline mt-3 inline-block text-sm">
              Open the mantra library
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
