import type { NvrModel } from "@/features/tools/components/nvr-selector/nvr-selector-data";
import nvrProducts from "@/prisma/mock-data/nvr-products.json";
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
};

export async function getNvrProducts(): Promise<NvrModel[]> {
  const shop = Array.isArray(shopData) ? (shopData as ShopItem[]) : [];
  const shopMap = new Map(shop.map((s) => [s.slug ?? s.id, s]));
  return (nvrProducts as NvrModel[]).map((p) => {
    const s = shopMap.get(p.shopSlug) ?? shopMap.get(p.id);
    if (!s) return p;
    return {
      ...p,
      nameFa: (s.title ?? s.name ?? p.nameFa) as string,
      price: s.price !== undefined ? s.price : p.price,
      inStock: s.inStock ?? s.stock ?? p.inStock,
      imageUrl: s.image ?? p.imageUrl,
      href: p.href ?? (s.slug ? `/shop/${s.slug}` : undefined),
    };
  });
}
