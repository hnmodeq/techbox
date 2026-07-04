'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';

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
          {products.map((prod) => (
            <Link
              key={prod.slug}
              href={`/shop/${prod.slug}`}
              className="group card !p-0 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-md)] border border-[var(--tb-border)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--tb-bg-muted)]">
                <Image
                  src={prod.image || '/assets/blog-1.jpg'}
                  alt={prod.title}
                  fill
                  className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-shop)] transition-colors line-clamp-2 min-h-[48px] leading-6">
                    {prod.title}
                  </h3>
                  <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-2 line-clamp-2 leading-5">
                    {prod.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--tb-border)]/60 flex items-center justify-between">
                  <span className="btn btn-outline !h-8 !px-4 !text-xs font-bold text-[var(--tb-shop)] border-[var(--tb-shop)]">
                    مشاوره خرید
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--tb-fg-muted)]">
                    <span>👁 {(prod.views ?? 0).toLocaleString('fa-IR')}</span>
                    <span>♥ {(prod.likes ?? 0).toLocaleString('fa-IR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
