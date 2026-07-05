"use client";
import { useSearchParams } from "next/navigation";
import { searchAcross } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import { Suspense, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

function SearchInner(){
 const sp = useSearchParams();
 const q = sp.get("q") || "";
 const [results, setResults] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
   if (!q) { setResults([]); return; }
   setLoading(true);
   // We fetch via API since this is a client component
   fetch(`/api/posts?search=${encodeURIComponent(q)}`)
     .then(r => r.json())
     .then(data => setResults(Array.isArray(data) ? data : []))
     .catch(() => setResults([]))
     .finally(() => setLoading(false));
 }, [q]);

 return (
   <main className="max-w-4xl mx-auto px-4 py-12" dir="rtl">
     <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-2">جستجو</h1>
     <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-muted-foreground mb-6">
       {q ? <>نتایج برای <b>«{q}»</b> – {results.length.toLocaleString("fa-IR")} مورد</> : "یک عبارت وارد کنید"}
     </p>
     {loading ? (
       <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color text-center py-8 animate-pulse">در حال جستجو...</p>
     ) : (
       <div className="grid gap-3 md:grid-cols-2">
         {results.map((r: any) => <ContentCard key={r.module + r.slug} item={r} />)}
       </div>
     )}
     {q && !loading && results.length === 0 && <p className="text-muted-foreground text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">نتیجه‌ای یافت نشد.</p>}
   </main>
 );
}
export default function SearchPage(){
 return <Suspense fallback={<div className="p-10 text-center">...</div>}><SearchInner/></Suspense>
}