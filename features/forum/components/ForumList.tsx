"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { useState } from "react";
import { zIndex } from "@/design";

type ForumPost = ReturnType<typeof getModuleItems>[0] & { answers?: number; solved?: boolean };

export default function ForumList(){
  const items = getModuleItems("forum").map((t,i)=>({
    ...t,
    answers: (t.likes % 9) + 2,
    solved: !t.slug.includes("proxmox"),
    avatar: t.author.avatar || "/assets/hooman.png"
  })) as (ForumPost & {avatar:string})[];
  const meta = moduleMeta.forum;
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [local, setLocal] = useState<typeof items>([]);

  const all = [...local, ...items];

  const submitTopic = (e: React.FormEvent)=>{
    e.preventDefault();
    if(!title.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g,"-").slice(0,60) + "-" + Date.now().toString(36);
    const nt:any = {
      slug, module:"forum", title: title.trim(),
      excerpt: body.slice(0,140),
      content: body,
      tags: ["پرسش","تکباکس"],
      author:{ name:"شما", role:"عضو", avatar:"/assets/hooman.png" },
      avatar:"/assets/hooman.png",
      date: new Date().toISOString(),
      date_fa: new Intl.DateTimeFormat("fa-IR", {dateStyle:"long"}).format(new Date()),
      likes:0, views:1, category:"پرسش",
      answers:0, solved:false
    };
    setLocal(l=>[nt, ...l]);
    setTitle(""); setBody(""); setShowNew(false);
    // persist draft
    const d = JSON.parse(localStorage.getItem("tb_forum_drafts")||"[]"); d.unshift(nt); localStorage.setItem("tb_forum_drafts", JSON.stringify(d));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>انجمن تکباکس</h1>
          <p className="text-xs text-muted-foreground mt-1">پرسش و پاسخ تخصصی – سبک Reddit</p>
        </div>
        <div className="flex gap-2">
          <input placeholder="جستجو در انجمن…" className="input w-56 text-sm" />
          <button onClick={()=>setShowNew(true)} className="btn btn-primary text-sm">+ موضوع جدید</button>
        </div>
      </div>

      {/* sub nav like reddit */}
      <div className="flex gap-2 text-[11px] mb-4">
        {["داغ","جدید","برتر","حل‌شده"].map(t=>(
          <button key={t} className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted">{t}</button>
        ))}
      </div>

      <div className="card divide-y divide-border/60 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 text-[11px] text-muted-foreground px-4 py-2 bg-muted/30">
          <div className="col-span-7">موضوع</div>
          <div className="col-span-1 text-center">رای</div>
          <div className="col-span-2 text-center">پاسخ / بازدید</div>
          <div className="col-span-2 text-left">آخرین فعالیت</div>
        </div>
        {all.map(t=>(
          <div key={t.slug} className="grid grid-cols-12 px-3 sm:px-4 py-3 hover:bg-muted/20 gap-2 items-center">
            {/* vote column – reddit style */}
            <div className="hidden sm:flex col-span-1 flex-col items-center text-muted-foreground text-[11px]">
              <button className="hover:text-[var(--tb-blog)]">▲</button>
              <span className="font-bold text-foreground">{t.likes}</span>
              <button className="hover:text-[var(--tb-review)]">▼</button>
            </div>
            {/* main */}
            <div className="col-span-12 sm:col-span-6 flex gap-3">
              <img src={t.avatar} alt={t.author.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-border mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/forum/${t.slug}`} className="font-bold text-[14px] leading-6 hover:text-[var(--tb-forum)]">{t.title}</Link>
                  {t.solved && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] text-[var(--tb-success)] border border-[color-mix(in_oklch,var(--tb-success)_20%,transparent)]">حل‌شده ✓</span>}
                  {!t.solved && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[color-mix(in_oklch,var(--tb-warning)_10%,transparent)] text-[var(--tb-warning)] border border-[color-mix(in_oklch,var(--tb-warning)_20%,transparent)]">باز</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  ارسال شده توسط <b className="text-foreground">{t.author.name}</b> • {t.date_fa} • {t.tags.slice(0,2).map(x=>`#${x}`).join(" ")}
                </div>
              </div>
            </div>
            {/* stats */}
            <div className="col-span-6 sm:col-span-2 text-center">
              <div className="text-sm font-bold">{t.answers} <span className="text-[11px] text-muted-foreground font-normal">پاسخ</span></div>
            </div>
            <div className="col-span-6 sm:col-span-2 text-center text-[11px] text-muted-foreground">
              {t.views.toLocaleString("fa-IR")} بازدید
            </div>
            <div className="hidden sm:block col-span-1 text-left text-[11px] text-muted-foreground">
              {t.date_fa.split(" ")[0]}<br/>{t.author.name.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>

      {/* New Topic Modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex:zIndex.modal}} dir="rtl">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={()=>setShowNew(false)} />
          <form onSubmit={submitTopic} className="relative card w-full max-w-2xl p-5 space-y-3 z-10">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg">موضوع جدید – انجمن تکباکس</h3>
              <button type="button" onClick={()=>setShowNew(false)} className="text-muted-foreground">✕</button>
            </div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان واضح بپرسید…" className="input" required />
            <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="جزئیات مشکل، لاگ‌ها، چیزی که امتحان کردید…" className="input min-h-[160px]" required />
            <div className="text-[11px] text-muted-foreground">با ارسال، با قوانین انجمن موافقت می‌کنید. پیش‌نویس به‌صورت لوکال ذخیره می‌شود – در نسخه Prisma به /api/posts ارسال خواهد شد.</div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setShowNew(false)} className="btn btn-ghost">انصراف</button>
              <button className="btn btn-primary">ارسال موضوع</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
