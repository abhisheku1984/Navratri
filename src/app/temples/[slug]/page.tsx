import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemple, getTemples } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, DefinitionList, Notice, OrnamentRule, PageHeader, SampleBadge,
  SectionHeading,
} from "@/components/ui";
import { Mandala, Trident } from "@/components/ornament";
import { FavouriteButton } from "@/components/interactive";

const KIND_LABEL: Record<string, string> = {
  "shakti-peetha": "Shakti Peetha",
  "major-devi-shrine": "Devi temple",
};

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTemples().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const t = getTemple(slug);
  return { title: t ? t.name : "Temple not found" };
}

export default async function TempleDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const t = getTemple(slug);
  if (!t) notFound();

  const near = getTemples()
    .filter((x) => x.id !== t.id && x.region === t.region)
    .slice(0, 4);

  const mapHref = `https://www.openstreetmap.org/?mlat=${t.coordinates.lat}&mlon=${t.coordinates.lon}` +
                  `#map=12/${t.coordinates.lat}/${t.coordinates.lon}`;
  const peethaHref = t.kind === "shakti-peetha" ? "/shakti-peethas" : null;

  return (
    <>
      <Breadcrumbs items={[
        { label: "Temples", href: "/temples" },
        { label: t.name },
      ]} />

      <PageHeader eyebrow={`${t.city}, ${t.region}, ${t.country}`} title={t.name}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{KIND_LABEL[t.kind] ?? t.kind}</Chip>
          {t.sampleContent && <SampleBadge />}
          <FavouriteButton kind="temples" id={t.id} label={t.name} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <section aria-labelledby="about">
            <h2 id="about" className="display mb-3 text-xl font-semibold">About this temple</h2>
            <p className="text-[1.02rem] leading-[1.9]">{t.note}</p>
            {peethaHref && (
              <Notice tone="info" title="Also a Shakti Peetha">
                This temple is also catalogued in the Peetha directory, where its traditional
                attribution, body-part claim and the lists that name it are recorded.
                <div className="mt-2">
                  <Link href={peethaHref} className="btn btn-ghost !px-3 !py-1.5 text-xs">
                    Open the Peetha directory
                  </Link>
                </div>
              </Notice>
            )}
          </section>

          {t.festivals.length > 0 && (
            <section className="mt-8" aria-labelledby="fest">
              <h2 id="fest" className="display mb-3 text-xl font-semibold">Festivals</h2>
              <Card className="p-6">
                <ul className="flex flex-wrap gap-1.5">
                  {t.festivals.map((f) => <li key={f}><span className="chip">{f}</span></li>)}
                </ul>
                <p className="muted mt-3 text-xs">
                  Festival dates vary by year and by the panchang the temple follows. This app
                  computes Navratri dates on the{" "}
                  <Link href="/calendar" className="link-underline">calendar</Link>; other festivals
                  are named rather than dated.
                </p>
              </Card>
            </section>
          )}

          <OrnamentRule className="my-9" />

          <section aria-labelledby="visit">
            <h2 id="visit" className="display mb-3 text-xl font-semibold">Visiting</h2>
            <Notice tone="caution" title="Visitor details are not published here">
              <p>{t.infoNote}</p>
              <p className="mt-2">
                Timings change with season, festival and local decision. Publishing an unverified
                schedule would send a pilgrim to a locked door, so the fields stay empty until
                someone verifies them against the temple itself.
              </p>
            </Notice>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                  Approximate coordinates
                </p>
                <p className="font-mono text-sm">
                  {t.coordinates.lat.toFixed(4)}, {t.coordinates.lon.toFixed(4)}
                </p>
                <p className="muted mt-2 text-xs">{t.coordinateNote}</p>
                <a href={mapHref} className="btn btn-ghost mt-3" target="_blank" rel="noreferrer noopener">
                  Open in OpenStreetMap
                </a>
              </Card>
              <Card className="p-5">
                <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                  Visitor information
                </p>
                <DefinitionList items={[
                  ["Official website", t.officialWebsite ?? "Not verified"],
                  ["Opening hours", t.openingHours ?? "Not verified"],
                  ["Contact", t.contact ?? "Not verified"],
                  ["Accessibility", t.accessibility ?? "Not verified"],
                ]} />
                <p className="muted mt-3 text-xs">
                  Status: <strong>{t.infoStatus}</strong>. A null means nobody checked.
                </p>
              </Card>
            </div>
          </section>

          {near.length > 0 && (
            <section className="mt-10" aria-labelledby="near">
              <SectionHeading eyebrow={`In ${t.region}`} title="Other temples nearby" />
              <h2 id="near" className="sr-only">Other temples nearby</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {near.map((n) => (
                  <li key={n.id}>
                    <Link href={`/temples/${n.slug}`} className="card block h-full p-4">
                      <p className="font-semibold">{n.name}</p>
                      <p className="muted mt-1 text-xs">{n.city}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden p-6 text-center">
            <Mandala className="absolute -right-12 -top-12 h-44 w-44 opacity-15"
                     petals={14} stroke="var(--gold)" spin />
            <Trident className="relative mx-auto h-14 w-14" />
            <p className="relative mt-3 font-semibold">{t.name}</p>
            <p className="muted relative text-xs">{t.city}</p>
          </Card>
          <Card className="p-5">
            <DefinitionList items={[
              ["Temple", t.name],
              ["Type", KIND_LABEL[t.kind] ?? t.kind],
              ["City", t.city],
              ["Region", t.region],
              ["Country", t.country],
            ]} />
          </Card>
          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Planning</p>
            <p className="text-sm leading-relaxed">
              Add this temple to your pilgrimage list from the star above. The list stays in this
              browser.
            </p>
            <Link href="/temples#planner" className="btn btn-ghost mt-3">Open the planner</Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
