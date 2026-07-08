"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ModerationComment = {
  id: string;
  text: string;
  status: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  authorName: string;
  author?: { id: string; name: string; username: string; avatar?: string | null; status?: string } | null;
  post: { module: string; slug: string; title: string };
};

type ModerationUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roleFa?: string;
  status: string;
  avatar?: string | null;
  _count: { posts: number; comments: number; ratings: number };
};

const commentStatuses = ["all", "approved", "pending", "hidden", "spam"];
const userStatuses = ["active", "suspended", "banned"] as const;

function statusLabel(status: string) {
  const map: Record<string, string> = { approved: "تایید", pending: "در انتظار", hidden: "مخفی", spam: "اسپم", active: "فعال", suspended: "تعلیق", banned: "مسدود" };
  return map[status] || status;
}

export default function ModerationPage() {
  const [tab, setTab] = useState<"comments" | "users">("comments");
  const [status, setStatus] = useState("all");
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation/comments?status=${status}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } finally { setLoading(false); }
  }, [status]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation/users", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (tab === "comments") loadComments(); else loadUsers(); }, [tab, loadComments, loadUsers]);

  const setCommentStatus = async (id: string, nextStatus: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) });
    setMsg(res.ok ? "وضعیت دیدگاه تغییر کرد." : "خطا در تغییر وضعیت دیدگاه.");
    loadComments();
  };

  const deleteComment = async (id: string) => {
    if (!confirm("دیدگاه حذف شود؟")) return;
    const res = await fetch(`/api/admin/moderation/comments?id=${id}`, { method: "DELETE" });
    setMsg(res.ok ? "دیدگاه حذف شد." : "خطا در حذف دیدگاه.");
    loadComments();
  };

  const setUserStatus = async (id: string, nextStatus: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) });
    setMsg(res.ok ? "وضعیت کاربر تغییر کرد." : "خطا در تغییر وضعیت کاربر.");
    loadUsers();
  };

  const counts = useMemo(() => ({
    comments: comments.length,
    users: users.length,
    hidden: comments.filter((c) => c.status === "hidden").length,
    spam: comments.filter((c) => c.status === "spam").length,
  }), [comments, users]);

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="Moderation / مدیریت گفتگو" titleClassName="text-[var(--admin)]" description="مدیریت دیدگاه‌ها، اسپم، مخفی‌سازی و وضعیت کاربران">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <Button type="button" size="sm" onClick={() => tab === "comments" ? loadComments() : loadUsers()}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">دیدگاه‌ها</div><b>{counts.comments.toLocaleString("fa-IR")}</b></div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">کاربران</div><b>{counts.users.toLocaleString("fa-IR")}</b></div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">مخفی</div><b>{counts.hidden.toLocaleString("fa-IR")}</b></div>
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">اسپم</div><b>{counts.spam.toLocaleString("fa-IR")}</b></div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={tab === "comments" ? "primary" : "ghost"} onClick={() => setTab("comments")}>دیدگاه‌ها</Button>
          <Button type="button" variant={tab === "users" ? "primary" : "ghost"} onClick={() => setTab("users")}>کاربران</Button>
          {tab === "comments" && commentStatuses.map((s) => <Button key={s} type="button" size="xs" variant={status === s ? "primary" : "ghost"} onClick={() => setStatus(s)}>{s === "all" ? "همه" : statusLabel(s)}</Button>)}
        </div>

        {msg && <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] p-3 paragraph-color">{msg}</div>}
        {loading && <div className="paragraph-color">در حال دریافت…</div>}

        {tab === "comments" && (
          <div className="space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-size)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {comment.author?.avatar && <Image src={comment.author.avatar} width={40} height={40} alt={comment.authorName} className="h-10 w-10 rounded-full object-cover" />}
                    <div>
                      <div className="font-bold text-[var(--primary-text)]">{comment.author?.name || comment.authorName}</div>
                      <div className="font-mono text-xs paragraph-color" dir="ltr">@{comment.author?.username || "guest"}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={comment.status === "approved" ? "success" : comment.status === "spam" ? "danger" : "warning"}>{statusLabel(comment.status)}</Badge>
                    <span className="text-xs paragraph-color">{new Date(comment.createdAt).toLocaleString("fa-IR")}</span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap paragraph-color">{comment.text}</p>
                <div className="mt-3 text-xs paragraph-color">
                  روی <Link href={`/${comment.post.module}/${comment.post.slug}`} target="_blank" className="text-[var(--admin)] hover:underline">{comment.post.title}</Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["approved", "pending", "hidden", "spam"] as const).map((s) => <Button key={s} size="xs" variant={comment.status === s ? "primary" : "ghost"} onClick={() => setCommentStatus(comment.id, s)}>{statusLabel(s)}</Button>)}
                  <Button size="xs" variant="ghost" onClick={() => deleteComment(comment.id)}>حذف</Button>
                </div>
              </article>
            ))}
            {!comments.length && !loading && <div className="paragraph-color p-6">دیدگاهی برای این فیلتر وجود ندارد.</div>}
          </div>
        )}

        {tab === "users" && (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)]/30 p-4 last:border-0">
                <div className="flex items-center gap-3">
                  {user.avatar && <Image src={user.avatar} width={42} height={42} alt={user.name} className="h-10 w-10 rounded-full object-cover" />}
                  <div><div className="font-bold text-[var(--primary-text)]">{user.name}</div><div className="font-mono text-xs paragraph-color" dir="ltr">@{user.username}</div></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.status === "active" ? "success" : user.status === "banned" ? "danger" : "warning"}>{statusLabel(user.status)}</Badge>
                  <span className="text-xs paragraph-color">{user._count.posts} posts • {user._count.comments} comments • {user._count.ratings} ratings</span>
                  {userStatuses.map((s) => <Button key={s} size="xs" variant={user.status === s ? "primary" : "ghost"} onClick={() => setUserStatus(user.id, s)}>{statusLabel(s)}</Button>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
