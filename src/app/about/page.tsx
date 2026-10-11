import Link from "next/link";
import { Card, Notice, PageHeader, SectionHeading } from "@/components/ui";
import { Diya, Lotus, Mandala, Trident } from "@/components/ornament";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="Navratri — The Divine Shakti"
                  sub="A digital library and pilgrimage companion for Maa Durga: the complete Durga Saptashati, the nine Navadurga forms, the sacred geography of the Shakti Peethas, and a festival calendar computed for your own city." />

      <div className="relative mb-10 overflow-hidden rounded-3xl border p-10 text-center"
           style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
        <Mandala className="absolute -left-20 -top-20 h-72 w-72 opacity-[0.08]" petals={24} stroke="var(--gold)" spin />
        <Mandala className="absolute -bottom-24 -right-20 h-72 w-72 opacity-[0.08]" petals={24} stroke="var(--maroon-300)" spin />
        <div className="relative mx-auto flex items-end justify-center gap-5">
          <Diya className="h-10 w-14" />
          <Trident className="h-14 w-14" />
          <Diya className="h-10 w-14" />
        </div>
        <p className="deva relative mt-5 text-3xl font-semibold">जय माता दी</p>
        <p className="muted relative mt-2">Discover Maa Durga. Explore Sacred Scriptures. Experience the Power of Shakti.</p>
      </div>

      <section aria-labelledby="what">
        <h2 id="what" className="display mb-3 text-2xl font-semibold">What this is</h2>
        <p className="leading-[1.9]">
          A reading and pilgrimage companion. It holds the Durga Saptashati in full — thirteen
          chapters, imported from an identified edition and checked against that edition&rsquo;s own
          colophon — together with the nine Navadurga forms, a directory of the Shakti Peethas that
          keeps the traditions&rsquo; disagreements rather than flattening them, a temple directory,
          puja guides, stories for children, and a festival calendar computed from sunrise at the
          location you choose.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="principles">
        <SectionHeading eyebrow="Principles" title="How it was built" />
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            ["Nothing is fabricated",
             "No verse, mantra, translation, chapter name, coordinate, darshan time or historical claim has been invented. Where a source does not exist in the project's collection, the gap is named instead of filled."],
            ["Disagreement is preserved",
             "The Peetha lists conflict. Identifications are contested. Colour and offering vary by region. Each record shows the variation and names the source rather than choosing one and hiding the rest."],
            ["Provenance is attached",
             "Every significant record carries a source, an edition where there is one, a verification status, and — where a review has happened — a reviewer and a date."],
            ["Dates are computed, never hard-coded",
             "Festival dates come from sunrise and the tithi at your latitude and longitude, with the method and its accuracy stated. No universal muhurat is published, because there is no such thing."],
            ["Your data stays with you",
             "There is no account. Bookmarks, progress, journal entries and settings live in this browser under one local-storage key."],
            ["Progress is not merit",
             "The tracker records which verses you opened. It is a bookmark, not a spiritual score, and the app never presents it as one."],
          ].map(([t, b]) => (
            <li key={t}>
              <Card className="h-full p-5">
                <p className="display text-lg font-semibold">{t}</p>
                <p className="muted mt-2 text-sm leading-relaxed">{b}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="not">
        <h2 id="not" className="display mb-3 text-2xl font-semibold">What this is not</h2>
        <Notice tone="caution" title="Read this before you rely on it">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>It is not an authority on ritual. Follow your family, your lineage and your temple.</li>
            <li>It does not publish darshan timings, and will not until they are verified with each temple.</li>
            <li>It does not guarantee any outcome, blessing, cure or prosperity. Nothing here promises one.</li>
            <li>It does not settle sectarian questions or rank traditions against each other.</li>
            <li>It is not a substitute for a qualified scholar, a priest, or a doctor where health is involved.</li>
          </ul>
        </Notice>
      </section>

      <section className="mt-10" aria-labelledby="tech">
        <h2 id="tech" className="display mb-3 text-2xl font-semibold">How it is built</h2>
        <Card className="p-6">
          <p className="leading-relaxed">
            Next.js with TypeScript and Tailwind. Scripture is stored as structured data — verses,
            labels, ranges and charitra assignments — not as hard-coded page markup, so it can be
            searched, cited and re-typeset. All content is reached through a single data-access
            layer, which means a database can replace the shipped JSON without touching a single
            component. Festival dates are computed in the browser from astronomical series rather
            than looked up.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/sources" className="btn btn-ghost">Sources &amp; verification</Link>
            <Link href="/accessibility" className="btn btn-ghost">Accessibility</Link>
            <Link href="/privacy" className="btn btn-ghost">Privacy</Link>
            <Link href="/terms" className="btn btn-ghost">Terms &amp; attribution</Link>
            <Link href="/report-error" className="btn btn-ghost">Report an error</Link>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <Card className="p-8 text-center">
          <Lotus className="mx-auto h-8 w-20" stroke="var(--gold)" />
          <p className="deva mt-4 text-xl font-semibold">
            या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता
          </p>
          <p className="verse-iast mt-1 text-sm">yā devī sarvabhūteṣu śaktirūpeṇa saṁsthitā</p>
          <p className="muted mt-3 text-xs">Durga Saptashati 5.14 — imported and verified</p>
        </Card>
      </section>
    </>
  );
}
