import Link from "next/link";
import { getKbSection, getNavadurgaForms } from "@/lib/content";
import { Breadcrumbs, Card, PageHeader, SectionHeading, Stat, TextLink } from "@/components/ui";
import { Mandala, OrnamentRule } from "@/components/ornament";

export const metadata = {
  title: "Navratri Guide",
  description:
    "Nine nights, two Navratris, ten days: why the festival exists, what ghatasthapana establishes, how the regions differ, and the dates computed for your city.",
};

/**
 * The Navratri guide is assembled from the knowledge base rather than written
 * twice: section C holds the festival's own documents, and the day-by-day page
 * carries the nine forms. Anything that would duplicate prose here links to the
 * document that owns it.
 */
export default function NavratriPage() {
  const forms = getNavadurgaForms();
  const section = getKbSection("C");
  const docs = section?.documents ?? [];

  return (
    <>
      <PageHeader
        eyebrow="The festival"
        title="Navratri Guide"
        sub="Nine nights of the Goddess, twice a year, in as many shapes as India has regions. Start here for the structure, then follow the day you are in."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Nights" value="9" hint="One form per night, in sequence" />
        <Stat label="Navratris a year" value="2" hint="Chaitra in spring, Sharad in autumn" />
        <Stat label="Closing day" value="10th" hint="Vijayadashami, or the tenth-day observance" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <TextLink href="/navratri/day-by-day">Day-by-day guide →</TextLink>
        <TextLink href="/calendar">Dates for your city →</TextLink>
        <TextLink href="/puja">Puja and rituals →</TextLink>
        <TextLink href="/questions?section=C">Festival questions →</TextLink>
      </div>

      <OrnamentRule className="my-10" />

      <SectionHeading
        eyebrow="The nine nights"
        title="One form a night, in order"
        sub="The nine names are recorded in the Devi Kavacham; the Navadurga Stotram gives each one a dhyana verse. Regionally the order can differ — where it does, this app records both."
      />

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((f) => (
          <li key={f.id}>
            <Card className="h-full">
              <Link href={`/navadurga/${f.slug}`} className="group block">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-deva text-lg text-[var(--accent)]">
                    {f.nameDevanagari}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Day {f.day}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                  {f.nameTransliterated}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{f.meaning}</p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Colour: {f.colour}
                </p>
              </Link>
            </Card>
          </li>
        ))}
      </ol>

      <OrnamentRule className="my-10" />

      <SectionHeading
        eyebrow="What the festival is"
        title="Why Navratri is kept"
        sub="From the knowledge base, with every source named: the festival's scriptural anchor, its two seasons, its tenth day, and the rite that opens it."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.id} className="h-full">
            <h3 className="text-base font-semibold text-[var(--ink)]">
              <Link href={`/kb/${d.slug}`} className="hover:text-[var(--accent)]">
                {d.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{d.summary}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {d.sources.map((s) => s.sourceId).join(" · ")}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h3 className="text-base font-semibold">The ten-day shape</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The nine nights are the worship; the tenth day observes the completion of the
            narrative the nights told. Bengal counts ten days of Durga Puja explicitly; in the
            north and west the tenth is Vijayadashami; in Karnataka it is Dasara; in Tamil and
            Malayali practice it is the day a child writes the first letters.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Dates move with the lunar month, so this app computes them for the city you choose
            and states the method and its precision limits rather than printing a fixed date.
          </p>
          <p className="mt-4">
            <TextLink href="/kb/nine-nights-ten-days">Read: nine nights, ten days →</TextLink>
          </p>
        </Card>

        <Card className="relative overflow-hidden">
          <Mandala className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 opacity-20" petals={12} />
          <h3 className="text-base font-semibold">Ghatasthapana</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            A pot, water, barley seed and a coconut: the rite that establishes the Goddess&rsquo;s seat
            for nine nights, with sprouts growing while the days pass.
          </p>
          <p className="mt-4">
            <TextLink href="/puja/ghatasthapana">Ghatasthapana guide →</TextLink>
          </p>
        </Card>
      </div>

      <OrnamentRule className="my-10" />

      <div id="region-by-region">
        <SectionHeading
          eyebrow="Region by region"
          title="The same nine nights, kept differently"
          sub="Bengal's Durga Puja, Gujarat's garba, Karnataka's Dasara, Tamil Nadu's golu, Nepal's Dashain. The frame is shared; the content of each night is local."
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h3 className="font-semibold">Bengal</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Installation on Shashti, kumari puja on Ashtami, sandhi puja at the junction, Visarjan
            on Dashami.
          </p>
          <p className="mt-3"><TextLink href="/kb/durga-puja-bengal">Read more →</TextLink></p>
        </Card>
        <Card>
          <h3 className="font-semibold">Gujarat</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Garba in a circle around a still centre, dandiya with sticks, the ritual alongside the
            dancing.
          </p>
          <p className="mt-3"><TextLink href="/kb/navratri-gujarat">Read more →</TextLink></p>
        </Card>
        <Card>
          <h3 className="font-semibold">Karnataka</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Dasara: the illuminated palace, Chamundeshwari&rsquo;s procession, Ayudha puja on the tenth.
          </p>
          <p className="mt-3"><TextLink href="/kb/dasara-karnataka">Read more →</TextLink></p>
        </Card>
        <Card>
          <h3 className="font-semibold">Tamil Nadu</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The golu&rsquo;s nine steps, daily visits with sundal, Saraswati puja on the ninth.
          </p>
          <p className="mt-3"><TextLink href="/kb/tamil-nadu-golu">Read more →</TextLink></p>
        </Card>
        <Card>
          <h3 className="font-semibold">Nepal</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Dashain: jamara grown at home, Fulpati on the seventh, tika on Vijaya Dashami.
          </p>
          <p className="mt-3"><TextLink href="/kb/other-regions">Read more →</TextLink></p>
        </Card>
        <Card>
          <h3 className="font-semibold">Everywhere else</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Kerala, Punjab, Maharashtra, Odisha, Assam — and the reasons the customs differ at all.
          </p>
          <p className="mt-3"><TextLink href="/kb/why-customs-vary">Read more →</TextLink></p>
        </Card>
      </div>

      <div className="mt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Navratri" },
          ]}
        />
      </div>
    </>
  );
}
