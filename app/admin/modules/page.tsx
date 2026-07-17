"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ModuleBadge } from "@/components/ui/module-badge";
import {
  getDefaultModuleConfigMap,
  DEFAULT_HOME_TITLES,
  DEFAULT_HOME_MORE_LABELS,
  type ModuleSlug,
  type ModuleConfigMap,
} from "@/lib/module-config";
import { moduleMeta } from "@/lib/content";

const ALL_MODULES: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

type TabId = "modules" | "homepage" | "titles";

export default function AdminModulesPage() {
  const [config, setConfig] = useState<ModuleConfigMap>({ ...getDefaultModuleConfigMap(), heroVisible: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<TabId>("modules");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/modules", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "load_failed");
      setConfig({ ...getDefaultModuleConfigMap(), ...data });
    } catch (e: any) {
      setMessage(e?.message || "خطا در دریافت تنظیمات ماژول");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "save_failed");
      setMessage("تنظیمات ماژول‌ها ذخیره شد ✓");
    } catch (e: any) {
      setMessage(e?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const updateModule = (slug: ModuleSlug, patch: Partial<ModuleConfigMap[ModuleSlug]>) => {
    setConfig((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], ...patch },
    }));
  };

  const enabledCount = ALL_MODULES.filter((s) => config[s]?.enabled).length;
  const homeVisibleCount = ALL_MODULES.filter((s) => config[s]?.enabled && config[s]?.showOnHome).length;

  const tabs: { id: TabId; label: string }[] = [
    { id: "modules", label: "فعال/غیرفعال" },
    { id: "homepage", label: "چیدمان خانه" },
    { id: "titles", label: "عناوین ردیف‌ها" },
  ];

  const sortedHomeModules = [...ALL_MODULES]
    .filter((s) => config[s]?.enabled)
    .sort((a, b) => (config[a]?.homeOrder ?? 99) - (config[b]?.homeOrder ?? 99));

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          colorVar="--admin"
          title="مدیریت ماژول‌ها"
          titleClassName="text-[var(--admin)]"
          description="فعال/غیرفعال کردن ماژول‌ها، چیدمان صفحه اصلی و عناوین ردیف‌ها"
        >
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">
              داشبورد
            </ButtonLink>
          </div>
        </PageHeader>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">ماژول فعال</div>
            <div className="text-2xl font-bold">{enabledCount} از {ALL_MODULES.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">ردیف صفحه اصلی</div>
            <div className="text-2xl font-bold">{homeVisibleCount} از {enabledCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">هیرو</div>
            <div className="text-2xl font-bold">{config.heroVisible !== false ? "فعال" : "غیرفعال"}</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[var(--admin)] text-[var(--admin)]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Modules enable/disable */}
        {tab === "modules" && (
          <Card className="p-5 space-y-1">
            <CardHeader className="p-0">
              <CardTitle>فعال‌سازی ماژول‌ها</CardTitle>
              <CardDescription>
                ماژول غیرفعال از همه‌جا ناپدید می‌شود: نوار کناری، تیکبار، جستجو، پیشنهادها، صفحه اصلی و فعالیت کاربران.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-1">
              {ALL_MODULES.map((slug) => {
                const meta = moduleMeta[slug];
                const cfg = config[slug];
                return (
                  <div
                    key={slug}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${
                      cfg?.enabled ? "bg-card border-border" : "bg-muted/30 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ModuleBadge module={slug}>
                        {meta?.titleFa || slug}
                      </ModuleBadge>
                      <span className="text-xs text-muted-foreground">/{slug}</span>
                      {cfg?.enabled && (
                        <Badge variant="default" className="text-[10px]">فعال</Badge>
                      )}
                      {!cfg?.enabled && (
                        <Badge variant="secondary" className="text-[10px]">غیرفعال</Badge>
                      )}
                    </div>
                    <Switch
                      checked={cfg?.enabled ?? true}
                      onCheckedChange={(checked) => updateModule(slug, { enabled: checked })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Tab: Homepage layout */}
        {tab === "homepage" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle>چیدمان صفحه اصلی</CardTitle>
              <CardDescription>
                ترتیب ردیف‌ها و نمایش آن‌ها در صفحه اصلی. ماژول غیرفعال قابل نمایش نیست.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-2">
              {/* Hero visibility toggle */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin)]/20 bg-[var(--admin)]/5 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm">🏅</span>
                  <div>
                    <div className="text-sm font-semibold">هیرو (تکباکس)</div>
                    <div className="text-xs text-muted-foreground">عنوان بزرگ «تکباکس» بالای صفحه اصلی</div>
                  </div>
                </div>
                <Switch
                  checked={config.heroVisible !== false}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, heroVisible: checked }))}
                />
              </div>

              {sortedHomeModules.map((slug, idx) => {
                const meta = moduleMeta[slug];
                const cfg = config[slug];
                return (
                  <div
                    key={slug}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${
                      cfg?.showOnHome ? "bg-card border-border" : "bg-muted/20 border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <ModuleBadge module={slug}>
                        {meta?.titleFa || slug}
                      </ModuleBadge>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {cfg?.homeTitle || DEFAULT_HOME_TITLES[slug] || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={idx === 0}
                        onClick={() => {
                          // Move up: swap order with previous
                          const prevSlug = sortedHomeModules[idx - 1];
                          if (!prevSlug) return;
                          const prevOrder = config[prevSlug]?.homeOrder ?? idx;
                          const curOrder = cfg?.homeOrder ?? idx + 1;
                          updateModule(slug, { homeOrder: prevOrder });
                          updateModule(prevSlug, { homeOrder: curOrder });
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={idx === sortedHomeModules.length - 1}
                        onClick={() => {
                          // Move down: swap order with next
                          const nextSlug = sortedHomeModules[idx + 1];
                          if (!nextSlug) return;
                          const nextOrder = config[nextSlug]?.homeOrder ?? idx + 2;
                          const curOrder = cfg?.homeOrder ?? idx + 1;
                          updateModule(slug, { homeOrder: nextOrder });
                          updateModule(nextSlug, { homeOrder: curOrder });
                        }}
                      >
                        ↓
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Label className="text-xs text-muted-foreground">نمایش</Label>
                      <Switch
                        checked={cfg?.showOnHome ?? true}
                        onCheckedChange={(checked) => updateModule(slug, { showOnHome: checked })}
                      />
                    </div>
                  </div>
                );
              })}
              {sortedHomeModules.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  هیچ ماژول فعالی وجود ندارد.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: Row titles & more labels */}
        {tab === "titles" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle>عناوین ردیف‌ها و دکمه «بیشتر»</CardTitle>
              <CardDescription>
                عنوان و متن دکمه بیشتر هر ردیف صفحه اصلی قابل تغییر است. خالی بگذارید تا مقدار پیش‌فرض استفاده شود.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              {sortedHomeModules
                .filter((s) => config[s]?.showOnHome)
                .map((slug) => {
                  const meta = moduleMeta[slug];
                  const cfg = config[slug];
                  return (
                    <div key={slug} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ModuleBadge module={slug}>
                          {meta?.titleFa || slug}
                        </ModuleBadge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">
                          عنوان ردیف
                          <span className="text-muted-foreground mr-1">
                            (پیش‌فرض: {DEFAULT_HOME_TITLES[slug] || "—"})
                          </span>
                        </Label>
                        <Input
                          value={cfg?.homeTitle || ""}
                          onChange={(e) => updateModule(slug, { homeTitle: e.target.value })}
                          placeholder={DEFAULT_HOME_TITLES[slug] || "عنوان ردیف..."}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">
                          متن دکمه «بیشتر»
                          <span className="text-muted-foreground mr-1">
                            (پیش‌فرض: {DEFAULT_HOME_MORE_LABELS[slug] || "—"})
                          </span>
                        </Label>
                        <Input
                          value={cfg?.homeMoreLabel || ""}
                          onChange={(e) => updateModule(slug, { homeMoreLabel: e.target.value })}
                          placeholder={DEFAULT_HOME_MORE_LABELS[slug] || "متن دکمه..."}
                        />
                      </div>
                    </div>
                  );
                })}
              {sortedHomeModules.filter((s) => config[s]?.showOnHome).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  هیچ ردیف فعالی در صفحه اصلی وجود ندارد.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {message && (
          <Card className="p-3 text-sm text-muted-foreground">{message}</Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>
            انصراف
          </Button>
          <Button type="button" onClick={save} disabled={loading || saving} loading={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </section>
    </main>
  );
}
