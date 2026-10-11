import Link from "next/link";
import { getKbSections, getSources } from "@/lib/content";
import { Card, Chip, Notice, PageHeader, SectionHeading, TextLink } from "@/components/ui";
import { OrnamentRule } from "@/components/ornament";

export const metadata = {
  title: "Knowledge Base",
  description:
    "Section-wise, source-tagged articles on the nine forms, Navratri, puja, mantras, fasting, stories and regional traditions — the corpus the AI guide retrieves from.",
};

/**
 * Index of the curated knowledge base.
 *
 * Kept deliberately plain: the value of this page is that every article names
 * its sources and its review state, so a reader can see the shape of the whole
 * corpus before opening anything.
 */
export default function KbIndexPage() {
  const sections = getKbSections();
  const sources = getSources();
  const total = sections.reduce((n, s) => n + s.documents.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Knowledge Base"
        sub={`${total} curated articles in ${sections.length} sections, each with named sources. This is the corpus the AI guide retrieves from before it writes anything.`}
      />

      <Notice tone="info" title="How to read these articles">
        <p>
          Every article names its sources and whether it has had an external review. Interpretation
          is labelled as interpretation, regional practice is labelled with its region, and nothing
          is presented as a quotation unless the quoted text is held in this app&rsquo;s verified
          corpus. Where two traditions disagree, both are recorded.
        </p>
      </Notice>

      <div className="mt-8 space-y-10">
        {sections.map((s) => (
          <section key={s.section} id={`section-${s.section}`}>
            <SectionHeading eyebrow={`Section ${s.section}`} title={s.title} sub={s.intro} />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {s.documents.map((d) => (
                <Card key={d.id} className="h-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{d.questions.join(", ")}</Chip>
                    {d.review !== "reviewed" && <Chip>In-house review</Chip>}
                  </div>
                  <h3 className="mt-3 text-base font-semibold">
                    <Link href={`/kb/${d.slug}`} className="hover:text-[var(--accent)]">
                      {d.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{d.summary}</p>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Sources:{" "}
                    {d.sources.map((s2) => s2.sourceId).join(" · ")}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <OrnamentRule className="my-10" />

      <SectionHeading
        eyebrow="Provenance"
        title="Only these sources are cited"
        sub="A source id in an article must exist here, and a test enforces it — a citation cannot point at a source this app does not hold."
      />
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {sources.map((s) => (
          <li key={s.id} className="text-sm">
            <Link href="/sources" className="font-medium text-[var(--accent)] hover:underline">
              {s.title}
            </Link>
            <span className="text-[var(--muted)]"> · {s.kind}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8">
        <TextLink href="/questions">Question Explorer — all 50 questions →</TextLink>
      </p>
    </>
  );
}
