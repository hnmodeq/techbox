import type { NasProduct } from "@/features/tools/components/nas-selector/nas-selector-data";
import nasProducts from "@/data/tools/nas-products.json";

// NAS catalog is now self-contained in data/tools/
export async function getNasProducts(): Promise<NasProduct[]> {
  return nasProducts as NasProduct[];
}

export async function getNasProductById(id: string) {
  const list = await getNasProducts();
  return list.find((p) => p.id === id) ?? null;
}
