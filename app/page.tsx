import React from "react";
import { HomeBentoGrid } from "@/features/home/components/HomeBentoGrid";
import { SpotlightBackground } from "@/components/effects/SpotlightBackground";
import { getSetting } from "@/lib/settings";

export default async function Page() {
  // Load terminal hero lines from DB (admin-configurable)
  let terminalLines: string[] | undefined;
  try {
    const raw = await getSetting("hero.terminal.lines");
    if (raw) terminalLines = JSON.parse(raw);
  } catch {
    terminalLines = undefined;
  }

  return (
    <>
      {/* Spotlight mouse-tracking background — fixed, covers the whole viewport */}
      <SpotlightBackground />

      <main className="relative z-10 overflow-x-hidden w-full max-w-full">
        <HomeBentoGrid terminalLines={terminalLines} />
      </main>
    </>
  );
}
