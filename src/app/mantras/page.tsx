import Link from "next/link";
import { getMantraCollection, getMantras } from "@/lib/content";
import { Card, Chip, Notice, PageHeader, SectionHeading, Stat } from "@/components/ui";
import { AudioPlayer } from "@/components/interactive";

export const metadata = { title: "Mantra Library" };

const STATUS_LABEL: Record<string, string> = {
  verified: "Verified against the imported edition",
  "verified-traditional": "Traditional text, widely attested",
  "not-included": "Text deliberately not included",
};

export default function MantraIndex() {
  const col = getMantraCollection();
  const mantras = getMantras();
  const withText = mantras.filter((m) => m.textStatus !== "not-included");
  const excluded = mantras.filter((m) => m.textStatus === "not-included");

  return (
    <>
      <PageHeader eyebrow="Recitation" title={col.title} sub={col.intro} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Texts listed" value={String(mantras.length)} />
        <Stat label="Text present" value={String(withText.length)} />
        <Stat label="With licensed audio" value="0" hint="None bundled" />
        <Stat label="Deliberately excluded" value={String(excluded.length)}
              hint="Named, not fabricated" />
      </div>

      <Notice tone="caution" title="Two things this page will not do">
        <p>
          <strong>It will not invent a verse.</strong> Where a well-known stotra has no verified
          public-domain source in this project&rsquo;s collection, it is listed with an explicit
          reason rather than transcribed from recollection. A mantra reproduced from memory and
          presented as scripture is a worse outcome than a gap.
        </p>
        <p className="mt-2">
          <strong>It will not play unlicensed audio.</strong> Devotional recordings are copyright
          works. The player is fully built and works; it simply has no file to play until a
          licensed track is added with its licence recorded.
        </p>
      </Notice>

      {col.editorialNote && (
        <Notice tone="info" title="Editorial note">{col.editorialNote}</Notice>
      )}

      <ul className="mt-8 space-y-4">
        {mantras.map((m) => (
          <li key={m.slug}>
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Chip tone="gold">{m.category}</Chip>
                    <Chip tone={m.textStatus === "not-included" ? "crimson" : "muted"}>
                      {STATUS_LABEL[m.textStatus] ?? m.textStatus}
                    </Chip>
                  </div>
                  <h2 className="display text-xl font-semibold">{m.title}</h2>
                  <p className="muted mt-1 text-xs">{m.attribution}</p>
                </div>
                <Link href={`/mantras/${m.slug}`} className="btn btn-ghost !px-3 !py-1.5 text-xs shrink-0">
                  Open
                </Link>
              </div>

              <div className="mt-4 rounded-xl border p-4"
                   style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
                <p className="verse-deva whitespace-pre-line">{m.deva}</p>
                <p className="verse-iast mt-2">{m.iast}</p>
              </div>

              <p className="muted mt-3 text-sm leading-relaxed">{m.meaning}</p>

              {m.textStatus === "not-included" && (
                <Notice tone="caution" title="Why the full text is not here">
                  The heading above is the name of the text, not its content. The full text has not
                  been imported from a verified public-domain source, so it is not reproduced. See
                  the individual page for the reason.
                </Notice>
              )}

              {m.fullTextRef && (
                <Link href={m.fullTextRef} className="link-underline mt-3 inline-block text-sm">
                  Read the full text
                </Link>
              )}
            </Card>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="audio">
        <SectionHeading eyebrow="Listening" title="Audio" />
        <h2 id="audio" className="sr-only">Audio</h2>
        <AudioPlayer track={{ url: null, title: "Mantra library", licence: "No licensed track configured" }} />
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="Recited with the path" title="The angas, in full" />
        <p className="muted mb-4 text-sm">
          The kavacham, argala, kilaka, dhyana, suktam and kshamapana are all imported and readable
          verse by verse.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["/scripture/angas/devi-kavacham", "Devi Kavacham"],
            ["/scripture/angas/argala-stotram", "Argala Stotram"],
            ["/scripture/angas/kilaka-stotram", "Kilaka Stotram"],
            ["/scripture/angas/devi-suktam", "Devi Suktam"],
            ["/scripture/angas/aparadha-kshamapana", "Aparadha Kshamapana"],
            ["/scripture/angas/chandika-dhyana", "Chandika Dhyana"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="card block p-4 text-sm hover:underline">{label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
