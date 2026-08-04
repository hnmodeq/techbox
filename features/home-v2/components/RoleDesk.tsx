"use client";

import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { useAuth } from "@/providers/auth.provider";
import { RemoteImage } from "@/components/ui/remote-image";

const STORAGE_KEY = "techbox-home-v2-role";
const roles = [
  { id: "all", label: "همه حوزه‌ها", keywords: [] },
  { id: "storage", label: "ذخیره‌سازی", keywords: ["ذخیره", "nas", "raid", "backup", "بکاپ", "دیسک"] },
  { id: "network", label: "شبکه", keywords: ["شبکه", "vpn", "wireguard", "ip", "ethernet", "فایروال"] },
  { id: "devops", label: "DevOps و پلتفرم", keywords: ["kubernetes", "docker", "devops", "ci", "cloud", "ابر"] },
  { id: "security", label: "امنیت", keywords: ["امنیت", "security", "cve", "باج", "firewall", "فایروال"] },
  { id: "buyer", label: "خرید سازمانی", keywords: ["review", "بررسی", "راهنمای خرید", "shop", "محصول"] },
] as const;

type RoleId = (typeof roles)[number]["id"];
type SavedRef = { module: string; slug: string };

function score(item: ContentItem, role: (typeof roles)[number]) {
  if (role.id === "all") return new Date(item.date).getTime();
  const haystack = `${item.title} ${item.excerpt} ${item.category ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  const matches = role.keywords.reduce((total, keyword) => total + (haystack.includes(keyword.toLowerCase()) ? 1 : 0), 0);
  return matches * 10_000_000_000_000 + new Date(item.date).getTime();
}

export function RoleDesk({ content }: { content: ContentItem[] }) {
  const { user } = useAuth();
  const [roleId, setRoleId] = React.useState<RoleId>("all");
  const [saved, setSaved] = React.useState<SavedRef[]>([]);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as RoleId | null;
    if (stored && roles.some((role) => role.id === stored)) setRoleId(stored);
  }, []);

  React.useEffect(() => {
    if (!user) { setSaved([]); return; }
    fetch("/api/saved-content", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSaved(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setSaved([]));
  }, [user]);

  const selectRole = (next: RoleId) => {
    setRoleId(next);
    localStorage.setItem(STORAGE_KEY, next);
  };
  const role = roles.find((candidate) => candidate.id === roleId) ?? roles[0];
  const recommendations = React.useMemo(
    () => [...content]
      .sort((a, b) => score(b, role) - score(a, role))
      .filter((item, index, all) => all.findIndex((candidate) => candidate.module === item.module && candidate.slug === item.slug) === index)
      .slice(0, 4),
    [content, role],
  );
  const contentByKey = React.useMemo(
    () => new Map(content.map((item) => [`${item.module}:${item.slug}`, item])),
    [content],
  );
  const savedItems = saved
    .map((item) => contentByKey.get(`${item.module}:${item.slug}`))
    .filter((item): item is ContentItem => Boolean(item))
    .slice(0, 4);

  return (
    <section id="v2-for-you" className="border-y border-border bg-white py-12 dark:bg-black" aria-labelledby="v2-for-you-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[color:var(--module-blog-color)]">میز شخصی</p>
            <h2 id="v2-for-you-title" className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
              {user ? `${user.name}، این‌ها احتمالاً برای شما مهم‌ترند` : "حوزه کاری خودت را انتخاب کن"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">انتخاب شما فقط روی همین نسخه آزمایشی و همین مرورگر ذخیره می‌شود.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="انتخاب حوزه کاری">
            {roles.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => selectRole(candidate.id)}
                aria-pressed={candidate.id === roleId}
                className={`border px-3 py-1.5 text-xs font-bold transition-colors ${
                  candidate.id === roleId
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {candidate.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((item) => <PersonalCard key={`${item.module}-${item.slug}`} item={item} />)}
        </div>

        {user && savedItems.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-base font-bold text-foreground">ذخیره‌شده‌های شما</h3>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {savedItems.map((item) => (
                <Link key={`${item.module}-${item.slug}`} href={`/${item.module}/${item.slug}`} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PersonalCard({ item }: { item: ContentItem }) {
  return (
    <article className="group border border-border bg-card">
      <Link href={`/${item.module}/${item.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <RemoteImage src={item.image} alt={item.title} sizes="(min-width: 1024px) 300px, 50vw" className="transition-transform duration-300 group-hover:scale-[1.02]" />
        </div>
        <div className="p-4">
          <span className="text-[10px] font-bold text-[color:var(--module-blog-color)]">{item.module}</span>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-foreground">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
