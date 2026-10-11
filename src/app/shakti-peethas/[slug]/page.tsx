import Link from "next/link";
import { notFound } from "next/navigation";
import { getPeetha, getPeethaCollection, getPeethas } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, ConfidenceBadge, DefinitionList, Notice, OrnamentRule, PageHeader,
  SampleBadge, SectionHeading, VerificationBadge,
} from "@/components/ui";
import { Mandala, Trident } from "@/components/ornament";
import { FavouriteButton } from "@/components/interactive";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPeethas().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const p = getPeetha(slug);
  return { title: p ? `${p.templeName} — Shakti Peetha` : "Site not found" };
}

export default async function PeethaDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const p = getPeetha(slug);
  if (!p) notFound();
  const col = getPeethaCollection();

  const here = p.coordinates;

  const near = here
    ? getPeethas()
        .filter((x) => x.id !== p.id && x.coordinates)
        .map((x) => ({
          x,
          d: Math.hypot(x.coordinates!.lat - here.lat, x.coordinates!.lon - here.lon),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4).map((n) => n.x)
    : [];

  const mapHref = here
    ? `https://www.openstreetmap.org/?mlat=${here.lat}&mlon=${here.lon}#map=12/${here.lat}/${here.lon}`
    : null;
  const v = p.verificationStatus;

  return (
    <>
      <Breadcrumbs items={[
        { label: "Shakti Peethas", href: "/shakti-peethas" },
        { label: p.templeName },
      ]} />

      <PageHeader eyebrow={`${p.location.country} · ${p.location.region}`} title={p.templeName}>
        <div className="flex flex-wrap items-center gap-2">
          {p.lists.map((l) => (
            <Chip key={l} tone="gold">{col.lists[l]?.label ?? l}</Chip>
          ))}
          <ConfidenceBadge confidence={p.confidence} />
          <VerificationBadge status={v.status} />
          {p.sampleContent && <SampleBadge />}
          <FavouriteButton kind="peethas" id={p.id} label={p.templeName} />
        </div>
        <p className="mt-3 text-lg">
          <span className="deva" style={{ color: "var(--gold)" }}>{p.goddessName}</span>
        </p>
        {p.bhairava && <p className="muted mt-1 text-sm">Bhairava: {p.bhairava}</p>}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {/* ---------------------------------------------------- the story */}
          <section aria-labelledby="story">
            <h2 id="story" className="display mb-3 text-xl font-semibold">The story of this site</h2>
            <p className="text-[1.02rem] leading-[1.9]">{p.story}</p>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="tradition">
            <h2 id="tradition" className="display mb-3 text-xl font-semibold">
              Attribution and tradition
            </h2>
            <Card className="p-6">
              {p.associatedBodyPart ? (
                <>
                  <p className="muted mb-1 text-[0.68rem] uppercase tracking-[0.14em]">
                    Part or ornament attributed here
                  </p>
                  <p className="text-lg font-semibold">{p.associatedBodyPart}</p>
                  <Notice tone="caution" title="Attributions are not uniform">
                    The part named at this site is given by a particular tradition. Other lists
                    assign the same part elsewhere, and some assign this site a different part.
                    Nothing here resolves that.
                  </Notice>
                </>
              ) : (
                <>
                  <p className="leading-relaxed">
                    No body part is attributed to this site in the tradition recorded here. Some
                    lists include it on other grounds; others do not include it at all.
                  </p>
                  <Notice tone="info" title="Why this field is empty">
                    A blank is deliberate. Where no source names a part, this app leaves the field
                    empty rather than supplying a plausible one.
                  </Notice>
                </>
              )}
              <p className="mt-4 border-t pt-4 leading-relaxed" style={{ borderColor: "var(--line)" }}>
                {p.traditionNote}
              </p>
            </Card>
          </section>

          <OrnamentRule className="my-9" />

          <section aria-labelledby="visit">
            <h2 id="visit" className="display mb-3 text-xl font-semibold">Visiting</h2>
            <Notice tone="caution" title="Nothing here has been verified against the temple">
              <p>
                Darshan timings, the official website and accessibility details are deliberately
                absent. Publishing them without verifying against the temple&rsquo;s own notice
                would send a pilgrim to the wrong hour or the wrong door.
              </p>
              <p className="mt-2">{p.visitorInfoNote}</p>
            </Notice>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                  Approximate coordinates
                </p>
                {here ? (
                  <>
                    <p className="font-mono text-sm">
                      {here.lat.toFixed(4)}, {here.lon.toFixed(4)}
                    </p>
                    <p className="muted mt-2 text-xs">{p.coordinateNote}</p>
                    {mapHref && (
                      <a href={mapHref} className="btn btn-ghost mt-3"
                         target="_blank" rel="noreferrer noopener">
                        Open in OpenStreetMap
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">No resolved location</p>
                    <p className="muted mt-2 text-xs">{p.coordinateNote}</p>
                    <p className="muted mt-2 text-xs">
                      The tradition names this site but the sources available here do not fix it to
                      a place. No coordinate is invented to fill the gap.
                    </p>
                  </>
                )}
              </Card>
              <Card className="p-5">
                <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                  Visitor information
                </p>
                <DefinitionList items={[
                  ["Official website", p.officialWebsite ?? "Not verified"],
                  ["Darshan timings", p.darshanTimings ?? "Not verified"],
                  ["Accessibility", p.accessibility ?? "Not verified"],
                ]} />
                <p className="muted mt-3 text-xs">
                  A null here means nobody checked, not that the temple has no website or no ramp.
                </p>
              </Card>
            </div>

            <p className="muted mt-3 text-xs">
              Verification: <strong>{v.status}</strong>
              {v.lastChecked ? ` · last checked ${v.lastChecked}` : " · never checked"}
              {v.note && <> · {v.note}</>}
            </p>
          </section>

          {near.length > 0 && (
            <section className="mt-10" aria-labelledby="near">
              <SectionHeading eyebrow="Nearby" title="Other sites in this region" />
              <h2 id="near" className="sr-only">Other sites in this region</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {near.map((n) => (
                  <li key={n.id}>
                    <Link href={`/shakti-peethas/${n.slug}`} className="card block h-full p-4">
                      <p className="font-semibold">{n.templeName}</p>
                      <p className="muted mt-1 text-xs">{n.location.city}, {n.location.country}</p>
                      <p className="deva mt-1.5 text-xs" style={{ color: "var(--gold)" }}>
                        {n.goddessName}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="muted mt-2 text-xs">
                &ldquo;Nearby&rdquo; means geographically close. A pilgrimage circuit is a local
                custom, not a rule.
              </p>
            </section>
          )}
        </div>

        {/* ---------------------------------------------------------- aside */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="relative overflow-hidden p-6 text-center">
            <Mandala className="absolute -right-12 -top-12 h-44 w-44 opacity-15"
                     petals={14} stroke="var(--gold)" spin />
            <Trident className="relative mx-auto h-14 w-14" />
            <p className="deva relative mt-3 text-xl font-semibold">{p.goddessName}</p>
            <p className="muted relative text-xs">{p.location.city}</p>
          </Card>

          <Card className="p-5">
            <DefinitionList items={[
              ["Site", p.templeName],
              ["Goddess", p.goddessName],
              ...(p.bhairava ? [["Bhairava", p.bhairava]] as [string, string][] : []),
              ["City", p.location.city],
              ["Region", p.location.region],
              ["Country", p.location.country],
              ["Appears in", p.lists.map((l) => col.lists[l]?.label ?? l).join(", ")],
              ["Body part", p.associatedBodyPart ?? "none named"],
            ]} />
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
              Is this site disputed?
            </p>
            <p className="text-sm leading-relaxed">
              {p.confidence === "low"
                ? "Yes, substantially. More than one site claims this attribution, or the location itself is unresolved. Both the claim and the doubt are recorded here."
                : p.confidence === "medium"
                ? "The attribution rests on a named tradition rather than a universally accepted list, and other lists differ."
                : "The attribution is widely attested, though the lists still differ on the details."}
            </p>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Verification</p>
            <VerificationBadge status={v.status} />
            <p className="muted mt-2 text-xs leading-relaxed">{v.note}</p>
            <Link href="/sources" className="link-underline mt-3 inline-block text-sm">
              Source registry
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
