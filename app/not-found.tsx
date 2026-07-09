import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center" dir="rtl">
      <div className="relative">
        <h1 className="text-9xl font-black text-[var(--border-color)] opacity-20">404</h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-2">گم شده‌اید؟</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            صفحه‌ای که به دنبال آن بودید یافت نشد. ممکن است آدرس را اشتباه وارد کرده باشید یا صفحه حذف شده باشد.
          </p>
          <div className="flex gap-4">
            <ButtonLink href="/" variant="primary">بازگشت به خانه</ButtonLink>
            <ButtonLink href="/search" variant="ghost">جستجو در سایت</ButtonLink>
          </div>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
        <Link href="/blog" className="p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--blog)] transition-colors">بلاگ</Link>
        <Link href="/news" className="p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--news)] transition-colors">اخبار</Link>
        <Link href="/tools" className="p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--tools)] transition-colors">ابزارها</Link>
        <Link href="/shop" className="p-4 rounded-xl border border-[var(--border-color)] hover:border-[var(--shop)] transition-colors">فروشگاه</Link>
      </div>
    </main>
  );
}
