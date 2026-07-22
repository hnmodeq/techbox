"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "—";

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
      <div className="rounded-xl border border-border bg-card p-10 space-y-6">
        <CheckCircle className="size-20 mx-auto text-emerald-500" />
        <h1 className="text-[24px] font-black">خرید شما با موفقیت ثبت شد</h1>
        <p className="text-[14px] text-muted-foreground leading-7">
          سفارش شما با شناسه <b className="text-foreground" dir="ltr">{orderId}</b> ثبت شد.
          <br />
          تیم تکباکس به‌زودی سفارش شما را پردازش و ارسال خواهد کرد.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href={`/order/track?id=${orderId}`}>
            <Button size="lg" className="gap-2">
              <Truck className="size-4" />
              پیگیری سفارش
            </Button>
          </Link>
          <Link href="/landing/storage/shop">
            <Button variant="outline" size="lg" className="gap-2">
              <Package className="size-4" />
              ادامه خرید
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
