import Link from "next/link";
import { notFound } from "next/navigation";
import { getStories, getStory } from "@/lib/content";
import {
  Breadcrumbs, Card, Chip, Notice, OrnamentRule, PageHeader,
} from "@/components/ui";
import { Lotus, Mandala } from "@/components/ornament";
import { BookmarkButton } from "@/components/interactive";
import { ReadAloudButton } from "@/components/speech";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getStories().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const s = getStory(slug);
  return { title: s ? s.title : "Story not found" };
}

export default async function StoryDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) notFound();
  const href = `/stories/${s.slug}`;
  const related = getStories().filter((x) => x.slug !== s.slug && x.age === s.age).slice(0, 3);
  const paragraphs = s.long.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Breadcrumbs items={[{ label: "Stories", href: "/stories" }, { label: s.title }]} />

      <PageHeader eyebrow={`Ages ${s.age}`} title={s.title}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="deva text-sm" style={{ color: "var(--gold)" }}>{s.titleHi}</span>
          <Chip>{s.minutes} min</Chip>
          <Chip>Retelling</Chip>
          <BookmarkButton kind="story" ref_={s.slug} label={s.title} href={href} />
          <ReadAloudButton text={[s.short, ...paragraphs].join(" ")} lang="en" label="this story" />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <div className="relative mb-8 overflow-hidden rounded-2xl border p-8 text-center"
               style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
            <Mandala className="absolute -right-16 -top-16 h-56 w-56 opacity-10"
                     petals={16} stroke="var(--gold)" spin />
            <Lotus className="relative mx-auto h-10 w-24" stroke="var(--gold)" />
            <p className="deva relative mt-4 text-xl font-semibold">{s.titleHi}</p>
            <p className="muted relative mt-1 text-sm">{s.title}</p>
          </div>

          <Card className="mb-8 p-6">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">The short version</p>
            <p className="leading-[1.9]">{s.short}</p>
          </Card>

          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[1.06rem] leading-[1.95]">{p}</p>
            ))}
          </div>

          <OrnamentRule className="my-10" />

          <section aria-labelledby="moral">
            <h2 id="moral" className="display mb-3 text-xl font-semibold">What it is about</h2>
            <Card className="p-6">
              <p className="leading-[1.9]">{s.moral}</p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                Offered as one reading, not as the only one. A child may take something different
                from the story, and that is not a wrong answer.
              </p>
            </Card>
          </section>

          <section className="mt-8" aria-labelledby="source">
            <h2 id="source" className="display mb-3 text-xl font-semibold">
              Where this story comes from
            </h2>
            <Notice tone="info" title="Retelling, with its source named">
              {s.sourceNote}
            </Notice>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Link href="/scripture" className="btn btn-ghost">The Saptashati itself</Link>
              <Link href="/maa-durga" className="btn btn-ghost">Knowledge library</Link>
            </div>
          </section>

          {s.illustrationHints.length > 0 && (
            <section className="mt-8" aria-labelledby="art">
              <h2 id="art" className="display mb-3 text-xl font-semibold">
                Drawing it together
              </h2>
              <Card className="p-6">
                <p className="muted mb-3 text-sm leading-relaxed">
                  Ideas for a child to draw, or for a family to act out. Deliberately simple — no
                  depiction of a deity is prescribed, and none is presented as an object of worship.
                </p>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                  {s.illustrationHints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Card>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Reading aloud</p>
            <p className="text-sm leading-relaxed">
              About {s.minutes} minutes for ages {s.age}. The paragraphs are short on purpose.
            </p>
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Next</p>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/stories" className="link-underline">All stories</Link></li>
              <li><Link href="/navadurga" className="link-underline">The nine forms</Link></li>
              <li><Link href="/scripture" className="link-underline">The Saptashati itself</Link></li>
            </ul>
          </Card>

          {related.length > 0 && (
            <Card className="p-5">
              <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
                Also for ages {s.age}
              </p>
              <ul className="space-y-1.5 text-sm">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/stories/${r.slug}`} className="link-underline">{r.title}</Link>
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
