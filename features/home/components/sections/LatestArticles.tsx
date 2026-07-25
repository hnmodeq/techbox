"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Clock } from "lucide-react";

// Sample article data (in real app, this would come from API/DB)
const articles = [
  {
    id: 1,
    title: "راهنمای کامل انتخاب NAS برای کسب‌وکارهای کوچک",
    excerpt: "چه عواملی در انتخاب NAS مناسب برای یک دفتر ۱۰ نفره اهمیت دارد؟ بررسی ۵ سناریوی واقعی.",
    category: "زیرساخت",
    readTime: "۸ دقیقه",
    date: "۳ روز پیش",
    href: "/blog/nas-guide-small-business",
    featured: true,
  },
  {
    id: 2,
    title: "مقایسه RAID 5 vs RAID 6: کدام امن‌تر است؟",
    excerpt: "بررسی فنی تفاوت‌های پارایتی و بازیابی اطلاعات در دو الگوی محبوب.",
    category: "ذخیره‌سازی",
    readTime: "۵ دقیقه",
    date: "۵ روز پیش",
    href: "/blog/raid-5-vs-raid-6",
    featured: false,
  },
  {
    id: 3,
    title: "۱۰ ابزار رایگان که هر ادمین شبکه نیاز دارد",
    excerpt: "لیست بهترین ابزارهای مانیتورینگ، آنالیز و عیب‌یابی شبکه.",
    category: "ابزارها",
    readTime: "۴ دقیقه",
    date: "۱ هفته پیش",
    href: "/blog/free-network-tools",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  "زیرساخت": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "ذخیره‌سازی": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "ابزارها": "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function LatestArticles() {
  const featuredArticle = articles.find((a) => a.featured);
  const otherArticles = articles.filter((a) => !a.featured);

  return (
    <section className="relative homepage-section-dark home-section" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-[10px] border-primary/30 text-primary">
                مجله تکباکس
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                مقالات تخصصی
              </h2>
            </div>
          </div>
          <Link 
            href="/blog" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            همه مقالات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured article */}
          {featuredArticle && (
            <Link href={featuredArticle.href} className="group block">
              <article className="card-glow p-6 h-full hover:border-primary/20 transition-all duration-300">
                <div className="space-y-4">
                  {/* Image placeholder */}
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-[oklch(0.20_0.02_270)] to-[oklch(0.15_0.02_260)] flex items-center justify-center">
                    <BookOpen className="size-12 text-primary/30" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${categoryColors[featuredArticle.category] || ""}`}>
                        {featuredArticle.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {featuredArticle.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold leading-snug group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {featuredArticle.date}
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Other articles */}
          <div className="space-y-4">
            {otherArticles.map((article) => (
              <Link key={article.id} href={article.href} className="group block">
                <article className="card-glow p-4 hover:border-primary/20 transition-all duration-300">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="size-20 rounded-lg bg-gradient-to-br from-[oklch(0.18_0.02_270)] to-[oklch(0.14_0.02_260)] flex-shrink-0 flex items-center justify-center">
                      <BookOpen className="size-6 text-primary/30" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${categoryColors[article.category] || ""}`}>
                          {article.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {article.readTime}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <div className="text-xs text-muted-foreground">
                        {article.date}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {/* View more link */}
            <Link 
              href="/blog" 
              className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg hover:border-primary/30"
            >
              <ArrowLeft className="size-4" />
              مشاهده همه مقالات
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
