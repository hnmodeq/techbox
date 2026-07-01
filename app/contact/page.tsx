import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/effects/PageHeader";
export const metadata = { title: "ارتباط با ما | تکباکس" };
export default function Contact() {
 return (
 <main className="max-w-3xl mx-auto px-5 py-16" dir="rtl">
 <PageHeader
 colorVar="--tb-contact"
 title="ارتباط با ما"
 titleClassName="text-[var(--tb-contact)]"
 description="پاتوق بچه‌های فناوری اطلاعات – هونامیک ارتباط رستاک"
 />
 <div className="card p-6 space-y-4">
 <div className="grid md:grid-cols-2 gap-4">
 <input className="input" placeholder="نام" />
 <input className="input" placeholder="ایمیل" />
 </div>
 <input className="input" placeholder="موضوع" />
 <textarea className="input min-h-[140px]" placeholder="پیام شما…" />
 <Button>ارسال</Button>
 <p className="tb-text-sm text-muted-foreground">پاسخ ظرف 24 ساعت – info@techbox.ir</p>
 </div>
 </main>
 );
}
