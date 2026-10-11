"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useApplySettings, useUser } from "@/lib/user";
import { t, getLanguage, type LangCode } from "@/lib/i18n";
import { Mandala, Diya, MotesStatic } from "./ornament";
import { OfflineStatusChip } from "./offline";
import { CinematicBackdrop } from "./backdrop";
import { CinematicArt } from "./art";
import { sectionArt } from "@/lib/art";
import { routeTheme, themeVars } from "@/lib/theme";
import { LanguageSelector } from "./language-selector";
import { NavadurgaIntro, hasSeenIntro, type IntroForm, type IntroBlessing } from "./intro";

/**
 * Navigation, grouped the way a reader moves through the material: the nine
 * forms, then the festival, then practice, then the library, then the tools.
 * Every entry points at a page that exists and has real content — there are no
 * placeholder routes here, and if one is removed the navigation test fails.
 */
const SIDE = [
  {
    labelKey: "nav.secondary",
    label: "Explore",
    items: [
      { href: "/", key: "nav.home" },
      { href: "/navadurga", key: "nav.navadurga" },
      { href: "/navratri", key: "nav.navratri" },
      { href: "/guide", key: "nav.guide" },
      { href: "/questions", key: "nav.questions" },
    ],
  },
  {
    labelKey: "nav.secondary",
    label: "Practise",
    items: [
      { href: "/puja", key: "nav.puja" },
      { href: "/mantras", key: "nav.mantras" },
      { href: "/calendar", key: "nav.calendar" },
      { href: "/shakti-peethas", key: "nav.peethas" },
      { href: "/temples", key: "nav.temples" },
      { href: "/plan", key: "nav.plan" },
    ],
  },
  {
    labelKey: "nav.secondary",
    label: "Library",
    items: [
      { href: "/scripture", key: "nav.scripture" },
      { href: "/stories", key: "nav.stories" },
      { href: "/maa-durga", key: "nav.durga" },
      { href: "/listen", key: "nav.listen" },
      { href: "/learn", key: "nav.learn" },
      { href: "/search", key: "nav.search" },
    ],
  },
  {
    labelKey: "nav.secondary",
    label: "You",
    items: [
      { href: "/journey", key: "nav.journey" },
      { href: "/settings", key: "nav.settings" },
      { href: "/about", key: "nav.about" },
      { href: "/sources", key: "nav.sources" },
      { href: "/upload", key: "nav.upload" },
    ],
  },
];

const BOTTOM = [
  { href: "/", key: "nav.home", icon: "◈" },
  { href: "/navadurga", key: "nav.navadurga", icon: "❁" },
  { href: "/guide", key: "nav.guide", icon: "✦" },
  { href: "/listen", key: "nav.listen", icon: "♫" },
  { href: "/more", key: "nav.more", icon: "⋯" },
];

function useLang(): LangCode {
  const { state } = useUser();
  return state.settings.language;
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
      <label htmlFor="global-search" className="sr-only">{t(lang, "action.search")}</label>
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t(lang, "empty.search")}
        className="w-full rounded-full border px-4 py-2 text-sm outline-none"
        style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", color: "var(--ink)" }}
      />
      <kbd className="muted pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 text-[0.65rem] sm:block"
           style={{ borderColor: "var(--line)" }} dir="ltr">/</kbd>
      {open && q.trim() && (
        <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold sm:hidden"
                style={{ color: "var(--gold)" }}>
          ↵
        </button>
      )}
    </form>
  );
}

/* ------------------------------------------------------------ first run */

function FirstRun({ onDone }: { onDone: () => void }) {
  const { state } = useUser();
  const lang = state.settings.language;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-6"
         style={{ background: "color-mix(in srgb, var(--maroon-950) 55%, transparent)" }}
         role="dialog" aria-modal="true" aria-labelledby="firstrun-title">
      <div className="card-raised surface w-full max-w-2xl overflow-y-auto rounded-b-none p-6 sm:rounded-2xl"
           style={{ maxHeight: "92vh" }}>
        <div className="mb-4 flex items-center gap-3">
          <Mandala className="h-10 w-10" petals={12} stroke="var(--gold)" opacity={0.8} />
          <div>
            <h2 id="firstrun-title" className="display text-xl font-semibold">
              {t(lang, "nav.chooseLanguage")}
            </h2>
            <p className="muted text-xs">{t(lang, "app.tagline")}</p>
          </div>
        </div>

        <LanguageSelector variant="dialog" />

        <div className="muted mt-5 rounded-xl border p-3 text-xs leading-relaxed"
             style={{ borderColor: "var(--line)" }}>
          <p className="mb-1 font-semibold" style={{ color: "var(--ink-2)" }}>
            {t(lang, "set.privacy")}
          </p>
          {t(lang, "set.dataNote")}
        </div>

        <button className="btn btn-primary mt-4 w-full"
                onClick={onDone}>
          {t(lang, "app.enter")}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */

export function Shell({
  children,
  introFormList,
  introBlessing,
}: {
  children: React.ReactNode;
  introFormList: IntroForm[];
  introBlessing: IntroBlessing;
}) {
  useApplySettings();
  const { state, setSettings, recordVisit } = useUser();
  const lang = useLang();
  const pathname = usePathname();
  const [showIntro, setShowIntro] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [, setNavOpen] = useState(false);

  /* The intro is decided after hydration, because whether it has been seen
     lives in localStorage and the server cannot know that. Nothing is shown
     until the answer is known, so there is no flash of a skipped intro. */
  useEffect(() => {
    setShowIntro(!state.settings.skipIntro && !hasSeenIntro());
  }, [state.settings.skipIntro]);

  useEffect(() => {
    setFirstRun(!state.settings.firstRunDone);
  }, [state.settings.firstRunDone]);

  useEffect(() => {
    setNavOpen(false);
    setLangOpen(false);
  }, [pathname]);

  /* Recently explored, for the learning journey. Written here rather than in
     every page so that coverage is automatic and cannot be forgotten. */
  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/api")) return;
    recordVisit({
      href: pathname,
      title: document.title.replace(/^[^-·|]*[-·|]\s*/, "") || pathname,
      kind: pathname.split("/")[1] || "page",
    });
  }, [pathname, recordVisit]);

  const isActive = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of BOTTOM) {
      map[item.href] = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    }
    return map;
  }, [pathname]);

  const sectionTheme = useMemo(() => routeTheme(pathname), [pathname]);
  const themeStyle = useMemo(
    () => themeVars(sectionTheme, state.settings.theme === "dark"),
    [sectionTheme, state.settings.theme],
  );

  const hasOwnArt =
    pathname === "/" || pathname === "/maa-durga" || pathname.startsWith("/navadurga/");

  const def = getLanguage(lang);

  return (
    <div style={themeStyle as CSSProperties}>
      <CinematicBackdrop />
      <>
        {showIntro && (
          <NavadurgaIntro
            forms={introFormList}
            blessing={introBlessing}
            lang={lang}
            onDone={() => setShowIntro(false)}
          />
        )}
        {firstRun && !showIntro && (
          <FirstRun onDone={() => { setSettings({ firstRunDone: true }); setFirstRun(false); }} />
        )}

        {langOpen && (
          <div className="fixed inset-0 z-40 flex items-start justify-center p-3 pt-16"
               style={{ background: "color-mix(in srgb, var(--maroon-950) 45%, transparent)" }}
               role="dialog" aria-modal="true" aria-label={t(lang, "nav.chooseLanguage")}>
            <div className="card-raised surface w-full max-w-3xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="display text-lg font-semibold">{t(lang, "nav.chooseLanguage")}</h2>
                <button className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => setLangOpen(false)}>
                  {t(lang, "action.close")}
                </button>
              </div>
              <LanguageSelector variant="dialog" onDone={() => setLangOpen(false)} />
            </div>
          </div>
        )}

        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
           style={{ background: "var(--gold)", color: "var(--surface)" }}>
          {t(lang, "nav.home")}
        </a>

        {/* top bar */}
        <header className="sticky top-0 z-30 border-b no-print"
                style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--surface) 92%, transparent)", backdropFilter: "blur(10px)" }}>
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${t(lang, "app.name")} — ${t(lang, "nav.home")}`}>
              <Mandala className="h-8 w-8 shrink-0" petals={12} stroke="var(--gold)" opacity={0.9} />
              <span className="hidden sm:block">
                <span className="display block text-base font-semibold leading-none"
                      style={{ fontFamily: def.fontStack }}>
                  {t(lang, "app.name")}
                </span>
                <span className="muted block text-[0.62rem] uppercase tracking-[0.22em]">
                  {t(lang, "app.subtitle")}
                </span>
              </span>
            </Link>
            <GlobalSearch lang={lang} onNavigate={() => setNavOpen(false)} />
            <OfflineStatusChip />
            <button
              type="button"
              onClick={() => setLangOpen(true)}
              className="btn btn-ghost shrink-0 !px-2.5 !py-1.5 text-xs"
              aria-label={`${t(lang, "nav.language")}: ${def.label}`}
            >
              <span aria-hidden="true">◍</span>
              <span className="hidden sm:inline" style={{ fontFamily: def.fontStack }}>{def.native}</span>
            </button>
            <button
              className="btn btn-ghost hidden shrink-0 !px-3 !py-1.5 text-xs lg:inline-flex"
              onClick={() => setSettings({ theme: state.settings.theme === "dark" ? "light" : "dark" })}
              aria-label="Toggle light and dark mode"
            >
              {state.settings.theme === "dark" ? "☀" : "☾"}
            </button>
            <Link href="/journey" className="btn btn-ghost hidden shrink-0 !px-3 !py-1.5 text-xs sm:inline-flex"
                  aria-label={t(lang, "nav.journey")}>♥</Link>
            <Link href="/settings" className="btn btn-ghost shrink-0 !px-3 !py-1.5 text-xs"
                  aria-label={t(lang, "nav.settings")}>⚙</Link>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] gap-8 px-0 sm:px-4">
          {/* desktop sidebar */}
          <nav className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto py-8 pr-2 lg:block no-print"
               aria-label="Main">
            {SIDE.map((g) => (
              <div key={g.label} className="mb-6">
                <p className="muted mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em]">
                  {g.label}
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
                {t(lang, "common.verifiedNote")}
              </p>
            </div>
          </nav>

          <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:pb-12 lg:pb-16">
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
          <p className="muted mt-2 text-xs leading-relaxed">{t(lang, "app.long")}</p>
        </div>
        <nav className="muted flex flex-wrap gap-x-5 gap-y-1.5 text-xs" aria-label="Footer">
          <Link href="/sources" className="link-underline">{t(lang, "nav.sources")}</Link>
          <Link href="/about" className="link-underline">{t(lang, "nav.about")}</Link>
          <Link href="/privacy" className="link-underline">{t(lang, "trust.privacy")}</Link>
          <Link href="/terms" className="link-underline">{t(lang, "trust.terms")}</Link>
          <Link href="/accessibility" className="link-underline">{t(lang, "a11y.title")}</Link>
          <Link href="/report-error" className="link-underline">{t(lang, "trust.report")}</Link>
        </nav>
      </div>
      <p className="muted mt-6 text-[0.7rem]">{t(lang, "app.jaiMataDi")}</p>
    </footer>
  );
}

export function useNavigate() {
  return useRouter();
}

/** Kept for the offline chip's mount point and any future header adornment. */
export function ShellSpacer() {
  return <MotesStatic count={6} />;
}
