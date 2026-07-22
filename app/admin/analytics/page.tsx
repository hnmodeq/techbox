"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModuleBadge } from "@/components/ui/module-badge";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import {
  Eye,
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react";

type AnalyticsData = {
  totals: { posts: number; users: number; comments: number; views: number };
  pending: { consultations: number; verifications: number; inbox: number; total: number };
  moduleStats: Array<{ module: string; count: number; views: number; likes: number }>;
  topPosts: Array<{ id: string; title: string; module: string; slug: string; views: number; likes: number; date: string }>;
  recentPosts: Array<{ id: string; title: string; module: string; slug: string; published: boolean; date: string; author: { name: string } }>;
  recentUsers: Array<{ id: string; name: string; username: string; role: string }>;
  recentComments: Array<{ id: string; text: string; status: string; createdAt: string; authorName: string; post: { title: string; module: string; slug: string } }>;
  charts: {
    postsPerDay: Array<{ date: string; count: number }>;
    usersPerDay: Array<{ date: string; count: number }>;
  };
};

function formatNumber(n: number) {
  return n.toLocaleString("fa-IR");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

// Simple CSS bar chart component
function BarChart({ data, maxBars = 30, color = "var(--primary)" }: { data: Array<{ date: string; count: number }>; maxBars?: number; color?: string }) {
  const display = data.slice(-maxBars);
  const max = Math.max(...display.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-0.5 h-32">
      {display.map((d, i) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm transition-all hover:opacity-80 min-h-[2px]"
            style={{ height: `${(d.count / max) * 100}%`, backgroundColor: color }}
          />
          {/* Tooltip on hover */}
          <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
            <div className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
              {d.count} • {formatDate(d.date)}
            </div>
          </div>
          {/* Show every 7th label */}
          {i % 7 === 0 && (
            <span className="text-[9px] text-muted-foreground -rotate-45 origin-top-left whitespace-nowrap">
              {formatDate(d.date)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Horizontal bar chart for module distribution
function HorizontalBars({ data }: { data: Array<{ module: string; count: number; views: number }> }) {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const meta = moduleMeta[d.module as ModuleSlug];
        return (
          <div key={d.module} className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <ModuleBadge module={d.module as ModuleSlug}>
                {meta?.titleFa || d.module}
              </ModuleBadge>
            </div>
            <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${(d.views / maxViews) * 100}%`,
                  backgroundColor: `var(--${d.module})`,
                  minWidth: d.views > 0 ? "4px" : "0",
                }}
              />
            </div>
            <div className="w-24 text-xs text-muted-foreground text-left" dir="ltr">
              {formatNumber(d.views)} views
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      {() => <AnalyticsContent />}
    </AdminGuard>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || "خطا در دریافت آمار");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <main className="p-4 md:p-6"><AdminLoading rows={6} /></main>;
  if (error) return <main className="p-4 md:p-6"><AdminError message={error} onRetry={load} /></main>;
  if (!data) return null;

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-5" />
            آمار و تحلیل‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            نمای کلی عملکرد سایت در ۳۰ روز گذشته
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="size-3" />
          به‌روزرسانی
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FileText} label="محتوای منتشر شده" value={data.totals.posts} />
        <StatCard icon={Eye} label="کل بازدید" value={data.totals.views} />
        <StatCard icon={Users} label="کاربران فعال" value={data.totals.users} />
        <StatCard icon={MessageCircle} label="دیدگاه‌ها" value={data.totals.comments} />
        <StatCard icon={TrendingUp} label="اقدام فوری" value={data.pending.total} highlight={data.pending.total > 0} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posts per day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">محتوای جدید (۳۰ روز گذشته)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.charts.postsPerDay} color="var(--primary)" />
            <div className="mt-2 text-xs text-muted-foreground text-center">
              مجموع: {data.charts.postsPerDay.reduce((s, d) => s + d.count, 0).toLocaleString("fa-IR")} مطلب
            </div>
          </CardContent>
        </Card>

        {/* Users per day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ثبت‌نام جدید (۳۰ روز گذشته)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={data.charts.usersPerDay} color="var(--home)" />
            <div className="mt-2 text-xs text-muted-foreground text-center">
              مجموع: {data.charts.usersPerDay.reduce((s, d) => s + d.count, 0).toLocaleString("fa-IR")} کاربر
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">توزیع بازدید بر اساس ماژول</CardTitle>
        </CardHeader>
        <CardContent>
          <HorizontalBars data={data.moduleStats} />
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Posts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">پربازدیدترین محتوا</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.topPosts.map((post, idx) => (
                <Link
                  key={post.id}
                  href={`/${post.module}/${post.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{post.title}</div>
                    <div className="text-[10px] text-muted-foreground">{formatDate(post.date)}</div>
                  </div>
                  <ModuleBadge module={post.module as ModuleSlug}>
                    {moduleMeta[post.module as ModuleSlug]?.titleFa?.slice(0, 3)}
                  </ModuleBadge>
                  <div className="text-xs text-muted-foreground w-16 text-left" dir="ltr">
                    👁 {formatNumber(post.views)}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">آخرین فعالیت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {/* Recent posts */}
              {data.recentPosts.slice(0, 3).map((post) => (
                <div key={`post-${post.id}`} className="flex items-center gap-3 px-4 py-2">
                  <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                    <FileText className="size-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">
                      <span className="font-medium">{post.author?.name}</span>
                      <span className="text-muted-foreground"> مطلب «{post.title}» را {post.published ? "منتشر" : "پیش‌نویس"} کرد</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(post.date)}</span>
                </div>
              ))}
              {/* Recent comments */}
              {data.recentComments.slice(0, 3).map((comment) => (
                <div key={`comment-${comment.id}`} className="flex items-center gap-3 px-4 py-2">
                  <div className="flex size-6 items-center justify-center rounded bg-muted">
                    <MessageCircle className="size-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-muted-foreground"> دیدگاهی در «{comment.post.title}» نوشت</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(comment.createdAt)}</span>
                </div>
              ))}
              {/* Recent users */}
              {data.recentUsers.slice(0, 2).map((u) => (
                <div key={`user-${u.id}`} className="flex items-center gap-3 px-4 py-2">
                  <div className="flex size-6 items-center justify-center rounded bg-muted">
                    <Users className="size-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-muted-foreground"> ثبت‌نام کرد (@{u.username})</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-destructive/30 bg-destructive/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="text-xl font-bold">{formatNumber(value)}</div>
      </CardContent>
    </Card>
  );
}
