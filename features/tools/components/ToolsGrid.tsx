"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import { useState } from "react";
import RaidCalculator from "@/features/tools/components/RaidCalculator";
import SubnetCalculator from "@/features/tools/components/SubnetCalculator";

const toolComponents: Record<string, React.ComponentType> = {
  "raid-calculator": RaidCalculator,
  "subnet-calculator": SubnetCalculator,
};

export default function ToolsGrid(){
  const items = getModuleItems("tools");
  const meta = moduleMeta.tools;
  const [active, setActive] = useState(items[0]?.slug || "raid-calculator");
  const ActiveComp = toolComponents[active] || RaidCalculator;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <h1 className={`text-3xl font-black mb-2 ${meta.color}`}>ابزارهای زیرساختی</h1>
      <p className="text-sm text-muted-foreground mb-6">اجرای مستقیم در مرورگر – بدون نصب</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {items.map(t => (
          <button
            key={t.slug}
            onClick={()=>setActive(t.slug)}
            className={`btn text-xs ${active===t.slug ? "btn-primary" : "btn-ghost"}`}
          >
            {t.title}
          </button>
        ))}
        {/* quick extra tools */}
        <button onClick={()=>setActive("subnet-calculator")} className={`btn text-xs ${active==="subnet-calculator" ? "btn-primary":"btn-ghost"}`}>Subnet Calculator</button>
      </div>

      <ActiveComp />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {items.map(t=>(
          <div key={t.slug} className="card p-4">
            <div className="text-[11px] text-[var(--tb-tools)]">{t.category}</div>
            <div className="font-bold mt-1 text-[14px]">{t.title}</div>
            <div className="text-xs text-muted-foreground mt-2">{t.excerpt}</div>
            <div className="text-[10px] text-muted-foreground mt-3">استفاده: {t.views.toLocaleString("fa-IR")} بار</div>
          </div>
        ))}
      </div>
    </main>
  );
}
