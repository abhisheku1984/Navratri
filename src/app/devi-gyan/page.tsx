"use client";

/**
 * The AI guide: "Ask the Divine Knowledge Guide".
 *
 * Retrieval runs first, always: the question is searched against the app's own
 * verified and reviewed corpus, and the passages are ranked and cited before
 * anything is written. Generation only happens when a provider is configured on
 * the server, and it is constrained to those passages. When retrieval finds
 * nothing confident, the assistant refuses rather than improvising — the
 * refusal is a feature of the design, not a failure of it.
 *
 * The conversation lives in this component's state for the length of the visit.
 * Nothing is written to storage, nothing is sent anywhere except the question
 * itself, and "Clear conversation" empties it immediately.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DeviGyanAnswer } from "@/lib/devi-gyan";
import { getLaunchQuestionMatrix } from "@/lib/content";
import { useUser } from "@/lib/user";
import { getLanguage } from "@/lib/i18n";
import { askGuideHref } from "@/lib/kb";
import {
  Card, Chip, EmptyState, ErrorState, LoadingBlock, Notice, PageHeader,
} from "@/components/ui";
import { NarrationPlayer } from "@/components/audio/narration";

const QUESTIONS = getLaunchQuestionMatrix();

const OPENERS = [
  "What is the Devi Kavacham?",
  "Who is Kalaratri?",
  "What happens in chapter 8?",
  "Where is Kamakhya?",
  "What is Ghatasthapana?",
  "What does the tradition say about fasting?",
];

interface Turn {
  question: string;
  result: DeviGyanAnswer | null;
  error: string | null;
  at: number;
}

/** A stable key for feedback, so the same question keeps one verdict. */
function feedbackId(question: string): string {
  return question.trim().toLowerCase().slice(0, 120);
}

export default function DeviGyanPage() {
  const { state, setGuideFeedback } = useUser();
  const lang = state.settings.language;
  const def = getLanguage(lang);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [copied, setCopied] = useState(false);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setBusy(true);
    setTurns((t) => [...t, { question: trimmed, result: null, error: null, at: Date.now() }]);
    setCopied(false);
    try {
      const res = await fetch("/api/devi-gyan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, lang }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as DeviGyanAnswer;
      setTurns((t) =>
        t.map((turn, i) =>
          i === t.length - 1 ? { ...turn, result: data } : turn,
        ),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "The request failed.";
      setTurns((t) =>
        t.map((turn, i) => (i === t.length - 1 ? { ...turn, error: message } : turn)),
      );
    } finally {
      setBusy(false);
    }
  }, [lang]);

  // Deep link support: /guide?q=… and /devi-gyan?q=… prefill and ask once.
  // Read from window rather than useSearchParams so this page needs no Suspense
  // boundary and stays static-friendly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("q");
    if (preset) {
      setQ(preset);
      void ask(preset);
    }
    // Intentionally run once on mount: this is a deep-link prefill, not a
    // reaction to later state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = turns[turns.length - 1] ?? null;

  /** Three follow-ups: launch questions that share words with the last question. */
  const followUps = useMemo(() => {
    if (!latest) return [];
    const words = latest.question.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    const scored = QUESTIONS.map((x) => {
      const hay = `${x.text} ${x.ask}`.toLowerCase();
      return { x, score: words.filter((w) => hay.includes(w)).length };
    }).sort((a, b) => b.score - a.score || a.x.id.localeCompare(b.x.id));
    const picked = scored.filter((s) => s.score > 0).slice(0, 3);
    const fillers = scored.filter((s) => s.score === 0).slice(0, 3 - picked.length);
    return [...picked, ...fillers].map((s) => s.x);
  }, [latest]);

  return (
    <>
      <PageHeader
        eyebrow="Assistant"
        title="Ask the Divine Knowledge Guide"
        sub="Answers from this app's own curated corpus, with a citation for every claim. It retrieves before it writes, it says when it does not know, and it will not invent a verse."
      />

      <Notice tone="info" title="What this assistant will and will not do">
        <p>
          <strong>It will</strong> search the imported scripture, the knowledge base, the Peetha
          directory, the puja guides and the glossary, and tell you exactly where each passage came
          from. Passages are retrieved first; prose is only written from those passages.
        </p>
        <p className="mt-2">
          <strong>It will not</strong> invent a verse, a quotation or a citation; guarantee a
          blessing, a cure or an outcome; settle a sectarian disagreement; or guess a temple&rsquo;s
          timings. Health, legal and money questions are refused outright rather than answered
          loosely, and questions that need a person — a vow, a family rite, a personal religious
          decision — are routed to the app&rsquo;s guidance boundary.
        </p>
        <p className="mt-2">
          <strong>Imperfection notice:</strong> generated prose can be wrong even when retrieval is
          right. The passages are the ground truth; read the citation before you trust the summary.
        </p>
        <p className="mt-2">
          <strong>Privacy:</strong> this conversation is held in this tab only — it is not saved to
          storage and not attached to your settings. Questions go to this app&rsquo;s own API route
          and nowhere else unless a provider is configured on the server. Use{" "}
          <em>Clear conversation</em> to empty it now.
        </p>
        <p className="mt-2">
          Answers are written in <strong>{def.native}</strong> ({def.label}) when an answer-writing
          service is configured. Without one, the retrieved passages are shown as they are, in the
          language of their source, and nothing is paraphrased.
        </p>
      </Notice>

      <form
        className="mt-6 flex flex-wrap gap-2.5"
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        role="search"
      >
        <label htmlFor="gyan-q" className="sr-only">Ask the guide</label>
        <input
          id="gyan-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Ask about a chapter, a form, a festival, a ritual… (${def.native})`}
          className="min-w-[14rem] flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !q.trim()}>
          {busy ? "Searching…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {OPENERS.map((s) => (
          <button key={s} className="chip" onClick={() => { setQ(s); ask(s); }}>{s}</button>
        ))}
        {turns.length > 0 && (
          <button
            className="chip"
            onClick={() => { setTurns([]); setCopied(false); }}
          >
            Clear conversation
          </button>
        )}
      </div>

      {busy && <LoadingBlock className="mt-8" label="Searching the corpus…" />}

      <div className="mt-8 space-y-8">
        {turns.map((turn, ti) => (
          <section key={`${turn.at}-${ti}`} aria-live={ti === turns.length - 1 ? "polite" : undefined}>
            <p className="text-sm font-semibold text-[var(--ink)]">
              <span className="muted mr-2">You asked:</span>{turn.question}
            </p>

            {turn.error && (
              <ErrorState className="mt-4" title="Could not answer" message={turn.error}
                          onRetry={() => ask(turn.question)} />
            )}

            {turn.result && (
              <>
                {turn.result.refused ? (
                  <Notice tone="caution" title="No answer offered">
                    <p>{turn.result.refusalReason}</p>
                    <p className="mt-2">
                      Refusing is the correct behaviour here: an assistant that answers from
                      nothing is worse than one that says it cannot.
                    </p>
                  </Notice>
                ) : (
                  <Card className="mt-4 p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Chip tone="gold">
                        {turn.result.mode === "provider" ? "Answer with sources" : "Retrieved passages"}
                      </Chip>
                      <Chip>{turn.result.passages.length} passages</Chip>
                    </div>

                    {turn.result.synthesis ? (
                      <p className="text-[1.03rem] leading-[1.9]">{turn.result.synthesis}</p>
                    ) : (
                      <p className="muted text-sm leading-relaxed">
                        No synthesis service is configured, so instead of prose this shows the
                        passages themselves. Nothing has been paraphrased, which means nothing has
                        been altered.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <button
                        className="chip"
                        onClick={async () => {
                          const text = turn.result?.synthesis
                            ?? turn.result?.passages.map((p) => p.text).join("\n\n")
                            ?? "";
                          try {
                            await navigator.clipboard.writeText(text);
                            setCopied(true);
                          } catch {
                            /* clipboard unavailable: the text is on screen anyway */
                          }
                        }}
                      >
                        {copied ? "Copied ✓" : "Copy answer"}
                      </button>
                      <span className="muted">Was this helpful?</span>
                      <button
                        className="chip"
                        aria-pressed={state.guideFeedback[feedbackId(turn.question)] === "helpful"}
                        onClick={() => setGuideFeedback(feedbackId(turn.question), "helpful")}
                      >
                        Helpful
                      </button>
                      <button
                        className="chip"
                        aria-pressed={state.guideFeedback[feedbackId(turn.question)] === "not-helpful"}
                        onClick={() => setGuideFeedback(feedbackId(turn.question), "not-helpful")}
                      >
                        Not helpful
                      </button>
                      {state.guideFeedback[feedbackId(turn.question)] && (
                        <span className="muted text-xs">
                          Recorded on this device, used to order future answers.
                        </span>
                      )}
                    </div>
                  </Card>
                )}

                {!turn.result.refused && (
                  <>
                    <div className="mt-4">
                      <h2 className="display mb-3 text-lg font-semibold">Listen to this answer</h2>
                      <NarrationPlayer
                        text={[
                          turn.result.synthesis
                            ?? "Here are the passages this app found for your question.",
                          ...turn.result.passages.map(
                            (p, i) => `Passage ${i + 1}, from ${p.citation.title}. ${p.text}`,
                          ),
                        ].join("\n\n")}
                        meta={{
                          label: "the guide's answer",
                          source: turn.result.passages
                            .map((p) => `${p.citation.title} (${p.citation.verification})`)
                            .join(" · "),
                          lang,
                        }}
                      />
                    </div>

                    <div className="mt-4">
                      <h2 className="display mb-3 text-lg font-semibold">Where this came from</h2>
                      <ol className="space-y-2">
                        {turn.result.passages.map((p, i) => (
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
                                <Link
                                  href={p.citation.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-underline mt-2 inline-block text-sm"
                                >
                                  Open the full text (opens in a new tab — this conversation stays) ↗
                                </Link>
                              )}
                            </Card>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {followUps.length > 0 && ti === turns.length - 1 && (
                      <div className="mt-4">
                        <h2 className="display mb-2 text-lg font-semibold">You might ask next</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {followUps.map((x) => (
                            <button
                              key={x.id}
                              className="chip"
                              onClick={() => { setQ(x.ask); ask(x.ask); }}
                            >
                              {x.text}
                            </button>
                          ))}
                        </div>
                        <p className="muted mt-2 text-xs">
                          Every follow-up opens the article that answers it, or asks the same guide
                          again — nothing here is generated.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <ul className="muted mt-4 space-y-1.5 text-xs leading-relaxed">
                  {turn.result.disclaimers.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </>
            )}
          </section>
        ))}
      </div>

      {turns.length === 0 && !busy && (
        <EmptyState
          className="mt-8"
          title="Ask a question"
          body="Try a chapter number, a form's name, a festival, a ritual or a Peetha. Every answer names its source, and the assistant says so when it cannot answer."
        />
      )}

      {latest && (
        <p className="muted mt-8 text-xs leading-relaxed">
          Questions that need a person — a vow, a family rite, a decision about your own practice —
          belong with a qualified teacher or priest, not with an app.{" "}
          <Link href="/about" className="link-underline">Read the editorial and AI policy</Link>.{" "}
          <Link href={askGuideHref(latest.question)} className="link-underline">
            Permalink to this question
          </Link>
        </p>
      )}
    </>
  );
}
