"use client";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMemo, useState } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";

export default function DownloadTable(){
 const items = getModuleItems("download");
 const brands = Array.from(new Set(items.flatMap(i=> i.tags.filter(t=>["dell","hp","qnap","ubuntu","mikrotik"].includes(t.toLowerCase())))));
 const types = Array.from(new Set(items.map(i=>i.category).filter(Boolean))) as string[];

 const [q,setQ] = useState("");
 const [brand,setBrand] = useState("all");
 const [type,setType] = useState("all");
 const [os,setOs] = useState("all");

 const filtered = useMemo(()=>{
 return items.filter(f=>{
 if(q && !(`${f.title} ${f.excerpt} ${f.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
 if(brand!=="all" && !f.tags.map(t=>t.toLowerCase()).includes(brand.toLowerCase())) return false;
 if(type!=="all" && f.category !== type) return false;
 if(os!=="all" && !f.tags.some(t=>t.toLowerCase().includes(os.toLowerCase()))) return false;
 return true;
 });
 }, [items,q,brand,type,os]);

 return (
 <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
 <ModuleHeader module="download" title="مرکز دانلود تکباکس" description="ISO • Firmware • Driver – لینک مستقیم داخل ایران" count={`${filtered.length.toLocaleString("fa-IR")} فایل`} />

 {/* filters */}
 <div className="card p-4 mb-6 grid md:grid-cols-4 gap-3 tb-text-md">
 <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو فایل…" className="input md:col-span-1" />
 <select value={brand} onChange={e=>setBrand(e.target.value)} className="input">
 <option value="all">همه برندها</option>
 <option value="dell">DELL</option>
 <option value="hp">HP</option>
 <option value="qnap">QNAP</option>
 <option value="ubuntu">Ubuntu</option>
 <option value="mikrotik">MikroTik</option>
 {brands.filter(b=>!["dell","hp","qnap","ubuntu","mikrotik"].includes(b.toLowerCase())).map(b=><option key={b} value={b}>{b}</option>)}
 </select>
 <select value={type} onChange={e=>setType(e.target.value)} className="input">
 <option value="all">همه نوع‌ها</option>
 {types.map(t=> <option key={t} value={t}>{t}</option>)}
 </select>
 <select value={os} onChange={e=>setOs(e.target.value)} className="input">
 <option value="all">همه OS</option>
 <option value="linux">Linux</option>
 <option value="windows">Windows</option>
 <option value="vmware">VMware</option>
 <option value="qnap">QTS</option>
 </select>
 </div>

 <div className="card overflow-hidden">
 <table className="w-full tb-text-md">
 <thead className="bg-[var(--tb-bg-muted)]/30 tb-text-sm text-[var(--tb-fg-muted)]">
 <tr>
              <th className="text-right p-3">نام فایل</th>
              <th className="p-3 hidden md:table-cell text-right">تاریخ</th>
              <th className="p-3 text-left">جزئیات</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map(f=>(
 <tr key={f.slug} className="border-t border-[color-mix(in_oklch,var(--tb-border)_60%,transparent)] hover:bg-[var(--tb-bg-muted)]/20 align-top">
                <td className="p-3">
                  <Link href={`/download/${f.slug}`} className=" hover:text-[var(--tb-download)] tb-text-md">{f.title}</Link>
                  <div className="tb-text-sm text-muted-foreground mt-1 line-clamp-2">{f.excerpt}</div>
                </td>
                <td className="p-3 hidden md:table-cell tb-text-sm text-muted-foreground">{f.date_fa}</td>
 <td className="p-3 text-left align-top">
 <ButtonLink href={`/download/${f.slug}`} variant="ghost" size="xs" className="whitespace-nowrap tb-text-sm">انتخاب نسخه</ButtonLink>
 <div className="tb-text-sm text-muted-foreground mt-1">{f.likes.toLocaleString("fa-IR")} بار</div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {filtered.length===0 && <div className="p-8 text-center text-muted-foreground tb-text-md">فایلی یافت نشد – فیلتر را تغییر دهید</div>}
 </div>
 </main>
 );
}
