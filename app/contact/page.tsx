import { Button } from "@/components/ui/Button";
export const metadata = { title: "ارتباط با ما | تکباکس" };
export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16" dir="rtl">
      <h1 className="text-3xl font-black mb-3">ارتباط با ما</h1>
      <p className="text-muted-foreground mb-8">پاتوق بچه‌های فناوری اطلاعات – هونامیک ارتباط رستاک</p>
      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="نام" />
          <input className="input" placeholder="ایمیل" />
        </div>
        <input className="input" placeholder="موضوع" />
        <textarea className="input min-h-[140px]" placeholder="پیام شما…" />
        <Button>ارسال</Button>
        <p className="text-[11px] text-muted-foreground">پاسخ ظرف 24 ساعت – info@techbox.ir</p>
      </div>
    </main>
  );
}
