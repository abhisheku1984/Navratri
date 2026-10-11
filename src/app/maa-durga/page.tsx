import Link from "next/link";
import { getKnowledgeCollection, getKnowledgeTopics } from "@/lib/content";
import { PageHeader, SectionHeading, SampleBadge } from "@/components/ui";

export const metadata = { title: "Maa Durga — Knowledge Library" };

export default function KnowledgeIndex() {
  const col = getKnowledgeCollection();
  const topics = getKnowledgeTopics();
  return (
    <>
      <PageHeader eyebrow="Knowledge" title={col.title} sub={col.intro}>
        <SampleBadge />
      </PageHeader>
      <ul className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <li key={t.slug}>
            <Link href={`/maa-durga/${t.slug}`} className="card flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
              <p className="deva mb-1 text-sm" style={{ color: "var(--gold)" }}>{t.titleHi}</p>
              <h2 className="display text-xl font-semibold">{t.title}</h2>
              <p className="muted mt-2 flex-1 text-sm leading-relaxed">{t.tagline}</p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                {t.detail.length} sections · {t.reflection.length} reflection questions
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <SectionHeading eyebrow="Also here" title="The nine forms" />
        <p className="muted mb-4 text-sm">
          Full profiles of the Navadurga, each with its dhyana verse and its source.
        </p>
        <Link href="/navadurga" className="btn btn-primary">Open the Navadurga</Link>
      </div>
    </>
  );
}
