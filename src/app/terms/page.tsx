import Link from "next/link";
import { Card, Notice, PageHeader } from "@/components/ui";

export const metadata = { title: "Terms & Attribution" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms &amp; attribution"
                  sub="What you may do with this app, and what belongs to whom." />

      <Notice tone="info" title="Copyright at a glance">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Public domain:</strong> the Markandeya Purana Sanskrit, and F. Eden Pargiter&rsquo;s
            1904 English translation.
          </li>
          <li>
            <strong>Attribution required:</strong> the specific scholarly transcription of the
            Sanskrit used here, whose editorial credits belong to the named proofreaders. Its
            source file restricts commercial reuse and redistribution without permission.
          </li>
          <li>
            <strong>Original to this app:</strong> the editorial summaries, retellings, glossary
            definitions, quiz questions, interface text and the generated ornament artwork.
          </li>
          <li>
            <strong>Not included:</strong> any copyrighted audio recording, artwork, or modern
            composition. None is bundled, and none may be added without a licence recorded in the
            source registry.
          </li>
        </ul>
      </Notice>

      <section className="mt-8" aria-labelledby="use">
        <h2 id="use" className="display mb-3 text-2xl font-semibold">Permitted use</h2>
        <Card className="p-6">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>Personal, devotional and study use, without restriction.</li>
            <li>Reading aloud at home, in a temple or in a community gathering.</li>
            <li>Sharing the greeting cards this app generates, which set verified verse text in real type.</li>
            <li>Quoting scripture and the public-domain translation with attribution.</li>
            <li>Studying, modifying and redistributing the application code under its own licence.</li>
          </ul>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="not-permitted">
        <h2 id="not-permitted" className="display mb-3 text-2xl font-semibold">
          Not permitted without permission
        </h2>
        <Card className="p-6">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Commercial redistribution of the Sanskrit transcription in the form supplied here,
              which the source file expressly restricts.
            </li>
            <li>
              Presenting any editorial translation, retelling or commentary in this app as scripture
              or as an ancient text. They are labelled, and the labels must not be removed.
            </li>
            <li>
              Stripping source attributions or verification badges from content taken from here.
            </li>
            <li>
              Adding copyrighted audio or artwork and presenting it as part of this collection.
            </li>
          </ul>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="religious">
        <h2 id="religious" className="display mb-3 text-2xl font-semibold">
          Religious sensitivity
        </h2>
        <Card className="p-6">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              No claim here guarantees a blessing, a cure, prosperity or any supernatural outcome.
              Nothing in this app should be read as promising one.
            </li>
            <li>
              No tradition is ranked above another. Regional practice is described, not judged.
            </li>
            <li>
              Where scholars, texts or lineages disagree, the disagreement is shown. This app does
              not resolve it and does not claim the authority to.
            </li>
            <li>
              Imagery is decorative and geometric. No depiction of a deity is presented as an object
              of worship, and none is generated to resemble a specific consecrated image.
            </li>
            <li>
              Ritual guidance is descriptive. It does not replace a priest, a lineage, or a
              qualified teacher, and it should never be followed against medical advice.
            </li>
          </ul>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="disclaimer">
        <h2 id="disclaimer" className="display mb-3 text-2xl font-semibold">Disclaimer</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            This application is provided as a study and devotional aid. It is not an authority on
            scripture, ritual, law or medicine. Editorial content has not been reviewed by a Sanskrit
            scholar or by any temple. Dates are computed from an approximate astronomical model and
            can differ from a published panchang. Coordinates are approximate and are not a
            substitute for local directions.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Nothing here creates a relationship of spiritual guidance between this app and its
            reader. For questions of doctrine, ritual correctness or personal practice, consult a
            qualified scholar, your lineage, or your local temple. For questions of health —
            including fasting — consult a doctor.
          </p>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="report">
        <h2 id="report" className="display mb-3 text-2xl font-semibold">
          Takedown and correction
        </h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            If you hold rights in anything included here, or you have found a factual or textual
            error, use the report form. Corrections to scripture are treated as urgent, because a
            wrong verse is worse than a missing one.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/report-error" className="btn btn-primary">Report an error</Link>
            <Link href="/sources" className="btn btn-ghost">Source registry</Link>
          </div>
        </Card>
      </section>

      <p className="muted mt-6 text-xs leading-relaxed">
        These terms are a template describing the project as it stands. Whoever deploys it publicly
        must review them, confirm the licence situation for every source actually bundled, and add
        their own contact details and effective date.
      </p>
    </>
  );
}
