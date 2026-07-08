'use client';

import React from 'react';
import { getLatest } from '@/lib/content';
import { useDbPosts } from '@/hooks/useDbPosts';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { CardStats } from '@/components/ui/card-stats';

export default function ShopRow() {
  const fallbackProducts = getLatest('shop', 5);
  const { items: dbProducts } = useDbPosts('shop', fallbackProducts, 5);
  const products = dbProducts.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.shopMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        {/* Simple Text More Button positioned ABOVE items inside the header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">جدیدترین تجهیزات سرور، استوریج و شبکه</h2>
          <Link href="/shop" className="text-sm font-bold text-[var(--shop)] hover:underline flex items-center gap-1 shrink-0">
            <span>مشاهده کل فروشگاه</span>
            <span>←</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((prod, idx) => (
            <Link
              key={prod.slug}
              href={`/shop/${prod.slug}`}
              className="group bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] !p-0 overflow-hidden flex flex-col justify-between hover:shadow-[var(--shadow-size)] transition-all duration-[200ms] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]"
            >
              {/* Product Image Showcase container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--muted-background)]/70 p-4 flex items-center justify-center">
                <Image
                  src={prod.image || '/assets/blog-1.jpg'}
                  alt={prod.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  {...blurProps(prod.image || '/assets/blog-1.jpg')}
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-black text-[var(--primary-text)] group-hover:text-[var(--shop)] transition-colors line-clamp-2 min-h-[44px] leading-6">
                    {prod.title}
                  </h3>
                  
                  <p className="mt-2.5 text-xs paragraph-color leading-5 line-clamp-3">
                    {prod.excerpt}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-start items-center">
                    <CardStats module="shop" slug={prod.slug} showComments={true} />
                  </div>
                  <span className="text-xs font-black text-[var(--shop)] hover:underline flex items-center justify-center py-1">
                    ثبت درخواست خرید ←
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
