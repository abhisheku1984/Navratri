import Link from "next/link";
import { getChapters, getManifestEntry } from "@/lib/content";
import { Breadcrumbs, Card, Notice, PageHeader, SectionHeading } from "@/components/ui";

export const metadata = { title: "Reading Plans" };

const PLANS = [
  {
    id: "nine-day",
    title: "Nine-day charitra path",
    days: 9,
    sub: "One charitra per day, as in the traditional Navratri path.",
    schedule: [
      ["Days 1–3", "Prathama Charitra", [1]],
      ["Days 4–6", "Madhyama Charitra", [2, 3, 4]],
      ["Days 7–9", "Uttama Charitra", [5, 6, 7, 8, 9, 10, 11, 12, 13]],
    ] as [string, string, number[]][],
  },
  {
    id: "thirteen-day",
    title: "Thirteen-day chapter path",
    days: 13,
    sub: "One chapter per day. The most common household reading.",
    schedule: null,
  },
  {
    id: "study",
    title: "Twenty-six day study schedule",
    days: 26,
    sub: "One chapter over two days: the Sanskrit on the first, the translation and reflection on the second.",
    schedule: null,
  },
];

export default function PlansPage() {
  const chapters = getChapters();

  return (
    <>
      <Breadcrumbs items={[{ label: "Durga Saptashati", href: "/scripture" }, { label: "Reading plans" }]} />
      <PageHeader eyebrow="Practice" title="Reading plans"
                  sub="Three schedules for the same text. Choose one that fits your life; none of them is more devout than another." />

      <Notice tone="info" title="What progress means here">
        The tracker records which verses you opened. It measures reading, nothing else. Completing
        a plan earns no merit and stopping one forfeits none. The purpose is to make a long text
        possible in a busy life.
      </Notice>

      <div className="mt-8 space-y-4">
        {PLANS.map((p) => (
          <Card key={p.id} className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="display text-xl font-semibold">{p.title}</h2>
              <span className="chip">{p.days} days</span>
            </div>
            <p className="muted mt-2 text-sm">{p.sub}</p>

            {p.schedule ? (
              <div className="mt-4 space-y-3">
                {p.schedule.map(([when, name, nums]) => (
                  <div key={when} className="rounded-xl border p-4"
                       style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
                    <p className="mb-1 text-sm font-semibold">{when} · {name}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {nums.map((n) => (
                        <li key={n}>
                          <Link href={`/scripture/${n}`} className="chip hover:underline">
                            Ch {n}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((c, i) => {
                  const e = getManifestEntry(c.number)!;
                  return (
                    <li key={c.id}>
                      <Link href={`/scripture/${c.number}`}
                            className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:underline"
                            style={{ borderColor: "var(--line)" }}>
                        <span className="chip shrink-0">
                          {p.id === "study" ? `Day ${i * 2 + 1}–${i * 2 + 2}` : `Day ${i + 1}`}
                        </span>
                        <span className="min-w-0">
                          <span className="deva block truncate">{c.titleSanskrit}</span>
                          <span className="muted block truncate text-xs">{e.titleEnglish}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeading eyebrow="Before and after" title="The full path" />
        <p className="muted mb-4 text-sm">
          The traditional sequence begins with the purvangas and closes with the uttarangas. Order
          varies by lineage.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["/scripture/angas/chandika-dhyana", "Chandika Dhyana"],
            ["/scripture/angas/devi-kavacham", "Devi Kavacham"],
            ["/scripture/angas/argala-stotram", "Argala Stotram"],
            ["/scripture/angas/kilaka-stotram", "Kilaka Stotram"],
            ["/scripture/angas/devi-suktam", "Devi Suktam"],
            ["/scripture/angas/aparadha-kshamapana", "Aparadha Kshamapana"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="card block p-4 text-sm hover:underline">{label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
