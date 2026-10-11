import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/ui";
import { Diya, Lotus } from "@/components/ornament";

export const metadata = { title: "More" };

const GROUPS: { title: string; eyebrow: string; items: { href: string; label: string; note: string; icon: string }[] }[] = [
  {
    title: "Festival",
    eyebrow: "The nine days",
    items: [
      { href: "/calendar", label: "Festival calendar", note: "Dates computed for your city", icon: "☷" },
      { href: "/puja", label: "Puja guides", note: "Ghatasthapana to visarjan", icon: "⚱" },
      { href: "/puja/fasting", label: "Fasting and health", note: "Never compulsory", icon: "❁" },
      { href: "/navadurga", label: "Navadurga profiles", note: "The nine forms", icon: "९" },
    ],
  },
  {
    title: "Library",
    eyebrow: "Text and recitation",
    items: [
      { href: "/scripture", label: "Durga Saptashati", note: "13 chapters, complete", icon: "☰" },
      { href: "/scripture/plans", label: "Reading plans", note: "Nine, thirteen, or slow", icon: "✎" },
      { href: "/mantras", label: "Mantra library", note: "Stotra, aarti, kavach", icon: "ॐ" },
      { href: "/stories", label: "Stories", note: "For children and families", icon: "❋" },
    ],
  },
  {
    title: "Pilgrimage",
    eyebrow: "Sacred geography",
    items: [
      { href: "/shakti-peethas", label: "Shakti Peethas", note: "Directory, map, disputes", icon: "⌖" },
      { href: "/temples", label: "Temple directory", note: "Peethas and major Devi shrines", icon: "⛩" },
      { href: "/plan", label: "Plan a pilgrimage", note: "Order sites, see distances", icon: "⌾" },
    ],
  },
  {
    title: "Study",
    eyebrow: "Learn and ask",
    items: [
      { href: "/learn", label: "Quizzes", note: "No streaks, no badges", icon: "✦" },
      { href: "/learn/glossary", label: "Glossary & flashcards", note: "Terms in three scripts", icon: "✎" },
      { href: "/devi-gyan", label: "Devi Gyan", note: "Ask, with citations", icon: "✧" },
    ],
  },
  {
    title: "Yours",
    eyebrow: "Personal and private",
    items: [
      { href: "/saved", label: "Saved & progress", note: "Bookmarks and journal", icon: "♥" },
      { href: "/settings", label: "Settings", note: "Language, reading, privacy", icon: "⚙" },
      { href: "/share", label: "Greeting cards", note: "Share a verse, not a screenshot", icon: "❀" },
    ],
  },
  {
    title: "About this app",
    eyebrow: "Provenance and responsibility",
    items: [
      { href: "/about", label: "About", note: "What this is and is not", icon: "❖" },
      { href: "/sources", label: "Sources & verification", note: "Every record's provenance", icon: "☰" },
      { href: "/admin", label: "Content review", note: "What still needs a reviewer", icon: "✓" },
      { href: "/accessibility", label: "Accessibility", note: "What is supported", icon: "♿" },
      { href: "/report-error", label: "Report an error", note: "In text or in fact", icon: "⚑" },
      { href: "/privacy", label: "Privacy policy", note: "No account, no tracking", icon: "⛨" },
      { href: "/terms", label: "Terms & attribution", note: "Copyright and use", icon: "§" },
    ],
  },
];

export default function MorePage() {
  return (
    <>
      <PageHeader eyebrow="Everything else" title="More"
                  sub="The whole app on one page, grouped by what you are trying to do." />

      {GROUPS.map((g) => (
        <section key={g.title} className="mb-10">
          <SectionHeading eyebrow={g.eyebrow} title={g.title} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href}
                      className="card flex h-full items-start gap-3.5 p-5 transition-transform hover:-translate-y-0.5">
                  <span aria-hidden="true" className="deva mt-0.5 text-xl leading-none"
                        style={{ color: "var(--gold)" }}>{i.icon}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{i.label}</span>
                    <span className="muted block text-xs">{i.note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12 rounded-2xl border p-8 text-center"
               style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
        <div className="mx-auto mb-4 flex items-end justify-center gap-4">
          <Diya className="h-10 w-14" />
          <Lotus className="h-7 w-16" stroke="var(--gold)" />
          <Diya className="h-10 w-14" />
        </div>
        <p className="deva text-2xl font-semibold">जय माता दी</p>
        <p className="muted mt-2 text-sm">Jai Mata Di</p>
      </section>
    </>
  );
}
