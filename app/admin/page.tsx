"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleBadge } from "@/components/ui/module-badge";
import {
  FileText,
  MessageCircle,
  Users,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  Newspaper,
  ArrowLeft,
} from "lucide-react";

type DashboardStats = {
  modules: Array<{ module: string; count: number; views: number; latest?: string }>;
  totals: { count: number; views: number };
};

type RecentPost = {
  id: string;
  module: string;
  slug: string;
  title: string;
  date: string;
  date_fa: string;
  published: boolean;
  views: number;
  author: { name: string };
};

type PendingItem = {
  id: string;
  type: "comment" | "consultation" | "verification" | "inbox";
  title: string;
  subtitle: string;
  href: string;
  createdAt: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function AdminPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, postsRes] = await Promise.allSettled([
          fetch("/api/admin/dashboard", { cache: "no-store", signal: controller.signal }),
          fetch("/api/posts?published=all&take=10", { cache: "no-store", signal: controller.signal }),
        ]);

        if (dashRes.status === "fulfilled" && dashRes.value.ok) {
          const data = await dashRes.value.json();
          setStats(data);
        }

        if (postsRes.status === "fulfilled" && postsRes.value.ok) {
          const data = await postsRes.value.json();
          setRecentPosts(Array.isArray(data) ? data.slice(0, 8) : []);
        }

        // Load pending items for super_admin
        if (user!.role === "super_admin") {
          const pending: PendingItem[] = [];

          try {
            const inboxRes = await fetch("/api/admin/inbox?type=feedback", { cache: "no-store", signal: controller.signal });
            if (inboxRes.ok) {
              const items = await inboxRes.json();
              if (Array.isArray(items)) {
                items
                  .filter((i: any) => i.status === "new")
                  .slice(0, 5)
                  .forEach((i: any) =>
                    pending.push({
                      id: i.id,
                      type: "inbox",
                      title: i.name,
                      subtitle: i.subject || i.message?.slice(0, 60),
                      href: "/admin/inbox",
                      createdAt: i.createdAt,
                    })
                  );
              }
            }
          } catch {}

          try {
            const consultRes = await fetch("/api/consultation", { cache: "no-store", signal: controller.signal });
            if (consultRes.ok) {
              const data = await consultRes.json();
              const items = data?.requests || [];
              items
                .filter((r: any) => r.status === "pending")
                .slice(0, 5)
                .forEach((r: any) =>
                  pending.push({
                    id: r.id,
                    type: "consultation",
                    title: r.userName || "بدون نام",
                    subtitle: `${(r.items || []).length} محصول`,
                    href: "/admin/consultations",
                    createdAt: r.createdAt,
                  })
                );
            }
          } catch {}

          try {
            const verifRes = await fetch("/api/admin/verification?status=pending", { cache: "no-store", signal: controller.signal });
            if (verifRes.ok) {
              const data = await verifRes.json();
              (data?.requests || [])
                .slice(0, 5)
                .forEach((r: any) =>
                  pending.push({
                    id: r.id,
                    type: "verification",
                    title: r.user?.name || "بدون نام",
                    subtitle: r.type === "org" ? "سازمانی" : r.type === "content" ? "تولید محتوا" : "کاربر",
                    href: "/admin/verification",
                    createdAt: r.createdAt,
                  })
                );
            }
          } catch {}

          setPendingItems(pending.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
        }
      } catch {}
      setLoading(false);
    }

    loadDashboard();
    return () => controller.abort();
  }, [user]);

  const allowedModules = useMemo(() => {
    if (!user) return [];
    return (Object.keys(moduleMeta) as ModuleSlug[]).filter((m) => canEdit(user, m));
  }, [user]);

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm p-6 text-center">
          <CardTitle className="mb-2">ورود ادمین</CardTitle>
          <p className="text-sm text-muted-foreground mb-4">برای مدیریت محتوا ابتدا وارد شوید.</p>
          <ButtonLink href="/admin/login" className="w-full">رفتن به صفحه ورود</ButtonLink>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Welcome + Role */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          سلام، {user.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user.role === "super_admin" ? "مدیر کل" : "ویراستار"} • {allowedModules.length} ماژول قابل مدیریت
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="کل محتوا"
          value={stats?.totals.count}
          icon={FileText}
          loading={loading}
          href="/admin/posts"
        />
        <StatCard
          label="کل بازدید"
          value={stats?.totals.views}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          label="ماژول فعال"
          value={allowedModules.length}
          icon={TrendingUp}
          loading={false}
        />
        <StatCard
          label="اقدام فوری"
          value={pendingItems.length}
          icon={AlertTriangle}
          loading={loading}
          highlight={pendingItems.length > 0}
        />
      </div>

      {/* Pending Actions — the most important section */}
      {user.role === "super_admin" && pendingItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                نیاز به اقدام ({pendingItems.length})
              </CardTitle>
              <Badge variant="destructive">{pendingItems.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {pendingItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    {item.type === "inbox" && <MessageCircle className="size-4" />}
                    {item.type === "consultation" && <Newspaper className="size-4" />}
                    {item.type === "verification" && <Users className="size-4" />}
                    {item.type === "comment" && <MessageCircle className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                  </div>
                  <ArrowLeft className="size-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Module Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">ماژول‌های شما</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-16 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-7 flex-1" />
                      <Skeleton className="h-7 flex-1" />
                    </div>
                  </Card>
                ))
              : allowedModules.map((module) => {
                  const meta = moduleMeta[module];
                  const stat = stats?.modules.find((m) => m.module === module);
                  return (
                    <Card key={module} className="group hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <ModuleBadge module={module}>{meta.titleFa}</ModuleBadge>
                            <div className="text-[10px] text-muted-foreground mt-1 font-mono" dir="ltr">
                              /{module}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {formatNumber(stat?.count ?? 0)}
                          </Badge>
                        </div>
                        {stat?.views != null && stat.views > 0 && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <Eye className="inline size-3 me-1" />
                            {formatNumber(stat.views)} بازدید
                          </div>
                        )}
                        <div className="flex gap-2">
                          <ButtonLink
                            href={`/admin/posts?module=${module}`}
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-center"
                          >
                            مدیریت
                          </ButtonLink>
                          <ButtonLink
                            href={`/admin/posts/new?module=${module}`}
                            size="sm"
                            className="flex-1 justify-center"
                          >
                            جدید +
                          </ButtonLink>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Recent Posts Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">آخرین محتواها</h2>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="divide-y">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/new?module=${post.module}&edit=${post.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <ModuleBadge module={post.module as ModuleSlug}>
                        {moduleMeta[post.module as ModuleSlug]?.titleFa?.slice(0, 3) || post.module}
                      </ModuleBadge>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{post.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{post.date_fa}</span>
                          <span className="text-[10px] text-muted-foreground">👁 {post.views}</span>
                        </div>
                      </div>
                      <Badge
                        variant={post.published ? "default" : "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {post.published ? "منتشر" : "پیش‌نویس"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  هنوز محتوایی ثبت نشده.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  href,
  highlight,
}: {
  label: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <Card className={highlight ? "border-destructive/30 bg-destructive/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-xl font-bold">
            {value != null ? formatNumber(value) : "—"}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:border-primary/30 transition-colors rounded-lg">
        {content}
      </Link>
    );
  }
  return content;
}
