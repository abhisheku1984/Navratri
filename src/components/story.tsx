"use client";

/**
 * Chapter story with a language selector.
 *
 * The story language is the app language (Settings / header "भाषा" control), so a
 * single choice switches the interface, the story text and the read-aloud voice
 * together. The inline picker offers the two languages that have a story
 * rendering (English / हिन्दी) and sets the same app-language setting.
 */

import { chapterStory, STORY_LANGUAGES, STORY_NOTE, type StoryLang } from "@/lib/hindi";
import type { LangCode } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { ReadAloudButton } from "./speech";
import { Card } from "./ui";

export function ChapterStory({ n }: { n: number }) {
  const { state, setSettings } = useUser();
  const lang: StoryLang = state.settings.language === "hi" ? "hi" : "en";
  const choose = (l: StoryLang) => setSettings({ language: l as LangCode });

  const story = chapterStory(lang, n);
  if (!story.text) return null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Story language" className="flex gap-2">
          {STORY_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => choose(l.code)}
              aria-pressed={lang === l.code}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
              style={{
                borderColor: lang === l.code ? "var(--gold)" : "var(--line)",
                background: lang === l.code ? "var(--accent-soft)" : "transparent",
                color: lang === l.code ? "var(--ink)" : "var(--muted)",
              }}
            >
              {l.native}
            </button>
          ))}
        </div>
        <ReadAloudButton
          text={story.text}
          lang={story.lang}
          label={`Listen to the chapter ${n} story in ${story.lang === "hi" ? "Hindi" : "English"}`}
        />
      </div>

      <p className={story.lang === "hi" ? "deva text-base leading-[2.1]" : "text-base leading-[1.9]"}>
        {story.text}
      </p>

      <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
        {STORY_NOTE[story.lang]}
      </p>
    </Card>
  );
}
