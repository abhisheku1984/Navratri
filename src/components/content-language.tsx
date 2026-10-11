"use client";

/**
 * Content-language honesty.
 *
 * The interface is translated into 24 languages; the *content* — chapter
 * stories, the knowledge base, the witnessed English translation — is not
 * available in all of them. The rule this module enforces is that a page never
 * leaves a reader to work out which language they are actually reading in.
 *
 * Two things are always stated, in the reader's own language where the
 * dictionary can say it and in English otherwise:
 *
 *  1. what language the main text on this page is in, and
 *  2. which languages that text *does* exist in — with a one-click switch when
 *     a language the reader might want is available.
 *
 * Nothing here claims a translation exists when it does not: `available` is a
 * list a caller has to prove, and it is rendered verbatim.
 */
import { useUser } from "@/lib/user";
import { t, getLanguage, type LangCode } from "@/lib/i18n";
import { Card } from "@/components/ui";

/** One-click language switch, used to offer an available alternative. */
export function SwitchTo({
  lang,
  label,
  className = "chip",
}: {
  lang: LangCode;
  label?: string;
  className?: string;
}) {
  const { setSettings } = useUser();
  const def = getLanguage(lang);
  return (
    <button type="button" className={className} onClick={() => setSettings({ language: lang })}>
      {label ?? def.native}
    </button>
  );
}

export interface ContentAvailabilityProps {
  /**
   * Languages in which this page's main text actually exists. Must be verified
   * by the caller — this component renders the list as fact.
   */
  available: LangCode[];
  /** The language the page is rendering that text in right now. */
  rendering: LangCode;
  /** Short description of the text, e.g. "the chapter story". */
  what: string;
  /** Optional: extra sentence, already in the reader's language. */
  note?: string;
  /**
   * What *does* exist in other languages, stated in those languages. Used so a
   * reader whose language is missing here is pointed at the pages that do have
   * a rendering, rather than being left with a bare "not available".
   */
  altNotes?: { lang: LangCode; text: string; href?: string }[];
  className?: string;
}

export function ContentAvailability({
  available,
  rendering,
  what,
  note,
  altNotes = [],
  className = "",
}: ContentAvailabilityProps) {
  const { state } = useUser();
  const requested = state.settings.language as LangCode;
  const reqDef = getLanguage(requested);
  const shownDef = getLanguage(rendering);

  const isRequested = rendering === requested;
  const others = available.filter((l) => l !== requested);

  return (
    <Card className={`p-4 ${className}`}>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span
          aria-hidden
          style={{ color: isRequested ? "#2f855a" : "var(--gold)" }}
        >
          {isRequested ? "●" : "◐"}
        </span>
        {isRequested ? (
          <span>
            {t(requested, "status.available")}: {what} — <strong>{reqDef.native}</strong>
            {reqDef.code !== "en" ? ` · ${reqDef.label}` : ""}
          </span>
        ) : (
          <span>
            {t(requested, "status.unavailable")}: {what} — {reqDef.native}.{" "}
            {t(requested, "audio.translationMissing", { language: reqDef.native })}
          </span>
        )}
      </p>

      <p className="muted mt-2 text-xs leading-relaxed">
        {t(requested, "lib.availableIn")}: {available.map((l) => getLanguage(l).native).join(" · ")}
        {rendering !== "en" && !isRequested && ` — showing ${shownDef.native}`}
      </p>

      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="muted text-xs">{t(requested, "set.languageSection")}:</span>
          {others.map((l) => (
            <SwitchTo key={l} lang={l} />
          ))}
        </div>
      )}

      <p className="muted mt-2 text-[0.68rem] leading-relaxed">
        {t(requested, "audio.languageNote")}
      </p>
      {note && <p className="muted mt-2 text-xs leading-relaxed">{note}</p>}

      {altNotes.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          {altNotes.map((a) => {
            const def = getLanguage(a.lang);
            return (
              <li
                key={a.lang}
                className="text-xs leading-relaxed"
                style={{ fontFamily: def.fontStack }}
                dir={def.dir}
              >
                {a.text}
                {a.href && (
                  <>
                    {" "}
                    <a href={a.href} className="link-underline">
                      {def.native} →
                    </a>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/**
 * The English-witness disclosure, used on the scripture reader.
 *
 * The imported translation is Pargiter (1904) and exists in English only. That
 * is a fact about the edition, not a missing feature, and the reader is told
 * which it is.
 */
export function EnglishWitnessNote({ className = "" }: { className?: string }) {
  const { state } = useUser();
  const lang = state.settings.language as LangCode;
  const def = getLanguage(lang);
  return (
    <p className={`muted text-xs leading-relaxed ${className}`}>
      <strong>{lang === "hi" ? "अंग्रेज़ी अनुवाद" : "English translation"}</strong>
      {" — "}
      {lang === "hi"
        ? "इस संस्करण के साथ आया अनुवाद केवल अंग्रेज़ी में है (एफ. ई. पार्जिटर, 1904, सार्वजनिक क्षेत्र)। "
          + "अतः यह पाठ अंग्रेज़ी में दिखाया जा रहा है; यह ऐप इसे हिन्दी में बदलकर प्रस्तुत नहीं करता। "
          + "हिन्दी कथा और वाचन ऊपर उपलब्ध हैं।"
        : `The translation that accompanies this edition is English only (F. E. Pargiter, 1904, `
          + `public domain). It is therefore shown in English and is not machine-rendered into `
          + `${def.native}: the app says what it has rather than inventing a rendering of a `
          + `published translation.`}
    </p>
  );
}
