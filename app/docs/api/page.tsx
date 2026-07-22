import { pageMetadata } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = pageMetadata({
  title: "مستندات API | تکباکس",
  description: "مستندات API عمومی تکباکس برای توسعه‌دهندگان. دسترسی به محتوا، جستجو، ابزارها و بیشتر.",
  path: "/docs/api",
});

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth?: boolean;
  params?: string;
  body?: string;
};

type ApiGroup = {
  name: string;
  description: string;
  endpoints: Endpoint[];
};

const apiGroups: ApiGroup[] = [
  {
    name: "محتوا",
    description: "خواندن و مدیریت محتوای سایت",
    endpoints: [
      {
        method: "GET",
        path: "/api/posts",
        description: "لیست محتوا بر اساس ماژول",
        params: "module (blog|news|media|review|download|shop|forum), slug, take (1-200), published (all|true)",
      },
      {
        method: "POST",
        path: "/api/posts",
        description: "ایجاد یا به‌روزرسانی محتوا (upsert)",
        auth: true,
        body: "{ module, slug, title, content, excerpt, image, tags, category, published, status, ... }",
      },
      {
        method: "PATCH",
        path: "/api/posts",
        description: "ویرایش فیلدهای محتوا",
        auth: true,
        body: "{ module, slug, title?, excerpt?, content?, published?, status? }",
      },
      {
        method: "DELETE",
        path: "/api/posts",
        description: "حذف نرم محتوا (soft delete)",
        auth: true,
        params: "module, slug",
      },
    ],
  },
  {
    name: "جستجو",
    description: "جستجوی محتوا در سراسر ماژول‌ها",
    endpoints: [
      {
        method: "GET",
        path: "/api/search",
        description: "جستجوی پیشرفته در عنوان، متن، برچسب و دسته",
        params: "q (عبارت جستجو), module (اختیاری), take (1-100)",
      },
    ],
  },
  {
    name: "کاربران و احراز هویت",
    description: "ثبت‌نام، ورود و مدیریت حساب کاربری",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "ثبت‌نام کاربر جدید",
        body: "{ name, username, email, password }",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        description: "ورود به حساب کاربری",
        body: "{ username, password }",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "خروج از حساب کاربری",
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "دریافت اطلاعات کاربر فعلی",
      },
      {
        method: "PUT",
        path: "/api/auth/profile",
        description: "به‌روزرسانی پروفایل",
        auth: true,
        body: "{ name, email, job, bio, birthday, avatar }",
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        description: "ارسال لینک بازیابی رمز عبور",
        body: "{ email }",
      },
      {
        method: "POST",
        path: "/api/auth/change-password",
        description: "تغییر رمز عبور",
        auth: true,
        body: "{ currentPassword, newPassword }",
      },
    ],
  },
  {
    name: "دیدگاه‌ها",
    description: "مدیریت دیدگاه‌های کاربران",
    endpoints: [
      {
        method: "GET",
        path: "/api/comments",
        description: "لیست دیدگاه‌های یک محتوا",
        params: "module, slug",
      },
      {
        method: "POST",
        path: "/api/comments",
        description: "ثبت دیدگاه جدید",
        body: "{ module, slug, text, parentId? }",
      },
      {
        method: "POST",
        path: "/api/comments/vote",
        description: "رای‌گیری روی دیدگاه",
        body: "{ commentId, vote (1|-1) }",
      },
    ],
  },
  {
    name: "لایک و ذخیره",
    description: "لایک کردن و ذخیره محتوا",
    endpoints: [
      {
        method: "POST",
        path: "/api/like",
        description: "لایک یا لغو لایک محتوا",
        body: "{ module, slug }",
      },
      {
        method: "GET",
        path: "/api/saved-content",
        description: "لیست محتوای ذخیره شده کاربر",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/saved-content",
        description: "ذخیره یا لغو ذخیره محتوا",
        auth: true,
        body: "{ module, slug }",
      },
    ],
  },
  {
    name: "امتیازدهی",
    description: "سیستم امتیازدهی محتوا",
    endpoints: [
      {
        method: "POST",
        path: "/api/rating",
        description: "ثبت یا به‌روزرسانی امتیاز",
        auth: true,
        body: "{ module, slug, value (1-5) }",
      },
    ],
  },
  {
    name: "فروشگاه",
    description: "مدیریت سفارشات و پرداخت",
    endpoints: [
      {
        method: "POST",
        path: "/api/orders",
        description: "ثبت سفارش جدید",
        body: "{ items: [{ slug, module, title, price, quantity }], customer: { name, phone, address, postalCode, city?, email? } }",
      },
      {
        method: "GET",
        path: "/api/orders",
        description: "دریافت سفارش (بر اساس شماره یا کاربر)",
        params: "id (شماره سفارش) یا user=me",
      },
      {
        method: "POST",
        path: "/api/pay/zarinpal/request",
        description: "شروع پرداخت از طریق زرین‌پال",
        body: "{ orderId }",
      },
    ],
  },
  {
    name: "تایم‌لاین",
    description: "گاه‌شمار تکنولوژی",
    endpoints: [
      {
        method: "GET",
        path: "/api/timeline/events",
        description: "لیست رویدادهای تایم‌لاین",
      },
      {
        method: "POST",
        path: "/api/timeline/like",
        description: "لایک رویداد تایم‌لاین",
        body: "{ eventId }",
      },
    ],
  },
  {
    name: "کاربران",
    description: "پروفایل عمومی و دنبال‌کردن",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/public/[username]",
        description: "پروفایل عمومی کاربر",
      },
      {
        method: "POST",
        path: "/api/follow",
        description: "دنبال‌کردن / لغو دنبال‌کردن کاربر",
        auth: true,
        body: "{ targetUserId }",
      },
      {
        method: "GET",
        path: "/api/follow/followers",
        description: "لیست دنبال‌کنندگان",
        params: "userId",
      },
      {
        method: "GET",
        path: "/api/follow/following",
        description: "لیست دنبال‌شوندگان",
        params: "userId",
      },
    ],
  },
  {
    name: "خبرنامه",
    description: "عضویت در خبرنامه",
    endpoints: [
      {
        method: "POST",
        path: "/api/newsletter/subscribe",
        description: "عضویت در خبرنامه",
        body: "{ email, name? }",
      },
      {
        method: "GET",
        path: "/api/newsletter/unsubscribe",
        description: "لغو عضویت از خبرنامه",
        params: "token",
      },
    ],
  },
  {
    name: "فرم‌ها",
    description: "فرم‌های تماس و پشتیبانی",
    endpoints: [
      {
        method: "POST",
        path: "/api/contact",
        description: "ارسال پیام تماس",
        body: "{ name, email, subject?, message }",
      },
      {
        method: "POST",
        path: "/api/feedback",
        description: "ارسال بازخورد",
        body: "{ name, email, message }",
      },
      {
        method: "POST",
        path: "/api/support",
        description: "ارسال تیکت پشتیبانی",
        body: "{ name, email, subject?, message }",
      },
      {
        method: "POST",
        path: "/api/consultation",
        description: "درخواست مشاوره",
        body: "{ items: [{ slug, title }], notes?, userName?, userEmail? }",
      },
    ],
  },
  {
    name: "ابزارها",
    description: "ابزارهای محاسباتی",
    endpoints: [
      {
        method: "GET",
        path: "/api/home",
        description: "داده‌های صفحه اصلی (ماژول‌ها و محتوا)",
      },
      {
        method: "GET",
        path: "/api/stats",
        description: "آمار کلی سایت (بازدید، لایک، دیدگاه)",
        params: "modules (لیست ماژول‌ها با کاما)",
      },
      {
        method: "GET",
        path: "/api/settings",
        description: "تنظیمات عمومی سایت",
      },
      {
        method: "GET",
        path: "/api/holidays",
        description: "لیست تعطیلات رسمی",
      },
      {
        method: "GET",
        path: "/api/faq",
        description: "پرسش‌های متداول",
      },
    ],
  },
  {
    name: "سلامت سیستم",
    description: "وضعیت سیستم",
    endpoints: [
      {
        method: "GET",
        path: "/api/healthz",
        description: "بررسی سلامت سرور و دیتابیس",
      },
    ],
  },
  {
    name: "RSS",
    description: "فید RSS",
    endpoints: [
      {
        method: "GET",
        path: "/feed.xml",
        description: "فید RSS آخرین مقالات، اخبار و بررسی‌ها (XML)",
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-600 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PUT: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  PATCH: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function ApiDocsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">مستندات API تکباکس</h1>
        <p className="text-sm text-muted-foreground mt-2">
          API عمومی تکباکس برای دسترسی به محتوا، جستجو، ابزارها و سرویس‌ها.
          تمام endpointها به جز موارد احراز هویت، بدون نیاز به لاگین قابل دسترسی هستند.
        </p>
      </div>

      <Card className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <b>baseUrl:</b> <code dir="ltr" className="text-xs">https://techbox.ir</code> یا <code dir="ltr" className="text-xs">http://localhost:3000</code>
          <br />
          <b>فرمت پاسخ:</b> JSON
          <br />
          <b>احراز هویت:</b> Cookie-based session (<code dir="ltr" className="text-xs">tb_session</code>)
          <br />
          <b>Rate Limit:</b> بله — IP-based برای جستجو و فرم‌ها
        </p>
      </Card>

      {apiGroups.map((group) => (
        <section key={group.name} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">{group.name}</h2>
            <p className="text-xs text-muted-foreground">{group.description}</p>
          </div>
          <div className="space-y-2">
            {group.endpoints.map((ep) => (
              <Card key={`${ep.method}-${ep.path}`} className="p-0 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  <Badge className={`${methodColors[ep.method]} border text-[10px] font-mono shrink-0`}>
                    {ep.method}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono font-bold" dir="ltr">{ep.path}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">{ep.description}</p>
                    {ep.auth && (
                      <Badge variant="outline" className="text-[9px] mt-1">🔒 نیاز به لاگین</Badge>
                    )}
                    {ep.params && (
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">پارامترها:</span>{" "}
                        <code className="text-[10px]" dir="ltr">{ep.params}</code>
                      </div>
                    )}
                    {ep.body && (
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Body:</span>{" "}
                        <code className="text-[10px] break-all" dir="ltr">{ep.body}</code>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <Separator />

      <Card className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <b>یادداشت:</b> مسیرهای <code dir="ltr" className="text-xs">/api/admin/*</code> فقط برای مدیران قابل دسترسی هستند و در این مستندات پوشش داده نشده‌اند.
          <br />
          <b>نسخه API:</b> v1 (بدون پیشوند نسخه — مستقیم از ریشه)
          <br />
          <b>آخرین به‌روزرسانی:</b> {new Date().toLocaleDateString("fa-IR")}
        </p>
      </Card>
    </main>
  );
}
