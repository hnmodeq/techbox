"use client";
import { useSearchParams } from "next/navigation";
import { searchAcross } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function SearchInner(){
 const sp = useSearchParams();
 const q = sp.get("q") || "";
 const results = searchAcross(q);
 return (
 <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-2">جستجو</h1>
 <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-muted-foreground mb-6">{q ? <>نتایج برای <b>«{q}»</b> – {results.length.toLocaleString("fa-IR")} مورد</> : "یک عبارت وارد کنید"}</p>
 <div className="grid gap-3 md:grid-cols-2">
 {results.map(r=> <ContentCard key={r.module+r.slug} item={r} />)}
 </div>
 {q && results.length===0 && <p className="text-muted-foreground text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">نتیجه‌ای یافت نشد.</p>}
 </main>
 );
}
export default function SearchPage(){
 return <Suspense fallback={<div className="p-10 text-center">...</div>}><SearchInner/></Suspense>
}
