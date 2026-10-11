"use client";

/**
 * Audio and Devotional Listening.
 *
 * What plays here is the device's own speech synthesis reading the selected
 * language, or — when a server speech service is configured — that service.
 * No recorded human recitation ships with this app: recordings are
 * performances with rights holders, and none has granted permission. The page
 * says so on the page, next to the player, rather than in a footnote.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { getKbDocuments, getNavadurgaForms } from "@/lib/content";
import { useUser } from "@/lib/user";
import { getLanguage } from "@/lib/i18n";
import { kbLanguageState, kbNarrationText } from "@/lib/kb";
import { Card, Chip, EmptyState, Notice, PageHeader, SectionHeading } from "@/components/ui";
import { NarrationPlayer, NarrationStatusLine } from "@/components/audio/narration";

type Kind = "forms" | "articles";

interface ListenItem {
  id: string;
  kind: Kind;
  title: string;
  meta: string;
  href: string;
  text: string;
  langs: string;
}

const FORMS = getNavadurgaForms();
const DOCS = getKbDocuments();

export default function ListenPage() {
  const { state } = useUser();
  const lang = state.settings.language;
  const def = getLanguage(lang);

  const [kind, setKind] = useState<Kind | "">("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const items = useMemo<ListenItem[]>(() => {
    const out: ListenItem[] = [];

    for (const f of FORMS) {
      out.push({
        id: `form:${f.id}`,
        kind: "forms",
        title: `${f.nameDevanagari} · ${f.nameTransliterated}`,
        meta: `Day ${f.day} · ${f.meaning}`,
        href: `/navadurga/${f.slug}`,
        text: [
          `${f.nameTransliterated}, day ${f.day}.`,
          f.meaning,
          f.originStory,
          f.iconography,
          `Qualities: ${f.qualities.join(", ")}.`,
          f.regionalVariationNote,
        ].join("\n\n"),
        langs: "device voice",
      });
    }

    for (const d of DOCS) {
      const st = kbLanguageState(d, lang);
      out.push({
        id: `doc:${d.id}`,
        kind: "articles",
        title: d.title,
        meta: `${d.summary.slice(0, 120)}${d.summary.length > 120 ? "…" : ""}`,
        href: `/kb/${d.slug}`,
        text: kbNarrationText(d, lang),
        langs:
          st === "full"
            ? `${def.native}: full translation`
            : st === "partial"
            ? `${def.native}: partial translation`
            : `${def.native}: not translated — will read in English or a labelled related voice`,
      });
    }

    return out;
  }, [lang, def.native]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => {
      if (kind && x.kind !== kind) return false;
      if (!q) return true;
      return x.title.toLowerCase().includes(q) || x.meta.toLowerCase().includes(q);
    });
  }, [items, kind, query]);

  const current = filtered.find((x) => x.id === selected) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Listen"
        title="Audio & Devotional Listening"
        sub="Listen to a form or an article in the language you have selected. Narration is matched to the language where a voice exists, and where none exists the app explains the limitation instead of reading the wrong accent."
      />

      <Notice tone="caution" title="What you are hearing">
        <p>
          This is device speech (or a configured speech service), not a recorded recitation. No
          human chanting ships with this app because recitation recordings are performances with
          rights holders, and none has granted permission. Sanskrit verse in particular is
          <em> spoken</em>, not sung, by speech engines — the metre of a traditional paath is not
          something a synthesiser reproduces, and the app does not pretend otherwise.
        </p>
        <p className="mt-2">
          Preference is remembered (voice, speed, volume) and can be changed in{" "}
          <Link href="/settings" className="link-underline">Settings</Link>.
        </p>
      </Notice>

      <div className="mt-6 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <label className="block">
          <span className="text-sm font-medium">Search the listening library</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kalaratri, vrat, ghatasthapana…"
            className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div>
          <span className="text-sm font-medium">Filter</span>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setKind("")}
              className={`rounded-full border px-3 py-1 text-xs ${kind === "" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
              All ({items.length})
            </button>
            <button type="button" onClick={() => setKind("forms")}
              className={`rounded-full border px-3 py-1 text-xs ${kind === "forms" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
              Nine forms ({FORMS.length})
            </button>
            <button type="button" onClick={() => setKind("articles")}
              className={`rounded-full border px-3 py-1 text-xs ${kind === "articles" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
              Articles ({DOCS.length})
            </button>
          </div>
        </div>
      </div>

      {current && (
        <div className="mt-8">
          <SectionHeading eyebrow="Now listening" title={current.title} sub={current.meta} />
          <NarrationStatusLine lang={lang} />
          <div className="mt-4">
            <NarrationPlayer
              key={current.id}
              text={current.text}
              meta={{
                label: current.kind === "forms" ? "profile" : "knowledge-base article",
                source: `Language: ${def.native} (${def.bcp47}). ${current.langs}.`,
                lang,
              }}
            />
          </div>
          <p className="mt-3 text-sm">
            <Link href={current.href} className="text-[var(--accent)] hover:underline">
              Open the full text →
            </Link>
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState
              title="Nothing matches that search"
              body="Try a shorter word. Every article in the knowledge base is narratable, and every form has a profile."
            />
          </div>
        ) : (
          filtered.map((x) => (
            <Card key={x.id} className="flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Chip>{x.kind === "forms" ? "Nine forms" : "Article"}</Chip>
                <Chip>{x.langs}</Chip>
              </div>
              <h3 className="mt-3 text-base font-semibold">{x.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.meta}</p>
              <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm">
                <button
                  type="button"
                  onClick={() => setSelected(x.id)}
                  className="text-[var(--accent)] hover:underline"
                >
                  {selected === x.id ? "Playing above ↑" : "Listen →"}
                </button>
                <Link href={x.href} className="text-[var(--muted)] hover:underline">
                  Read →
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      <p className="mt-10 text-sm text-[var(--muted)]">
        Looking for the scripture itself? Chapter narration and the auxiliary recitations live with
        the <Link href="/scripture" className="link-underline">text</Link>, next to their source notes.
      </p>
    </>
  );
}
