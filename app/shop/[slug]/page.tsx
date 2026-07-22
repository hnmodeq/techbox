import { getDbPost } from "@/lib/server-post";
import { detailMetadata } from "@/lib/seo";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbProductDetail from "@/features/shop/components/DbProductDetail";

export const dynamicParams = true;
export const revalidate = 3600;

type P = Promise<{ slug: string }>;

// Check if a product has enough specs to be worth showing
function hasEnoughSpecs(item: any): boolean {
  if (!item) return false;
  const specs = (item.specs && typeof item.specs === "object" && !Array.isArray(item.specs))
    ? item.specs as Record<string, unknown>
    : {};

  // Count major specs
  const hasBay = !!(specs["Drive Bay"] || specs["Bay"] || specs["تعداد جایگاه دیسک"]);
  const hasCpu = !!(specs["CPU"] || specs["پردازنده"]);
  const hasRam = !!(specs["System Memory"] || specs["RAM"] || specs["حافظه رم"]);
  const hasNetwork = !!(
    specs["10 Gigabit Ethernet Port"] ||
    specs["2.5 Gigabit Ethernet Port (2.5G/1G/100M)"] ||
    specs["2.5 Gigabit Ethernet Port"] ||
    specs["Network Card"]
  );
  const majorSpecCount = [hasBay, hasCpu, hasRam, hasNetwork].filter(Boolean).length;

  // Count total non-empty specs
  const totalSpecs = Object.values(specs).filter((v) => {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s && !["n/a", "na", "-", ""].includes(s);
  }).length;

  return majorSpecCount >= 2 && totalSpecs >= 3;
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("shop", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("shop", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }

  // Reject products with insufficient specs — redirect to shop listing
  if (dbItem && !hasEnoughSpecs(dbItem)) {
    redirect("/landing/storage/shop");
  }

  return <DbProductDetail slug={slug} fallback={dbItem} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("shop", slug);
  return detailMetadata("shop", item, "فروشگاه تکباکس");
}
