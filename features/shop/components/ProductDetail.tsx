"use client";

import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { ProductGallery } from "@/components/ui/product-gallery";
import { CardStats } from "@/components/ui/card-stats";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart.provider";
import { ProductJsonLd } from "@/components/seo/StructuredData";

type ProductItem = ContentItem & {
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  priceLabel?: string | null;
  availability?: string | null;
  warranty?: string | null;
  specs?: Record<string, unknown> | null;
};

function SpecsTable({ specs }: { specs?: Record<string, unknown> | null }) {
  const entries = Object.entries(specs || {}).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");
  if (!entries.length) return null;
  return (
    <section className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)]">
      <h2 className="mb-4 text-[length:var(--h2-font-size)] font-bold text-[var(--primary-text)]">مشخصات فنی</h2>
      <div className="divide-y divide-[var(--border-color)]/50">
        {entries.map(([key, value]) => (
          <div key={key} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr]">
            <div className="font-bold text-[var(--primary-text)]">{key}</div>
            <div className="paragraph-color">{String(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductDetail({ item }: { item: ProductItem }) {
  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : item.image ? [item.image] : [];
  const { add, setOpen } = useCart();

  const addConsultation = () => {
    add({ slug: item.slug, title: item.title, price: item.priceLabel || "مشاوره خرید", image: item.image || "" }, 1);
    setOpen(true);
  };

  return (
    <>
    <ProductJsonLd item={item} />
    <main className="mx-auto max-w-7xl px-4 py-10" dir="rtl">
      <nav className="mb-6 flex items-center gap-2 text-[length:var(--paragraph-font-size)] paragraph-color">
        <Link href="/" className="hover:text-[var(--primary-text)]">خانه</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--shop)]">فروشگاه</Link>
        <span>/</span>
        <span className="truncate text-[var(--primary-text)]">{item.title}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start">
        <div>
          <ProductGallery images={gallery} title={item.title} />
        </div>

        <aside className="space-y-5 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)] lg:sticky lg:top-24">
          <div className="flex flex-wrap gap-2">
            {item.category && <span className="rounded-[var(--corner-radius)] bg-[var(--shop)]/10 px-2 py-1 text-xs font-bold text-[var(--shop)]">{item.category}</span>}
            {item.availability && <span className="rounded-[var(--corner-radius)] bg-[var(--success)]/10 px-2 py-1 text-xs font-bold text-[var(--success)]">{item.availability}</span>}
          </div>

          <div>
            <h1 className="text-[length:var(--h1-font-size)] font-black text-[var(--primary-text)] leading-tight">{item.title}</h1>
            <p className="mt-3 leading-7 paragraph-color">{item.excerpt}</p>
          </div>

          <div className="grid gap-3 rounded-[var(--corner-radius)] bg-[var(--muted-background)]/20 p-4 text-sm">
            {item.brand && <div className="flex justify-between gap-3"><span className="paragraph-color">برند</span><b>{item.brand}</b></div>}
            {item.model && <div className="flex justify-between gap-3"><span className="paragraph-color">مدل</span><b dir="ltr">{item.model}</b></div>}
            {item.sku && <div className="flex justify-between gap-3"><span className="paragraph-color">SKU</span><b dir="ltr">{item.sku}</b></div>}
            {item.warranty && <div className="flex justify-between gap-3"><span className="paragraph-color">گارانتی</span><b>{item.warranty}</b></div>}
            <div className="flex justify-between gap-3 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-3"><span className="paragraph-color">قیمت</span><b className="text-[var(--shop)]">{item.priceLabel || "مشاوره خرید"}</b></div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <CardStats module="shop" slug={item.slug} initialViews={item.views} initialLikes={item.likes} initialComments={item.comments || 0} showComments />
            <LikeButton contentType="shop" slug={item.slug} initial={item.likes || 0} />
          </div>

          <Button type="button" onClick={addConsultation} className="w-full">درخواست مشاوره خرید</Button>
        </aside>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)]">
          <h2 className="mb-3 text-[length:var(--h2-font-size)] font-bold text-[var(--primary-text)]">توضیحات محصول</h2>
          <p className="whitespace-pre-line leading-8 paragraph-color">{item.content || item.excerpt}</p>
        </article>
        <SpecsTable specs={item.specs} />
      </section>

      <CommentSection module="shop" slug={item.slug} />
    </main>
    </>
  );
}
