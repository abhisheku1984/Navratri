import Link from "next/link";
import { getSourceCollection, getSources, getScriptureManifest, getTranslationManifest } from "@/lib/content";
import { Card, Chip, Notice, PageHeader, SectionHeading, Stat, VerificationBadge } from "@/components/ui";
import { Mandala } from "@/components/ornament";
import type { VerificationStatus } from "@/lib/types";

export const metadata = { title: "Sources & Verification" };

/**
 * `status` is free text in the content file, so it is narrowed to a known badge
 * value here. Anything unrecognised is displayed verbatim rather than silently
 * upgraded to a stronger claim.
 */
const KNOWN: VerificationStatus[] = [
  "verified", "verified-with-caveats", "partially-verified",
  "tradition-recorded", "awaiting-verification", "awaiting-review",
];
function badgeFor(status: string): VerificationStatus | null {
  return (KNOWN as string[]).includes(status) ? (status as VerificationStatus) : null;
}

export default function SourcesPage() {
  const col = getSourceCollection();
  const sources = getSources();
  const manifest = getScriptureManifest();
  const trManifest = getTranslationManifest();
  const src = manifest.source;

  return (
    <>
      <PageHeader eyebrow="Provenance" title={col.title} sub={col.intro} />

      <Notice tone="info" title="The verification model">
        <p>
          Each source carries a status. They mean:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>verified</strong> — checked against the named edition by a script or a person.</li>
          <li><strong>partially-verified</strong> — the record is sound in part; the rest is flagged.</li>
          <li><strong>awaiting-verification</strong> — plausible, but not yet checked against a primary source.</li>
        </ul>
        <p className="mt-2">
          Nothing in this app has been reviewed by a Sanskrit scholar or by any temple. Where that
          matters — a contested Peetha identification, a disputed reading — the disagreement is
          shown rather than resolved.
        </p>
      </Notice>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sources recorded" value={String(sources.length)} />
        <Stat label="Verified" value={String(sources.filter((s) => s.status === "verified").length)} />
        <Stat label="Awaiting verification"
              value={String(sources.filter((s) => s.status.startsWith("awaiting")).length)} />
        <Stat label="Kinds" value={String(new Set(sources.map((s) => s.kind)).size)}
              hint={Array.from(new Set(sources.map((s) => s.kind))).join(" · ")} />
      </div>

      <section className="mt-10" aria-labelledby="list">
        <SectionHeading eyebrow="Registry" title="Every source" />
        <h2 id="list" className="sr-only">Every source</h2>
        <ul className="space-y-3">
          {sources.map((s) => {
            const badge = badgeFor(s.status);
            return (
              <li key={s.id}>
                <Card className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Chip tone="gold">{s.kind}</Chip>
                        {badge
                          ? <VerificationBadge status={badge} />
                          : <Chip tone="muted">{s.status}</Chip>}
                      </div>
                      <h2 className="display text-lg font-semibold">{s.title}</h2>
                    </div>
                  </div>

                  {s.provenance && (
                    <p className="muted mt-1 text-sm">{s.provenance}</p>
                  )}

                  {(s.author || s.published) && (
                    <p className="muted mt-1 text-sm">
                      {s.author}{s.author && s.published ? " · " : ""}{s.published}
                    </p>
                  )}

                  {s.people && (s.people.transcribers.length > 0 || s.people.proofreaders.length > 0) && (
                    <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      {s.people.transcribers.length > 0 && (
                        <div>
                          <dt className="muted text-[0.68rem] uppercase tracking-[0.14em]">
                            Transcribed by
                          </dt>
                          <dd>{s.people.transcribers.join(", ")}</dd>
                        </div>
                      )}
                      {s.people.proofreaders.length > 0 && (
                        <div>
                          <dt className="muted text-[0.68rem] uppercase tracking-[0.14em]">
                            Proofread by
                          </dt>
                          <dd>{s.people.proofreaders.join(", ")}</dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {s.editionNote && (
                    <p className="muted mt-3 text-sm"><strong>Edition: </strong>{s.editionNote}</p>
                  )}

                  {s.digitalCopy && (
                    <p className="muted mt-3 text-sm">
                      <strong>Digital copy: </strong>{s.digitalCopy}
                    </p>
                  )}

                  {s.localCopy && (
                    <p className="mt-2 text-sm">
                      <strong>Local copy: </strong>
                      <code className="rounded px-1 text-xs"
                            style={{ background: "var(--surface-3)" }}>{s.localCopy}</code>
                    </p>
                  )}

                  {s.derived && (
                    <p className="muted mt-3 text-sm leading-relaxed">
                      <strong>How it was used: </strong>{s.derived}
                    </p>
                  )}

                  {s.caveats && s.caveats.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                      {s.caveats.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  )}

                  {s.licence && (
                    <div className="mt-3 rounded-lg border p-3"
                         style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
                      <p className="muted mb-1 text-[0.68rem] uppercase tracking-[0.14em]">Licence</p>
                      <p className="text-sm leading-relaxed">{s.licence}</p>
                    </div>
                  )}

                  {s.verification && (
                    <p className="muted mt-3 text-xs leading-relaxed">
                      <strong>Verification: </strong>{s.verification}
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="scripture-prov">
        <SectionHeading eyebrow="Scripture" title="How the Sanskrit text was prepared" />
        <h2 id="scripture-prov" className="sr-only">How the Sanskrit text was prepared</h2>
        <Card className="p-6">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              The source is a scholarly transcription in ITRANS, proofread by named scholars, with
              the underlying Markandeya Purana Sanskrit in the public domain.
            </li>
            <li>
              {src.derivedRendering ||
                "An import script converts it mechanically to Devanagari and to standard IAST."}{" "}
              No text was typed by hand and no verse was reconstructed from memory.
            </li>
            <li>
              Verse ranges such as <code className="rounded px-1" style={{ background: "var(--surface-3)" }}>5.14–16</code>{" "}
              are expanded to one record per traditional verse, so verse numbering stays continuous.
            </li>
            <li>
              A verification script checks chapter count, verse-label continuity, the absence of
              gaps, and the traditional total against the count stated in the source&rsquo;s own
              colophon. It exits non-zero on any failure.
            </li>
          </ol>

          <dl className="mt-5 grid gap-x-6 gap-y-2 border-t pt-5 text-sm sm:grid-cols-2"
              style={{ borderColor: "var(--line)" }}>
            <div className="flex gap-2"><dt className="muted shrink-0">Chapters:</dt><dd>{manifest.chapters.length}</dd></div>
            <div className="flex gap-2"><dt className="muted shrink-0">Verse units:</dt><dd>{manifest.verseUnitTotal}</dd></div>
            <div className="flex gap-2"><dt className="muted shrink-0">Traditional verses:</dt><dd>{manifest.traditionalVerseTotal}</dd></div>
            <div className="flex gap-2"><dt className="muted shrink-0">Colophon says:</dt><dd>700</dd></div>
          </dl>

          {src.proofreaders.length > 0 && (
            <p className="muted mt-3 text-xs">
              Proofread by {src.proofreaders.join(", ")}. {src.editionNote}
            </p>
          )}

          <Notice tone="caution" title="The licence caveat that must be honoured">
            <p>
              The source transcription carries a restriction on commercial reuse and
              redistribution. That restriction is recorded in the registry above and must be
              respected before this text is deployed commercially. The underlying Purana text is
              public domain; this particular transcription&rsquo;s editorial credits belong to the
              named scholars.
            </p>
          </Notice>
        </Card>
      </section>

      {trManifest && (
        <section className="mt-10" aria-labelledby="tr-prov">
          <SectionHeading eyebrow="Translation" title="How the English was prepared" />
          <h2 id="tr-prov" className="sr-only">How the English was prepared</h2>
          <Card className="p-6">
            <p className="text-sm font-semibold">{trManifest.title}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><dt className="muted shrink-0">Language:</dt><dd>{trManifest.language}</dd></div>
              <div className="flex gap-2"><dt className="muted shrink-0">Copyright:</dt><dd>{trManifest.copyrightStatus}</dd></div>
              <div className="flex gap-2"><dt className="muted shrink-0">Granularity:</dt><dd>{trManifest.granularity}</dd></div>
              <div className="flex gap-2">
                <dt className="muted shrink-0">Verse alignment:</dt>
                <dd>{trManifest.verseAlignment ?? "none — deliberate"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="muted shrink-0">OCR:</dt>
                <dd>{trManifest.ocrUncorrected ? "uncorrected" : "corrected"}</dd>
              </div>
            </dl>

            <ul className="muted mt-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {trManifest.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {trManifest.chapters.map((c) => (
                <Link key={c.chapter} href={`/scripture/${c.chapter}`} className="chip hover:underline">
                  Ch {c.chapter}: {c.paragraphs} ¶
                  {c.status !== "imported" && " ⚠"}
                </Link>
              ))}
            </div>

            <Notice tone="caution" title="Why there is no verse-level English">
              The OCR witness&rsquo;s verse numbers are corrupt and chapter numbering is damaged in
              places. Aligning prose paragraphs to Sanskrit verses on that evidence would produce a
              correspondence nobody can check. The app offers chapter-level translation and says so
              plainly. No machine translation is ever applied to sacred text.
            </Notice>
          </Card>
        </section>
      )}

      <section className="mt-10" aria-labelledby="panchang-prov">
        <SectionHeading eyebrow="Calendar" title="How festival dates are computed" />
        <h2 id="panchang-prov" className="sr-only">How festival dates are computed</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            Solar and lunar positions come from low-precision series (Meeus). Sunrise is computed
            for the selected latitude and longitude. The tithi is evaluated at sunrise, and the
            first civil day whose sunrise tithi is Shukla Pratipada inside the season&rsquo;s
            window becomes day one. Vijayadashami is fixed by tithi, never by counting days.
          </p>
          <p className="muted mt-3 text-xs leading-relaxed">
            The series are accurate to better than a tenth of a degree. That is enough for a tithi
            boundary in most cases but not enough to guarantee agreement with a published panchang
            on a borderline day. Where observance depends on an exact boundary, follow a temple or
            family panchang.
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-3">
            <Mandala className="h-8 w-8 opacity-60" petals={12} stroke="var(--gold)" />
            <h2 className="display text-xl font-semibold">If you find an error</h2>
          </div>
          <p className="muted text-sm leading-relaxed">
            Especially in the scripture. A wrong verse is worse than a missing one, and a correction
            that cannot be sourced results in removal rather than a caveat.
          </p>
          <Link href="/report-error" className="btn btn-primary mt-4">Report it</Link>
        </Card>
      </section>
    </>
  );
}
