import Link from "next/link";
import { getAngas, getScriptureManifest, getTranslations } from "@/lib/content";
import {
  Card, Chip, Notice, OrnamentRule, PageHeader, SectionHeading, Stat, VerificationBadge,
} from "@/components/ui";
import { Mandala, OmMark } from "@/components/ornament";

export const metadata = { title: "Durga Saptashati" };

const CHARITRA_ORDER = ["prathama", "madhyama", "uttama"] as const;
const CHARITRA_NOTE: Record<string, string> = {
  prathama: "Presided over by Mahakali. The Madhu-Kaitabha narrative.",
  madhyama: "Presided over by Mahalakshmi. The Mahishasura narrative and the gods' hymn.",
  uttama: "Presided over by Mahasaraswati. Shumbha-Nishumbha, the great hymns, and the closing boons.",
};

export default function ScriptureIndex() {
  const manifest = getScriptureManifest();
  const angas = getAngas();
  const translations = getTranslations();
  const byCharitra = (c: string) => manifest.chapters.filter((x) => x.charitra === c);

  return (
    <>
      <PageHeader eyebrow="Scripture" title={manifest.titleEnglish}
                  sub={`${manifest.titleSanskrit} · ${manifest.titleIast}`}>
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge status="verified" />
          <Chip tone="gold">{manifest.traditionalVerseTotal} verses</Chip>
          <Chip>13 chapters</Chip>
          <Chip>{angas.length} auxiliary recitations</Chip>
        </div>
      </PageHeader>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Chapters" value="13" hint="Markandeya Purana 81–93" />
        <Stat label="Verse units" value={String(manifest.verseUnitTotal)}
              hint="As numbered in the edition" />
        <Stat label="Traditional count" value={String(manifest.traditionalVerseTotal)}
              hint="Matches the source colophon" />
        <Stat label="English" value={String(Object.keys(translations).length)}
              hint="Chapters with a translation" />
      </div>

      <Notice tone="caution" title="What is and is not here">
        <p>
          <strong>Complete:</strong> all 13 chapters in Devanagari and IAST, from an identified
          edition, with verse numbering verified for continuity and a total that reconciles exactly
          with the count stated in the source&rsquo;s own colophon (700).
        </p>
        <p className="mt-2">
          <strong>Chapter-level only:</strong> the English translation. It is Pargiter (1904),
          public domain, from an uncorrected OCR witness. Verse-level alignment is not offered
          because the witness&rsquo;s verse numbers are corrupt. Canto XCIII is truncated in that
          witness, so chapter 13&rsquo;s English is partial.
        </p>
        <p className="mt-2">
          <strong>Not here:</strong> Hindi, Telugu and Bengali verse translations, word-by-word
          glosses for every verse, and audio. Each is a documented import, not a gap to be filled
          by generating text. See <a href="/sources" className="link-underline">Sources</a>.
        </p>
      </Notice>

      {/* front matter */}
      {manifest.preludeDevanagari.length > 0 && (
        <section className="mt-10" aria-labelledby="front">
          <SectionHeading eyebrow="Front matter" title="Invocation" />
          <h2 id="front" className="sr-only">Invocation</h2>
          <Card className="p-6">
            <div className="verse-deva space-y-1">
              {manifest.preludeDevanagari.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <p className="muted mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--line)" }}>
              From the head of the imported edition. The Chandika Dhyana that follows these lines is
              available separately under{" "}
              <Link href="/scripture/angas/chandika-dhyana" className="link-underline">
                auxiliary recitations
              </Link>.
            </p>
          </Card>
        </section>
      )}

      {/* chapter index */}
      <section className="mt-10" aria-labelledby="toc">
        <SectionHeading eyebrow="Navigation index" title="The thirteen chapters"
                        sub="This index navigates the text. It is not a substitute for it — every chapter opens the complete verses." />
        <h2 id="toc" className="sr-only">Chapter index</h2>

        {CHARITRA_ORDER.map((c) => {
          const list = byCharitra(c);
          if (!list.length) return null;
          return (
            <div key={c} className="mb-8">
              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <h3 className="display text-xl font-semibold">{list[0].charitraLabel}</h3>
                <p className="muted text-sm">{CHARITRA_NOTE[c]}</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((ch) => {
                  const hasTr = Boolean(translations[ch.number]);
                  return (
                    <li key={ch.id}>
                      <Link href={`/scripture/${ch.number}`}
                            className="card flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="chip" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                            Chapter {ch.number}
                          </span>
                          <span className="muted font-mono text-xs">
                            {ch.traditionalVerseCount} verses
                          </span>
                        </div>
                        <p className="deva text-lg font-semibold leading-snug">{ch.titleSanskrit}</p>
                        <p className="muted mt-1 text-xs italic">{ch.titleIast}</p>
                        <p className="mt-2 flex-1 text-sm font-medium">{ch.titleEnglish}</p>
                        <p className="muted mt-3 border-t pt-2.5 text-xs"
                           style={{ borderColor: "var(--line)" }}>
                          Markandeya Purana {ch.markandeyaPuranaChapter} · {ch.presidingDeity}
                          {hasTr && <> · English available</>}
                          {!hasTr && <> · English incomplete in the witness</>}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <OrnamentRule className="my-10" />

      {/* angas */}
      <section aria-labelledby="angas">
        <SectionHeading eyebrow="Angas" title="Auxiliary recitations"
                        sub="Recited before and after the main path. Sequences differ by lineage; the order shown is the common Navangam order and is not imposed as the only one." />
        <h2 id="angas" className="sr-only">Auxiliary recitations</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {angas.map((a) => (
            <li key={a.slug}>
              <Link href={`/scripture/angas/${a.slug}`} className="card block h-full p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="chip">{a.kind === "purvanga" ? "Purvanga" : "Uttaranga"}</span>
                  <span className="muted font-mono text-xs">{a.verseUnitCount} verses</span>
                </div>
                <p className="deva text-lg font-semibold">{a.titleSanskrit}</p>
                <p className="mt-0.5 text-sm font-medium">{a.titleEnglish}</p>
                <p className="muted mt-2 text-xs leading-relaxed">{a.note}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* plans + provenance */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-3">
            <OmMark className="h-8 w-8" />
            <h2 className="display text-xl font-semibold">Reading plans</h2>
          </div>
          <p className="muted text-sm leading-relaxed">
            A nine-day plan (one charitra per day), a thirteen-day plan (one chapter per day), and a
            slower study schedule. Progress is tracked for your own use and means nothing about
            merit.
          </p>
          <Link href="/scripture/plans" className="btn btn-primary mt-4">Choose a plan</Link>
        </Card>
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-3">
            <Mandala className="h-8 w-8" petals={12} stroke="var(--gold)" opacity={0.8} />
            <h2 className="display text-xl font-semibold">Edition and provenance</h2>
          </div>
          <p className="muted text-sm leading-relaxed">
            Sanskrit text from an identified transcription, proofread by named scholars; Devanagari
            and IAST derived mechanically from it. Full details, including the licence caveat, are
            in the source registry.
          </p>
          <Link href="/sources" className="btn btn-ghost mt-4">Source registry</Link>
        </Card>
      </div>
    </>
  );
}
