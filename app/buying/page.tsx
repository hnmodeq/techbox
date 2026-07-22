"use client";

import { useState, useMemo } from "react";
import { useConsultation } from "@/providers/consultation.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Building2,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  Trash2,
  ArrowRight,
  CalendarDays,
  Bookmark,
} from "lucide-react";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "ارسال عادی (۳ تا ۵ روز کاری)", price: 0 },
  { id: "express", label: "ارسال سریع (۱ تا ۲ روز کاری)", price: 500000 },
  { id: "same_day", label: "ارسال همان روز (فقط تهران)", price: 1500000 },
];

const DELIVERY_TIME_OPTIONS = [
  { id: "morning", label: "صبح (۸ تا ۱۲)" },
  { id: "afternoon", label: "بعدازظهر (۱۲ تا ۱۷)" },
  { id: "evening", label: "عصر (۱۷ تا ۲۱)" },
];

const TAX_RATE = 0.09; // 9% VAT

export default function BuyingPage() {
  const { items, remove, count } = useConsultation();
  const [shipping, setShipping] = useState("standard");
  const [deliveryTime, setDeliveryTime] = useState("morning");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    address: "",
    postalCode: "",
    city: "تهران",
    email: "",
    notes: "",
  });

  const updateField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const shippingCost = SHIPPING_OPTIONS.find((s) => s.id === shipping)?.price ?? 0;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [items]);

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shippingCost + tax;

  const handlePayment = async () => {
    if (!form.name || !form.phone || !form.address || !form.postalCode) {
      alert("لطفاً فیلدهای ضروری (نام، شماره تماس، آدرس و کد پستی) را پر کنید.");
      return;
    }
    if (items.length === 0) {
      alert("سبد خرید شما خالی است.");
      return;
    }

    setSubmitting(true);
    try {
      // Create order first
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, title: i.title, price: i.price || 0 })),
          customer: form,
          shipping: { method: shipping, time: deliveryTime, cost: shippingCost },
          subtotal,
          tax,
          total,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.error || "order_failed");

      // Redirect to payment
      const payRes = await fetch("/api/pay/zarinpal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          description: `سفارش تکباکس - ${orderData.orderId}`,
          email: form.email || undefined,
          mobile: form.phone,
          orderId: orderData.orderId,
        }),
      });

      const payData = await payRes.json();
      if (payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
      } else {
        // If payment not enabled, redirect to success directly
        window.location.href = `/order/success?id=${orderData.orderId}`;
      }
    } catch (err) {
      alert("خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <div className="rounded-xl border border-border bg-card p-10 space-y-4">
          <Package className="size-16 mx-auto text-muted-foreground/30" />
          <h1 className="text-[20px] font-bold">سبد خرید شما خالی است</h1>
          <p className="text-[13px] text-muted-foreground">محصولی به سبد خرید اضافه نشده است.</p>
          <Link href="/landing/storage/shop">
            <Button className="mt-2">مشاهده فروشگاه</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6 py-6" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">خانه</Link>
        <span>/</span>
        <Link href="/landing/storage/shop" className="hover:text-foreground">فروشگاه</Link>
        <span>/</span>
        <span className="text-foreground">تکمیل خرید</span>
      </nav>

      <h1 className="text-[22px] font-black mb-6 flex items-center gap-2">
        <CreditCard className="size-6 text-primary" />
        تکمیل خرید
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Form sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* Customer info */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              اطلاعات گیرنده
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">نام و نام خانوادگی *</label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="مثلاً: علی محمدی" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">شماره تماس *</label>
                <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">ایمیل</label>
                <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@example.com" dir="ltr" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">نام شرکت / سازمان</label>
                <div className="relative">
                  <Building2 className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={form.company} onChange={(e) => updateField("company", e.target.value)} placeholder="اختیاری" className="pr-8" />
                </div>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              آدرس
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">شهر</label>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">کد پستی *</label>
                <Input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="۱۲۳۴۵۶۷۸۹۰" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">آدرس کامل *</label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="خیابان، پلاک، واحد..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none min-h-[80px]"
                rows={3}
              />
            </div>
            {/* Map placeholder */}
            <div className="rounded-lg border border-border bg-muted/30 h-[200px] flex items-center justify-center text-[12px] text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="size-8 text-muted-foreground/40" />
                <span>نقشه (انتخاب موقعیت روی نقشه — به‌زودی)</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">توضیحات سفارش</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="توضیحات اختیاری..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none min-h-[60px]"
                rows={2}
              />
            </div>
          </section>

          {/* Shipping method */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              روش ارسال
            </h2>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                    shipping === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === opt.id}
                      onChange={() => setShipping(opt.id)}
                      className="accent-primary"
                    />
                    <span className="text-[12px] font-medium">{opt.label}</span>
                  </div>
                  <span className="text-[12px] font-bold">
                    {opt.price === 0 ? "رایگان" : `${opt.price.toLocaleString("fa-IR")} تومان`}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Delivery time */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              زمان تحویل
            </h2>
            <div className="flex gap-2">
              {DELIVERY_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDeliveryTime(opt.id)}
                  className={`flex-1 rounded-lg border p-3 text-center text-[12px] font-medium transition-colors ${
                    deliveryTime === opt.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Product list */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <Package className="size-5 text-primary" />
              لیست محصولات ({count.toLocaleString("fa-IR")} کالا)
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.slug} className="flex items-center gap-3 border border-border rounded-lg p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={item.image || "/assets/blog-1.jpg"} alt={item.title} fill sizes="64px" className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold line-clamp-1">{item.title}</p>
                    {item.price ? (
                      <p className="text-[12px] text-primary font-bold mt-1">{item.price.toLocaleString("fa-IR")} تومان</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground mt-1">قیمت: استعلام</p>
                    )}
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => remove(item.slug)} className="text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right — Order summary (sticky) */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-[15px] font-bold">خلاصه سفارش</h2>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">جمع کالاها</span>
                  <span className="font-bold">{subtotal > 0 ? `${subtotal.toLocaleString("fa-IR")} تومان` : "استعلام"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">هزینه ارسال</span>
                  <span className="font-bold">{shippingCost === 0 ? "رایگان" : `${shippingCost.toLocaleString("fa-IR")} تومان`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مالیات بر ارزش افزوده (۹٪)</span>
                  <span className="font-bold">{tax > 0 ? `${tax.toLocaleString("fa-IR")} تومان` : "—"}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-[14px]">
                  <span className="font-bold">مبلغ قابل پرداخت</span>
                  <span className="font-black text-primary">{total > 0 ? `${total.toLocaleString("fa-IR")} تومان` : "استعلام"}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handlePayment}
                disabled={submitting}
                loading={submitting}
                className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-12 text-[14px] font-bold rounded-lg"
              >
                <CreditCard className="size-4 ml-2" />
                {submitting ? "در حال انتقال..." : "پرداخت"}
              </Button>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2">
                <ShieldCheck className="size-3.5" />
                <span>پرداخت امن از طریق درگاه زرین‌پال</span>
              </div>
            </div>

            <Link
              href="/landing/storage/shop"
              className="flex items-center justify-center gap-1 text-[12px] text-primary hover:underline"
            >
              <ArrowRight className="size-3.5" />
              ادامه خرید از فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
