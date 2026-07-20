/**
 * Seeds real tags for all posts based on their module, category, and title.
 * Run: pnpm db:seed-tags
 *
 * Tags are derived from:
 * 1. Existing tags kept as-is
 * 2. Module-level base tags added to all posts in that module
 * 3. Category → tags mapping
 * 4. Keyword scanning of title for common IT terms
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Base tags per module — every post in a module gets these
const MODULE_BASE_TAGS: Record<string, string[]> = {
  blog:     ["مقاله", "تکباکس"],
  news:     ["خبر", "تکنولوژی"],
  media:    ["ویدیو", "آموزش"],
  forum:    ["انجمن", "پرسش"],
  review:   ["نقد", "بررسی"],
  download: ["دانلود", "فایل"],
  shop:     ["محصول", "سخت‌افزار"],
};

// Category → tags
const CATEGORY_TAGS: Record<string, string[]> = {
  "شبکه":           ["شبکه", "networking"],
  "امنیت":          ["امنیت", "security"],
  "سرور":           ["سرور", "server"],
  "استوریج":        ["استوریج", "storage", "ذخیره‌سازی"],
  "ذخیره‌سازی":     ["استوریج", "storage", "ذخیره‌سازی"],
  "مجازی‌سازی":    ["مجازی‌سازی", "virtualization", "vmware"],
  "ابری":           ["کلود", "cloud"],
  "cloud":          ["کلود", "cloud"],
  "هوش مصنوعی":   ["هوش مصنوعی", "ai", "machine learning"],
  "DevOps":         ["devops", "ci/cd", "automation"],
  "لینوکس":         ["لینوکس", "linux"],
  "ویندوز سرور":   ["ویندوز", "windows server"],
  "زیرساخت":       ["زیرساخت", "infrastructure"],
  "NAS":            ["nas", "ذخیره‌سازی", "qnap", "synology"],
  "NVR":            ["nvr", "دوربین", "cctv"],
  "Firewall":       ["فایروال", "firewall", "امنیت"],
  "پشتیبانی":      ["backup", "پشتیبان‌گیری"],
  "بک‌اپ":         ["backup", "پشتیبان‌گیری"],
};

// Keywords in title → tags
const KEYWORD_TAGS: Array<[RegExp, string[]]> = [
  [/vmware|vcenter|esxi/i,         ["vmware", "مجازی‌سازی"]],
  [/proxmox/i,                     ["proxmox", "مجازی‌سازی"]],
  [/docker|kubernetes|k8s/i,       ["docker", "kubernetes", "devops"]],
  [/cisco|switch|vlan/i,           ["cisco", "شبکه", "سوئیچ"]],
  [/mikrotik/i,                    ["mikrotik", "شبکه"]],
  [/dell|poweredge/i,              ["dell", "سرور"]],
  [/hpe|proliant/i,                ["hpe", "سرور"]],
  [/qnap|synology/i,               ["nas", "ذخیره‌سازی"]],
  [/fortinet|fortigate/i,          ["fortinet", "فایروال", "امنیت"]],
  [/backup|veeam/i,                ["backup", "پشتیبان‌گیری"]],
  [/zero.?trust/i,                  ["zero trust", "امنیت"]],
  [/vpn|wireguard/i,               ["vpn", "شبکه", "امنیت"]],
  [/raid/i,                        ["raid", "استوریج"]],
  [/نقد|review/i,                  ["نقد", "بررسی"]],
  [/ansible|terraform/i,           ["devops", "automation"]],
  [/linux|ubuntu|centos/i,         ["لینوکس"]],
  [/monitoring|grafana|prometheus/i, ["مانیتورینگ", "devops"]],
  [/load.?balance/i,               ["load balancer", "شبکه"]],
  [/هایپر.?کانورجد|hci/i,          ["hci", "زیرساخت"]],
  [/آی‌پی|subnet|ip\s|cidr/i,     ["شبکه", "آدرس‌دهی"]],
  [/دوربین|cctv|nvr|دوربین/i,     ["nvr", "دوربین", "امنیت"]],
];

function deriveTags(post: any): string[] {
  const existingTags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const tags = new Set<string>(existingTags);

  // Module base tags
  const baseTags = MODULE_BASE_TAGS[post.module] || [];
  baseTags.forEach((t) => tags.add(t));

  // Category tags
  if (post.category) {
    const catTags = CATEGORY_TAGS[post.category] || [];
    catTags.forEach((t) => tags.add(t));
  }

  // Keyword scanning
  const text = `${post.title || ""} ${post.excerpt || ""} ${post.category || ""}`;
  for (const [pattern, kTags] of KEYWORD_TAGS) {
    if (pattern.test(text)) {
      kTags.forEach((t) => tags.add(t));
    }
  }

  return [...tags].slice(0, 20); // max 20 tags
}

async function main() {
  const posts = await prisma.post.findMany({
    where: { published: true, deletedAt: null },
    select: { id: true, slug: true, module: true, title: true, excerpt: true, category: true, tags: true },
  });

  console.log(`Processing ${posts.length} posts...`);
  let updated = 0;

  for (const post of posts) {
    const newTags = deriveTags(post);
    const existing = JSON.stringify(Array.isArray(post.tags) ? [...post.tags].sort() : []);
    const derived  = JSON.stringify([...newTags].sort());

    if (existing !== derived) {
      await prisma.post.update({
        where: { id: post.id },
        data: { tags: newTags },
      });
      updated++;
      if (updated <= 20) {
        console.log(`  [${post.module}] ${post.slug} → [${newTags.join(", ")}]`);
      }
    }
  }

  console.log(`\nDone. Updated ${updated}/${posts.length} posts.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
