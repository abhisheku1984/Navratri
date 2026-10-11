"use client";

/**
 * The chapter reading flow, in the right order for the selected language.
 *
 * Order matters and was a real defect: the page used to lead with a large
 * "Chapter 1 in English" block (the imported 1904 witness) and place the
 * selected-language narrative underneath it, so a reader who had chosen Hindi
 * met English first and had to scroll to find their own language.
 *
 * Now:
 *
 *  1. the chapter's narrative in the selected language, read aloud in that
 *     language (Hindi or English — the two renderings this app actually holds),
 *  2. the English witness, clearly labelled as an English-only edition text,
 *  3. a one-line availability statement naming exactly which languages exist.
 */
import { useState } from "react";
import { chapterStory, STORY_NOTE, type StoryLang } from "@/lib/hindi";
import { getLanguage, t, type LangCode } from "@/lib/i18n";
import { useUser } from "@/lib/user";
import { Card, Chip, ErrorState, SectionHeading } from "@/components/ui";
import { NarrationPlayer } from "@/components/audio/narration";
import { ContentAvailability, EnglishWitnessNote, SwitchTo } from "@/components/content-language";

/** Languages this app holds a chapter narrative for. Verified, not aspirational. */
const STORY_LANGS: LangCode[] = ["en", "hi"];

/**
 * Narration of a chapter's verses.
 *
 * The verses are Devanagari, so the language of the narration is Sanskrit — and
 * `planVoice` reports that a Sanskrit voice does not exist on most devices and
 * a Hindi voice is used instead, by name, on screen. That is the honest
 * arrangement: Devanagari read with an Indic voice, labelled, rather than
 * Devanagari read with an English one.
 */
export function ChapterVersesAudio({
  n,
  verses,
  className = "",
}: {
  n: number;
  verses: { label: string; devanagari: string }[];
  className?: string;
}) {
  const { state } = useUser();
  const requested = state.settings.language as LangCode;
  if (verses.length === 0) return null;

  return (
    <div className={className}>
      <NarrationPlayer
        text={verses.map((v) => v.devanagari).join("\n\n")}
        meta={{
          label:
            requested === "hi"
              ? `अध्याय ${n} के श्लोक (देवनागरी)`
              : `chapter ${n} verses (Devanagari)`,
          source:
            requested === "hi"
              ? "श्लोक देवनागरी में हैं, इसलिए वाचन संस्कृत/हिन्दी स्वर में होता है — अंग्रेज़ी स्वर में नहीं।"
              : "The verses are Devanagari, so narration uses a Sanskrit/Hindi voice, not an English one. The app names the voice it is using rather than borrowing an unrelated accent.",
          lang: "sa",
        }}
      />
      <p className="muted mt-2 text-xs leading-relaxed">
        {requested === "hi"
          ? "यह वाचन यंत्र-स्वर है, किसी मानव पाठ की रिकॉर्डिंग नहीं; छंद और लय यंत्र से नहीं बनती।"
          : "This is device speech, not a human recitation — the metre and melody of a traditional paath are not something a speech engine produces, and the app says so. Verse labels are shown as they are numbered in this edition."}
      </p>
    </div>
  );
}

export function ChapterReading({
  n,
  paragraphs,
  partial,
}: {
  n: number;
  /** Paragraphs of the imported English witness (Pargiter 1904). */
  paragraphs: string[];
  /** True when the OCR witness for this canto is truncated. */
  partial: boolean;
}) {
  const { state } = useUser();
  const requested = state.settings.language as LangCode;
  const reqDef = getLanguage(requested);

  // The narrative language: the reader's own where it exists, English otherwise
  // — never a third language chosen silently on the reader's behalf.
  const storyLang: StoryLang = requested === "hi" ? "hi" : "en";
  const story = chapterStory(storyLang, n);

  const [openEn, setOpenEn] = useState(false);

  return (
    <>
      <section aria-labelledby="story" className="mt-8">
        <SectionHeading
          eyebrow={storyLang === "hi" ? "कथा · Story" : "Story"}
          title={storyLang === "hi" ? `अध्याय ${n} की कथा` : `Chapter ${n} — the story`}
          sub={
            storyLang === "hi"
              ? "समकालीन हिन्दी वाचन · यह ऐप की अपनी हिन्दी रचना है, किसी प्रकाशित अनुवाद की नकल नहीं।"
              : "A contemporary rendering written for this app — not a copy of any published translation."
          }
        />
        <h2 id="story" className="sr-only">
          Chapter {n} story
        </h2>

        <Card className="p-6">
          {story.text ? (
            <>
              <p
                className={
                  storyLang === "hi"
                    ? "deva text-base leading-[2.1]"
                    : "text-base leading-[1.9]"
                }
              >
                {story.text}
              </p>
              <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
                {STORY_NOTE[storyLang]}
              </p>

              <div className="mt-5">
                <NarrationPlayer
                  text={story.text}
                  meta={{
                    label:
                      storyLang === "hi"
                        ? `अध्याय ${n} की कथा`
                        : `chapter ${n} story`,
                    source: STORY_NOTE[storyLang],
                    lang: storyLang,
                  }}
                />
              </div>
            </>
          ) : (
            <ErrorState
              title={t(requested, "status.unavailable")}
              message={`No ${storyLang === "hi" ? "Hindi" : "English"} narrative is held for this chapter.`}
            />
          )}
        </Card>

        <ContentAvailability
          className="mt-4"
          available={STORY_LANGS}
          rendering={storyLang}
          what={storyLang === "hi" ? "अध्याय की कथा" : "the chapter story"}
          note={
            requested !== storyLang
              ? `${reqDef.native} ${reqDef.label} narrative is not held for this chapter yet. ` +
                `The narrative is shown in ${getLanguage(storyLang).native}; the Sanskrit verses ` +
                `above are complete in both Devanagari and IAST, and the English translation of ` +
                `the edition is below.`
              : undefined
          }
        />
      </section>

      <section aria-labelledby="translation" className="mt-10">
        <SectionHeading
          eyebrow={requested === "hi" ? "अनुवाद" : "Translation"}
          title={
            requested === "hi"
              ? `अध्याय ${n} — अंग्रेज़ी अनुवाद`
              : `Chapter ${n} in English`
          }
        />
        <h2 id="translation" className="sr-only">
          English translation
        </h2>

        <EnglishWitnessNote className="mb-4" />

        {partial && (
          <ErrorState
            title={
              requested === "hi"
                ? "इस अध्याय का अंग्रेज़ी अनुवाद अपूर्ण है"
                : "This chapter's English translation is incomplete"
            }
          >
            <p>
              {requested === "hi"
                ? `इस पाठ की OCR प्रति अधूरी है, इसलिए केवल ${paragraphs.length} अनुच्छेद बचे हैं। ऊपर का संस्कृत पूर्ण है। यह ऐप छूटी हुई गद्य रचना नहीं गढ़ता — वह स्पष्ट लिखता है कि वह नहीं है।`
                : `The OCR witness for this canto is truncated, so only ${paragraphs.length} paragraph${paragraphs.length === 1 ? "" : "s"} survived. The Sanskrit above is complete. Rather than generate the missing prose, the app says plainly that it is missing.`}
            </p>
          </ErrorState>
        )}

        {paragraphs.length > 0 && (
          <>
            <Card className="mb-4 p-6">
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-[1.9]">
                    {p}
                  </p>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap items-center gap-2">
              <Chip>{requested === "hi" ? "अंग्रेज़ी पाठ" : "English text"}</Chip>
              <button type="button" className="chip" onClick={() => setOpenEn((v) => !v)}>
                {openEn
                  ? requested === "hi" ? "अंग्रेज़ी वाचन छिपाएँ" : "Hide English narration"
                  : requested === "hi" ? "अंग्रेज़ी पाठ सुनें" : "Listen in English"}
              </button>
            </div>

            {openEn && (
              <div className="mt-4">
                <NarrationPlayer
                  text={paragraphs.join("\n\n")}
                  meta={{
                    label:
                      requested === "hi"
                        ? `अध्याय ${n} का अंग्रेज़ी अनुवाद`
                        : `chapter ${n}, English translation`,
                    source: "F. E. Pargiter (1904), public domain — English only",
                    lang: "en",
                  }}
                />
                <p className="muted mt-2 text-xs leading-relaxed">
                  {requested === "hi"
                    ? "यह वाचन अंग्रेज़ी में है क्योंकि पाठ अंग्रेज़ी में है — हिन्दी कथा का वाचन ऊपर है।"
                    : "This is read in English because the text is English. The narrative above is read in your selected language."}
                </p>
              </div>
            )}
          </>
        )}

        {paragraphs.length === 0 && !partial && (
          <ErrorState
            title={t(requested, "status.unavailable")}
            message="No English witness text is held for this chapter."
          />
        )}
      </section>

      <p className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="muted">
          {requested === "hi"
            ? "पूरा पाठ हिन्दी में पढ़ना चाहें?"
            : "Want the narrative in Hindi?"}
        </span>
        <SwitchTo lang="hi" />
        <SwitchTo lang="en" />
      </p>
    </>
  );
}
