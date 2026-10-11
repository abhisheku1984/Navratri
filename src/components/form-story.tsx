"use client";

/**
 * A form's story, in the selected language, with narration.
 *
 * Each of the nine forms has its own knowledge-base article with a reviewed
 * Hindi rendering. This component renders that article in the reader's language
 * and, where the language does not exist yet, shows English while naming the
 * languages that do — with a one-click switch. It never leaves the reader
 * guessing which language they are reading.
 */
import Link from "next/link";
import { getKbDocument } from "@/lib/content";
import type { KbDocument } from "@/lib/types";
import { useUser } from "@/lib/user";
import { t, getLanguage, type LangCode } from "@/lib/i18n";
import { kbLanguageState, kbNarrationText, localiseKbDocument } from "@/lib/kb";
import { Card, Chip, Notice, SectionHeading } from "@/components/ui";
import { NarrationPlayer } from "@/components/audio/narration";
import { ContentAvailability } from "@/components/content-language";

/** Languages this app actually holds per-form article text for. Verified by tests. */
function availableLanguages(doc: KbDocument | null): LangCode[] {
  if (!doc) return [];
  const out: LangCode[] = ["en"];
  for (const code of Object.keys(doc.translations ?? {})) {
    if (kbLanguageState(doc, code) === "full") out.push(code as LangCode);
  }
  return out;
}

export function FormStory({ slug, className = "" }: { slug: string; className?: string }) {
  const { state } = useUser();
  const requested = state.settings.language as LangCode;
  const doc = getKbDocument(slug);

  if (!doc) return null;

  const available = availableLanguages(doc);
  const rendering: LangCode = available.includes(requested) ? requested : "en";
  const localised = localiseKbDocument(doc, rendering);
  const renderingDef = getLanguage(rendering);

  return (
    <section className={className} aria-labelledby="form-story">
      <SectionHeading
        eyebrow={
          requested === "hi" ? "कथा · अर्थ · स्रोत" : "Story · meaning · sources"
        }
        title={
          rendering === "hi"
            ? "इस रूप की कथा"
            : rendering === "en"
            ? doc.title
            : localised.title
        }
        sub={
          rendering === requested
            ? undefined
            : `${t(requested, "status.unavailable")} — ${getLanguage(requested).native}`
        }
      />
      <h2 id="form-story" className="sr-only">
        {doc.title}
      </h2>

      <Card className="p-6">
        {rendering !== "en" && (
          <p
            className="text-lg font-semibold leading-snug"
            style={{ fontFamily: renderingDef.fontStack }}
            dir={renderingDef.dir}
          >
            {localised.title}
          </p>
        )}

        <p className="mt-3 text-base leading-[1.9]">{localised.summary}</p>

        <div className="mt-4 space-y-4">
          {localised.body.map((para, i) => (
            <p key={i} className="text-[15px] leading-[1.9]">
              {para}
            </p>
          ))}
        </div>

        {localised.bodyTranslated && rendering === "hi" && (
          <p className="muted mt-4 text-xs">
            समकालीन हिन्दी पाठ · इस ऐप के लिए लिखा गया, किसी प्रकाशित अनुवाद की प्रतिलिपि नहीं।
          </p>
        )}

        <ul className="mt-5 space-y-2">
          {doc.keyPoints.map((k, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span aria-hidden className="mt-1 text-[var(--accent)]">◆</span>
              <span>{k}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <NarrationPlayer
            text={kbNarrationText(doc, rendering)}
            meta={{
              label:
                rendering === "hi"
                  ? `${doc.title} — हिन्दी`
                  : `${doc.title} — ${renderingDef.label}`,
              source: doc.sources
                .map((s) => `${s.sourceId} (${s.locator})`)
                .join(" · "),
              lang: rendering,
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip>
            {rendering === "hi" ? "स्रोत" : "Sources"}: {doc.sources.map((s) => s.sourceId).join(" · ")}
          </Chip>
          <Link href={`/kb/${doc.slug}`} className="chip">
            {rendering === "hi" ? "पूरा लेख" : "Full article"} →
          </Link>
        </div>
      </Card>

      <ContentAvailability
        className="mt-4"
        available={available}
        rendering={rendering}
        what={rendering === "hi" ? "इस रूप की कथा" : "this form's story"}
      />

      <div className="mt-4">
      <Notice tone="info" title={requested === "hi" ? "यह लेख किस बारे में है" : "About this article"}>
        <p className="muted">
          {requested === "hi"
            ? "सामग्री इस ऐप के लिए लिखी गई है और उपर्युक्त स्रोतों के नाम दिए गए हैं। व्याख्या को व्याख्या कहकर लिखा गया है; जहाँ दो परम्पराएँ भिन्न हैं, दोनों दर्ज की जाती हैं।"
            : "Editorial content written for this app, with the sources named above. Interpretation is labelled as interpretation; where two traditions differ, both are recorded."}
        </p>
      </Notice>
      </div>
    </section>
  );
}
