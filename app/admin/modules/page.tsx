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
  getDefaultSiteLayoutConfig,
  DEFAULT_HOME_TITLES,
  DEFAULT_HOME_MORE_LABELS,
  type ModuleSlug,
  type SiteLayoutConfig,
  type ModuleConfigMap,
} from "@/lib/module-config";
import { moduleMeta } from "@/lib/content";

const ALL_MODULES: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

type TabId = "modules" | "homepage" | "titles" | "colors" | "names";

const DEFAULT_MODULE_COLORS: Record<string, string> = {
  blog: "light-dark(oklch(0.7 0.17 52), #fb923c)",
  news: "light-dark(oklch(0.64 0.22 25), #fb7185)",
  media: "light-dark(oklch(0.82 0.15 85), #fcd34d)",
  shop: "light-dark(oklch(0.8 0.19 125), #a3e635)",
  forum: "light-dark(oklch(0.78 0.16 5), #fda4af)",
  review: "light-dark(oklch(0.7 0.17 240), #38bdf8)",
  download: "light-dark(oklch(0.72 0.2 350), #f472b6)",
  timeline: "light-dark(oklch(0.72 0.16 210), #06b6d4)",
  tools: "light-dark(oklch(0.82 0.12 200), #67e8f9)",
};

export default function AdminModulesPage() {
  const [config, setConfig] = useState<SiteLayoutConfig>(getDefaultSiteLayoutConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<TabId>("modules");
  // ─── Module names (source of truth) ───
  const [moduleNames, setModuleNames] = useState<Record<string, string>>({});
  const [nameDefaults, setNameDefaults] = useState<Record<string, string>>({});
  const [namesLoading, setNamesLoading] = useState(false);
  const [namesSaving, setNamesSaving] = useState(false);

  useEffect(() => {
    if (tab !== "names") return;
    setNamesLoading(true);
    fetch("/api/admin/module-names", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setModuleNames(d.titles || {});
          setNameDefaults(d.defaults || {});
        }
      })
      .catch(() => {})
      .finally(() => setNamesLoading(false));
  }, [tab]);

  const saveNames = async () => {
    setNamesSaving(true);
    try {
      const res = await fetch("/api/admin/module-names", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleNames),
      });
      if (res.ok) setMessage("نام ماژول‌ها ذخیره شد و در سراسر سایت اعمال شد");
      else setMessage("خطا در ذخیره نام‌ها");
    } catch {
      setMessage("خطا در ارتباط با سرور");
    } finally {
      setNamesSaving(false);
    }
  };
  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/modules", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "load_failed");
      setConfig({ ...getDefaultSiteLayoutConfig(), ...data, heroVisible: data.heroVisible !== false });
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
      // Build complete payload — every module must have ALL 7 required fields
      const moduleData: Record<string, any> = {};
      for (const slug of ALL_MODULES) {
        const m = config[slug] || {};
        moduleData[slug] = {
          enabled: m.enabled ?? true,
          showOnHome: m.showOnHome ?? true,
          homeOrder: m.homeOrder ?? 99,
          homeTitle: m.homeTitle ?? "",
          homeMoreLabel: m.homeMoreLabel ?? "",
          showHomeTitle: m.showHomeTitle ?? true,
          showHomeMoreLabel: m.showHomeMoreLabel ?? true,
        };
      }

      const payload = {
        heroVisible: config.heroVisible,
        moduleColorsEnabled: config.moduleColorsEnabled,
        unifiedModuleColor: config.unifiedModuleColor,
        moduleColors: config.moduleColors,
        titles: config.titles,
        ...moduleData,
      };

      const res = await fetch("/api/admin/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "save_failed");
      setMessage("تنظیمات ماژول‌ها ذخیره شد ✓");
    } catch (e: any) {
      let msg = "خطا در ذخیره تنظیمات";
      if (e?.message) {
        msg = e.message;
      } else if (typeof e === "string") {
        msg = e;
      } else if (e?.error) {
        msg = typeof e.error === "string" ? e.error : JSON.stringify(e.error);
      }
      setMessage(msg);
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
    { id: "colors", label: "رنگ‌ها" },
    { id: "names", label: "نام ماژول‌ها" },
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
              {/* Hero row — same style as module rows */}
              <div
                className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${
                  config.heroVisible ? "bg-card border-border" : "bg-muted/20 border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--admin)]/10 text-xs font-bold text-[var(--admin)]">
                    🏅
                  </span>
                  <span className="text-sm font-semibold">هیرو (تکباکس)</span>
                  <span className="text-xs text-muted-foreground">عنوان بزرگ بالای صفحه اصلی</span>
                  {config.heroVisible ? (
                    <Badge variant="default" className="text-[10px]">فعال</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">غیرفعال</Badge>
                  )}
                </div>
                <Switch
                  checked={config.heroVisible}
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
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">
                            عنوان ردیف
                            <span className="text-muted-foreground mr-1">
                              (پیش‌فرض: {DEFAULT_HOME_TITLES[slug] || "—"})
                            </span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-muted-foreground">نمایش</Label>
                            <Switch
                              checked={cfg?.showHomeTitle ?? true}
                              onCheckedChange={(checked) => updateModule(slug, { showHomeTitle: checked })}
                            />
                          </div>
                        </div>
                        <Input
                          value={cfg?.homeTitle || ""}
                          onChange={(e) => updateModule(slug, { homeTitle: e.target.value })}
                          placeholder={DEFAULT_HOME_TITLES[slug] || "عنوان ردیف..."}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">
                            متن دکمه «بیشتر»
                            <span className="text-muted-foreground mr-1">
                              (پیش‌فرض: {DEFAULT_HOME_MORE_LABELS[slug] || "—"})
                            </span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-muted-foreground">نمایش</Label>
                            <Switch
                              checked={cfg?.showHomeMoreLabel ?? true}
                              onCheckedChange={(checked) => updateModule(slug, { showHomeMoreLabel: checked })}
                            />
                          </div>
                        </div>
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

        {/* Tab: Colors */}
        {tab === "colors" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle>رنگ‌های ماژول‌ها</CardTitle>
              <CardDescription>
                کنترل رنگ اختصاصی هر ماژول. وقتی سیستم رنگ فعال باشد هر ماژول رنگ جداگانه دارد؛ وقتی غیرفعال باشد همه از یک رنگ واحد استفاده می‌کنند.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              {/* Master toggle */}
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <div className="text-sm font-semibold">سیستم رنگ ماژول‌ها</div>
                  <div className="text-xs text-muted-foreground">
                    {config.moduleColorsEnabled !== false
                      ? "هر ماژول رنگ اختصاصی خود را دارد"
                      : "همه ماژول‌ها از یک رنگ واحد استفاده می‌کنند"}
                  </div>
                </div>
                <Switch
                  checked={config.moduleColorsEnabled !== false}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, moduleColorsEnabled: checked }))}
                />
              </div>

              {config.moduleColorsEnabled !== false ? (
                /* Per-module color pickers */
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">رنگ هر ماژول</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_MODULES.map((slug) => {
                      const meta = moduleMeta[slug];
                      const currentColor = config.moduleColors?.[slug] || "";
                      const defaultColor = DEFAULT_MODULE_COLORS[slug] || "var(--primary)";
                      return (
                        <div key={slug} className="flex items-center gap-3 rounded-lg border p-3">
                          <div
                            className="h-8 w-8 shrink-0 rounded-md border"
                            style={{ backgroundColor: `var(--${slug})` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold flex items-center gap-2">
                              <ModuleBadge module={slug}>{meta?.titleFa || slug}</ModuleBadge>
                            </div>
                            <input
                              type="text"
                              value={currentColor}
                              onChange={(e) => {
                                const newColors = { ...(config.moduleColors || {}) };
                                if (e.target.value) {
                                  newColors[slug] = e.target.value;
                                } else {
                                  delete newColors[slug];
                                }
                                setConfig((prev) => ({ ...prev, moduleColors: newColors }));
                              }}
                              placeholder={defaultColor}
                              className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    مقدار CSS وارد کنید (مثلاً #ff6600 یا oklch(0.7 0.17 52)). خالی بگذارید تا رنگ پیش‌فرض استفاده شود.
                  </p>
                </div>
              ) : (
                /* Unified color picker */
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">رنگ واحد همه ماژول‌ها</Label>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div
                      className="h-8 w-8 shrink-0 rounded-md border"
                      style={{ backgroundColor: config.unifiedModuleColor || "var(--primary)" }}
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.unifiedModuleColor || ""}
                        onChange={(e) => setConfig((prev) => ({ ...prev, unifiedModuleColor: e.target.value }))}
                        placeholder="var(--primary)"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        همه ماژول‌ها از این رنگ استفاده خواهند کرد. مقدار CSS وارد کنید.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Live preview */}
              <div className="rounded-lg border p-4 space-y-2">
                <Label className="text-xs font-semibold">پیش‌نمایش زنده</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_MODULES.slice(0, 6).map((slug) => {
                    const meta = moduleMeta[slug];
                    return (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: `color-mix(in oklch, var(--${slug}) 18%, transparent)`,
                          color: `var(--${slug})`,
                          border: `1px solid color-mix(in oklch, var(--${slug}) 35%, transparent)`,
                        }}
                      >
                        {meta?.titleFa || slug}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Tab: Module Names (source of truth) */}
        {tab === "names" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle>نام نمایشی ماژول‌ها</CardTitle>
              <CardDescription>
                منبع واحد نام ماژول‌ها — تغییر در اینجا در سراسر سایت اعمال می‌شود (سایدبار، هدر صفحات، تیکبار، بردکرامب و...).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {namesLoading ? (
                <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
              ) : (
                [
                  { slug: "blog", label: "مجله / Blog" },
                  { slug: "news", label: "اخبار / News" },
                  { slug: "media", label: "رسانه / Media" },
                  { slug: "shop", label: "فروشگاه / Shop" },
                  { slug: "forum", label: "انجمن / Forum" },
                  { slug: "review", label: "نقد و بررسی / Review" },
                  { slug: "download", label: "دانلود / Download" },
                  { slug: "tools", label: "ابزارها / Tools" },
                  { slug: "timeline", label: "تایم‌لاین / Timeline" },
                ].map((m) => {
                  const isCustom = moduleNames[m.slug] && moduleNames[m.slug] !== nameDefaults[m.slug];
                  return (
                    <div key={m.slug} className="grid grid-cols-[1fr_1.4fr] items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{m.label}</span>
                        {isCustom && <Badge variant="secondary" className="text-[10px]">شخصی‌سازی‌شده</Badge>}
                      </div>
                      <Input
                        value={moduleNames[m.slug] ?? ""}
                        onChange={(e) => setModuleNames((t) => ({ ...t, [m.slug]: e.target.value }))}
                        placeholder={nameDefaults[m.slug] || m.slug}
                        className="h-9"
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModuleNames({ ...nameDefaults })} disabled={namesLoading || namesSaving}>بازگشت به پیش‌فرض</Button>
              <Button type="button" size="sm" onClick={saveNames} disabled={namesLoading || namesSaving} loading={namesSaving}>ذخیره نام‌ها</Button>
            </div>
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
