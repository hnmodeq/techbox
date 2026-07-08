import { modulePageMetadata } from "@/lib/seo";
import ReviewGrid from "@/features/review/components/ReviewGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "review",
  "نقد و بررسی تخصصی تجهیزات شبکه، سرور، ذخیره‌سازی، امنیت و زیرساخت."
);

export const revalidate = 60;

export default async function ReviewPage() {
  const dbItems = await getDbModulePosts("review", 60);
  return <ReviewGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
