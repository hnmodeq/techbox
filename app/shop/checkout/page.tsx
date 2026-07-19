import ModuleHeader from "@/components/effects/ModuleHeader";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12" dir="rtl">
      <ModuleHeader
        module="shop"
        title="فروشگاه تکباکس — کاتالوگ"
        description="فروشگاه تکباکس در حال حاضر فقط کاتالوگ است"
      />

      <div className="mt-8 bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-8 text-center space-y-4">
        <div className="text-6xl">🛍️</div>
        <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">
          فروشگاه در حال حاضر فقط کاتالوگ است
        </h2>
        <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color max-w-md mx-auto">
          شما می‌توانید محصولات را مشاهده و بررسی کنید. برای اطلاع از قیمت و موجودی، با تیم فروش تکباکس تماس بگیرید.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-4 px-6 py-3 rounded-[var(--corner-radius)] bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    </main>
  );
}
