"use client";

import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import type { HomeV2Product } from "@/features/home-v2/lib/home-v2-types";

const topics = [
  { id: "storage", label: "ذخیره‌سازی", keywords: ["ذخیره", "nas", "raid", "backup", "بکاپ", "دیسک"], tools: ["/tools/raid-calculator", "/tools/nas-selector"] },
  { id: "network", label: "شبکه", keywords: ["شبکه", "vpn", "ip", "ethernet", "wireguard", "vlan"], tools: ["/tools/subnet-calculator"] },
  { id: "security", label: "امنیت", keywords: ["امنیت", "security", "cve", "فایروال", "باج"], tools: ["/search?q=امنیت"] },
  { id: "platform", label: "پلتفرم و ابر", keywords: ["kubernetes", "docker", "cloud", "ابر", "devops", "sre"], tools: ["/search?q=Kubernetes"] },
] as const;

type Topic = (typeof topics)[number];

function matches(item: ContentItem, topic: Topic) {
  const text = `${item.title} ${item.excerpt} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  return topic.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function KnowledgeGraph({
  content,
  forum,
  products,
}: {
  content: ContentItem[];
  forum: ContentItem[];
  products: HomeV2Product[];
}) {
  const [topicId, setTopicId] = React.useState<(typeof topics)[number]["id"]>("storage");
  const topic = topics.find((item) => item.id === topicId) ?? topics[0];
  const readings = content.filter((item) => matches(item, topic)).slice(0, 4);
  const questions = forum.filter((item) => matches(item, topic)).slice(0, 3);
  const productMatches = topic.id === "storage" ? products.slice(0, 3) : [];

  return (
    <section id="v2-graph" className="border-y border-border bg-white py-14 dark:bg-black" aria-labelledby="v2-graph-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold text-[color:var(--module-timeline-color)]">زیرساخت دانشی نسخه آزمایشی</p>
          <h2 id="v2-graph-title" className="mt-1 text-3xl font-black text-foreground">نقشهٔ زیرساخت تکباکس</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            به‌جای جداکردن مقاله، سؤال، ابزار و محصول، این نما هر موضوع را به همه مسیرهای تصمیم‌گیری مرتبط می‌کند.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {topics.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTopicId(item.id)}
              aria-pressed={topic.id === item.id}
              className={`border px-4 py-2 text-sm font-bold ${topic.id === item.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid border border-border lg:grid-cols-[1fr_1fr_1fr_1fr]">
          <GraphColumn title="بخوان و یاد بگیر" color="var(--module-blog-color)">
            {(readings.length ? readings : content.slice(0, 4)).map((item) => (
              <GraphLink key={`${item.module}-${item.slug}`} href={`/${item.module}/${item.slug}`}>{item.title}</GraphLink>
            ))}
          </GraphColumn>
          <GraphColumn title="از تجربه جامعه" color="var(--module-forum-color)">
            {(questions.length ? questions : forum.slice(0, 3)).map((item) => (
              <GraphLink key={item.slug} href={`/forum/${item.slug}`}>{item.title}</GraphLink>
            ))}
            <GraphLink href="/forum?new=1">سؤال تازه مطرح کن</GraphLink>
          </GraphColumn>
          <GraphColumn title="محاسبه و طراحی" color="var(--module-tools-color)">
            {topic.tools.map((href) => (
              <GraphLink key={href} href={href}>{href.includes("raid") ? "محاسبه RAID" : href.includes("nas") ? "انتخاب NAS" : href.includes("subnet") ? "محاسبه Subnet" : "جستجوی ابزار و راهنما"}</GraphLink>
            ))}
            <GraphLink href="/tools">همه ابزارها</GraphLink>
          </GraphColumn>
          <GraphColumn title="تصمیم و اجرا" color="var(--module-shop-color)">
            {productMatches.length > 0 ? productMatches.map((product) => (
              <GraphLink key={product.id} href={`/shop/${product.slug}`}>{product.model || product.title}</GraphLink>
            )) : (
              <GraphLink href={`/search?q=${encodeURIComponent(topic.label)}`}>یافتن راهکارهای مرتبط</GraphLink>
            )}
            <GraphLink href="/consultation">بررسی با کارشناس</GraphLink>
          </GraphColumn>
        </div>
      </div>
    </section>
  );
}

function GraphColumn({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="min-h-64 border-b border-border p-5 last:border-0 lg:border-b-0 lg:border-e lg:last:border-e-0">
      <div className="mb-5 h-1 w-10" style={{ backgroundColor: color }} />
      <h3 className="text-sm font-black text-foreground">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function GraphLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="block text-xs leading-5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{children}</Link>;
}
