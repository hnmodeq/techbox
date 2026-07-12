'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardStats } from '@/components/ui/card-stats';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

export default function ShopRow() {
  const { items: dbProducts, loading } = useHomeModule('shop');
  const products = dbProducts.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.shopMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">جدیدترین تجهیزات سرور، استوریج و شبکه</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--shop)] font-bold shrink-0" href="/shop">
            مشاهده کل فروشگاه ←
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={5} imageRatio="aspect-[4/3]" />
        ) : products.length === 0 ? (
          <EmptyRow>هنوز محصولی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((prod) => (
            <Card key={prod.slug} className="group !p-0 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <Link href={`/shop/${prod.slug}`} className="block flex-1">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/70 p-4 flex items-center justify-center">
                  <Image
                    src={prod.image || '/assets/blog-1.jpg'}
                    alt={prod.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                    {...blurProps(prod.image || '/assets/blog-1.jpg')}
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-[var(--shop)]/85 text-white border-none text-[10px]">
                    محصول
                  </Badge>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-foreground group-hover:text-[var(--shop)] transition-colors line-clamp-2 min-h-[44px] leading-6">
                      {prod.title}
                    </h3>
                    
                    <p className="mt-2.5 text-xs text-muted-foreground leading-5 line-clamp-3">
                      {prod.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-start items-center">
                      <CardStats module="shop" slug={prod.slug} showComments={true} />
                    </div>
                    <div className="text-xs font-black text-[var(--shop)] text-center py-1">
                      ثبت درخواست خرید ←
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
