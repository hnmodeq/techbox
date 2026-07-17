"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ModuleSlug, type ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { moduleMeta } from "@/lib/content";
import { useEnabledModules } from "@/providers/module-config.provider";

export const dynamic = "force-dynamic";

const ALL_SEARCHABLE_MODULES: Array<"all" | ModuleSlug> = ["all", "news", "blog", "media", "shop", "forum", "review", "download"];
const searchModuleLabels: Partial<Record<"all" | ModuleSlug, string>> = {
  all: "همه",
  news: "اخبار",
  blog: "مجله",
  media: "ویدیوهای کوتاه",
  shop: "فروشگاه",
  forum: "انجمن",
  review: "نقد و بررسی",
  download: "دانلود",
};

type SearchResult = ContentItem & { comments?: number };

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const enabledModules = useEnabledModules();
  const searchableModules = ALL_SEARCHABLE_MODULES.filter(
    (m) => m === "all" || enabledModules.has(m as ModuleSlug)
  );
  const q = sp.get("q") || "";
  const moduleFilter = (sp.get("module") as "all" | ModuleSlug) || "all";
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDb, setFromDb] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setInput(q), [q]);

  useEffect(() => {
    let mounted = true;
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      setFromDb(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    fetch(`/api/search?q=${encodeURIComponent(q)}&module=${encodeURIComponent(moduleFilter)}&take=60`)
      .then((r) => {
        if (!r.ok) throw new Error("search_failed");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data.results)) {
          setResults(data.results);
          setFromDb(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setResults([]);
        setFromDb(false);
        setError("جستجوی دیتابیس در دسترس نبود. لطفاً دوباره تلاش کنید.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [q, moduleFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const item of results) {
      const key = item.module || "other";
      map.set(key, [...(map.get(key) || []), item]);
    }
    return [...map.entries()];
  }, [results]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = String(formData.get("q") || input).trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (moduleFilter !== "all") params.set("module", moduleFilter);
    router.push(params.size ? `/search?${params.toString()}` : "/search");
  };

  const setModule = (nextModule: "all" | ModuleSlug) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextModule !== "all") params.set("module", nextModule);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight">جستجو</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {q ? (
          <>
            نتایج برای <Badge variant="outline">«{q}»</Badge> – {loading ? "در حال جستجو…" : `${results.length.toLocaleString("fa-IR")} مورد`}
          </>
        ) : (
          "یک عبارت وارد کنید"
        )}
      </p>

      <Card className="mb-4 p-3">
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input name="q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="جستجو در عنوان، متن، برچسب، دسته، نویسنده…" />
          <Button type="submit">جستجو</Button>
        </form>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {searchableModules.map((m) => (
          <Button key={m} type="button" size="xs" variant={moduleFilter === m ? "primary" : "ghost"} onClick={() => setModule(m)}>
            {searchModuleLabels[m] || moduleMeta[m as ModuleSlug]?.titleFa || m}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="mb-4 border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          <CardContent className="p-0">{error}</CardContent>
        </Card>
      )}
      {fromDb && q && <div className="mb-4 text-xs text-muted-foreground">نتایج از دیتابیس Neon دریافت شد.</div>}

      <Separator className="mb-6" />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([moduleKey, items]) => (
            <section key={moduleKey}>
              <h2 className="mb-3 text-sm font-bold flex items-center gap-2">
                {moduleMeta[moduleKey as ModuleSlug]?.titleFa || moduleKey}
                <Badge variant="secondary">{items.length.toLocaleString("fa-IR")}</Badge>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((r) => (
                  <ContentCard key={r.module + r.slug} item={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {q && !loading && results.length === 0 && <p className="text-sm font-semibold text-muted-foreground">نتیجه‌ای یافت نشد.</p>}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری…</div>}>
      <SearchInner />
    </Suspense>
  );
}
