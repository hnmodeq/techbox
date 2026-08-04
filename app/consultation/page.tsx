import { pageMetadata } from "@/lib/seo";
import { SupportForm } from "@/features/support/components/SupportForm";

export const metadata = pageMetadata({
  title: "مشاوره زیرساخت | تکباکس",
  description: "ثبت درخواست مشاوره و ادامه گفت‌وگوی امن و قابل پیگیری با تیم فنی تکباکس.",
  path: "/consultation",
});

/** The former support-ticket mechanism is retained deliberately: it provides
 * authenticated/guest ownership, threaded replies and status tracking. Only
 * its public product language is now Consultation. */
export default function ConsultationPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12" dir="rtl">
      <h1 className="mb-2 text-2xl font-bold text-foreground">مشاوره زیرساخت</h1>
      <p className="mb-8 text-sm leading-7 text-muted-foreground">
        نیاز یا مسئله زیرساختی خود را ثبت کنید؛ پاسخ تیم فنی و ادامه گفت‌وگو در همین درخواست قابل پیگیری خواهد بود.
      </p>
      <SupportForm />
    </main>
  );
}
