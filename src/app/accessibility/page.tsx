import Link from "next/link";
import { Card, Notice, PageHeader } from "@/components/ui";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader eyebrow="Access" title="Accessibility"
                  sub="A text you read for years should be readable by anyone. This page states what is supported, and — just as importantly — what is not yet." />

      <section aria-labelledby="supported">
        <h2 id="supported" className="display mb-3 text-2xl font-semibold">Supported</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Screen readers",
             "Every page has a single h1 and a logical heading order. Landmarks (banner, navigation, main, contentinfo) are present. Decorative ornament is aria-hidden. Reading progress is announced through a live region rather than a visual bar alone."],
            ["Keyboard navigation",
             "Every control is reachable and operable by keyboard. Focus order follows reading order. The global search opens with / and closes with Escape. Map markers are reachable, and a full text list of every site sits beside each map."],
            ["Visible focus",
             "Focus rings are always drawn and never removed. The focus colour is chosen against both light and dark themes."],
            ["Contrast",
             "Body text meets 4.5:1 against its background in both themes. A high-contrast mode deepens text colour further and removes the decorative background wash."],
            ["Reduced motion",
             "Honours prefers-reduced-motion automatically and offers an explicit toggle. Turning it on stops the mandala spin, the diya flicker and the floating particles, and disables page-transition fades."],
            ["Text size and spacing",
             "Verse size (0.85×–1.8×) and line spacing (0.85×–1.8×) are adjustable independently, plus a whole-page text scale. Settings persist across chapters and reloads."],
            ["Script choice",
             "Devanagari only, IAST only, or both — so a reader who cannot read Devanagari is not locked out of the scripture, and a reader who can is not forced to look at Latin."],
            ["Reading themes",
             "Day and night themes, with a follow-the-system option. The night theme is tuned for long reading rather than being an inverted day theme."],
            ["Low bandwidth",
             "Low-data mode skips map tiles and defers the Leaflet library. Text, scripture and search — the things that matter — work without it. Ornament is inline SVG and CSS, so there is no decorative image download at all."],
            ["Offline reading",
             "The whole corpus ships in the page bundle, so a loaded page keeps working without a network. Scripture you have already opened does not need a connection to be read again."],
            ["Captions and transcripts",
             "There is no audio or video in this build, so there is nothing uncaptioned. When licensed audio is added, a synchronised transcript must ship with it."],
            ["Language",
             "The interface offers Hindi, English and Sanskrit with transliteration, plus Telugu and Bengali at partial coverage. Coverage is shown honestly rather than behind a switch that pretends."],
          ].map(([t, b]) => (
            <Card key={t} className="p-5">
              <p className="display text-lg font-semibold">{t}</p>
              <p className="muted mt-2 text-sm leading-relaxed">{b}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="gaps">
        <h2 id="gaps" className="display mb-3 text-2xl font-semibold">Known gaps</h2>
        <Notice tone="caution" title="Stated plainly rather than hidden">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>No read-aloud.</strong> The Web Speech API is not wired up. For a long Sanskrit
              text this is a real gap: many readers would rather listen than read, and correct
              pronunciation is hard to learn from text alone. A licensed audio track would close it
              properly; a machine voice reading Sanskrit would close it badly.
            </li>
            <li>
              <strong>No voice search.</strong> Search is keyboard and touch only.
            </li>
            <li>
              <strong>No downloadable reading packs.</strong> You cannot export a chapter as an
              offline file. The page itself works offline once loaded, which is a partial answer.
            </li>
            <li>
              <strong>Contrast is designed, not audited.</strong> Colours were chosen against WCAG
              ratios, but no assistive-technology audit has been run on the built site.
            </li>
            <li>
              <strong>No full PWA install.</strong> There is no service worker, so the app is not
              installable from the browser. The content is bundled into the page, which gives
              offline reading without an install prompt.
            </li>
          </ul>
        </Notice>
      </section>

      <section className="mt-10" aria-labelledby="how">
        <h2 id="how" className="display mb-3 text-2xl font-semibold">Turning things on</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            Every setting lives on one page. Reading controls are also repeated inside the scripture
            reader, so you can change size or script without leaving the chapter you are in.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/settings" className="btn btn-primary">Open Settings</Link>
            <Link href="/report-error" className="btn btn-ghost">Report a barrier</Link>
          </div>
          <p className="muted mt-4 text-sm leading-relaxed">
            If something here does not work for you — a control you cannot reach, text you cannot
            read, a page that does not announce itself — that is a bug in this app, not a
            limitation you have to work around. Please report it.
          </p>
        </Card>
      </section>
    </>
  );
}
