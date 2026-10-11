"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useApplySettings, useUser } from "@/lib/user";
import { LANGUAGES, t, type LangCode } from "@/lib/i18n";
import { Mandala, Diya, OmMark, MotesStatic } from "./ornament";
import { OfflineStatusChip } from "./offline";
import { CinematicBackdrop } from "./backdrop";
import { CinematicArt } from "./art";
import { sectionArt } from "@/lib/art";
import { routeTheme, themeVars } from "@/lib/theme";

const BOTTOM = [
  { href: "/", key: "nav.home", icon: "◈" },
  { href: "/maa-durga", key: "nav.durga", icon: "❁" },
  { href: "/scripture", key: "nav.scripture", icon: "☰" },
  { href: "/shakti-peethas", key: "nav.peethas", icon: "⌖" },
  { href: "/more", key: "nav.more", icon: "⋯" },
];

const SIDE = [
  { group: "Explore", items: [
    { href: "/", key: "nav.home" },
    { href: "/maa-durga", key: "nav.durga" },
    { href: "/navadurga", key: "nav.navadurga" },
    { href: "/scripture", key: "nav.scripture" },
    { href: "/shakti-peethas", key: "nav.peethas" },
    { href: "/temples", key: "nav.temples" },
    { href: "/plan", key: "nav.plan" },
  ]},
  { group: "Practise", items: [
    { href: "/calendar", key: "nav.calendar" },
    { href: "/puja", key: "nav.puja" },
    { href: "/mantras", key: "nav.mantras" },
    { href: "/stories", key: "nav.stories" },
  ]},
  { group: "Learn", items: [
    { href: "/learn", key: "nav.learn" },
    { href: "/devi-gyan", key: "nav.assistant" },
    { href: "/sources", key: "nav.sources" },
  ]},
  { group: "You", items: [
    { href: "/saved", key: "nav.saved" },
    { href: "/settings", key: "nav.settings" },
    { href: "/about", key: "nav.about" },
  ]},
];

function useLang(): LangCode {
  const { state } = useUser();
  return state.settings.language;
}

/* ------------------------------------------------------------------- splash */

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1500);
    return () => window.clearTimeout(id);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
         style={{ background: "var(--maroon-950)" }} role="status" aria-label="Loading">
      <div className="relative h-56 w-56">
        <Mandala className="absolute inset-0 h-full w-full" petals={16} spin
                 stroke="#c9a227" opacity={0.55} />
        <Mandala className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)]" petals={8}
                 stroke="#e8c86a" opacity={0.7} />
        <div className="absolute inset-0 flex items-center justify-center">
          <OmMark className="h-14 w-14" />
        </div>
      </div>
      <div className="text-center" style={{ color: "#f4ecdc" }}>
        <p className="display text-3xl font-semibold tracking-wide">NAVRATRI</p>
        <p className="mt-1 text-xs uppercase tracking-[0.34em]" style={{ color: "#c9a227" }}>
          The Divine Shakti
        </p>
      </div>
      <MotesStatic count={10} />
    </div>
  );
}

/* ---------------------------------------------------------------- first run */

export function FirstRun({ onDone }: { onDone: () => void }) {
  const { state, setSettings } = useUser();
  const lang = state.settings.language;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-6"
         style={{ background: "color-mix(in srgb, var(--maroon-950) 55%, transparent)" }}
         role="dialog" aria-modal="true" aria-labelledby="firstrun-title">
      <div className="card-raised surface w-full max-w-lg rounded-b-none p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center gap-3">
          <Mandala className="h-10 w-10" petals={12} stroke="var(--gold)" opacity={0.8} />
          <div>
            <h2 id="firstrun-title" className="display text-xl font-semibold">
              {t(lang, "app.name")} — {t(lang, "app.subtitle")}
            </h2>
            <p className="muted text-xs">{t(lang, "app.tagline")}</p>
          </div>
        </div>

        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold">Choose your language · भाषा चुनें</legend>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => {
              const active = state.settings.language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSettings({ language: l.code as LangCode })}
                  aria-pressed={active}
                  className="rounded-xl border px-3 py-2.5 text-left text-sm transition-colors"
                  style={{
                    borderColor: active ? "var(--gold)" : "var(--line)",
                    background: active ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  <span className="deva block font-semibold">{l.native}</span>
                  <span className="muted block text-[0.7rem]">{l.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="muted mb-5 rounded-xl border p-3 text-xs leading-relaxed"
             style={{ borderColor: "var(--line)" }}>
          <p className="mb-1 font-semibold" style={{ color: "var(--ink-2)" }}>
            How this app handles your data
          </p>
          Bookmarks, reading progress and your journal are stored only on this device. There is no
          account, no analytics and nothing sent to a server. You can erase everything from
          Settings.
        </div>

        <button className="btn btn-primary w-full" onClick={onDone}>
          Enter · प्रवेश
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- search bar */

function GlobalSearch({ lang, onNavigate }: { lang: LangCode; onNavigate: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <form
      role="search"
      className="relative min-w-0 flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (!q.trim()) return;
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        setOpen(false);
        onNavigate();
      }}
    >
      <label htmlFor="global-search" className="sr-only">{t(lang, "common.search.placeholder")}</label>
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t(lang, "common.search.placeholder")}
        className="w-full rounded-full border px-4 py-2 text-sm outline-none"
        style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", color: "var(--ink)" }}
      />
      <kbd className="muted pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 text-[0.65rem] sm:block"
           style={{ borderColor: "var(--line)" }}>/</kbd>
      {open && q.trim() && (
        <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold sm:hidden"
                style={{ color: "var(--gold)" }}>
          Go
        </button>
      )}
    </form>
  );
}

/* -------------------------------------------------------------------- shell */

export function Shell({ children }: { children: React.ReactNode }) {
  useApplySettings();
  const { state, setSettings } = useUser();
  const lang = useLang();
  const pathname = usePathname();
  const [splash, setSplash] = useState(true);
  const [firstRun, setFirstRun] = useState(false);
  // only the setter is read: the menu is closed on navigate and on search
  const [, setNavOpen] = useState(false);

  useEffect(() => {
    setFirstRun(!state.settings.firstRunDone);
  }, [state.settings.firstRunDone]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const isActive = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of BOTTOM) {
      map[item.href] = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    }
    return map;
  }, [pathname]);

  // Per-section cinematic theming: accent, soft fill, backdrop tint, display
  // serif — resolved from the route and the user's light/dark choice.
  const sectionTheme = useMemo(() => routeTheme(pathname), [pathname]);
  const themeStyle = useMemo(
    () => themeVars(sectionTheme, state.settings.theme === "dark"),
    [sectionTheme, state.settings.theme],
  );

  // These routes already embed their own framed artwork (home hero, the Maa
  // Durga index banner, and each Navadurga profile's form banner), so the
  // Shell-level banner would duplicate them there.
  const hasOwnArt =
    pathname === "/" || pathname === "/maa-durga" || pathname.startsWith("/navadurga/");

  return (
    <div style={themeStyle as CSSProperties}>
      <CinematicBackdrop />
      <>
      {splash && <Splash onDone={() => setSplash(false)} />}
      {firstRun && !splash && (
        <FirstRun onDone={() => { setSettings({ firstRunDone: true }); setFirstRun(false); }} />
      )}

      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
         style={{ background: "var(--gold)", color: "var(--surface)" }}>
        Skip to content
      </a>

      {/* top bar */}
      <header className="sticky top-0 z-30 border-b no-print"
              style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--surface) 92%, transparent)", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-2.5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Navratri — home">
            <Mandala className="h-8 w-8 shrink-0" petals={12} stroke="var(--gold)" opacity={0.9} />
            <span className="hidden sm:block">
              <span className="display block text-base font-semibold leading-none">
                {t(lang, "app.name")}
              </span>
              <span className="muted block text-[0.62rem] uppercase tracking-[0.22em]">
                {t(lang, "app.subtitle")}
              </span>
            </span>
          </Link>
          <GlobalSearch lang={lang} onNavigate={() => setNavOpen(false)} />
          <OfflineStatusChip />
          <label className="hidden shrink-0 items-center gap-1.5 sm:flex" htmlFor="ui-lang">
            <span className="muted text-[0.65rem] uppercase tracking-[0.14em]">भाषा</span>
            <select
              id="ui-lang"
              value={state.settings.language}
              onChange={(e) => setSettings({ language: e.target.value as LangCode })}
              className="rounded-full border px-2 py-1 text-xs outline-none"
              style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", color: "var(--ink)" }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-ghost hidden shrink-0 !px-3 !py-1.5 text-xs lg:inline-flex"
            onClick={() => setSettings({
              theme: state.settings.theme === "dark" ? "light" : "dark",
            })}
            aria-label="Toggle light and dark mode"
          >
            {state.settings.theme === "dark" ? "☀" : "☾"}
          </button>
          <Link href="/saved" className="btn btn-ghost shrink-0 !px-3 !py-1.5 text-xs"
                aria-label={t(lang, "nav.saved")}>♥</Link>
          <Link href="/settings" className="btn btn-ghost shrink-0 !px-3 !py-1.5 text-xs"
                aria-label={t(lang, "nav.settings")}>⚙</Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] gap-8 px-0 sm:px-4">
        {/* desktop sidebar */}
        <nav className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto py-8 pr-2 lg:block no-print"
             aria-label="Main">
          {SIDE.map((g) => (
            <div key={g.group} className="mb-6">
              <p className="muted mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                {g.group}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        aria-current={active ? "page" : undefined}
                        className="block rounded-lg px-3 py-1.5 text-sm transition-colors"
                        style={{
                          background: active ? "var(--accent-soft)" : "transparent",
                          color: active ? "var(--ink)" : "var(--muted)",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {t(lang, it.key)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="mt-8 border-t px-3 pt-4" style={{ borderColor: "var(--line)" }}>
            <Diya className="h-8 w-11 opacity-80" />
            <p className="muted mt-2 text-[0.7rem] leading-relaxed">
              Content is labelled with its source and verification status. Where traditions
              disagree, both are shown.
            </p>
          </div>
        </nav>

        <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:pb-12 lg:pb-16">
          {/* Pages that don't carry their own framed artwork still show the
              created Devi imagery as a cinematic banner at the top. */}
          {!hasOwnArt && (
            <CinematicArt
              src={sectionArt(pathname)}
              alt="Maa Durga, the Divine Shakti, in a cinematic devotional rendering"
              className="mb-8"
            />
          )}
          {children}
          <Footer lang={lang} />
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t no-print lg:hidden"
           style={{ borderColor: "var(--line)", background: "var(--surface)" }}
           aria-label="Main">
        <ul className="mx-auto flex max-w-lg items-stretch">
          {BOTTOM.map((it) => {
            const active = isActive[it.href];
            return (
              <li key={it.href} className="flex-1">
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-0.5 px-1 py-2.5 text-[0.65rem]"
                  style={{ color: active ? "var(--accent)" : "var(--muted)", fontWeight: active ? 600 : 400 }}
                >
                  <span aria-hidden="true" className="text-base leading-none">{it.icon}</span>
                  <span className="truncate">{t(lang, it.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      </>
    </div>
  );
}

function Footer({ lang }: { lang: LangCode }) {
  return (
    <footer className="mt-16 border-t pt-8 no-print" style={{ borderColor: "var(--line)" }}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Mandala className="h-7 w-7" petals={12} stroke="var(--gold)" opacity={0.85} />
            <span className="display text-base font-semibold">{t(lang, "app.name")}</span>
          </div>
          <p className="muted mt-2 text-xs leading-relaxed">
            A digital library and pilgrimage companion. Scripture is imported from identified
            editions and labelled; editorial content is labelled as awaiting review.
          </p>
        </div>
        <nav className="muted flex flex-wrap gap-x-5 gap-y-1.5 text-xs" aria-label="Footer">
          <Link href="/sources" className="link-underline">Sources &amp; verification</Link>
          <Link href="/privacy" className="link-underline">Privacy</Link>
          <Link href="/terms" className="link-underline">Terms</Link>
          <Link href="/report-error" className="link-underline">Report an error</Link>
          <Link href="/accessibility" className="link-underline">Accessibility</Link>
        </nav>
      </div>
      <p className="muted mt-6 text-[0.7rem]">
        Jai Mata Di · This app does not promise blessings, cures or outcomes, and does not rank one
        tradition above another.
      </p>
    </footer>
  );
}

export function useNavigate() {
  return useRouter();
}
