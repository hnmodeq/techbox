"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ChromaItem } from "@/components/effects/ChromaGrid";

// Code-split the heavy gsap-driven grid (below the fold) so it doesn't bloat
// the initial homepage JavaScript bundle.
const ChromaGrid = dynamic(
  () => import("@/components/effects/ChromaGrid").then((m) => m.default),
  { ssr: true, loading: () => <div className="min-h-[480px]" aria-hidden /> }
);

export type TeamMember = {
  name: string;
  role: string;
  roleFa?: string;
  username: string;
  avatar?: string;
  modules: string[];
};

/** Resolve a CSS var (e.g. --tb-blog) to a concrete rgb string for the card gradient. */
function resolveVarColor(varName: string, fallback: string): string {
 if (typeof window === "undefined") return fallback;
 const probe = document.createElement("span");
 probe.style.color = `var(${varName})`;
 probe.style.display = "none";
 document.body.appendChild(probe);
 const resolved = getComputedStyle(probe).color;
 probe.remove();
 return resolved || fallback;
}

export default function TeamChromaSection({ team }: { team: TeamMember[] }) {
 const [items, setItems] = useState<ChromaItem[]>([]);

 // The accent var cycles across module tokens so each card is tinted from central tokens.
 const accentVars = useMemo(
 () => ["--blog", "--news", "--subnet", "--vip", "--tools", "--shop"],
 []
 );

 useEffect(() => {
 const build = () => {
 const next = team.map((u, i) => {
 const varName = accentVars[i % accentVars.length];
        const color = resolveVarColor(varName, "var(--home)");
          return {
            image: u.avatar || "/assets/hooman.png",
            title: u.name,
            subtitle: u.roleFa || (u.role === "super_admin" ? "مدیر کل" : "ویراستار"),
            borderColor: color,
            gradient: `linear-gradient(145deg, ${color}, var(--card-background))`,
          } satisfies ChromaItem;
 });
 setItems(next);
 };
 build();
 const observer = new MutationObserver(build);
 observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
 return () => observer.disconnect();
 }, [team, accentVars]);

 return (
 <div className="relative w-full min-h-[480px]" dir="ltr">
 <ChromaGrid items={items} radius={300} damping={0.45} fadeOut={0.6} ease="power3.out" />
 </div>
 );
}
