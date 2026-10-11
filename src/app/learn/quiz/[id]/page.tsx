import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuiz, getQuizzes } from "@/lib/content";
import { Breadcrumbs, Chip, Notice, PageHeader, SectionHeading } from "@/components/ui";
import { QuizRunner } from "@/components/interactive";

// The full set of slugs is known at build time. Pinning dynamicParams off
// means an unknown slug 404s immediately instead of being rendered on demand
// and cached as a 200 — a wrong URL must not look like a real page.
export const dynamicParams = false;

export function generateStaticParams() {
  return getQuizzes().map((q) => ({ id: q.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const q = getQuiz(id);
  return { title: q ? q.title : "Quiz not found" };
}

export default async function QuizPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quiz = getQuiz(id);
  if (!quiz) notFound();
  const others = getQuizzes().filter((q) => q.id !== quiz.id);

  return (
    <>
      <Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: quiz.title }]} />

      <PageHeader eyebrow={quiz.topic} title={quiz.title}>
        <Chip>{quiz.questions.length} questions</Chip>
      </PageHeader>

      <Notice tone="info" title="No score is kept beyond this browser">
        Your last attempt is stored locally so you can see whether you improved. It is not a
        measure of devotion, it is not compared with anyone else, and there is no leaderboard.
      </Notice>

      <div className="mt-8">
        <QuizRunner quiz={quiz} />
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <SectionHeading eyebrow="More" title="Other quizzes" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/learn/quiz/${o.id}`} className="card block h-full p-5">
                  <span className="chip">{o.topic}</span>
                  <p className="display mt-2 font-semibold">{o.title}</p>
                  <p className="muted mt-1 text-xs">{o.questions.length} questions</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
