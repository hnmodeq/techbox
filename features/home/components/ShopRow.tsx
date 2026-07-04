'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { CardStats } from '@/components/ui/CardStats';

export default function ShopRow() {
  const products = getLatest('shop', 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.shopMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">جدیدترین تجهیزات سرور، استوریج و شبکه</h2>
          <Link href="/shop" className="text-sm font-bold text-[var(--tb-shop)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده کل فروشگاه</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((prod, idx) => (
            <Link
              key={prod.slug}
              href={`/shop/${prod.slug}`}
              className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]"
            >
              {/* Product Image Showcase container with clean padding */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--tb-bg-muted)]/70 p-4 flex items-center justify-center border-b border-[var(--tb-border)]/50">
                <Image
                  src={prod.image || '/assets/blog-1.jpg'}
                  alt={prod.title}
                  fill
                  className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute top-2.5 right-2.5 rounded-[var(--tb-radius-sm)] bg-[var(--tb-shop)]/20 border border-[var(--tb-shop)]/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--tb-shop)] backdrop-blur-md">
                  SKU: TB-{1024 + idx}
                </span>
                <span className="absolute top-2.5 left-2.5 rounded-full border border-white/30 bg-black/60 px-2 py-0.5 tb-text-sm text-white backdrop-blur-md font-bold">
                  موجود در انبار
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[var(--tb-shop)] mb-1">{prod.category || 'تجهیزات سازمانی'}</div>
                  <h3 className="tb-text-md font-black text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-shop)] transition-colors line-clamp-2 min-h-[44px] leading-6">
                    {prod.title}
                  </h3>
                  
                  {/* Authentic Product Feature Bullets */}
                  <ul className="mt-2.5 space-y-1 text-xs text-[var(--tb-fg-muted)] leading-5">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--tb-shop)]" />
                      <span>گارانتی طلایی اصالت سخت‌افزار تکباکس</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--tb-shop)]" />
                      <span>آماده تحویل و کانفینگ سفارشی دیتاسنتر</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--tb-border)]/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[var(--tb-fg-muted)]">آمار بازدید محصول:</span>
                    <CardStats module="shop" slug={prod.slug} initialViews={prod.views ?? 0} initialLikes={prod.likes ?? 0} />
                  </div>
                  <span className="btn btn-primary bg-[var(--tb-shop)] text-slate-950 hover:opacity-90 font-black w-full py-2.5 text-xs shadow-md flex items-center justify-center">
                    ثبت درخواست خرید
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
