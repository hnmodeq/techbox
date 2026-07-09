import type { NvrModel } from "@/features/tools/components/nvr-selector/nvr-selector-data";
import nvrProducts from "@/data/tools/nvr-products.json";

export async function getNvrProducts(): Promise<NvrModel[]> {
  return nvrProducts as NvrModel[];
}
