"use client";

/**
 * Read-aloud, using the device's own speech synthesis.
 *
 * No recording ships with this app — recitation audio needs permission from
 * rights holders, and none has been granted. What the browser *can* do, with no
 * licensing and no network, is speak text aloud with its built-in voices. That
 * is what this offers, and the button says exactly that: "read aloud with your
 * device's voice", never implying a human recitation.
 *
 * It degrades gracefully: browsers without `speechSynthesis` (or users with it
 * disabled) get an explanatory disabled control, not an error. Pronunciation
 * quality is entirely up to the device's voices; Devanagari only sounds right
 * if a Hindi-capable voice is installed. The UI does not pretend otherwise.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/user";

/** Map an app language code to a BCP-47 tag the speech engine understands. */
export function speechLang(lang: string): string {
  switch (lang) {
    case "hi": return "hi-IN";
    case "te": return "te-IN";
    case "bn": return "bn-IN";
    case "sa": return "hi-IN"; // Sanskrit text is Devanagari; a Hindi voice is the closest common match.
    default: return "en-IN";
  }
}

/**
 * Choose the best available voice for a language tag.
 *
 * Prefers an exact language match, then any voice whose language shares the
 * primary subtag, then the engine default. Pure and synchronous so it is
 * trivially testable.
 */
export function pickVoice(
  voices: { lang?: string; name?: string }[],
  want: string,
): { lang?: string; name?: string } | null {
  if (!voices.length) return null;
  const primary = want.split("-")[0].toLowerCase();
  const exact = voices.find((v) => (v.lang ?? "").toLowerCase().replace("_", "-") === want.toLowerCase());
  if (exact) return exact;
  const same = voices.find((v) => (v.lang ?? "").toLowerCase().split("-")[0] === primary);
  return same ?? voices[0];
}

/**
 * Normalise text before handing it to a TTS engine.
 *
 * Strips Devanagari danda/double-danda and verse numerals that read badly
 * aloud, collapses whitespace, and trims. Pure so it is testable without a
 * speech engine.
 */
export function prepareSpeechText(text: string): string {
  return text
    // Verse-number markers "॥ १ ॥" read terribly aloud; drop them whole.
    .replace(/॥[^॥।]*॥/g, " ")
    // A lone danda is a caesura; turn it into a spoken pause.
    .replace(/[।॥|]+/g, ", ")
    // Any stray Devanagari numerals.
    .replace(/[०-९]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,+/g, ", ")
    .trim()
    .replace(/,\s*$/, "");
}

interface ReadAloud {
  supported: boolean;
  speaking: boolean;
  /** Begin reading `text`, or stop if already reading it. */
  toggle: () => void;
  stop: () => void;
}

export function useReadAloud(text: string, lang: string): ReadAloud {
  const { state } = useUser();
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const currentRef = useRef<string | null>(null);

  // Never leave a voice running when the control unmounts or the text changes.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported, text]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    currentRef.current = null;
    setSpeaking(false);
  }, [supported]);

  const toggle = useCallback(() => {
    if (!supported) return;

    // Toggling the same text again stops it.
    if (speaking && currentRef.current === text) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(prepareSpeechText(text));
    const tag = speechLang(lang);
    utter.lang = tag;
    const voice = pickVoice(window.speechSynthesis.getVoices(), tag);
    if (voice && "name" in voice && voice.name) {
      // getVoices returns SpeechSynthesisVoice; re-fetch to keep the type.
      const match = window.speechSynthesis
        .getVoices()
        .find((v) => v.name === voice.name);
      if (match) utter.voice = match;
    }
    utter.rate = state.settings.audioRate || 1;

    utter.onend = () => {
      currentRef.current = null;
      setSpeaking(false);
    };
    utter.onerror = () => {
      currentRef.current = null;
      setSpeaking(false);
    };

    currentRef.current = text;
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, [supported, speaking, text, lang, state.settings.audioRate, stop]);

  return { supported, speaking, toggle, stop };
}

/**
 * A read-aloud control for a piece of text.
 *
 * `label` describes what is being read ("this story", "verse 5.14") so a
 * screen-reader user hears what the button does, not just "read aloud".
 */
export function ReadAloudButton({
  text,
  lang,
  label,
}: {
  text: string;
  lang: string;
  label: string;
}) {
  const { supported, speaking, toggle } = useReadAloud(text, lang);
  const { hydrated } = useUser();

  // The server and the first client render must agree, so nothing window-
  // dependent is drawn until after hydration. Then we either get the control
  // or an honest explanation.
  if (!hydrated) return null;

  if (!supported) {
    return (
      <span className="muted text-xs" title="Read aloud unavailable">
        Read aloud needs your browser&apos;s speech support, which is not
        available here.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        speaking
          ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
          : "border-[color:var(--line-strong)] hover:border-[color:var(--gold)]"
      }`}
    >
      <span aria-hidden="true">{speaking ? "■" : "🔊"}</span>
      {speaking ? `Stop reading ${label}` : `Read ${label} aloud`}
    </button>
  );
}
