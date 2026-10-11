import Link from "next/link";
import { getKbDocument, getKbSection, getNavadurgaForms } from "@/lib/content";
import { Breadcrumbs, Card, Notice, PageHeader, SectionHeading, TextLink } from "@/components/ui";
import { OrnamentRule } from "@/components/ornament";

export const metadata = {
  title: "Day by Day",
  description:
    "The nine nights of Navratri, one line a night: the form, its meaning, its colour, its mantra, and what a household actually does.",
};

/** A calm, printable view of the sequence — one card per night. */
export default function DayByDayPage() {
  const forms = getNavadurgaForms();
  const ghat = getKbDocument("ghatasthapana-meaning");
  const vrat = getKbDocument("what-is-navratri-vrat");
  const region = getKbSection("H");

  return (
    <>
      <PageHeader
        eyebrow="Navratri"
        title="Day by Day"
        sub="Nine nights, in order. Each night carries one form, one quality and — in household practice — one small thing to do."
      />

      <Notice tone="info" title="Read this before the list">
        <p>
          The night-to-form mapping below is the common northern sequence, with the nine names
          as the Devi Kavacham records them. Regional sequences differ, and where they do this app
          records both rather than choosing one. Nothing here obliges anyone to fast; the fasting
          guide says plainly who should not, and offers non-fasting ways to keep the nights.
        </p>
      </Notice>

      <div className="mt-8 space-y-4">
        {forms.map((f) => (
          <Card key={f.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Night {f.day}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  <span className="font-deva text-[var(--accent)]">{f.nameDevanagari}</span>
                  {" · "}
                  {f.nameTransliterated}
                </h3>
              </div>
              <p className="text-sm text-[var(--muted)]">Colour: {f.colour}</p>
            </div>

            <p className="mt-3 text-sm text-[var(--ink)]">{f.meaning}</p>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Read</dt>
                <dd><Link className="text-[var(--accent)] hover:underline" href={`/navadurga/${f.slug}`}>{f.nameTransliterated} in full →</Link></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Mantra</dt>
                <dd className="font-deva">{f.navarnaMantra.devanagari}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Listen</dt>
                <dd><Link className="text-[var(--accent)] hover:underline" href={`/listen?for=${f.slug}`}>Narration of this night →</Link></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Do</dt>
                <dd className="text-[var(--muted)]">
                  Light the lamp, offer a flower, say the name of the night, sit still for the
                  length of one listening.
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <OrnamentRule className="my-10" />

      <SectionHeading
        eyebrow="Around the nine"
        title="Before the first night, and after the ninth"
        sub="Ghatasthapana opens the sequence; the tenth day closes it. Fasting is optional and has caveats."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="font-semibold">Ghatasthapana</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {ghat?.summary ?? "The kalash rite that opens Navratri."}
          </p>
          <p className="mt-3">
            <TextLink href="/puja/ghatasthapana">Step-by-step guide →</TextLink>
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold">Vrat and food</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {vrat?.summary ?? "What vrat is, and who should not keep it without medical advice."}
          </p>
          <p className="mt-3">
            <TextLink href="/kb/what-is-navratri-vrat">Read the vrat guide →</TextLink>
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold">Regional sequences</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {region?.intro ?? "How the same nine nights are kept differently across India."}
          </p>
          <p className="mt-3">
            <TextLink href="/navratri#region-by-region">Region by region →</TextLink>
          </p>
        </Card>
      </div>

      <div className="mt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Navratri", href: "/navratri" },
            { label: "Day by day" },
          ]}
        />
      </div>
    </>
  );
}
