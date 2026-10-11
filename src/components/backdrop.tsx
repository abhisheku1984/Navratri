"use client";

/**
 * A fixed, full-bleed cinematic Devi Durga backdrop behind every page.
 *
 * The same original rendering sits under all sections; each section tints it
 * with its own `--tint` (see lib/theme.ts) so the background reads as themed
 * per page. The image is kept faint and layered under a legibility scrim so
 * body text stays readable.
 *
 * Respects the app's promises:
 *  - low-data mode swaps the photo for a calm solid surface,
 *  - reduced motion disables the slow drift.
 */

import { useUser } from "@/lib/user";

export function CinematicBackdrop() {
  const { state, hydrated } = useUser();
  const lowData = state.settings.lowData;

  // Render immediately (including in the server HTML); only an explicit
  // low-data choice after mount swaps the photo for a solid surface.
  if (hydrated && lowData) {
    return <div className="app-backdrop app-backdrop--solid" aria-hidden="true" />;
  }

  return (
    <div className="app-backdrop" aria-hidden="true">
      <div className="app-backdrop-img" />
      <div className="app-backdrop-scrim" />
    </div>
  );
}
