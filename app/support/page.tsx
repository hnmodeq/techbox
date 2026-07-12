import { defaultSeo } from "@/lib/seo"
import { SupportForm } from "@/features/support/components/SupportForm"

export const metadata = {
  title: `پشتیبانی | ${defaultSeo.title}`,
  description: "ارسال پیام به تیم پشتیبانی تکباکس",
}

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground mb-2">پشتیبانی</h1>
      <p className="text-sm text-muted-foreground mb-8">
        سوال یا مشکلی دارید؟ پیام خود را برای تیم پشتیبانی ارسال کنید.
      </p>
      <SupportForm />
    </main>
  )
}
