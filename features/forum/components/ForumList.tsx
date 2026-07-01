"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useState } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/Button";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { ChipButton } from "@/components/ui/ChipButton";
import { CloseButton } from "@/components/ui/CloseButton";
import { OverlayBackdrop } from "@/components/ui/Overlay";

type ForumPost = ReturnType<typeof getModuleItems>[0] & { answers?: number; solved?: boolean };

export default function ForumList() {
  const items = getModuleItems("forum").map((t) => ({
    ...t,
    answers: (t.likes % 9) + 2,
    solved: !t.slug.includes("proxmox"),
    avatar: t.author?.avatar || "/assets/hooman.png",
  })) as (ForumPost & { avatar: string })[];

  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [local, setLocal] = useState<typeof items>([]);
  const [filter, setFilter] = useState<"داغ" | "جدید" | "برتر" | "حل‌شده">("داغ");

  const merged = [...local, ...items];
  const all = (() => {
    const list = [...merged];
    if (filter === "جدید") return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (filter === "برتر") return list.sort((a, b) => b.likes - a.likes);
    if (filter === "حل‌شده") return list.filter((t) => t.solved);
    return list.sort((a, b) => b.views - a.views); // داغ
  })();

  const submitTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
    const nt: any = {
      slug,
      module: "forum",
      title: title.trim(),
      excerpt: body.slice(0, 140),
      content: body,
      tags: ["پرسش", "تکباکس"], // kept in data systematically, hidden in UI
      author: { name: "شما", role: "عضو", avatar: "/assets/hooman.png" },
      avatar: "/assets/hooman.png",
      date: new Date().toISOString(),
      date_fa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
      likes: 0,
      views: 1,
      category: "پرسش",
      answers: 0,
      solved: false,
    };
    setLocal((l) => [nt, ...l]);
    setTitle("");
    setBody("");
    setShowNew(false);
    const d = JSON.parse(localStorage.getItem("tb_forum_drafts") || "[]");
    d.unshift(nt);
    localStorage.setItem("tb_forum_drafts", JSON.stringify(d));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <ModuleHeader module="forum" title="انجمن تکباکس" description="پرسش و پاسخ تخصصی زیرساخت و شبکه" count={`${all.length.toLocaleString("fa-IR")} موضوع`}>
        <div className="flex gap-2">
          <input placeholder="جستجو در انجمن…" className="input w-56 tb-text-md" />
          <Button onClick={() => setShowNew(true)} className="tb-text-md">+ موضوع جدید</Button>
        </div>
      </ModuleHeader>

      <div className="flex gap-2 tb-text-sm mb-4">
        {(["داغ", "جدید", "برتر", "حل‌شده"] as const).map((t) => (
          <ChipButton key={t} tone="forum" aria-pressed={filter === t} onClick={() => setFilter(t)} className={filter === t ? "ring-1 ring-[var(--tb-forum)] text-[var(--tb-forum)]" : ""}>
            {t}
          </ChipButton>
        ))}
      </div>

      <div className="card divide-y divide-[var(--tb-border)]/60 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 tb-text-sm text-[var(--tb-fg-muted)] px-4 py-2.5 bg-[var(--tb-bg-muted)]/30 font-bold">
          <div className="col-span-7">عنوان موضوع و نویسنده</div>
          <div className="col-span-1 text-center">امتیاز</div>
          <div className="col-span-2 text-center">پاسخ / بازدید</div>
          <div className="col-span-2 text-left">آخرین فعالیت</div>
        </div>
        {all.map((t) => (
          <Link key={t.slug} href={`/forum/${t.slug}`} className="group grid grid-cols-12 px-3 sm:px-4 py-3.5 hover:bg-[var(--tb-bg-muted)]/20 gap-2 items-center transition-colors">
            {/* vote column */}
            <div className="hidden sm:flex col-span-1 flex-col items-center text-[var(--tb-fg-muted)] tb-text-sm">
              <Button type="button" variant="link" size="xs" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-[var(--tb-fg-muted)] hover:text-[var(--tb-success)] font-bold">▲</Button>
              <span className="font-bold text-[var(--tb-fg-primary)]">{t.likes.toLocaleString("fa-IR")}</span>
              <Button type="button" variant="link" size="xs" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); }} className="text-[var(--tb-fg-muted)] hover:text-[var(--tb-warning)] font-bold">▼</Button>
            </div>

            {/* main */}
            <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
              <Image src={t.avatar} alt={t.author?.name || "کاربر"} width={40} height={40} className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[var(--tb-border)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tb-text-md font-bold transition-colors group-hover:text-[var(--tb-forum)]">{t.title}</span>
                  {t.solved ? (
                    <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-success)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-success)]">
                      حل‌شده ✓
                    </span>
                  ) : (
                    <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-warning)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-warning)_30%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--tb-warning)]">
                      باز
                    </span>
                  )}
                </div>
                <div className="tb-text-sm text-[var(--tb-fg-muted)] mt-1">
                  ارسال‌شده توسط <b className="text-[var(--tb-fg-primary)]">{t.author?.name || "کاربر تکباکس"}</b> • {t.date_fa}
                </div>
              </div>
            </div>

            {/* stats */}
            <div className="col-span-6 sm:col-span-2 text-center">
              <div className="tb-text-md font-bold">{(t.answers ?? 0).toLocaleString("fa-IR")} <span className="tb-text-sm text-[var(--tb-fg-muted)] font-normal">پاسخ</span></div>
            </div>
            <div className="col-span-6 sm:col-span-2 text-center tb-text-sm text-[var(--tb-fg-muted)]">
              {t.views.toLocaleString("fa-IR")} بازدید
            </div>
            <div className="hidden sm:block col-span-1 text-left tb-text-sm text-[var(--tb-fg-muted)]">
              {t.date_fa.split(" ")[0]}<br />{t.author?.name.split(" ")[0]}
            </div>
          </Link>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: zIndex.modal }} dir="rtl">
          <OverlayBackdrop onClick={() => setShowNew(false)} />
          <form onSubmit={submitTopic} className="relative card w-full max-w-2xl p-6 space-y-4 z-10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--tb-border)] pb-3">
              <h3 className="tb-text-lg font-bold">موضوع جدید در انجمن تکباکس</h3>
              <CloseButton onClick={() => setShowNew(false)} />
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان واضح و دقیق بپرسید…" className="input w-full" required />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="جزئیات کامل مشکل، توپولوژی، لاگ‌ها یا چیزی که تا الان امتحان کردید..." className="input w-full min-h-[160px]" required />
            <div className="tb-text-sm text-[var(--tb-fg-muted)]">پیش‌نویس به‌صورت خودکار در مرورگر ذخیره می‌شود.</div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--tb-border)]">
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>انصراف</Button>
              <Button type="submit">ارسال موضوع</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
