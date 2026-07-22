"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminError, AdminEmpty } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModuleBadge } from "@/components/ui/module-badge";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { RefreshCw, AlertTriangle, CheckCircle, Search, Eye } from "lucide-react";

type AuditData = {
  total: number;
  withIssues: number;
  issueCounts: Record<string, number>;
  issues: Array<{
    id: string;
    module: string;
    slug: string;
    title: string;
    views: number;
    issues: string[];
  }>;
};

const ISSUE_LABELS: Record<string, string> = {
  missing_seo_title: "عنوان SEO ندارد",
  missing_seo_description: "توضیحات SEO ندارد",
  short_seo_description: "توضیحات SEO کوتاه (< 120)",
  long_seo_title: "عنوان SEO بلند (> 60)",
  missing_image: "تصویر شاخص ندارد",
  weak_excerpt: "خلاصه ضعیف (< 50)",
  missing_category: "دسته‌بندی ندارد",
  thin_content: "محتوای کم (< 300)",
  images_missing_alt: "تصاویر بدون alt text",
};

const ISSUE_SEVERITY: Record<string, "destructive" | "secondary" | "outline"> = {
  missing_seo_title: "destructive",
  missing_seo_description: "destructive",
  missing_image: "destructive",
  images_missing_alt: "destructive",
  missing_category: "secondary",
  weak_excerpt: "secondary",
  thin_content: "secondary",
  short_seo_description: "outline",
  long_seo_title: "outline",
};

export default function AdminSeoAuditPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <SeoAuditContent />}
    </AdminGuard>
  );
}

function SeoAuditContent() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seo-audit", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch (e: any) {
      setError(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const score = data ? Math.round(((data.total - data.withIssues) / data.total) * 100) : 0;

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Search className="size-5" />
            ممیزی SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            بررسی کیفیت SEO محتوای منتشر شده
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="size-3" />
          اسکن مجدد
        </Button>
      </div>

      {error && <AdminError message={error} onRetry={load} />}

      {loading ? (
        <AdminLoading rows={4} />
      ) : !data ? null : (
        <>
          {/* Score */}
          <Card className={score >= 80 ? "border-green-500/30 bg-green-500/5" : score >= 50 ? "border-yellow-500/30 bg-yellow-500/5" : "border-destructive/30 bg-destructive/5"}>
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black">{score}%</div>
                <div className="text-xs text-muted-foreground">امتیاز SEO</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {score >= 80 ? "✅ عالی! اکثر محتواها SEO بهینه دارند." :
                   score >= 50 ? "⚠️ نیاز به بهبود — برخی محتواها مشکل دارند." :
                   "❌ نیاز فوری — بسیاری از محتواها SEO ضعیفی دارند."}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.withIssues.toLocaleString("fa-IR")} از {data.total.toLocaleString("fa-IR")} مطلب مشکل دارند
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue breakdown */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.issueCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([issue, count]) => (
                <Card key={issue}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <AlertTriangle className={`size-4 shrink-0 ${ISSUE_SEVERITY[issue] === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{ISSUE_LABELS[issue] || issue}</div>
                    </div>
                    <Badge variant={ISSUE_SEVERITY[issue]} className="text-xs">{count.toLocaleString("fa-IR")}</Badge>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Issues list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">محتوای دارای مشکل (مرتب شده بر اساس بازدید)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.issues.length === 0 ? (
                <div className="p-6"><AdminEmpty title="همه محتواها SEO بهینه دارند ✓" /></div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {data.issues.slice(0, 100).map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/posts/new?module=${item.module}&edit=${item.slug}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <ModuleBadge module={item.module as ModuleSlug}>
                        {moduleMeta[item.module as ModuleSlug]?.titleFa?.slice(0, 3)}
                      </ModuleBadge>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">/{item.module}/{item.slug}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.issues.map((issue) => (
                            <Badge key={issue} variant={ISSUE_SEVERITY[issue] || "outline"} className="text-[9px]">
                              {ISSUE_LABELS[issue] || issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Eye className="size-3" />
                        {item.views.toLocaleString("fa-IR")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
