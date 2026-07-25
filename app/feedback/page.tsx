import { pageMetadata } from "@/lib/seo"
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm"

export const metadata = pageMetadata({
  title: "بازخورد و پیشنهادها | تکباکس",
  description: "ارسال نظر، پیشنهاد و بازخورد درباره خدمات و محتوای تکباکس.",
  path: "/feedback",
})

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground mb-2">بازخورد</h1>
      <p className="text-sm text-muted-foreground mb-8">
        نظرات و پیشنهادات خود را با ما در میان بگذارید.
      </p>
      <FeedbackForm />
    </main>
  )
}
