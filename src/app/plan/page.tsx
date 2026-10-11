"use client";

/**
 * Pilgrimage planner.
 *
 * Ordering and distance only. See src/components/planner.tsx for why travel
 * times are deliberately absent: producing one would mean inventing it.
 */

import { useUser } from "@/lib/user";
import { PageHeader, Stat } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui";
import { ItineraryPlanner } from "@/components/planner";
import { getPeethas, getTemples } from "@/lib/content";

export default function PlanPage() {
  const { state, hydrated } = useUser();

  const peethas = getPeethas();
  const temples = getTemples();
  const stops = state.itinerary.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plan a pilgrimage" }]} />

      <PageHeader
        eyebrow="Pilgrimage planner"
        title="Plan a pilgrimage"
        sub="Collect the Peethas and temples you hope to visit, put them in order, and see how far apart they are. Nothing here is sent anywhere — your plan stays on this device."
      >
        <div className="flex flex-wrap gap-3">
          <Stat label="Shakti Peethas" value={String(peethas.length)} hint="across five countries" />
          <Stat
            label="Devi temples"
            value={String(temples.length)}
            hint="Peethas and major shrines"
          />
          <Stat
            label="On your plan"
            value={hydrated ? String(stops) : "—"}
            hint={stops === 0 ? "nothing selected yet" : "saved on this device"}
          />
        </div>
      </PageHeader>

      <ItineraryPlanner />
    </div>
  );
}
