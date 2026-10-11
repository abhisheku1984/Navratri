import Link from "next/link";
import { getNavadurga, getNavadurgaForms } from "@/lib/content";
import { Card, Notice, PageHeader, SectionHeading } from "@/components/ui";
import { Mandala } from "@/components/ornament";

export const metadata = { title: "Navadurga — The Nine Forms" };

export default function NavadurgaIndex() {
  const col = getNavadurga();
  const forms = getNavadurgaForms();
  const nameVerse = forms[0]?.kavachamNameVerse;

  return (
    <>
      <PageHeader eyebrow="The nine forms" title={col.title} sub={col.intro} />

      {nameVerse?.devanagari && (
        <Card className="mb-10 p-6">
          <p className="muted mb-2 text-[0.7rem] uppercase tracking-[0.16em]">
            The nine names as given in {nameVerse.source}
          </p>
          <p className="verse-deva whitespace-pre-line">{nameVerse.devanagari}</p>
          <p className="muted mt-3 text-xs">
            This verse is imported from the same edition as the rest of the scripture library, so
            the name list is verified rather than retyped.
          </p>
        </Card>
      )}

      <Notice tone="caution" title="Colours, offerings and rituals vary">
        The nine-colour scheme, the flower and bhog for each day, the number of arms shown, and the
        ritual sequence all differ between regions and lineages. Each profile records the most
        widely attested version and names the variation instead of flattening it.
      </Notice>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((f) => (
          <li key={f.slug}>
            <Link href={`/navadurga/${f.slug}`}
                  className="card group flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="chip" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                  Day {f.day}
                </span>
                <Mandala className="h-9 w-9 opacity-30 transition-opacity group-hover:opacity-60"
                         petals={f.day + 7} stroke="var(--gold)" />
              </div>
              <p className="deva text-2xl font-semibold">{f.nameDevanagari}</p>
              <p className="muted mt-0.5 text-sm">{f.nameTransliterated} · {f.nameHindi}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{f.meaning}</p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                {f.qualities.slice(0, 3).join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <SectionHeading eyebrow="Practice" title="Keeping the nine days" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/calendar" className="card p-5">
            <p className="display text-lg font-semibold">This year&rsquo;s calendar</p>
            <p className="muted mt-1 text-sm">
              Computed for your city, with repeated and skipped tithis flagged.
            </p>
          </Link>
          <Link href="/puja/daily-puja" className="card p-5">
            <p className="display text-lg font-semibold">A five-minute daily form</p>
            <p className="muted mt-1 text-sm">For households not doing a full ritual.</p>
          </Link>
          <Link href="/mantras" className="card p-5">
            <p className="display text-lg font-semibold">Mantra library</p>
            <p className="muted mt-1 text-sm">Kavacham, argala, kilaka and the great hymns.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
