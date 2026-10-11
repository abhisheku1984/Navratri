import Link from "next/link";
import type { ReactNode } from "react";
import { Mandala } from "./ornament";
import type { VerificationStatus } from "@/lib/types";

/**
 * OrnamentRule lives with the other ornaments but is used alongside Card and
 * Notice in page layouts, so it is re-exported here to keep imports coherent.
 */
export { OrnamentRule } from "./ornament";

/* ------------------------------------------------------------------ surfaces */

export function Card({
  children, className = "", raised = false, as: As = "div",
}: { children: ReactNode; className?: string; raised?: boolean; as?: "div" | "article" | "li" }) {
  return <As className={`${raised ? "card-raised" : "card"} ${className}`}>{children}</As>;
}

export function SectionHeading({
  eyebrow, title, sub, right,
}: { eyebrow?: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
             style={{ color: "var(--gold)" }}>{eyebrow}</p>
        )}
        <h2 className="display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {sub && <p className="muted mt-1 max-w-2xl text-sm">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  eyebrow, title, sub, children,
}: { eyebrow?: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
           style={{ color: "var(--gold)" }}>{eyebrow}</p>
      )}
      <h1 className="display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
      {sub && <p className="muted mt-3 max-w-3xl text-base leading-relaxed">{sub}</p>}
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

/* -------------------------------------------------------------------- chips */

export function Chip({
  children, tone = "default",
}: { children: ReactNode; tone?: "default" | "gold" | "warn" | "muted" | "crimson" }) {
  const style =
    tone === "gold" ? { borderColor: "var(--gold)", color: "var(--gold)" }
    : tone === "crimson" ? { borderColor: "var(--maroon-400)", color: "var(--maroon-500)" }
    : tone === "warn" ? { borderColor: "var(--maroon-400)", color: "var(--maroon-500)" }
    : tone === "muted" ? { opacity: 0.7 }
    : undefined;
  return <span className="chip" style={style}>{children}</span>;
}

const STATUS_LABEL: Record<VerificationStatus, { label: string; tone: "gold" | "warn" | "muted" }> = {
  verified: { label: "Verified", tone: "gold" },
  "verified-with-caveats": { label: "Verified with caveats", tone: "gold" },
  "partially-verified": { label: "Partially verified", tone: "warn" },
  "tradition-recorded": { label: "Tradition recorded", tone: "muted" },
  "awaiting-verification": { label: "Awaiting verification", tone: "warn" },
  "awaiting-review": { label: "Awaiting review", tone: "warn" },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL["awaiting-verification"];
  return <Chip tone={s.tone}>{s.label}</Chip>;
}

export function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const map = {
    high: { label: "High confidence", tone: "gold" as const },
    medium: { label: "Medium confidence", tone: "default" as const },
    low: { label: "Low / disputed", tone: "warn" as const },
  };
  const c = map[confidence];
  return <Chip tone={c.tone}>{c.label}</Chip>;
}

export function SampleBadge() {
  return <Chip tone="muted">Sample content</Chip>;
}

/* ------------------------------------------------------------------- alerts */

export function Notice({
  tone = "info", title, children,
}: { tone?: "info" | "warn" | "caution"; title?: string; children: ReactNode }) {
  const palette =
    tone === "warn"
      ? { bg: "color-mix(in srgb, var(--maroon-400) 10%, transparent)", border: "var(--maroon-400)" }
      : tone === "caution"
      ? { bg: "color-mix(in srgb, var(--gold) 12%, transparent)", border: "var(--gold)" }
      : { bg: "var(--surface-3)", border: "var(--line)" };
  return (
    <aside
      className="rounded-xl border p-4 text-sm leading-relaxed"
      style={{ background: palette.bg, borderColor: palette.border }}
      role={tone === "warn" ? "alert" : "note"}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="muted [&_a]:link-underline">{children}</div>
    </aside>
  );
}

/* ------------------------------------------------------------------ loading */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`card p-6 ${className}`} role="status" aria-live="polite">
      <SkeletonText lines={4} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({
  title, body, action, icon, className = "",
}: { title: string; body?: string; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={`card flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}>
      <div className="mb-1 opacity-40">{icon ?? <Mandala className="h-16 w-16" petals={12} />}</div>
      <p className="display text-lg font-semibold">{title}</p>
      {body && <p className="muted max-w-md text-sm">{body}</p>}
      {action}
    </div>
  );
}

/**
 * Error state. Takes either a short `message` or richer `children`, because a
 * genuine content gap (a missing translation) needs more than one line.
 */
export function ErrorState({
  title = "Something went wrong", message, children, onRetry, className = "",
}: {
  title?: string; message?: string; children?: ReactNode;
  onRetry?: () => void; className?: string;
}) {
  return (
    <div className={`card border-2 px-6 py-8 text-center ${className}`} role="alert">
      <p className="display text-lg font-semibold">{title}</p>
      {message && <p className="muted mx-auto mt-2 max-w-md text-sm">{message}</p>}
      {children && (
        <div className="muted mx-auto mt-2 max-w-xl text-sm leading-relaxed [&_a]:link-underline">
          {children}
        </div>
      )}
      {onRetry && (
        <button className="btn btn-primary mt-4" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- quotes */

export function VerseBlock({
  devanagari, iast, translation, label, id, speaker, padas, range,
}: {
  devanagari: string; iast?: string; translation?: string; label?: string; id?: string;
  speaker?: string | null; padas?: number; range?: boolean;
}) {
  return (
    <figure id={id} className="scroll-mt-28 border-l-2 py-3 pl-5"
            style={{ borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)" }}>
      {label && (
        <figcaption className="muted mb-2 flex flex-wrap items-center gap-2 font-mono text-xs tracking-wide">
          <span>{label}</span>
          {speaker && <span className="not-italic">· {speaker}</span>}
          {typeof padas === "number" && padas > 0 && <span>· {padas} pada{padas === 1 ? "" : "s"}</span>}
          {range && <span>· spans more than one verse</span>}
        </figcaption>
      )}
      <p className="verse-deva whitespace-pre-line">{devanagari}</p>
      {iast && <p className="verse-iast mt-2" style={{ color: "var(--ink-2)" }}>{iast}</p>}
      {translation && (
        <blockquote className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {translation}
        </blockquote>
      )}
    </figure>
  );
}

export function PullQuote({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <blockquote className="card my-6 px-6 py-5">
      <p className="display text-lg leading-relaxed">{children}</p>
      {source && (
        <footer className="muted mt-3 text-xs uppercase tracking-[0.12em]">— {source}</footer>
      )}
    </blockquote>
  );
}

/* -------------------------------------------------------------------- links */

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="link-underline font-medium">{children}</Link>;
}

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="muted inline-flex items-center gap-1.5 text-sm hover:opacity-100"
          style={{ opacity: 0.85 }}>
      <span aria-hidden="true">←</span> {label}
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="muted mb-5 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="opacity-50">/</span>}
            {it.href && i < items.length - 1 ? (
              <Link href={it.href} className="link-underline">{it.label}</Link>
            ) : (
              <span aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ----------------------------------------------------------------- utilities */

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="muted text-[0.68rem] uppercase tracking-[0.14em]">{label}</p>
      <p className="display mt-0.5 text-xl font-semibold">{value}</p>
      {hint && <p className="muted mt-0.5 text-xs">{hint}</p>}
    </div>
  );
}

export function DefinitionList({ items }: { items: [string, string | null | undefined][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(9rem,auto)_1fr]">
      {items.filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="muted text-sm font-medium">{k}</dt>
          <dd className="text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
