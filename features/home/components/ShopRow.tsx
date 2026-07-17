'use client';

import React from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyRow, RowGridSkeleton } from './HomeRowSkeletons';

export default function ShopRow({ homeTitle, homeMoreLabel }: { homeTitle?: string; homeMoreLabel?: string }) {
  const { items: dbProducts, loading } = useHomeModule('shop');
  const products = dbProducts.slice(0, 5);

  return (
    <section className={`w-full py-12 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.shopMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">{homeTitle || "آخرین محصولات سازمانی اضافه شده"}</h2>
          <ButtonLink variant="link" size="sm" className="text-[var(--shop)] font-bold shrink-0" href="/shop">
            {homeMoreLabel || "بازدید از فروشگاه ←"}
          </ButtonLink>
        </div>

        {loading ? (
          <RowGridSkeleton count={5} imageRatio="aspect-[4/3]" />
        ) : products.length === 0 ? (
          <EmptyRow>هنوز محصولی در دیتابیس ثبت نشده است.</EmptyRow>
        ) : (
        <div className="responsive-card-grid grid gap-6">
          {products.map((prod) => {
            const available = (prod as any).availability !== "ناموجود";
            return (
              <Card key={prod.slug} className="group !p-0 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 ease-out">
                <Link href={`/shop/${prod.slug}`} className="block flex-1">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-white p-4 flex items-center justify-center">
                    <Image
                      src={prod.image || '/assets/blog-1.jpg'}
                      alt={prod.title}
                      fill
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 300px"
                      {...blurProps(prod.image || '/assets/blog-1.jpg')}
                    />
                    <Badge
                      className={`absolute top-2 left-2 border-none text-[10px] font-bold ${
                        available
                          ? "bg-[var(--success)]/85 text-white"
                          : "bg-[var(--danger)]/85 text-white"
                      }`}
                    >
                      {available ? "موجود" : "ناموجود"}
                    </Badge>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-foreground group-hover:text-[var(--shop)] transition-colors duration-300 line-clamp-2 min-h-[44px] leading-6">
                        {prod.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(prod as any).brand && (
                          <Badge variant="outline" className="text-[10px]">{(prod as any).brand}</Badge>
                        )}
                        {(prod as any).category && (
                          <Badge variant="secondary" className="text-[10px]">{(prod as any).category}</Badge>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground leading-5 line-clamp-2">
                        {prod.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 text-xs font-black text-[var(--shop)] text-center py-2 rounded-[var(--corner-radius)] bg-[var(--shop)]/5">
                      مشاهده جزئیات و درخواست مشاوره ←
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
