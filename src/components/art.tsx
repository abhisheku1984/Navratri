"use client";

/**
 * A cinematic framed presentation of the app's original devotional artwork.
 *
 * Renders nothing heavy in low-data mode (a quiet ornament instead) and never
 * eager-loads a multi-hundred-KB image, so the "cinematic" look does not come
 * at the cost of the app's low-bandwidth promise. The slow Ken Burns breathe is
 * suppressed when the reader prefers reduced motion.
 *
 * Every frame carries the caption "Contemporary digital rendering" so the art
 * is never mistaken for a traditional or historical painting.
 */

import { useUser } from "@/lib/user";
import { ART_CAPTION } from "@/lib/art";
import { Lotus } from "@/components/ornament";

export function CinematicArt({
  src,
  alt,
  className = "",
  eager = false,
  caption = ART_CAPTION,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Set for the one above-the-fold hero; everything else lazy-loads. */
  eager?: boolean;
  caption?: string;
}) {
  const { state, hydrated } = useUser();
  const lowData = state.settings.lowData;

  if (!hydrated || lowData) {
    // No image: keep layout calm with an ornament placeholder.
    return (
      <figure
        className={`cinematic flex items-center justify-center ${className}`}
        style={{ minHeight: "12rem" }}
        role="img"
        aria-label={alt}
      >
        <Lotus className="h-10 w-24" stroke="var(--gold)" opacity={0.5} />
      </figure>
    );
  }

  return (
    <figure className={`cinematic ${className}`}>
      <div className="cinematic-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="cinematic-img"
        />
        <span className="cinematic-vignette" aria-hidden="true" />
      </div>
      <figcaption className="muted mt-2 text-center text-[0.66rem] uppercase tracking-[0.18em]">
        {caption}
      </figcaption>
    </figure>
  );
}
