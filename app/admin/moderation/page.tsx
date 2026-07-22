"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/ui/verified-badge";

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

function statusVariant(status: string) {
  if (status === "approved" || status === "active") return "default" as const;
  if (status === "spam" || status === "banned") return "destructive" as const;
  if (status === "hidden" || status === "suspended") return "secondary" as const;
  return "outline" as const;
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
    } finally {
      setLoading(false);
    }
  }, [status]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation/users`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "comments") loadComments();
    else loadUsers();
  }, [tab, loadComments, loadUsers]);

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

  const counts = useMemo(
    () => ({
      comments: comments.length,
      users: users.length,
      hidden: comments.filter((c) => c.status === "hidden").length,
      spam: comments.filter((c) => c.status === "spam").length,
    }),
    [comments, users]
  );

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="Moderation / مدیریت گفتگو" titleClassName="text-[var(--admin)]" description="مدیریت دیدگاه‌ها، اسپم، مخفی‌سازی و وضعیت کاربران">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <Button type="button" size="sm" onClick={() => (tab === "comments" ? loadComments() : loadUsers())}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <div className="grid gap-3 sm:grid-cols-4">
          <Card className="p-4"><div className="text-xs text-muted-foreground">دیدگاه‌ها</div><div className="font-bold text-lg">{counts.comments.toLocaleString("fa-IR")}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">کاربران</div><div className="font-bold text-lg">{counts.users.toLocaleString("fa-IR")}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">مخفی</div><div className="font-bold text-lg">{counts.hidden.toLocaleString("fa-IR")}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">اسپم</div><div className="font-bold text-lg">{counts.spam.toLocaleString("fa-IR")}</div></Card>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="comments">دیدگاه‌ها</TabsTrigger>
            <TabsTrigger value="users">کاربران</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-wrap gap-2">
            {tab === "comments" &&
              commentStatuses.map((s) => (
                <Button key={s} type="button" size="xs" variant={status === s ? "secondary" : "ghost"} onClick={() => setStatus(s)}>
                  {s === "all" ? "همه" : statusLabel(s)}
                </Button>
              ))}
          </div>

          {msg && <Card className="p-3 text-sm text-muted-foreground mt-4">{msg}</Card>}
          {loading && <div className="text-sm text-muted-foreground mt-4">در حال دریافت…</div>}

          <TabsContent value="comments" className="space-y-3 mt-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {comment.author?.avatar && <Image src={comment.author.avatar} width={40} height={40} alt={comment.authorName} className="h-10 w-10 rounded-full object-cover" />}
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1">
                        {comment.author?.name || comment.authorName}
                        {(comment.author as any)?.verifiedType && (
                          <VerifiedBadge type={(comment.author as any).verifiedType as "content" | "org" | "user"} label={(comment.author as any)?.verifiedLabel} size={13} />
                        )}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground" dir="ltr">@{comment.author?.username || "guest"}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(comment.status)}>{statusLabel(comment.status)}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString("fa-IR")}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{comment.text}</p>
                <div className="text-xs text-muted-foreground">
                  روی{" "}
                  <Link href={`/${comment.post.module}/${comment.post.slug}`} target="_blank" className="text-primary hover:underline">
                    {comment.post.title}
                  </Link>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {(["approved", "pending", "hidden", "spam"] as const).map((s) => (
                    <Button key={s} size="xs" variant={comment.status === s ? "secondary" : "ghost"} onClick={() => setCommentStatus(comment.id, s)}>{statusLabel(s)}</Button>
                  ))}
                  <Button size="xs" variant="ghost" onClick={() => deleteComment(comment.id)} className="text-destructive hover:text-destructive">حذف</Button>
                </div>
              </Card>
            ))}
            {!comments.length && !loading && <Card className="p-6 text-center text-sm text-muted-foreground">دیدگاهی برای این فیلتر وجود ندارد.</Card>}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-border/30">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar && <Image src={user.avatar} width={42} height={42} alt={user.name} className="h-10 w-10 rounded-full object-cover" />}
                      <div><div className="font-bold text-sm">{user.name}</div><div className="font-mono text-xs text-muted-foreground" dir="ltr">@{user.username}</div></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(user.status)}>{statusLabel(user.status)}</Badge>
                      <span className="text-xs text-muted-foreground">{user._count.posts} posts • {user._count.comments} comments • {user._count.ratings} ratings</span>
                      {userStatuses.map((s) => (
                        <Button key={s} size="xs" variant={user.status === s ? "secondary" : "ghost"} onClick={() => setUserStatus(user.id, s)}>{statusLabel(s)}</Button>
                      ))}
                    </div>
                  </div>
                ))}
                {!users.length && !loading && <div className="p-6 text-center text-sm text-muted-foreground">کاربری یافت نشد.</div>}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
