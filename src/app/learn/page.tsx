import Link from "next/link";
import { getGlossaryTerms, getQuizzes } from "@/lib/content";
import { Card, Notice, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { Lotus, Mandala } from "@/components/ornament";

export const metadata = { title: "Learn & Quiz" };

export default function LearnIndex() {
  const quizzes = getQuizzes();
  const glossary = getGlossaryTerms();
  const totalQ = quizzes.reduce((n, q) => n + q.questions.length, 0);

  return (
    <>
      <PageHeader eyebrow="Study" title="Learn"
                  sub="Quizzes, flashcards and a glossary. Nothing here is a test of faith — a wrong answer costs nothing and a right one earns nothing." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Quizzes" value={String(quizzes.length)} />
        <Stat label="Questions" value={String(totalQ)} />
        <Stat label="Glossary terms" value={String(glossary.length)} />
        <Stat label="Rewards" value="None" hint="Deliberately" />
      </div>

      <Notice tone="info" title="Why there are no streaks or badges">
        A streak counter quietly turns devotion into a metric. These quizzes exist so a family can
        check what it remembered from a story read aloud — not so an app can tell you how devoted
        you have been this week.
      </Notice>

      <section className="mt-10" aria-labelledby="quizzes">
        <SectionHeading eyebrow="Test yourself" title="Quizzes" />
        <h2 id="quizzes" className="sr-only">Quizzes</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <li key={q.id}>
              <Link href={`/learn/quiz/${q.id}`} className="card flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="chip">{q.topic}</span>
                  <Mandala className="h-8 w-8 opacity-25" petals={10} stroke="var(--gold)" />
                </div>
                <h2 className="display text-lg font-semibold">{q.title}</h2>
                <p className="muted mt-2 flex-1 text-sm leading-relaxed">
                  {q.questions.length} questions, each with an explanation of the answer.
                </p>
                <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                  Instant feedback · no account needed
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="glossary-teaser">
        <SectionHeading eyebrow="Reference" title="Glossary and flashcards" />
        <h2 id="glossary-teaser" className="sr-only">Glossary and flashcards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-3">
              <Lotus className="h-8 w-8 opacity-60" stroke="var(--gold)" />
              <h2 className="display text-xl font-semibold">Glossary</h2>
            </div>
            <p className="muted text-sm leading-relaxed">
              {glossary.length} terms — tithi, charitra, kavacham, nyasa, ghatasthapana — each with
              its Devanagari, its transliteration and a plain-language definition, searchable and
              linkable from anywhere in the app.
            </p>
            <Link href="/learn/glossary" className="btn btn-primary mt-4">Open the glossary</Link>
          </Card>
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-3">
              <Mandala className="h-8 w-8 opacity-60" petals={12} stroke="var(--gold)" />
              <h2 className="display text-xl font-semibold">Flashcards</h2>
            </div>
            <p className="muted text-sm leading-relaxed">
              The glossary doubles as a deck. Turn the card over to check the definition; step
              through in either direction. Works offline once the page is loaded.
            </p>
            <Link href="/learn/glossary#flashcards" className="btn btn-ghost mt-4">Study the deck</Link>
          </Card>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="Related" title="Also useful" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/stories" className="card p-5">
            <p className="display text-lg font-semibold">Stories</p>
            <p className="muted mt-1 text-sm">Retellings for children, each with questions.</p>
          </Link>
          <Link href="/scripture" className="card p-5">
            <p className="display text-lg font-semibold">The text itself</p>
            <p className="muted mt-1 text-sm">All 13 chapters, verse by verse.</p>
          </Link>
          <Link href="/devi-gyan" className="card p-5">
            <p className="display text-lg font-semibold">Ask a question</p>
            <p className="muted mt-1 text-sm">Devi Gyan answers from the corpus, with citations.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
