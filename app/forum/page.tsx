import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import ForumList from "@/features/forum/components/ForumList";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata("forum", "انجمن گفتگوی فنی تکباکس — پرسش و پاسخ، تجربیات و راه‌حل‌ها.");
export default async function ForumPage() {
  const dbItems = await getDbModulePosts("forum", 80);
  return (
    <div dir="rtl">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "انجمن" }]} />
      </div>
      <ForumList serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
