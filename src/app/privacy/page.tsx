import Link from "next/link";
import { Card, Notice, PageHeader } from "@/components/ui";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy"
                  sub="Written in plain language, because a spiritual app that hides what it does with your data has already failed." />

      <Notice tone="info" title="The short version">
        <p>
          There is no account. There is no tracking. Nothing you read, save, write or search is
          sent to a server. Your bookmarks, reading progress, journal entries, quiz scores and
          preferences are stored in this browser only, under a single local-storage key, and you
          can erase them at any time from Settings.
        </p>
      </Notice>

      <section className="mt-8" aria-labelledby="collected">
        <h2 id="collected" className="display mb-3 text-2xl font-semibold">What is stored</h2>
        <Card className="p-6">
          <dl className="space-y-4 text-sm">
            {[
              ["Bookmarks", "Verses, chapters, Peethas, temples, mantras and stories you saved."],
              ["Reading progress", "Which chapter you opened, how far you scrolled, and the last verse you reached."],
              ["Journal entries", "Prayers, reflections and gratitude lines. Written by you, read by you."],
              ["Quiz scores", "Your most recent attempt at each quiz, so you can see if you improved."],
              ["Preferences", "Language, script, font size, line spacing, theme, contrast, motion, low-data mode, and the city used for festival dates."],
              ["First-run flag", "A single boolean recording that you have seen the welcome screen."],
            ].map(([t, b]) => (
              <div key={t} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="w-44 shrink-0 font-semibold">{t}</dt>
                <dd className="muted flex-1 leading-relaxed">{b}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="not-collected">
        <h2 id="not-collected" className="display mb-3 text-2xl font-semibold">
          What is deliberately not collected
        </h2>
        <Card className="p-6">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>Your birth details.</strong> No feature here needs a birth date, birth time or
              birth place, and none is requested. Festival dates use the city you select for sunrise
              — not your natal chart.
            </li>
            <li>Your name, email, phone number or any identifier.</li>
            <li>Analytics, advertising identifiers, cookies set for tracking, or third-party pixels.</li>
            <li>The content of your journal. It never leaves the device.</li>
            <li>Your search terms. Search runs against an index built in your browser.</li>
          </ul>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="network">
        <h2 id="network" className="display mb-3 text-2xl font-semibold">
          What does touch the network
        </h2>
        <Card className="p-6">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>Map tiles.</strong> If you open a map, your browser fetches tiles from
              OpenStreetMap. OSM&rsquo;s own privacy policy applies to that request. Low-data mode
              skips the map entirely.
            </li>
            <li>
              <strong>The Devi Gyan endpoint.</strong> A question you type is sent to this
              app&rsquo;s own server, which searches the local corpus. With no AI provider
              configured, the question never leaves that server. If a provider key is added by the
              operator, the question is forwarded to it — that is a deployment decision and must be
              disclosed to you by whoever runs the site.
            </li>
            <li>
              <strong>Error reports.</strong> The report-an-error form sends what you type in it,
              and nothing else.
            </li>
          </ul>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="children">
        <h2 id="children" className="display mb-3 text-2xl font-semibold">Children</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            The stories and quizzes are written for children and collect nothing about them. There
            is no account to create, no profile to build and no way for this app to identify a
            child. Parents and guardians can erase everything from Settings at any time.
          </p>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="control">
        <h2 id="control" className="display mb-3 text-2xl font-semibold">Your control</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            Settings has a single button that erases everything this app has stored — bookmarks,
            progress, journal, quiz scores and preferences — and returns the app to its first-run
            state. Clearing your browser data for this site does the same thing.
          </p>
          <Link href="/settings" className="btn btn-primary mt-4">Open Settings</Link>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="changes">
        <h2 id="changes" className="display mb-3 text-2xl font-semibold">If this changes</h2>
        <Card className="p-6">
          <p className="text-sm leading-relaxed">
            Any change that starts collecting data a user would not expect — an account system,
            analytics, sync between devices — must be announced on this page before it ships, with
            the reason. A spiritual library that begins tracking its readers without saying so has
            broken the trust the whole thing rests on.
          </p>
          <p className="muted mt-3 text-xs">
            This policy is a template for the project as it stands. Whoever deploys it publicly is
            responsible for reviewing it against their actual infrastructure and adding their own
            contact details and effective date.
          </p>
        </Card>
      </section>
    </>
  );
}
