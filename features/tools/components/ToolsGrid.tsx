"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import { useState } from "react";
import RaidCalculator from "@/features/tools/components/RaidCalculator";
import SubnetCalculator from "@/features/tools/components/SubnetCalculator";
import { Button } from "@/components/ui/Button";
import ModuleHeader from "@/components/effects/ModuleHeader";

const toolComponents: Record<string, React.ComponentType> = {
 "raid-calculator": RaidCalculator,
 "subnet-calculator": SubnetCalculator,
};

export default function ToolsGrid(){
 const items = getModuleItems("tools");
 const [active, setActive] = useState(items[0]?.slug || "raid-calculator");
 const ActiveComp = toolComponents[active] || RaidCalculator;

 return (
 <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
 <ModuleHeader module="tools" title="ابزارهای زیرساختی" description="اجرای مستقیم در مرورگر – بدون نصب" />

 <div className="flex flex-wrap gap-2 mb-6">
 {items.map(t => (
 <Button
 key={t.slug}
 onClick={()=>setActive(t.slug)}
 variant={active===t.slug ? "primary" : "ghost"}
 size="xs"
 >
 {t.title}
 </Button>
 ))}
 {/* quick extra tools */}
 <Button onClick={()=>setActive("subnet-calculator")} variant={active==="subnet-calculator" ? "primary" : "ghost"} size="xs">Subnet Calculator</Button>
 </div>

 <ActiveComp />

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
 {items.map(t=>(
 <div key={t.slug} className="card p-4">
 <div className="tb-text-sm text-[var(--tb-tools)]">{t.category}</div>
 <div className=" mt-1 tb-text-md">{t.title}</div>
 <div className="tb-text-sm text-muted-foreground mt-2">{t.excerpt}</div>
 <div className="tb-text-sm text-muted-foreground mt-3">استفاده: {t.views.toLocaleString("fa-IR")} بار</div>
 </div>
 ))}
 </div>
 </main>
 );
}
