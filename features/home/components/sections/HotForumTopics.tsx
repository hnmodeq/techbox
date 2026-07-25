"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, ArrowLeft, MessageCircle, Eye } from "lucide-react";

// Sample forum data (in real app, this would come from API/DB)
const forumTopics = [
  {
    id: 1,
    title: "بهترین RAID برای آرشیو ۵۰ ترابایتی چیست؟",
    author: "کاربر ادمین",
    replies: 12,
    views: "۲.۴K",
    category: "ذخیره‌سازی",
    time: "۲ ساعت پیش",
    href: "/forum/best-raid-for-archive",
  },
  {
    id: 2,
    title: "تجربه استفاده از QNAP در محیط سازمانی",
    author: " network_admin",
    replies: 8,
    views: "۱.۸K",
    category: "بررسی محصول",
    time: "۵ ساعت پیش",
    href: "/forum/qnap-enterprise-experience",
  },
  {
    id: 3,
    title: "راهنمای انتخاب سوئیچ مناسب برای NAS",
    author: "IT_Consultant",
    replies: 5,
    views: "۱.۲K",
    category: "شبکه",
    time: "۱ روز پیش",
    href: "/forum/nas-switch-guide",
  },
];

const categoryColors: Record<string, string> = {
  "ذخیره‌سازی": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "بررسی محصول": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "شبکه": "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function HotForumTopics() {
  return (
    <section className="relative homepage-section-darker home-section" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <MessagesSquare className="size-5 text-cyan-400" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-[10px] border-cyan-500/30 text-cyan-400">
                انجمن
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                بحث‌های داغ
              </h2>
            </div>
          </div>
          <Link 
            href="/forum" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            همه بحث‌ها
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {/* Topics list */}
        <div className="space-y-3">
          {forumTopics.map((topic) => (
            <Link key={topic.id} href={topic.href} className="group block">
              <article className="card-glow p-4 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  {/* Avatar placeholder */}
                  <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-cyan-400">
                      {topic.author.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[10px] ${categoryColors[topic.category] || ""}`}>
                        {topic.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {topic.time}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {topic.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3.5" />
                        {topic.replies} پاسخ
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3.5" />
                        {topic.views}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowLeft className="size-4 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-[-4px] transition-all flex-shrink-0 mt-2" />
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            سوالی دارید؟ در انجمن مطرح کنید
          </p>
          <Link 
            href="/forum/new" 
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>ایجاد موضوع جدید</span>
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
