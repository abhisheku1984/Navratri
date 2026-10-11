/**
 * Ornamental components.
 *
 * Everything here is inline SVG or CSS. There are no bitmap assets, no icon
 * font and no CDN request, so the decorative layer costs nothing on a slow
 * connection and cannot fail to load. Every animation is suppressed when
 * [data-motion="reduced"] is set (see globals.css).
 */

export function Mandala({
  className = "",
  petals = 16,
  spin = false,
  stroke = "currentColor",
  strokeWidth = 0.7,
  opacity = 0.5,
}: {
  className?: string;
  petals?: number;
  spin?: boolean;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const items = Array.from({ length: petals }, (_, i) => (360 / petals) * i);
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} ${spin ? "mandala-spin" : ""}`}
      role="presentation"
      aria-hidden="true"
      style={{ color: stroke, opacity }}
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
        <circle cx="100" cy="100" r="94" />
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="26" />
        {items.map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <path d="M100 22 C 112 48, 112 62, 100 74 C 88 62, 88 48, 100 22 Z" />
            <path d="M100 74 C 108 84, 108 92, 100 98 C 92 92, 92 84, 100 74 Z" />
            <line x1="100" y1="98" x2="100" y2="74" />
          </g>
        ))}
        {items.slice(0, petals / 2).map((a) => (
          <circle key={`d${a}`} cx="100" cy="14" r="2.4"
                  transform={`rotate(${a + 360 / petals / 2} 100 100)`} />
        ))}
      </g>
    </svg>
  );
}

export function Lotus({
  className = "",
  stroke = "currentColor",
  opacity = 0.6,
}: { className?: string; stroke?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 120 60" className={className} role="presentation" aria-hidden="true"
         style={{ color: stroke, opacity }} fill="none" stroke="currentColor" strokeWidth={1.1}>
      <path d="M60 52 C 46 46, 34 34, 30 18 C 44 22, 54 32, 60 44 Z" />
      <path d="M60 52 C 74 46, 86 34, 90 18 C 76 22, 66 32, 60 44 Z" />
      <path d="M60 52 C 50 44, 44 30, 44 12 C 54 20, 59 34, 60 46 Z" />
      <path d="M60 52 C 70 44, 76 30, 76 12 C 66 20, 61 34, 60 46 Z" />
      <path d="M60 52 C 56 42, 56 26, 60 8 C 64 26, 64 42, 60 52 Z" />
      <path d="M14 52 C 34 58, 86 58, 106 52" />
    </svg>
  );
}

export function Diya({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="flameGrad" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="#f0a03a" />
          <stop offset="100%" stopColor="#cf6d1f" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="40" rx="22" ry="5.5" fill="#571a29" opacity="0.18" />
      <path d="M8 32 C 16 42, 48 42, 56 32 C 48 36, 16 36, 8 32 Z" fill="#c9a227" />
      <path d="M8 32 C 18 28, 46 28, 56 32 C 48 36, 16 36, 8 32 Z" fill="#e8c86a" />
      <g className="diya-flame" style={{ transformOrigin: "32px 30px" }}>
        <path
          d="M32 6 C 37 14, 40 18, 40 23 C 40 28, 36 31, 32 31 C 28 31, 24 28, 24 23 C 24 18, 27 14, 32 6 Z"
          fill="url(#flameGrad)"
        />
        <path d="M32 16 C 34.5 20, 36 22, 36 25 C 36 28, 34 29.5, 32 29.5 C 30 29.5, 28 28, 28 25 C 28 22, 29.5 20, 32 16 Z"
              fill="#fff8ee" opacity="0.85" />
      </g>
    </svg>
  );
}

export function Trident({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="presentation" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M24 44 V 18" />
      <path d="M10 20 C 10 10, 15 6, 15 6 M38 20 C 38 10, 33 6, 33 6" />
      <path d="M10 20 H 38" />
      <path d="M15 6 L 13 10 L 17 10 Z" fill="currentColor" />
      <path d="M33 6 L 31 10 L 35 10 Z" fill="currentColor" />
      <path d="M24 18 L 21 22 L 27 22 Z" fill="currentColor" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function OmMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <path d="M14 40 c -6 0 -9 -4 -8 -8 c 1 -5 7 -6 11 -3 c 5 4 2 12 -4 13 c -7 1 -12 -5 -10 -12" />
      <path d="M20 34 c 4 -3 10 -2 12 2 c 2 5 -2 10 -8 10" />
      <path d="M32 26 c 6 -2 12 2 12 9 c 0 9 -8 14 -16 13" />
      <path d="M36 18 c 4 -4 11 -2 12 3 c 1 4 -2 7 -6 7" />
      <circle cx="46" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function OrnamentRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="ornament-rule flex-1" />
      <Lotus className="h-4 w-8 shrink-0" />
      <span className="ornament-rule flex-1" />
    </div>
  );
}

/**
 * Golden motes. Rendered client-side only (see GoldenMotes) so the SSR markup
 * stays stable, and suppressed entirely under reduced motion and in low-data
 * mode.
 */
export function MotesStatic({ count = 14 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const left = (i * 71) % 100;
    const delay = (i * 1.37) % 14;
    const size = 1.5 + ((i * 13) % 4) * 0.5;
    return { left, delay, size };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="mote absolute rounded-full"
          style={{
            left: `${d.left}%`,
            bottom: "-8px",
            width: d.size,
            height: d.size,
            background: "var(--gold)",
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
