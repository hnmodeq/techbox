import { pageMetadata } from "@/lib/seo";

import PageHeader from "@/components/effects/PageHeader";
import ContactForm from "@/features/contact/components/ContactForm";

export const metadata = pageMetadata({
  title: "ارتباط با ما | تکباکس",
  description: "راه‌های ارتباط با تیم تکباکس برای همکاری، مشاوره و پشتیبانی.",
  path: "/contact",
});

export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-16" dir="rtl">
      <PageHeader
        colorVar="--contact"
        title="ارتباط با ما"
        titleClassName="text-[var(--contact)]"
        description="پاتوق بچه‌های فناوری اطلاعات – هونامیک ارتباط رستاک"
      />
      <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 space-y-4">
        <ContactForm />
        <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground">
          پاسخ ظرف ۲۴ ساعت – info@techbox.ir
        </p>
      </div>
    </main>
  );
}
