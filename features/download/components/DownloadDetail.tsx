"use client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { useState, useMemo } from "react";

const fakeVersions = (slug:string) => {
 const base = [
 { ver: "v5.2.4", date: "2026-07-12", dateFa: "21 تیر 1405", size: "842 MB", os: "QTS", notes: "پایدار – پیشنهادی" },
 { ver: "v5.2.3", date: "2026-06-20", dateFa: "30 خرداد 1405", size: "838 MB", os: "QTS", notes: "رفع باگ امنیتی" },
 { ver: "v5.1.9", date: "2026-05-02", dateFa: "12 اردیبهشت 1405", size: "821 MB", os: "QTS", notes: "" },
 { ver: "v24.04", date: "2026-07-07", dateFa: "16 تیر 1405", size: "2.1 GB", os: "Linux", notes: "LTS" },
 { ver: "2022", date: "2026-04-11", dateFa: "22 فروردین 1405", size: "4.7 GB", os: "Windows", notes: "" },
 ];
 // filter a bit by slug tags
 return base;
};

export default function DownloadDetail({ item }: { item: ContentItem }){
 const versions = fakeVersions(item.slug);
 const osOptions = Array.from(new Set(["all", ...versions.map(v=>v.os), ...item.tags.filter(t=>["linux","windows","vmware","qnap","ubuntu"].includes(t.toLowerCase())) ]));
 const [os, setOs] = useState("all");
 const [sort, setSort] = useState<"new"|"old">("new");

 const list = useMemo(()=>{
 let l = versions.filter(v => os==="all" || v.os.toLowerCase()===os.toLowerCase() || item.tags.some(t=>t.toLowerCase()===os.toLowerCase()));
 if(l.length===0) l = versions;
 l = [...l].sort((a,b)=> sort==="new" ? +new Date(b.date) - +new Date(a.date) : +new Date(a.date) - +new Date(b.date));
 return l;
 }, [os, sort, versions, item.tags]);

 return (
 <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mb-2">
 <Link href="/download" className="hover:text-foreground">دانلود</Link> / <span className="text-[var(--download)]">{item.category}</span>
 </div>
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold md:text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{item.title}</h1>
      <p className="text-muted-foreground mt-3">{item.excerpt}</p>

      {/* OS chooser */}
 <div className="card p-4 mt-8">
 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
 <div className="">انتخاب سیستم‌عامل / نسخه</div>
 <div className="flex gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <select value={os} onChange={e=>setOs(e.target.value)} className="input !w-auto !py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {osOptions.map(o=> <option key={o} value={o}>{o==="all"?"همه OS":o}</option>)}
 </select>
 <select value={sort} onChange={e=>setSort(e.target.value as any)} className="input !w-auto !py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 <option value="new">جدیدترین اول</option>
 <option value="old">قدیمی‌ترین اول</option>
 </select>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
 <thead className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground border-b border-[var(--border-color)]">
 <tr>
 <th className="text-right py-2 pe-2">نسخه</th>
 <th className="text-right py-2">تاریخ</th>
 <th className="text-right py-2 hidden sm:table-cell">OS</th>
 <th className="text-right py-2 hidden sm:table-cell">حجم</th>
 <th className="text-right py-2">یادداشت</th>
 <th></th>
 </tr>
 </thead>
 <tbody>
 {list.map(v=>(
 <tr key={v.ver+v.date} className="border-b border-[var(--border-color)]/40 hover:bg-[var(--muted-background)]/20">
 <td className="py-3 pe-2 font-mono text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ">{v.ver}</td>
 <td className="py-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{v.dateFa}</td>
 <td className="py-3 hidden sm:table-cell"><Badge variant="download" className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{v.os}</Badge></td>
 <td className="py-3 hidden sm:table-cell text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground" dir="ltr">{v.size}</td>
 <td className="py-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground">{v.notes}</td>
 <td className="py-3 text-left">
 <Button size="xs" onClick={e=>{e.preventDefault(); alert(`شروع دانلود ${item.title} – ${v.ver} (${v.os})`);}} className="px-3 py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">دانلود</Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mt-3">لینک مستقیم داخل ایران – قابلیت resume – SHA256 در صفحه چک‌سام موجود است.</p>
 </div>

 <div className="card p-4 mt-6 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground">
 {item.content}
 </div>
 </main>
 );
}
