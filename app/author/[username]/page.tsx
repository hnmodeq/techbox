import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllAcross } from "@/lib/content";
import usersData from "@/data/users.json";
import PageHeader from "@/components/effects/PageHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/CardStats";

const authorBios: Record<string, string> = {
  admin: "مدیر کل و معمار ارشد پلتفرم تکباکس با بیش از ۱۵ سال سابقه در طراحی و پیاده‌سازی زیرساخت‌های کلان دیتاسنتر، شبکه‌های سازمانی و سیستم‌های رایانش ابری.",
  sara: "ویراستار ارشد مجله تخصصی تکباکس و پژوهشگر معماری‌های نوین سرور و راهکارهای ذخیره‌سازی داده‌های کلان.",
  nima: "دبیر بخش اخبار و تحلیلگر روندهای روز سخت‌افزار، پردازش‌های هوش مصنوعی و امنیت زیرساخت.",
  rojina: "تحلیلگر و تولیدکننده محتوای ویدیویی و نقد و بررسی‌های آزمایشگاهی سخت‌افزارهای شبکه و سرور.",
  atiye: "کارشناس ارشد ابزارها و نرم‌افزارهای زیرساختی با تمرکز بر مجازی‌سازی، سیستم‌عامل‌های سرور و اتوماسیون.",
  nastaran: "مدیر فروشگاه و ناظر انجمن تخصصی، مشاور راهکارهای سخت‌افزاری و تأمین تجهیزات دیتاسنتر.",
  arash: "ناظر انجمن تخصصی و مهندس زیرساخت شبکه با تخصص در پروتکل‌های مسیریابی و امنیت فایروال.",
  maryam: "ویراستار بخش دانلود و کارشناس سیستم‌عامل‌های لینوکس، ایزوهای سازمانی و فریم‌ورهای سرور.",
  keyvan: "کارشناس فروش و ارزیاب آزمایشگاهی تجهیزات سرور، استوریج‌های SAN و راهکارهای پشتیبان‌گیری.",
  elham: "دبیر اخبار و رسانه، متخصص تحلیل بازار فناوری اطلاعات و فناوری‌های ابری.",
  editorial: "هیئت تحریریه تکباکس متشکل از گروهی از مهندسان، معماران و تحلیلگران زیرساخت فناوری اطلاعات."
};

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const cleanUser = decodeURIComponent(username).toLowerCase();

  const userRecord = (usersData as any[]).find(
    u => u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser
  ) || {
    username: cleanUser,
    name: cleanUser === "editorial" ? "تحریریه تکباکس" : cleanUser,
    roleFa: "کارشناس و تحلیگر زیرساخت",
    avatar: "/assets/hooman.png",
    modules: ["blog", "review"]
  };

  const allPosts = getAllAcross();
  const authorPosts = allPosts.filter(p => {
    const pAuthor = p.author?.name || "";
    return pAuthor.toLowerCase() === userRecord.name.toLowerCase() ||
           (userRecord.username === "editorial" && (pAuthor === "تحریریه" || pAuthor === "تکباکس"));
  });

  const totalViews = authorPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = authorPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const bio = authorBios[userRecord.username] || authorBios.editorial;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <PageHeader
        colorVar="--tb-primary"
        title={`پروفایل نویسنده: ${userRecord.name}`}
        titleClassName="text-[var(--primary-text)]"
      >
        <div className="flex items-center gap-2 text-sm paragraph-color">
          <span>آرشیو مطالب و نقد و بررسی‌های تخصصی</span>
        </div>
      </PageHeader>

      {/* Author Showcase Card */}
      <div className="mt-8 card p-6 sm:p-8 bg-[var(--card-background)] border border-[var(--border-color)] shadow-xl grid md:grid-cols-[160px_1fr] gap-6 items-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--home)] shadow-lg">
            <Image
              src={userRecord.avatar || "/assets/hooman.png"}
              alt={userRecord.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        </div>

        <div className="space-y-4 text-right">
          <div>
            <span className="badge bg-[var(--home)]/15 text-[var(--home)] border border-[var(--home)]/30 font-bold px-3 py-1 text-xs">
              {userRecord.roleFa || "ویراستار و پژوهشگر"}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--primary-text)]">
              {userRecord.name}
            </h1>
          </div>

          <p className="text-sm sm:text-base leading-7 paragraph-color max-w-3xl">
            {bio}
          </p>

          <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold paragraph-color">
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]">
              <Icon name="blog" size={18} className="text-[var(--home)]" />
              <span>تعداد مطالب: <b>{authorPosts.length.toLocaleString("fa-IR")}</b></span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]">
              <Icon name="view" size={18} className="text-[var(--blog)]" />
              <span>مجموع بازدید: <b>{totalViews.toLocaleString("fa-IR")}</b></span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]">
              <Icon name="like" size={18} className="text-red-400" />
              <span>مجموع پسند: <b>{totalLikes.toLocaleString("fa-IR")}</b></span>
            </span>
          </div>
        </div>
      </div>

      {/* Author's Posts Grid */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-black text-[var(--primary-text)] border-b border-[var(--border-color)] pb-4">
          آرشیو مطالب منتشر شده توسط {userRecord.name} ({authorPosts.length.toLocaleString("fa-IR")})
        </h2>

        {authorPosts.length === 0 ? (
          <div className="card p-12 text-center paragraph-color">
            هنوز مطلبی به نام این نویسنده در آرشیو ثبت نشده است.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authorPosts.map((post) => (
              <Link
                key={`${post.module}-${post.slug}`}
                href={`/${post.module}/${post.slug}`}
                className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all border border-[var(--border-color)] bg-[var(--card-background)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--muted-background)]">
                  <Image
                    src={post.image || "/assets/blog-1.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="350px"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white backdrop-blur-md">
                    {post.category || post.module}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs paragraph-color font-bold mb-1">
                      <span>{post.date_fa}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--primary-text)] group-hover:text-[var(--home)] transition-colors line-clamp-2 leading-7">
                      {post.title}
                    </h3>
                    <p className="text-xs paragraph-color mt-2 line-clamp-2 leading-5">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                    <CardStats module={post.module} slug={post.slug} initialViews={post.views ?? 0} initialLikes={post.likes ?? 0} showComments={true} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
