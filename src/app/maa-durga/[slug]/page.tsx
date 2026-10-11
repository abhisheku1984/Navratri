import Link from "next/link";
import { notFound } from "next/navigation";
import { getKnowledgeTopic, getKnowledgeTopics } from "@/lib/content";
import {
  Breadcrumbs, Card, Notice, OrnamentRule, PageHeader, PullQuote,
  SectionHeading, TextLink, VerificationBadge,
} from "@/components/ui";
import { BookmarkButton } from "@/components/interactive";
import { ContentAvailability } from "@/components/content-language";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getKnowledgeTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const t = getKnowledgeTopic(slug);
  return { title: t ? t.title : "Topic not found" };
}

export default async function TopicPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const t = getKnowledgeTopic(slug);
  if (!t) notFound();
  const related = getKnowledgeTopics().filter((x) => t.related.includes(x.slug));
  const href = `/maa-durga/${t.slug}`;

  return (
    <>
      <Breadcrumbs items={[
        { label: "Maa Durga", href: "/maa-durga" },
        { label: t.title },
      ]} />

      <PageHeader eyebrow="Knowledge" title={t.title} sub={t.tagline}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="deva text-sm" style={{ color: "var(--gold)" }}>{t.titleHi}</span>
          <VerificationBadge status="awaiting-review" />
          <BookmarkButton kind="topic" ref_={t.slug} label={t.title} href={href} />
        </div>
      </PageHeader>

      {/* Names the language this page is actually in, and what exists in others. */}
      <ContentAvailability
        className="mb-8"
        available={["en"]}
        rendering="en"
        what="this topic's article"
        altNotes={[
          { lang: "hi", text: "हिन्दी में उपलब्ध: नौ रूपों की कथाएँ, अध्याय-कथाएँ और सामान्य प्रश्नों के लेख।", href: "/kb" },
        ]}
      />


      <Notice tone="caution" title="How to read this page">
        Each section separates what a scripture states, what a regional tradition holds, and what a
        commentator has added. This is editorial content written for this app and has not been
        through independent scholarly review — the sources it rests on are named so you can check
        them yourself.
      </Notice>

      <section className="mt-8">
        <h2 className="display mb-3 text-xl font-semibold">The story</h2>
        <p className="text-[1.05rem] leading-[1.85]">{t.story}</p>
      </section>

      <OrnamentRule className="my-10" />

      <section aria-labelledby="detail-heading">
        <SectionHeading eyebrow="In detail" title="Explanation" />
        <h2 id="detail-heading" className="sr-only">Explanation</h2>
        <dl className="space-y-5">
          {t.detail.map(([head, body]) => (
            <div key={head} className="card p-5">
              <dt className="display text-lg font-semibold">{head}</dt>
              <dd className="muted mt-2 leading-relaxed">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PullQuote source="Spiritual significance">{t.significance}</PullQuote>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="people-heading">
          <h2 id="people-heading" className="display mb-3 text-xl font-semibold">
            Characters and places
          </h2>
          <Card className="p-5">
            {t.characters.length > 0 ? (
              <>
                <p className="muted mb-2 text-xs uppercase tracking-[0.14em]">People</p>
                <ul className="mb-4 flex flex-wrap gap-1.5">
                  {t.characters.map((c) => <li key={c}><span className="chip">{c}</span></li>)}
                </ul>
              </>
            ) : <p className="muted text-sm">No individual characters are named in this topic.</p>}
            {t.places.length > 0 && (
              <>
                <p className="muted mb-2 text-xs uppercase tracking-[0.14em]">Places</p>
                <ul className="flex flex-wrap gap-1.5">
                  {t.places.map((p) => <li key={p}><span className="chip">{p}</span></li>)}
                </ul>
              </>
            )}
          </Card>
        </section>

        <section aria-labelledby="child-heading">
          <h2 id="child-heading" className="display mb-3 text-xl font-semibold">
            Explained to a child
          </h2>
          <Card className="p-5">
            <p className="leading-relaxed">{t.childVersion}</p>
          </Card>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="source-heading">
        <h2 id="source-heading" className="display mb-3 text-xl font-semibold">
          Scripture and source
        </h2>
        <Card className="p-5">
          <p className="leading-relaxed">{t.source}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/scripture" className="btn btn-ghost">Open the Saptashati</Link>
            <Link href="/sources" className="btn btn-ghost">Source registry</Link>
          </div>
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="reflection-heading">
        <SectionHeading eyebrow="Sit with it" title="Reflection questions" />
        <h2 id="reflection-heading" className="sr-only">Reflection questions</h2>
        <ol className="space-y-3">
          {t.reflection.map((q, i) => (
            <li key={i} className="card flex gap-4 p-5">
              <span className="deva text-lg" style={{ color: "var(--gold)" }}>{i + 1}</span>
              <span className="leading-relaxed">{q}</span>
            </li>
          ))}
        </ol>
        <p className="muted mt-3 text-sm">
          Want to write something down? <TextLink href="/saved#journal">Open the journal</TextLink>.
        </p>
      </section>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <SectionHeading eyebrow="Keep reading" title="Related topics" />
          <h2 id="related-heading" className="sr-only">Related topics</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/maa-durga/${r.slug}`} className="card block h-full p-5">
                  <p className="font-semibold">{r.title}</p>
                  <p className="muted mt-1 text-sm">{r.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
