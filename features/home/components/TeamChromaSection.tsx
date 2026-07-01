"use client";

import { useEffect, useMemo, useState } from "react";
import ChromaGrid, { type ChromaItem } from "@/components/effects/ChromaGrid";

export type TeamMember = {
 name: string;
 role: string;
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
 () => ["--tb-blog", "--tb-news", "--tb-subnet", "--tb-vip", "--tb-tools", "--tb-shop"],
 []
 );

 useEffect(() => {
 const build = () => {
 const next = team.map((u, i) => {
 const varName = accentVars[i % accentVars.length];
 const color = resolveVarColor(varName, "#60a5fa");
 return {
 image: u.avatar || "/assets/hooman.png",
 title: u.name,
 subtitle: u.role === "super_admin" ? "مدیر کل" : "ویراستار",
 handle: `@${u.username}`,
 location: u.modules.slice(0, 2).join("، "),
 borderColor: color,
 gradient: `linear-gradient(145deg, ${color}, var(--tb-bg-secondary))`,
 url: "/account",
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
