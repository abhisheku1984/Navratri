import Link from "next/link";
import { getStories, getStoryCollection } from "@/lib/content";
import { Card, Notice, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Lotus } from "@/components/ornament";

export const metadata = { title: "Stories" };

export default function StoryIndex() {
  const col = getStoryCollection();
  const stories = getStories();
  const ages = Array.from(new Set(stories.map((s) => s.age))).sort();

  return (
    <>
      <PageHeader eyebrow="For families" title={col.title} sub={col.intro} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Stories" value={String(stories.length)} />
        <Stat label="Age bands" value={String(ages.length)} hint={ages.join(" · ")} />
        <Stat label="Shortest" value={`${Math.min(...stories.map((s) => s.minutes))} min`} />
        <Stat label="Written for this app" value={String(stories.length)} hint="Retellings, not scripture" />
      </div>

      <Notice tone="info" title="Retelling is not the same as scripture">
        <p>
          These are written for children, in plain language, with the violence of some narratives
          softened. Each one carries a source note saying what it is a retelling of. When a child is
          old enough, the{" "}
          <Link href="/scripture" className="link-underline">Durga Saptashati itself</Link> is here
          in full and unedited.
        </p>
      </Notice>

      {col.editorialNote && <Notice tone="caution">{col.editorialNote}</Notice>}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s) => (
          <li key={s.slug}>
            <Link href={`/stories/${s.slug}`} className="card flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="chip">Ages {s.age}</span>
                <Lotus className="h-8 w-8 opacity-30" stroke="var(--gold)" />
              </div>
              <h2 className="display text-lg font-semibold">{s.title}</h2>
              <p className="muted text-xs">{s.titleHi}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{s.short}</p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                {s.minutes} min read
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <SectionHeading eyebrow="Reading aloud" title="Bedtime" />
        <Card className="p-6">
          <div className="flex flex-wrap items-start gap-6">
            <Lotus className="h-10 w-24 shrink-0 opacity-50" stroke="var(--gold)" />
            <div className="min-w-[16rem] flex-1">
              <p className="leading-relaxed">
                Every Navadurga profile ends with a story written to be read aloud at night. Nothing
                in this section rewards a child for answering a question correctly, and the
                reflection questions that follow a story are for talking about, not for scoring.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href="/navadurga" className="btn btn-primary">The nine bedtime stories</Link>
                <Link href="/learn" className="btn btn-ghost">Quizzes &amp; glossary</Link>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
