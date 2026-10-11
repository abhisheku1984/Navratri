"use client";

/**
 * A story, in the selected language, with narration.
 *
 * Each story carries an English retelling and — where one has been written — a
 * contemporary Hindi rendering. This component picks the right one for the
 * reader, states plainly which languages the story exists in, and narrates it in
 * the language it is actually showing. It never reads English text with a Hindi
 * voice or the reverse.
 */
import type { Story } from "@/lib/types";
import { useUser } from "@/lib/user";
import { getLanguage, t, type LangCode } from "@/lib/i18n";
import { Card } from "@/components/ui";
import { NarrationPlayer } from "@/components/audio/narration";
import { ContentAvailability, SwitchTo } from "@/components/content-language";

/** Languages this story actually holds text for. Verified from the record. */
export function storyLanguages(s: Story): LangCode[] {
  const out: LangCode[] = ["en"];
  if (s.shortHi && s.longHi) out.push("hi");
  return out;
}

export function StoryReader({ story, className = "" }: { story: Story; className?: string }) {
  const { state } = useUser();
  const requested = state.settings.language as LangCode;
  const available = storyLanguages(story);
  const rendering: LangCode = available.includes(requested) ? requested : "en";
  const def = getLanguage(rendering);

  const short = rendering === "hi" ? story.shortHi! : story.short;
  const long = rendering === "hi" ? story.longHi! : story.long;
  const paragraphs = long.split(/\n{2,}/).filter(Boolean);
  const title = rendering === "hi" ? story.titleHi : story.title;

  return (
    <>
      <ContentAvailability
        className={className}
        available={available}
        rendering={rendering}
        what={rendering === "hi" ? "यह कथा" : "this story"}
        altNotes={
          requested !== "hi" && available.includes("hi")
            ? [{ lang: "hi", text: "यह कथा हिन्दी में भी उपलब्ध है (" + "समकालीन हिन्दी रूपांतरण" + ")।" }]
            : undefined
        }
      />

      <article className="min-w-0">
        <Card className="mb-8 p-6">
          <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
            {rendering === "hi" ? "संक्षेप में" : "The short version"}
          </p>
          <p
            className={rendering === "hi" ? "deva leading-[2.1]" : "leading-[1.9]"}
            style={{ fontFamily: def.fontStack }}
            dir={def.dir}
          >
            {short}
          </p>
        </Card>

        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={rendering === "hi" ? "deva text-[1.06rem] leading-[2.05]" : "text-[1.06rem] leading-[1.95]"}
              style={{ fontFamily: def.fontStack }}
              dir={def.dir}
            >
              {p}
            </p>
          ))}
        </div>

        {rendering === "hi" && (
          <p className="muted mt-6 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
            समकालीन हिन्दी रूपांतरण · इस ऐप के लिए लिखा गया, किसी प्रकाशित पुस्तक की प्रतिलिपि नहीं।
          </p>
        )}

        <div className="mt-6">
          <NarrationPlayer
            text={[title, short, ...paragraphs].join("\n\n")}
            meta={{
              label:
                rendering === "hi" ? `${story.titleHi} — हिन्दी` : `${story.title} — English`,
              source:
                rendering === "hi"
                  ? "समकालीन हिन्दी रूपांतरण (इस ऐप के लिए लिखित) · वाचन यंत्र-स्वर द्वारा"
                  : "Contemporary retelling · device voice",
              lang: rendering,
            }}
          />
        </div>

        {requested !== rendering && (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="muted">{t(requested, "status.unavailable")}</span>
            {available.map((l) => (
              <SwitchTo key={l} lang={l} />
            ))}
          </p>
        )}
      </article>
    </>
  );
}
