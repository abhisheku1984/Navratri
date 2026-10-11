"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { DeviGyanAnswer } from "@/lib/devi-gyan";
import { Card, Chip, EmptyState, ErrorState, LoadingBlock, Notice, PageHeader } from "@/components/ui";

const SUGGESTIONS = [
  "What is the Devi Kavacham?",
  "Who is Kalaratri?",
  "What happens in chapter 8?",
  "Where is Kamakhya?",
  "What is Ghatasthapana?",
  "Will chanting this mantra cure my illness?",
];

export default function DeviGyanPage() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DeviGyanAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/devi-gyan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setResult((await res.json()) as DeviGyanAnswer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The request failed.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <>
      <PageHeader eyebrow="Assistant" title="Devi Gyan"
                  sub="Answers from this app's own content, with a citation for every claim. It does not have opinions, and it will not invent a verse." />

      <Notice tone="info" title="What this assistant will and will not do">
        <p>
          <strong>It will</strong> find passages in the imported scripture, the Peetha directory,
          the puja guides and the glossary, and tell you exactly where each came from.
        </p>
        <p className="mt-2">
          <strong>It will not</strong> invent a verse, guarantee a blessing or a cure, settle a
          sectarian disagreement, or guess a temple&rsquo;s timing. Questions about health, legal
          matters or money are refused outright rather than answered loosely.
        </p>
        <p className="mt-2">
          No AI provider is configured in this deployment, so every answer comes from local
          retrieval — which is the mode this app is designed to be genuinely useful in anyway. Add
          a provider key on the server and generation switches on; the citations do not change.
        </p>
      </Notice>

      <form
        className="mt-6 flex flex-wrap gap-2.5"
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        role="search"
      >
        <label htmlFor="gyan-q" className="sr-only">Ask Devi Gyan</label>
        <input
          id="gyan-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about a chapter, a form, a Peetha, a festival…"
          className="min-w-[14rem] flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !q.trim()}>
          {busy ? "Searching…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => { setQ(s); ask(s); }}>{s}</button>
        ))}
      </div>

      {busy && <LoadingBlock className="mt-8" label="Searching the corpus…" />}

      {error && (
        <ErrorState className="mt-8" title="Could not answer" message={error}
                    onRetry={() => ask(q)} />
      )}

      {result && !busy && (
        <section className="mt-8" aria-live="polite">
          {result.refused ? (
            <Notice tone="caution" title="No answer offered">
              <p>{result.refusalReason}</p>
              <p className="mt-2">
                Refusing is the correct behaviour here. An assistant that answers from nothing is
                worse than one that says it cannot.
              </p>
            </Notice>
          ) : (
            <>
              <Card className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Chip tone="gold">
                    {result.mode === "provider" ? "Answer with sources" : "Retrieved passages"}
                  </Chip>
                  <Chip>{result.passages.length} passages</Chip>
                </div>

                {result.synthesis ? (
                  <p className="text-[1.03rem] leading-[1.9]">{result.synthesis}</p>
                ) : (
                  <p className="muted text-sm leading-relaxed">
                    No synthesis service is configured, so instead of prose this shows the passages
                    themselves. Nothing has been paraphrased, which means nothing has been altered.
                  </p>
                )}
              </Card>

              <div className="mt-4">
                <h2 className="display mb-3 text-lg font-semibold">Where this came from</h2>
                <ol className="space-y-2">
                  {result.passages.map((p, i) => (
                    <li key={i}>
                      <Card className="p-4">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="chip">{i + 1}</span>
                          <Chip>{p.citation.kind}</Chip>
                          <Chip tone="gold">{p.citation.verification}</Chip>
                        </div>
                        <p className="mb-1 text-sm font-semibold">{p.citation.title}</p>
                        {p.citation.locator && (
                          <p className="muted mb-2 text-xs">{p.citation.locator}</p>
                        )}
                        <p className="verse-deva whitespace-pre-line text-sm">{p.text}</p>
                        {p.citation.href && (
                          <Link href={p.citation.href}
                                className="link-underline mt-2 inline-block text-sm">
                            Open the full text
                          </Link>
                        )}
                      </Card>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          <ul className="muted mt-4 space-y-1.5 text-xs leading-relaxed">
            {result.disclaimers.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </section>
      )}

      {!result && !busy && !error && (
        <EmptyState className="mt-8" title="Ask a question"
                    body="Try a chapter number, a form's name, a festival, or a Peetha. Every answer names its source." />
      )}
    </>
  );
}
