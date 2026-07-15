import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/effects/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "شرایط استفاده و حریم خصوصی | تکباکس",
  description: "شرایط استفاده از خدمات و سیاست حفظ حریم خصوصی تکباکس.",
  path: "/terms",
});

const sections = [
  {
    title: "اطلاعاتی که دریافت می‌کنیم",
    body: "هنگام ساخت حساب، ارسال فرم یا ثبت دیدگاه، اطلاعاتی را که خودتان وارد می‌کنید دریافت می‌کنیم. همچنین داده‌های فنی ضروری مانند نشانی IP و اطلاعات مرورگر ممکن است برای امنیت، رفع خطا و بهبود خدمات ثبت شوند.",
  },
  {
    title: "نحوه استفاده از اطلاعات",
    body: "اطلاعات شما فقط برای ارائه خدمات، پاسخ‌گویی به درخواست‌ها، مدیریت حساب، جلوگیری از سوءاستفاده و بهبود تجربه کاربری استفاده می‌شود. اطلاعات شخصی شما بدون مبنای قانونی یا رضایت شما فروخته نمی‌شود.",
  },
  {
    title: "محتوا و رفتار کاربران",
    body: "کاربران مسئول محتوایی هستند که ارسال می‌کنند. انتشار محتوای غیرقانونی، ناقض حقوق دیگران، مخرب یا فریبنده مجاز نیست و تکباکس می‌تواند چنین محتوا یا حسابی را محدود یا حذف کند.",
  },
  {
    title: "امنیت و نگهداری داده‌ها",
    body: "برای محافظت از داده‌ها از اقدامات فنی و مدیریتی متعارف استفاده می‌کنیم و اطلاعات را فقط تا زمانی نگه می‌داریم که برای ارائه خدمت، امنیت یا انجام تعهدات قانونی لازم باشد.",
  },
  {
    title: "تغییرات این شرایط",
    body: "ممکن است این صفحه با تغییر خدمات یا الزامات قانونی به‌روزرسانی شود. ادامه استفاده از خدمات پس از انتشار تغییرات به معنی پذیرش نسخه جدید است.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-14" dir="rtl">
      <PageHeader
        colorVar="--about"
        title="شرایط استفاده و حریم خصوصی"
        titleClassName="text-foreground"
        description="اصول استفاده از خدمات تکباکس و نحوه نگهداری از اطلاعات کاربران"
      />

      <Card className="mt-8 p-0 overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">تعهد ما به شفافیت و حفظ حریم خصوصی</CardTitle>
          <p className="text-sm leading-7 text-muted-foreground">
            با استفاده از وب‌سایت تکباکس یا ارسال اطلاعات از طریق فرم‌های آن، این شرایط را می‌پذیرید.
          </p>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2 p-5 sm:p-6">
              <h2 className="font-bold text-foreground">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </CardContent>
      </Card>

      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        برای پرسش درباره اطلاعات شخصی یا درخواست حذف آن‌ها، از صفحه ارتباط با ما استفاده کنید.
      </p>
    </main>
  );
}
