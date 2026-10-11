import Link from "next/link";
import { getPujaCollection, getPujaGuides } from "@/lib/content";
import { Card, Notice, PageHeader, SectionHeading } from "@/components/ui";
import { Diya, Mandala } from "@/components/ornament";

export const metadata = { title: "Puja Guides" };

export default function PujaIndex() {
  const col = getPujaCollection();
  const guides = getPujaGuides();

  return (
    <>
      <PageHeader eyebrow="Practice" title={col.title} sub={col.intro} />

      <Notice tone="info" title="Nothing here is compulsory">
        <p>
          Fasting, all-night vigil, elaborate offering — none of it is required, and none of it
          makes a person more or less devout. Navratri is kept by millions of people who simply
          light a lamp and sit quietly for a few minutes.
        </p>
        <p className="mt-2">
          <strong>Health first.</strong> Fasting is unsafe for some people and inadvisable for
          others: anyone pregnant, nursing, diabetic, on regular medication, elderly, unwell, or
          recovering; and children. A fast that harms the body is not a religious act. Speak to a
          doctor before changing how you eat.
        </p>
      </Notice>

      {col.editorialNote && <Notice tone="caution">{col.editorialNote}</Notice>}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/puja/${g.slug}`} className="card flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="chip">{g.sections.length} sections</span>
                <Mandala className="h-8 w-8 opacity-25" petals={12} stroke="var(--gold)" />
              </div>
              <h2 className="display text-lg font-semibold">{g.title}</h2>
              <p className="muted mt-2 flex-1 text-sm leading-relaxed">{g.summary}</p>
              <ul className="muted mt-4 space-y-1 border-t pt-3 text-xs"
                  style={{ borderColor: "var(--line)" }}>
                {g.sections.slice(0, 4).map((s) => <li key={s.heading}>{s.heading}</li>)}
                {g.sections.length > 4 && <li>…and {g.sections.length - 4} more</li>}
              </ul>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <SectionHeading eyebrow="If you do nothing else" title="A lamp, a flower, a minute of quiet" />
        <Card className="p-6">
          <div className="flex flex-wrap items-start gap-6">
            <Diya className="h-12 w-16 shrink-0" />
            <div className="min-w-[16rem] flex-1">
              <p className="leading-relaxed">
                Wash your hands. Set down a small bowl of water and a flower. Light a lamp. Say the
                name of the day&rsquo;s form and the Navarna mantra nine times. Sit still until the
                lamp has burned a little. That is a complete Navratri puja. It takes five minutes
                and it is enough.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href="/puja/daily-puja" className="btn btn-primary">The five-minute form</Link>
                <Link href="/puja/ghatasthapana" className="btn btn-ghost">Ghatasthapana</Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="Regional" title="How different regions keep it" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Bengal", "Bodhan on Shashti, then Durga Puja over four days, ending in visarjan. Ghatasthapana is not the opening act it is elsewhere."],
            ["Gujarat", "Garba and dandiya through the night, with the mother goddess invoked in the garbo at the centre."],
            ["South India", "Golu or Bommai Kolu: tiers of dolls and deities displayed in the home, visited house to house."],
          ].map(([title, body]) => (
            <Card key={title} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Mandala className="h-7 w-7 opacity-40" petals={10} stroke="var(--gold)" />
                <p className="display font-semibold">{title}</p>
              </div>
              <p className="muted text-sm leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>
        <p className="muted mt-3 text-xs leading-relaxed">
          These are described as the differences they are, not ranked. The observances page on the{" "}
          <Link href="/calendar" className="link-underline">calendar</Link> lists them alongside the
          festivals they belong to.
        </p>
      </section>
    </>
  );
}
