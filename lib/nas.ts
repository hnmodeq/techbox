import type { NasProduct } from "@/features/tools/components/nas-selector/nas-selector-data";
import nasProducts from "@/prisma/mock-data/nas-products.json";
import shopData from "@/prisma/mock-data/shop.json";

type ShopItem = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  price?: number | string;
  stock?: boolean;
  inStock?: boolean;
  image?: string;
  images?: string[];
  category?: string;
};

// Merge NAS catalog with real shop data when slugs match
export async function getNasProducts(): Promise<NasProduct[]> {
  const shop = Array.isArray(shopData) ? (shopData as ShopItem[]) : [];
  const shopMap = new Map(shop.map((s) => [s.slug ?? s.id, s]));

  return (nasProducts as NasProduct[]).map((p) => {
    const s = shopMap.get(p.shopSlug) ?? shopMap.get(p.id);
    if (!s) return p;
    return {
      ...p,
      title: (s.title ?? s.name ?? p.title) as string,
      price: s.price !== undefined ? s.price : p.price,
      inStock: s.inStock ?? s.stock ?? p.inStock,
      imageUrl: s.image ?? s.images?.[0] ?? p.imageUrl,
      href: p.href ?? (s.slug ? `/shop/${s.slug}` : undefined),
    };
  });
}

export async function getNasProductById(id: string) {
  const list = await getNasProducts();
  return list.find((p) => p.id === id) ?? null;
}
