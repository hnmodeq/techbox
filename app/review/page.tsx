import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import ReviewGrid from "@/features/review/components/ReviewGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "review",
  "نقد و بررسی تخصصی تجهیزات شبکه، سرور، ذخیره‌سازی، امنیت و زیرساخت."
);
export default async function ReviewPage() {
  const dbItems = await getDbModulePosts("review", 60);
  return (
    <div dir="rtl">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "نقد و بررسی" }]} />
      </div>
      <ReviewGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
