import { defaultSeo } from "@/lib/seo"
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm"

export const metadata = {
  title: `بازخورد | ${defaultSeo.title}`,
  description: "ارسال بازخورد و پیشنهادات به تکباکس",
}

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
