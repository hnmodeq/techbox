"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty } from "@/components/admin/admin-states";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
type IpBan = {
  id: string;
  ip: string;
  reason: string | null;
  bannedBy: string | null;
  createdAt: string;
};

const userStatuses = ["active", "muted", "banned"] as const;

function statusLabel(status: string) {
  const map: Record<string, string> = { approved: "تایید", pending: "در انتظار", hidden: "مخفی", spam: "اسپم", active: "فعال", muted: "سکوت", suspended: "تعلیق", banned: "مسدود" };
  return map[status] || status;
}

function statusVariant(status: string) {
  if (status === "approved" || status === "active") return "default" as const;
  if (status === "spam" || status === "banned") return "destructive" as const;
  if (status === "hidden" || status === "suspended" || status === "muted") return "secondary" as const;
  return "outline" as const;
}

export default function ModerationPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <ModerationContent />}
    </AdminGuard>
  );
}

function ModerationContent() {
  const [tab, setTab] = useState<"comments" | "users" | "ip_bans">("comments");
  const [status, setStatus] = useState("all");
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [ipBans, setIpBans] = useState<IpBan[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [banReason, setBanReason] = useState("");
  const [ipBanInput, setIpBanInput] = useState("");

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
      if (data.users) setUsers(data.users);
      if (data.ipBans) setIpBans(data.ipBans);
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

  const muteUser = async (id: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "mute", reason: banReason || undefined }),
    });
    setMsg(res.ok ? "کاربر سکوت شد." : "خطا");
    setBanReason("");
    loadUsers();
  };

  const unmuteUser = async (id: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "unmute" }),
    });
    setMsg(res.ok ? "سکوت برداشته شد." : "خطا");
    loadUsers();
  };

  const banUser = async (id: string) => {
    if (!confirm("آیا از مسدود کردن این کاربر اطمینان دارید؟")) return;
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "ban", reason: banReason || undefined }),
    });
    setMsg(res.ok ? "کاربر مسدود شد." : "خطا");
    setBanReason("");
    loadUsers();
  };

  const unbanUser = async (id: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "unban" }),
    });
    setMsg(res.ok ? "مسدودی برداشته شد." : "خطا");
    loadUsers();
  };

  const ipBanUser = async (ip: string) => {
    if (!confirm(`آیا از مسدود کردن IP ${ip} اطمینان دارید؟`)) return;
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ip_ban", ip, reason: banReason || undefined }),
    });
    setMsg(res.ok ? "IP مسدود شد." : "خطا");
    setBanReason("");
    loadUsers();
  };

  const ipUnban = async (ip: string) => {
    setMsg("");
    const res = await fetch("/api/admin/moderation/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ip_unban", ip }),
    });
    setMsg(res.ok ? "مسدودی IP برداشته شد." : "خطا");
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
          {loading && <div className="mt-4"><AdminLoading rows={3} /></div>}

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
            {!comments.length && !loading && <AdminEmpty title="دیدگاهی برای این فیلتر وجود ندارد." />}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {/* IP Ban Input */}
            <Card className="p-3 mb-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">مسدود کردن IP</label>
                  <Input value={ipBanInput} onChange={(e) => setIpBanInput(e.target.value)} placeholder="192.168.1.1" dir="ltr" className="h-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground">دلیل (اختیاری)</label>
                  <Input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="دلیل مسدودی..." className="h-8" />
                </div>
                <Button size="sm" variant="danger" onClick={() => ipBanInput.trim() && ipBanUser(ipBanInput.trim())} disabled={!ipBanInput.trim()}>
                  مسدود کردن IP
                </Button>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-border/30">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar && <Image src={user.avatar} width={42} height={42} alt={user.name} className="h-10 w-10 rounded-full object-cover" />}
                      <div>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          {user.name}
                          {(user as any).verifiedType && (
                            <VerifiedBadge type={(user as any).verifiedType as "content" | "org" | "user"} label={(user as any).verifiedLabel} size={13} />
                          )}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground" dir="ltr">@{user.username}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {user._count.posts} مطلب · {user._count.comments} دیدگاه · {user._count.ratings} امتیاز
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(user.status)}>{statusLabel(user.status)}</Badge>
                        {(user as any).mutedUntil && (
                          <span className="text-[10px] text-muted-foreground">
                            تا {new Date((user as any).mutedUntil).toLocaleDateString("fa-IR")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.status === "muted" ? (
                          <Button size="xs" variant="outline" onClick={() => unmuteUser(user.id)}>لغو سکوت</Button>
                        ) : (
                          <Button size="xs" variant="ghost" onClick={() => muteUser(user.id)}>سکوت</Button>
                        )}
                        {user.status === "banned" ? (
                          <Button size="xs" variant="outline" onClick={() => unbanUser(user.id)}>لغو مسدودی</Button>
                        ) : (
                          <Button size="xs" variant="ghost" className="text-destructive" onClick={() => banUser(user.id)}>مسدود کردن</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!users.length && !loading && <AdminEmpty title="کاربری یافت نشد." />}
              </div>
            </Card>

            {/* IP Bans List */}
            {ipBans.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">IP های مسدود شده ({ipBans.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ipBans.map((ban) => (
                      <div key={ban.id} className="flex items-center justify-between gap-3 px-4 py-2">
                        <div>
                          <code className="text-xs font-mono" dir="ltr">{ban.ip}</code>
                          {ban.reason && <span className="text-xs text-muted-foreground ms-2">— {ban.reason}</span>}
                          <div className="text-[10px] text-muted-foreground">{new Date(ban.createdAt).toLocaleString("fa-IR")}</div>
                        </div>
                        <Button size="xs" variant="ghost" className="text-destructive" onClick={() => ipUnban(ban.ip)}>
                          لغو مسدودی
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
