"use client";

/**
 * Chapter story with a language selector.
 *
 * Picking a language swaps both the story text and the read-aloud voice to that
 * language. The choice is remembered on the device. The first (server) render is
 * English; the stored preference is applied after mount so there is never a
 * hydration mismatch.
 */

import { useEffect, useState } from "react";
import { chapterStory, STORY_LANGUAGES, STORY_NOTE, type StoryLang } from "@/lib/hindi";
import { ReadAloudButton } from "./speech";
import { Card } from "./ui";

const KEY = "navratri.storyLang";

export function ChapterStory({ n }: { n: number }) {
  const [lang, setLang] = useState<StoryLang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch {
      /* private mode etc. */
    }
  }, []);

  const choose = (l: StoryLang) => {
    setLang(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

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
