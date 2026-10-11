import Link from "next/link";
import { getLocations, getNavadurgaForms } from "@/lib/content";
import { computeNavratri, currentNavratriDay, formatInTimezone, panchangForDay, todaysDeviId } from "@/lib/panchang/panchang";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Card, Chip, SectionHeading, Stat } from "@/components/ui";
import { Mandala, Diya, Lotus, MotesStatic, OrnamentRule, Trident } from "@/components/ornament";

export const metadata = { title: "Home" };

const QUICK = [
  { href: "/maa-durga", label: "Maa Durga", note: "Knowledge library", icon: "❁" },
  { href: "/navadurga", label: "Navadurga", note: "The nine forms", icon: "९" },
  { href: "/scripture", label: "Durga Saptashati", note: "13 chapters, complete", icon: "☰" },
  { href: "/shakti-peethas", label: "Shakti Peethas", note: "Sacred geography", icon: "⌖" },
  { href: "/calendar", label: "Festival calendar", note: "Computed for you", icon: "☷" },
  { href: "/puja", label: "Puja guides", note: "Ghatasthapana & more", icon: "⚱" },
  { href: "/mantras", label: "Mantra library", note: "Stotra, aarti, kavach", icon: "ॐ" },
  { href: "/stories", label: "Stories", note: "For children & families", icon: "❋" },
  { href: "/temples", label: "Temples", note: "Directory & planner", icon: "⛩" },
  { href: "/devi-gyan", label: "Devi Gyan", note: "Ask, with citations", icon: "✦" },
  { href: "/learn", label: "Learn & quiz", note: "Glossary, flashcards", icon: "✎" },
  { href: "/saved", label: "Saved", note: "Bookmarks & progress", icon: "♥" },
];

export default function HomePage() {
  const locations = getLocations().locations;
  const loc = locations.find((l) => l.id === DEFAULT_SETTINGS.locationId) ?? locations[0];
  const now = new Date();

  const p = panchangForDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), {
    id: loc.id, city: loc.city, region: loc.region, country: loc.country,
    lat: loc.lat, lon: loc.lon, utcOffsetHours: loc.utcOffsetHours, timezone: loc.timezone,
  });
  const geo = { ...loc };
  const day = currentNavratriDay(geo, now);
  const todays = todaysDeviId(geo, now);
  const forms = getNavadurgaForms();
  const todaysForm = forms.find((f) => f.slug === (day ? day.deviId : todays.id)) ?? null;

  const sharad = computeNavratri("sharad", now.getUTCFullYear(), geo);
  const countdownTarget = sharad.days[0]?.civilDate ?? null;
  const daysUntil = countdownTarget
    ? Math.ceil((countdownTarget.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86400000)
    : null;

  const sunrise = formatInTimezone(p.sunriseUtc, loc.timezone, { hour: "2-digit", minute: "2-digit" });
  const todayLabel = formatInTimezone(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12)),
    loc.timezone,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border"
               style={{ borderColor: "var(--line)", background: "var(--maroon-950)" }}>
        <div className="absolute inset-0 lotus-field" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-80 w-80 opacity-[0.14]" aria-hidden="true">
          <Mandala className="h-full w-full" petals={16} spin stroke="#e8c86a" />
        </div>
        <div className="absolute -left-20 bottom-[-6rem] h-72 w-72 opacity-[0.10]" aria-hidden="true">
          <Mandala className="h-full w-full" petals={24} stroke="#f0a03a" />
        </div>
        <MotesStatic count={12} />

        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em]"
             style={{ color: "#e8c86a" }}>
            {todayLabel}
          </p>
          <h1 className="display max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl"
              style={{ color: "#fdfbf4" }}>
            Jai Mata Di.
            <span className="mt-1 block" style={{ color: "#e8c86a" }}>
              Welcome to the World of Divine Shakti.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base"
             style={{ color: "#d8c8a8" }}>
            Discover Maa Durga. Explore Sacred Scriptures. Experience the Power of Shakti. The
            complete Durga Saptashati, the nine Navadurga forms, and the sacred geography of the
            Shakti Peethas — with festival dates computed for {loc.city}, not hard-coded.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/scripture" className="btn btn-primary">Read the Saptashati</Link>
            <Link href="/navadurga" className="btn btn-ghost"
                  style={{ borderColor: "rgba(232,200,106,0.4)", color: "#e8c86a" }}>
              Meet the nine forms
            </Link>
            <Link href="/shakti-peethas" className="btn btn-ghost"
                  style={{ borderColor: "rgba(232,200,106,0.4)", color: "#e8c86a" }}>
              Explore the Peethas
            </Link>
          </div>

          <div className="mt-8 flex items-end gap-4" aria-hidden="true">
            <Diya className="h-10 w-14" />
            <Lotus className="h-6 w-14" stroke="#c9a227" opacity={0.7} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ today strip */}
      <section className="mb-12" aria-labelledby="today-heading">
        <SectionHeading
          eyebrow={loc.city}
          title="Today"
          sub={`Panchang computed at local sunrise (${sunrise}). Method and caveats are shown on every calendar page.`}
          right={<Chip tone="gold">{p.tithiLabelDevanagari}</Chip>}
        />
        <h2 id="today-heading" className="sr-only">Today</h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Tithi" value={p.tithiLabel} hint={p.tithiLabelDevanagari} />
          <Stat label="Nakshatra" value={p.nakshatraName} hint={`Yoga: ${p.yogaName}`} />
          <Stat label="Navratri" value={day ? `Day ${day.day}` : "Not in season"}
                hint={day ? day.tithiLabel : "Year-round devotion below"} />
          <Stat label="Sunrise" value={sunrise} hint={loc.timezone} />
        </div>

        {daysUntil !== null && daysUntil > 0 && !day && (
          <div className="card mt-3 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="muted text-[0.7rem] uppercase tracking-[0.16em]">Sharad Navratri</p>
              <p className="display text-xl font-semibold">
                Begins in {daysUntil} {daysUntil === 1 ? "day" : "days"}
              </p>
            </div>
            <p className="muted text-sm">
              Ghatasthapana {formatInTimezone(sharad.days[0].sunriseUtc, loc.timezone,
                { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <Link href="/calendar" className="btn btn-ghost">Open calendar</Link>
          </div>
        )}

        {daysUntil !== null && daysUntil < 0 && !day && (
          <div className="card mt-3 px-5 py-4">
            <p className="muted text-[0.7rem] uppercase tracking-[0.16em]">Sharad Navratri</p>
            <p className="display text-xl font-semibold">Concluded for {now.getUTCFullYear()}</p>
            <p className="muted mt-1 text-sm">
              Vijayadashami was {sharad.vijayadashami
                ? formatInTimezone(sharad.vijayadashami.sunriseUtc, loc.timezone,
                    { day: "numeric", month: "long" })
                : "computed"} · <Link href="/calendar" className="link-underline">see next year</Link>
            </p>
          </div>
        )}

        <div className="muted mt-2 text-xs">
          Method: low-precision solar/lunar longitudes (Meeus). Tithi evaluated at sunrise. Can
          differ by a day from a specific published panchang near a boundary.{" "}
          <Link href="/calendar" className="link-underline">Details</Link>
        </div>
      </section>

      {/* --------------------------------------------------- today's form */}
      {todaysForm && (
        <section className="mb-12" aria-labelledby="todays-form">
          <SectionHeading
            eyebrow={day ? `Navratri day ${day.day} · ${day.tithiLabel}` : todays.reason}
            title="Today's form of Maa Durga"
          />
          <h2 id="todays-form" className="sr-only">Today&rsquo;s form of Maa Durga</h2>
          <Card raised className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="p-6 sm:p-8">
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
                   style={{ color: "var(--gold)" }}>Day {todaysForm.day}</p>
                <h3 className="display text-3xl font-semibold">{todaysForm.nameDevanagari}</h3>
                <p className="muted mt-1 text-sm">
                  {todaysForm.nameTransliterated} · {todaysForm.nameHindi}
                </p>
                <p className="mt-4 text-sm leading-relaxed">{todaysForm.originStory}</p>
                <div className="mt-5 rounded-xl border p-4"
                     style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
                  <p className="muted mb-1.5 text-[0.68rem] uppercase tracking-[0.16em]">
                    Mantra of the day
                  </p>
                  <p className="verse-deva">{todaysForm.navarnaMantra.devanagari}</p>
                  <p className="verse-iast mt-1">{todaysForm.navarnaMantra.transliteration}</p>
                  <p className="muted mt-2 text-xs">{todaysForm.navarnaMantra.meaning}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link href={`/navadurga/${todaysForm.slug}`} className="btn btn-primary">
                    Full profile
                  </Link>
                  <Link href="/mantras" className="btn btn-ghost">Mantra library</Link>
                </div>
              </div>
              <div className="relative flex items-center justify-center border-t p-8 md:border-l md:border-t-0"
                   style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}>
                <Mandala className="absolute h-56 w-56" petals={12} spin
                         stroke="var(--gold)" opacity={0.22} />
                <div className="relative text-center">
                  <Trident className="mx-auto h-16 w-16" />
                  <p className="deva mt-4 text-lg font-semibold">{todaysForm.nameDevanagari}</p>
                  <p className="muted mt-1 text-xs">Colour: {todaysForm.colour}</p>
                  <p className="muted mt-0.5 text-[0.7rem]">Varies by region</p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ---------------------------------------------- daily puja & bhog */}
      <section className="mb-12 grid gap-3 md:grid-cols-3" aria-label="Daily practice">
        <Card className="p-5">
          <p className="muted text-[0.68rem] uppercase tracking-[0.16em]">Daily puja</p>
          <p className="display mt-1 text-lg font-semibold">A five-minute form</p>
          <p className="muted mt-2 text-sm leading-relaxed">
            Wash your hands. Light a lamp. Offer water and a flower. Say the day&rsquo;s name and
            the Navarna mantra nine times. Sit quietly. That is a complete puja.
          </p>
          <Link href="/puja/daily-puja" className="link-underline mt-3 inline-block text-sm">
            Full guide
          </Link>
        </Card>
        <Card className="p-5">
          <p className="muted text-[0.68rem] uppercase tracking-[0.16em]">Bhog &amp; offering</p>
          <p className="display mt-1 text-lg font-semibold">
            {todaysForm ? todaysForm.offering.flower : "See the day&rsquo;s profile"}
          </p>
          <p className="muted mt-2 text-sm leading-relaxed">
            {todaysForm ? todaysForm.offering.bhog : ""} · Offerings vary by region and family.
            Nothing here is prescribed.
          </p>
          <Link href="/puja/fasting" className="link-underline mt-3 inline-block text-sm">
            Fasting &amp; health
          </Link>
        </Card>
        <Card className="p-5">
          <p className="muted text-[0.68rem] uppercase tracking-[0.16em]">Continue reading</p>
          <p className="display mt-1 text-lg font-semibold">Durga Saptashati</p>
          <p className="muted mt-2 text-sm leading-relaxed">
            All 13 chapters in Sanskrit and IAST, from an identified edition. 700 verses, verified
            against the source&rsquo;s own colophon.
          </p>
          <Link href="/scripture" className="link-underline mt-3 inline-block text-sm">
            Chapter index
          </Link>
        </Card>
      </section>

      <OrnamentRule className="mb-12" />

      {/* --------------------------------------------------- quick access */}
      <section className="mb-12" aria-labelledby="explore-heading">
        <SectionHeading eyebrow="Everything" title="Explore" sub="Quick access to every section." />
        <h2 id="explore-heading" className="sr-only">Explore</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {QUICK.map((q) => (
            <li key={q.href}>
              <Link href={q.href}
                    className="card group flex h-full items-start gap-3.5 p-4 transition-transform hover:-translate-y-0.5">
                <span aria-hidden="true" className="deva mt-0.5 text-xl leading-none"
                      style={{ color: "var(--gold)" }}>{q.icon}</span>
                <span>
                  <span className="block font-semibold">{q.label}</span>
                  <span className="muted block text-xs">{q.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- journey strip */}
      <section className="mb-8" aria-labelledby="journey-heading">
        <SectionHeading
          eyebrow="Your practice"
          title="A personal devotional journey"
          sub="Bookmarks, reading progress and a journal — stored only on this device. Nothing here measures spiritual merit; progress tracks reading, nothing more."
        />
        <h2 id="journey-heading" className="sr-only">A personal devotional journey</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/saved" className="card p-5 transition-transform hover:-translate-y-0.5">
            <p className="display text-lg font-semibold">Saved &amp; continue</p>
            <p className="muted mt-1 text-sm">Your bookmarks, last verse read, and favourites.</p>
          </Link>
          <Link href="/scripture/plans" className="card p-5 transition-transform hover:-translate-y-0.5">
            <p className="display text-lg font-semibold">Reading plans</p>
            <p className="muted mt-1 text-sm">Nine-day, thirteen-day, or a slower study schedule.</p>
          </Link>
          <Link href="/saved#journal" className="card p-5 transition-transform hover:-translate-y-0.5">
            <p className="display text-lg font-semibold">Prayer journal</p>
            <p className="muted mt-1 text-sm">Private notes and a gratitude line. Local only.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
