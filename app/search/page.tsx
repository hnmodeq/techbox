"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ModuleSlug, type ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import { Button } from "@/components/ui/button";
import { moduleMeta } from "@/lib/content";

export const dynamic = "force-dynamic";

const searchableModules: Array<"all" | ModuleSlug> = ["all", "blog", "news", "media", "review", "download", "shop", "forum"];

type SearchResult = ContentItem & { comments?: number };

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (moduleFilter !== "all") params.set("module", moduleFilter);
    router.push(`/search?${params.toString()}`);
  };

  const setModule = (nextModule: "all" | ModuleSlug) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextModule !== "all") params.set("module", nextModule);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <h1 className="mb-2 text-[length:var(--h1-font-size)] font-extrabold text-[var(--h1-font-color)]">جستجو</h1>
      <p className="mb-6 text-[length:var(--h3-font-size)] font-semibold text-[var(--h3-font-color)] paragraph-color">
        {q ? <>نتایج برای <b>«{q}»</b> – {loading ? "در حال جستجو…" : `${results.length.toLocaleString("fa-IR")} مورد`}</> : "یک عبارت وارد کنید"}
      </p>

      <form onSubmit={submit} className="mb-4 grid gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="جستجو در عنوان، متن، برچسب، دسته، نویسنده…" />
        <Button type="submit">جستجو</Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {searchableModules.map((m) => (
          <Button key={m} type="button" size="xs" variant={moduleFilter === m ? "primary" : "ghost"} onClick={() => setModule(m)}>
            {m === "all" ? "همه" : moduleMeta[m]?.titleFa || m}
          </Button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--warning)]/40 p-3 text-[var(--warning)]">{error}</div>}
      {fromDb && q && <div className="mb-4 text-xs paragraph-color">نتایج از دیتابیس Neon دریافت شد.</div>}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([moduleKey, items]) => (
            <section key={moduleKey}>
              <h2 className="mb-3 text-[length:var(--h3-font-size)] font-bold text-[var(--primary-text)]">{moduleMeta[moduleKey as ModuleSlug]?.titleFa || moduleKey} <span className="paragraph-color text-sm">({items.length.toLocaleString("fa-IR")})</span></h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((r) => <ContentCard key={r.module + r.slug} item={r} />)}
              </div>
            </section>
          ))}
        </div>
      )}
      {q && !loading && results.length === 0 && <p className="text-[length:var(--h3-font-size)] font-semibold text-[var(--h3-font-color)] paragraph-color">نتیجه‌ای یافت نشد.</p>}
    </main>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری…</div>}><SearchInner /></Suspense>;
}
