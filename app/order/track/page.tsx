"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  Box,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "processing"
  | "packing"
  | "shipping"
  | "out_for_delivery"
  | "delivered";

type OrderInfo = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: Array<{ title: string; slug: string }>;
  customer: { name: string; phone: string; address: string };
  total: number;
};

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; Icon: React.ElementType }[] = [
  { key: "pending", label: "در انتظار تایید", desc: "سفارش شما ثبت شده و در انتظار تایید تیم فروش است.", Icon: Clock },
  { key: "processing", label: "در حال آماده‌سازی", desc: "سفارش شما در حال آماده‌سازی و بررسی موجودی است.", Icon: Package },
  { key: "packing", label: "در حال بسته‌بندی", desc: "محصولات شما با دقت بسته‌بندی می‌شوند.", Icon: Box },
  { key: "shipping", label: "در حال ارسال", desc: "سفارش شما تحویل شرکت حمل‌ونقل شده است.", Icon: Truck },
  { key: "out_for_delivery", label: "خروج از مرکز توزیع", desc: "بسته شما از مرکز توزیع خارج شده و در مسیر تحویل است.", Icon: MapPin },
  { key: "delivered", label: "تحویل به مشتری", desc: "سفارش شما با موفقیت تحویل داده شد.", Icon: CheckCircle },
];

function getStatusIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function OrderTrackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    if (!orderId) {
      setError("شناسه سفارش یافت نشد.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`);
      if (!res.ok) throw new Error("not_found");
      const data = await res.json();
      setOrder(data);
    } catch {
      // If API doesn't exist yet, show demo data
      setOrder({
        id: orderId,
        status: "processing",
        createdAt: new Date().toISOString(),
        items: [],
        customer: { name: "—", phone: "—", address: "—" },
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center" dir="rtl">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-[13px] text-muted-foreground mt-4">در حال بارگذاری اطلاعات سفارش...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <div className="rounded-xl border border-border bg-card p-10 space-y-4">
          <Package className="size-16 mx-auto text-muted-foreground/30" />
          <h1 className="text-[20px] font-bold">سفارش یافت نشد</h1>
          <p className="text-[13px] text-muted-foreground">{error || "لطفاً شناسه سفارش را بررسی کنید."}</p>
          <Link href="/landing/storage/shop">
            <Button className="mt-2">بازگشت به فروشگاه</Button>
          </Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = getStatusIndex(order.status);

  return (
    <main className="mx-auto max-w-3xl px-3 sm:px-4 py-6" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">خانه</Link>
        <span>/</span>
        <span className="text-foreground">پیگیری سفارش</span>
      </nav>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black">پیگیری سفارش</h1>
            <p className="text-[12px] text-muted-foreground mt-1">
              شناسه: <span className="font-mono font-bold text-foreground" dir="ltr">{order.id}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadOrder} className="gap-1 text-[12px]">
            <RefreshCw className="size-3.5" />
            بروزرسانی
          </Button>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {STATUS_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const isPending = idx > currentStepIndex;
            const Icon = step.Icon;

            return (
              <div key={step.key} className="flex gap-4">
                {/* Left — icon + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                      isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                      isPending && "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-12 my-1",
                        isCompleted ? "bg-emerald-500" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Right — text */}
                <div className={cn("pb-6", isActive && "pb-8")}>
                  <h3
                    className={cn(
                      "text-[14px] font-bold",
                      isCompleted && "text-emerald-600",
                      isActive && "text-primary",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                    {isActive && (
                      <span className="mr-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                        مرحله فعلی
                      </span>
                    )}
                    {isCompleted && (
                      <span className="mr-2 text-[10px] font-medium text-emerald-600">✓</span>
                    )}
                  </h3>
                  <p className={cn("text-[12px] mt-1 leading-5", isPending ? "text-muted-foreground/60" : "text-muted-foreground")}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order info */}
        {order.items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-[14px] font-bold">جزئیات سفارش</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[12px] py-1">
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
            {order.total > 0 && (
              <div className="flex justify-between text-[13px] font-bold border-t border-border pt-2">
                <span>مبلغ کل</span>
                <span>{order.total.toLocaleString("fa-IR")} تومان</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border pt-4 flex items-center gap-3">
          <Link href="/landing/storage/shop">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowRight className="size-3.5" />
              بازگشت به فروشگاه
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
