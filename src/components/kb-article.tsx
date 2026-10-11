"use client";

/**
 * One knowledge-base document, rendered in the selected language.
 *
 * The document body is translated where a reviewed translation exists; where it
 * does not, the English text is shown and the page says so explicitly, along
 * with which languages do have a translation. That disclosure is the point of
 * this component existing separately from the page: it is the only place in the
 * app that can tell a reader, per document, exactly how much of what they are
 * reading is in their language.
 */
import Link from "next/link";
import type { KbDocument } from "@/lib/types";
import { useUser } from "@/lib/user";
import { getLanguage } from "@/lib/i18n";
import { kbLanguageState, localiseKbDocument, askGuideHref, kbNarrationText } from "@/lib/kb";
import { Card, Chip, Notice, SectionHeading, TextLink } from "@/components/ui";
import { NarrationPlayer, NarrationStatusLine } from "@/components/audio/narration";

const STATE_LABEL: Record<string, string> = {
  full: "full translation",
  partial: "partial translation",
  none: "not translated yet",
};

export function KbArticle({
  doc,
  sourceTitles,
  hrefs,
}: {
  doc: KbDocument;
  /** sourceId → human title, resolved on the server from sources.json. */
  sourceTitles: Record<string, string>;
  /** sourceId → /sources#anchor, when the sources page has one. */
  hrefs: Record<string, string>;
}) {
  const { state } = useUser();
  const lang = state.settings.language;
  const localised = localiseKbDocument(doc, lang);
  const def = getLanguage(lang);

  const translationState = kbLanguageState(doc, lang);
  const available = Object.keys(doc.translations ?? {})
    .map((code) => getLanguage(code).native)
    .slice(0, 12);

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Chip>Section {doc.section}</Chip>
        <Chip>{doc.review === "reviewed" ? "Reviewed" : "Editorial, in-house review"}</Chip>
        <Chip>Updated {doc.updated}</Chip>
      </div>

      <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--ink)]">
        {localised.title}
      </h1>
      {!localised.titleTranslated && lang !== "en" && (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Title shown in English — no reviewed {def.native} title for this document yet.
        </p>
      )}

      <p className="mt-4 text-lg leading-relaxed text-[var(--ink)]">{localised.summary}</p>
      {!localised.summaryTranslated && lang !== "en" && (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Summary shown in English — no reviewed {def.native} summary yet.
        </p>
      )}

      <div className="mt-5">
        <NarrationStatusLine lang={lang} />
      </div>

      <div className="mt-4">
        <NarrationPlayer
          text={kbNarrationText(doc, lang)}
          meta={{
            label: `knowledge-base article: ${localised.title}`,
            source: doc.sources
              .map((s) => `${sourceTitles[s.sourceId] ?? s.sourceId} — ${s.locator}`)
              .join(" · "),
            lang,
          }}
        />
      </div>

      <div className="prose-app mt-8 space-y-4">
        {localised.body.map((para, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-[var(--ink)]">
            {para}
          </p>
        ))}
      </div>

      {!localised.bodyTranslated && lang !== "en" && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Body shown in English. {available.length > 1
            ? `Reviewed translations exist for: ${available.join(", ")}.`
            : "No other language has a reviewed translation of this document yet."}
        </p>
      )}

      <OrnamentRuleSpacer />

      <SectionHeading eyebrow="In short" title="Key points" />
      <ul className="mt-4 space-y-2">
        {doc.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-3 text-sm text-[var(--ink)]">
            <span aria-hidden className="mt-1 text-[var(--accent)]">◆</span>
            <span>{k}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Sources
          </h3>
          <ul className="mt-3 space-y-3">
            {doc.sources.map((s) => (
              <li key={`${s.sourceId}-${s.locator}`} className="text-sm">
                <Link
                  href={hrefs[s.sourceId] ?? "/sources"}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {sourceTitles[s.sourceId] ?? s.sourceId}
                </Link>
                <span className="text-[var(--muted)]"> — {s.locator}</span>
                {s.note && <p className="mt-1 text-xs text-[var(--muted)]">{s.note}</p>}
              </li>
            ))}
          </ul>
          {translationState !== "full" && (
            <p className="mt-4 text-xs text-[var(--muted)]">
              Translation state for {def.native}: {STATE_LABEL[translationState] ?? translationState}.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Related
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {doc.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[var(--accent)] hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <TextLink href={askGuideHref(localised.title)}>
              Ask the AI guide about this →
            </TextLink>
          </p>
        </Card>
      </div>

      <Notice tone="info" title="About this article">
        <p>
          Editorial content written for this app, with sources named above. Interpretive
          readings are labelled as interpretation; nothing here is presented as a scriptural
          quotation unless the quoted text is held in this app&rsquo;s verified corpus. Two
          traditions that disagree are both recorded — the app records, it does not arbitrate.
        </p>
      </Notice>
    </article>
  );
}

/** Local spacer so the article keeps the app's ornament rhythm without importing a heading. */
function OrnamentRuleSpacer() {
  return <div aria-hidden className="my-8 h-px w-full bg-[var(--line)] opacity-60" />;
}
