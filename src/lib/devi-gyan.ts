/**
 * Devi Gyan — retrieval layer for the optional spiritual assistant.
 *
 * Two-tier design, on purpose:
 *
 *  1. `retrieve()` always works. It searches the app's own verified content and
 *     returns ranked passages with exact citations. With no provider configured
 *     the UI shows these passages directly — a citation-first answer with no
 *     generation step, which cannot hallucinate because nothing is written.
 *
 *  2. If `DEVI_GYAN_API_KEY` is set on the *server*, `answer()` additionally
 *     asks a provider to synthesise, constrained to the retrieved passages and
 *     instructed to refuse rather than invent. The key is read in a route
 *     handler only and is never exposed to the client.
 *
 * Guardrails are enforced in code, not just in the prompt: if retrieval finds
 * nothing confident, the function returns `refused: true` and the UI says so.
 */
import { search, type SearchHit } from "@/lib/search";
import { getLanguage, isLanguageCode } from "@/lib/i18n";
import { getChapters, getKbDocument, getPeethas, getNavadurgaForms } from "@/lib/content";

export interface CitationRef {
  title: string;
  locator: string;
  href: string;
  kind: string;
  verification: string;
}

export interface RetrievedPassage {
  text: string;
  citation: CitationRef;
  score: number;
}

export interface DeviGyanAnswer {
  question: string;
  passages: RetrievedPassage[];
  /** Set when a provider produced prose; null in retrieval-only mode. */
  synthesis: string | null;
  mode: "retrieval" | "provider";
  refused: boolean;
  refusalReason: string | null;
  disclaimers: string[];
}

const OUT_OF_SCOPE = [
  // Prefixes must not carry a trailing \b: "pregnan\b" never matches
  // "pregnant", which is exactly the question this list exists to refuse.
  /\b(cure|cures|heal|heals|healing|medicine|medication|dose|dosage|surgery|treatment)\b/i,
  /\b(pregnan\w*|miscarri\w*|fertilit\w*|infertilit\w*|conceiv\w*|conception|ivf)\b/i,
  /\b(lottery|stocks?|gambl\w*|betting|invest\w*|crypto\w*)\b/i,
  /\b(lawsuit|litigation|divorce|inheritance|property dispute|custody)\b/i,
];

const GUARANTEE_REQUESTS = [
  /\b(guarantee|ensure|promise|surely will|definitely will)\b.*(bless|child|job|money|marriage)/i,
];

/**
 * Questions that need a human authority rather than a retrieval engine.
 * These are detected and routed explicitly instead of being answered loosely.
 */
const NEEDS_AUTHORITY = [
  /\b(should i (divorce|abort|leave|disinherit))\b/i,
  /\b(is .* (haram|sinful|forbidden) for me personally)\b/i,
];

export function retrieve(question: string, limit = 8): RetrievedPassage[] {
  const hits: SearchHit[] = search(question, 60);
  const out: RetrievedPassage[] = [];

  for (const h of hits.slice(0, limit)) {
    let text = h.excerpt;
    let verification = "awaiting-verification";
    let locator = h.sub ?? "";

    if (h.kind === "verse") {
      const [ch, label] = h.id.split(":");
      const num = Number(ch.replace("ch-", ""));
      const chapter = getChapters().find((c) => c.number === num);
      const verse = chapter?.verses.find((v) => v.label === label);
      if (chapter && verse) {
        text = `${verse.devanagari}\n${verse.iast}`;
        locator = `Devi Mahatmya ${verse.label} (${chapter.titleEnglishEditorial})`;
        verification = "verified";
      }
    } else if (h.kind === "chapter") {
      verification = "verified";
      locator = "Durga Saptashati, imported Sanskrit edition";
    } else if (h.kind === "anga") {
      verification = "verified";
      locator = "Durga Saptashati auxiliary recitation";
    } else if (h.kind === "peetha") {
      const p = getPeethas().find((x) => x.id === h.id);
      if (p) {
        text = `${p.templeName} — ${p.goddessName}. ${p.traditionNote} ${p.story}`;
        locator = `${p.location.city}, ${p.location.country} · lists: ${p.lists.join(", ")}`;
        verification = p.confidence === "high" ? "high confidence"
          : p.confidence === "medium" ? "medium confidence" : "low confidence / disputed";
      }
    } else if (h.kind === "navadurga") {
      const f = getNavadurgaForms().find((x) => x.id === h.id);
      if (f) {
        text = `${f.nameDevanagari} (${f.nameTransliterated}), day ${f.day}: ${f.meaning}. ${f.originStory}`;
        locator = `Navadurga, day ${f.day} · names from Devi Kavacham 3–5`;
        verification = "names verified; detail is editorial";
      }
    } else if (h.kind === "topic") {
      verification = "editorial, awaiting scholarly review";
      locator = "Maa Durga knowledge library";
    } else if (h.kind === "mantra") {
      verification = "text verified where marked; see the item";
      locator = "Mantra library";
    } else if (h.kind === "glossary") {
      verification = "editorial";
      locator = "Glossary";
    } else if (h.kind === "story") {
      verification = "retelling — see the source note";
      locator = "Stories";
    } else if (h.kind === "kb") {
      const doc = getKbDocument(h.id);
      if (doc) {
        text = `${doc.summary}\n\n${doc.keyPoints.join(" ")}`;
        const sources = doc.sources.map((s) => `${s.sourceId} (${s.locator})`).join("; ");
        locator = `Knowledge base, section ${doc.section} · sources: ${sources}`;
        verification = doc.review === "reviewed"
          ? "reviewed"
          : "editorial, in-house review";
      }
    }

    out.push({
      text,
      score: h.score,
      citation: { title: h.title, locator, href: h.href, kind: h.kind, verification },
    });
  }
  return out;
}

export async function answer(question: string, lang = "en"): Promise<DeviGyanAnswer> {
  const language = isLanguageCode(lang) ? getLanguage(lang) : getLanguage("en");
  const q = question.trim();
  const disclaimers = [
    "This assistant retrieves from this app's own content and cites it. It does not have access " +
      "to your family tradition, your local temple, or your priest.",
    "It will not promise blessings, cures, prosperity or any supernatural outcome, and it does " +
      "not give medical, legal or financial advice.",
  ];

  for (const re of OUT_OF_SCOPE) {
    if (re.test(q)) {
      return {
        question: q, passages: [], synthesis: null, mode: "retrieval",
        refused: true,
        refusalReason:
          "That question is outside what this assistant should answer. For health, legal or " +
          "financial matters please speak to a qualified professional.",
        disclaimers,
      };
    }
  }
  for (const re of NEEDS_AUTHORITY) {
    if (!re.test(q)) continue;
    return {
      question: q, passages: [], synthesis: null, mode: "retrieval",
      refused: true,
      refusalReason:
        "This needs a qualified person who knows your situation — a family priest, a scholar, or " +
        "a counsellor. A retrieval engine should not answer it.",
      disclaimers,
    };
  }

  const passages = retrieve(q, 8);

  if (passages.length === 0 || passages[0].score < 12) {
    return {
      question: q, passages, synthesis: null, mode: "retrieval",
      refused: true,
      refusalReason:
        "Nothing in this app's verified content answers that confidently, so no answer is " +
        "offered rather than one being invented. Try rephrasing, or ask a qualified scholar.",
      disclaimers,
    };
  }

  const guarantee = GUARANTEE_REQUESTS.some((re) => re.test(q));
  if (guarantee) {
    disclaimers.unshift(
      "No one can guarantee a blessing, a cure or an outcome, and this assistant will not pretend " +
      "otherwise. Practice is its own reward; results are not promised by any tradition honestly " +
      "represented here.",
    );
  }

  const apiKey = process.env.DEVI_GYAN_API_KEY;
  if (!apiKey) {
    return {
      question: q, passages, synthesis: null, mode: "retrieval", refused: false,
      refusalReason: null, disclaimers,
    };
  }

  // ---- provider mode -------------------------------------------------------
  // Server-only. The key never reaches the client bundle.
  const endpoint = process.env.DEVI_GYAN_ENDPOINT;
  const model = process.env.DEVI_GYAN_MODEL;
  if (!endpoint || !model) {
    return {
      question: q, passages, synthesis: null, mode: "retrieval", refused: false,
      refusalReason: null, disclaimers,
    };
  }

  const system = [
    "You are Devi Gyan, an assistant about Maa Durga, the Durga Saptashati and the Shakti Peethas.",
    "Answer ONLY from the passages provided. Cite them by number in square brackets, e.g. [1].",
    "If the passages do not answer the question, say so plainly. Do not add verses, quotations,",
    "temple facts, timings or ritual instructions from memory.",
    "Distinguish clearly between: what a scripture says; what a regional tradition holds; and",
    "what a commentator has added. Where the passages disagree, present both and say they disagree.",
    "Never promise blessings, cures, prosperity or supernatural results. Never rank one sect",
    "above another. If a question needs a qualified scholar or local priest, say so.",
    `Answer in ${language.native} (${language.bcp47}). The question may have been asked in a`,
    "different language: answer in the language requested, and if a quotation must stay in its",
    "original script, give it in the original followed by that language's rendering.",
  ].join(" ");

  const context = passages
    .map((p, i) => `[${i + 1}] ${p.citation.title} — ${p.citation.locator}\n${p.text}`)
    .join("\n\n");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Passages:\n\n${context}\n\nQuestion: ${q}` },
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) throw new Error(`provider returned ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const synthesis = data.choices?.[0]?.message?.content?.trim() ?? null;
    return {
      question: q, passages, synthesis, mode: "provider", refused: false,
      refusalReason: null, disclaimers,
    };
  } catch {
    // degrade to retrieval-only rather than failing the request
    return {
      question: q, passages, synthesis: null, mode: "retrieval", refused: false,
      refusalReason: null,
      disclaimers: [...disclaimers,
        "The answer-synthesis service is unavailable, so only the cited passages are shown."],
    };
  }
}
