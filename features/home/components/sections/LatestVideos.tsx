"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Film, Play, ArrowLeft, Clock } from "lucide-react";

// Sample video data (in real app, this would come from API/DB)
const videos = [
  {
    id: 1,
    title: "آنباکسینگ Synology DS423+",
    duration: "۱۲:۳۴",
    views: "۲.۵K بازدید",
    category: "آنباکسینگ",
    thumbnail: "unboxing",
    href: "/media/unboxing-ds423plus",
  },
  {
    id: 2,
    title: "تنظیم RAID 5 در ۵ دقیقه",
    duration: "۵:۲۱",
    views: "۱.۸K بازدید",
    category: "آموزش",
    thumbnail: "tutorial",
    href: "/media/raid-5-setup",
  },
  {
    id: 3,
    title: "مقایسه سرعت NVMe vs SATA SSD",
    duration: "۸:۴۵",
    views: "۳.۲K بازدید",
    category: "بنچمارک",
    thumbnail: "benchmark",
    href: "/media/nvme-vs-sata-benchmark",
  },
  {
    id: 4,
    title: "راه‌اندازی Docker روی NAS",
    duration: "۱۵:۱۲",
    views: "۱.۱K بازدید",
    category: "آموزش",
    thumbnail: "docker",
    href: "/media/docker-on-nas",
  },
];

const thumbnailGradients: Record<string, string> = {
  unboxing: "from-violet-600/20 to-blue-600/20",
  tutorial: "from-blue-600/20 to-cyan-600/20",
  benchmark: "from-amber-600/20 to-orange-600/20",
  docker: "from-green-600/20 to-emerald-600/20",
};

const categoryColors: Record<string, string> = {
  "آنباکسینگ": "bg-violet-500/10 text-violet-400",
  "آموزش": "bg-blue-500/10 text-blue-400",
  "بنچمارک": "bg-amber-500/10 text-amber-400",
};

export default function LatestVideos() {
  return (
    <section className="relative overflow-hidden homepage-section-darker home-section" dir="rtl">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.15_0.02_260)/5%] to-transparent" />
      
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Film className="size-5 text-pink-400" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-[10px] border-pink-500/30 text-pink-400">
                ریل‌ها
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ویدیوهای جدید
              </h2>
            </div>
          </div>
          <Link 
            href="/media" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            همه ویدیوها
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <Link key={video.id} href={video.href} className="group block">
              <article className="card-glow overflow-hidden hover:border-pink-500/20 transition-all duration-300">
                {/* Thumbnail */}
                <div className={`relative aspect-video bg-gradient-to-br ${thumbnailGradients[video.thumbnail]} flex items-center justify-center`}>
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="size-5 text-white fill-white mr-[-2px]" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-[10px] bg-black/70 backdrop-blur-sm">
                      <Clock className="size-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`text-[10px] ${categoryColors[video.category] || "bg-muted/80"}`}>
                      {video.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-medium leading-snug group-hover:text-pink-400 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {video.views}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link 
            href="/media" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>مشاهده همه ریل‌ها در یوتیوب</span>
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
