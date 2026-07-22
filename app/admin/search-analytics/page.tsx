"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty, AdminError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";

type SearchData = {
  totalSearches: number;
  days: number;
  topQueries: Array<{ query: string; count: number; avgResults: number }>;
  zeroResults: Array<{ query: string; count: number }>;
  searchesPerDay: Array<{ date: string; count: number }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

export default function AdminSearchAnalyticsPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <SearchAnalyticsContent />}
    </AdminGuard>
  );
}

function SearchAnalyticsContent() {
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState("30");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/search-analytics?days=${days}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch (e: any) {
      setError(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Search className="size-5" />
            آمار جستجو
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data ? `${data.totalSearches.toLocaleString("fa-IR")} جستجو در ${data.days} روز گذشته` : "تحلیل جستجوی کاربران"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={days} onValueChange={(v) => setDays(v ?? "30")}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">۷ روز</SelectItem>
              <SelectItem value="30">۳۰ روز</SelectItem>
              <SelectItem value="90">۹۰ روز</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="size-3" />
          </Button>
        </div>
      </div>

      {error && <AdminError message={error} onRetry={load} />}

      {loading ? (
        <AdminLoading rows={4} />
      ) : !data ? null : (
        <>
          {/* Stats */}
          <div className="grid gap-3 grid-cols-3">
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">کل جستجوها</div><div className="text-xl font-bold">{data.totalSearches.toLocaleString("fa-IR")}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">عبارات یکتا</div><div className="text-xl font-bold">{data.topQueries.length.toLocaleString("fa-IR")}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">بدون نتیجه</div><div className="text-xl font-bold text-destructive">{data.zeroResults.length.toLocaleString("fa-IR")}</div></CardContent></Card>
          </div>

          {/* Search trend chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">روند جستجو ({data.days} روز)</CardTitle></CardHeader>
            <CardContent>
              {data.searchesPerDay.length > 0 ? (
                <div className="flex items-end gap-0.5 h-28">
                  {data.searchesPerDay.map((d, i) => {
                    const max = Math.max(...data.searchesPerDay.map((x) => x.count), 1);
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full rounded-t-sm bg-primary/70 transition-all hover:bg-primary min-h-[2px]" style={{ height: `${(d.count / max) * 100}%` }} />
                        <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                          <div className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">{d.count} • {formatDate(d.date)}</div>
                        </div>
                        {i % 7 === 0 && <span className="text-[9px] text-muted-foreground">{formatDate(d.date)}</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">داده‌ای موجود نیست</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top queries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  پرجستجوترین عبارات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.topQueries.length === 0 ? (
                  <div className="p-4"><AdminEmpty title="هنوز جستجویی ثبت نشده" /></div>
                ) : (
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {data.topQueries.map((q, idx) => (
                      <div key={q.query} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{q.query}</div>
                          <div className="text-[10px] text-muted-foreground">میانگین {q.avgResults.toLocaleString("fa-IR")} نتیجه</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{q.count.toLocaleString("fa-IR")}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zero results — content gaps */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  جستجوهای بدون نتیجه (خلأ محتوایی)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.zeroResults.length === 0 ? (
                  <div className="p-4"><AdminEmpty title="همه جستجوها نتیجه داشته‌اند ✓" /></div>
                ) : (
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {data.zeroResults.map((q) => (
                      <div key={q.query} className="flex items-center gap-3 px-4 py-2">
                        <AlertTriangle className="size-3.5 text-warning shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{q.query}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">{q.count.toLocaleString("fa-IR")} بار</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-3 border-t">
                  <p className="text-[10px] text-muted-foreground">
                    این عبارات نشان می‌دهد کاربران چه چیزی می‌خواهند اما محتوایی برای آن ندارید. برای تولید محتوای جدید ایده بگیرید.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
