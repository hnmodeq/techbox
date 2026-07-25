"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { HardDrive, ArrowLeft, ShoppingCart, Check } from "lucide-react";

// Featured product data (in real app, this would come from API/DB)
const featuredProduct = {
  title: "DS423+",
  subtitle: "4 Bay همه‌کاره با پشتیبانی NVMe",
  brand: "Synology",
  price: "۳۵,۹۰۰,۰۰۰",
  priceUnit: "تومان",
  tags: ["پیشنهادی", "4 Bay", "NVMe"],
  specs: [
    { label: "بی", value: "۴ Bay" },
    { label: "حداکثر ظرفیت", value: "۸۸ TB" },
    { label: "شبکه", value: "2.5GbE" },
    { label: "NVMe", value: "پشتیبانی" },
  ],
  href: "/shop/synology-ds423plus",
  badge: "پرفروش‌ترین",
};

export default function FeaturedProduct() {
  return (
    <section className="relative overflow-hidden homepage-section-darker home-section" dir="rtl">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.13_0.01_260)/5%] to-transparent" />
      
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-3 text-[11px] border-primary/30 text-primary">
              محصول ویژه
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              پیشنهاد ویژه این هفته
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            همه محصولات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {/* Product card */}
        <div className="card-glow overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Product image placeholder */}
            <div className="relative bg-gradient-to-br from-[oklch(0.20_0.01_260)] to-[oklch(0.15_0.01_260)] p-8 flex items-center justify-center min-h-[280px]">
              <div className="text-center space-y-4">
                <div className="mx-auto size-24 rounded-2xl bg-[oklch(0.25_0.02_260)] flex items-center justify-center">
                  <HardDrive className="size-12 text-primary/60" />
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {featuredProduct.badge}
                </Badge>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-[10px]">
                  {featuredProduct.brand}
                </Badge>
              </div>
            </div>

            {/* Product info */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {featuredProduct.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-3xl font-black tracking-tight">
                    {featuredProduct.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {featuredProduct.subtitle}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3">
                  {featuredProduct.specs.map((spec) => (
                    <div key={spec.label} className="bg-muted/30 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground mb-1">
                        {spec.label}
                      </div>
                      <div className="text-sm font-semibold">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {featuredProduct.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {featuredProduct.priceUnit}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <ButtonLink href={featuredProduct.href} size="lg" className="btn-glow flex-1 gap-2">
                    <ShoppingCart className="size-4" />
                    مشاهده و خرید
                  </ButtonLink>
                  <ButtonLink href="/compare" variant="outline" size="lg" className="flex-1 gap-2">
                    مقایسه محصولات
                  </ButtonLink>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check className="size-3.5 text-green-500" />
                  موجود در انبار — ارسال فوری
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
