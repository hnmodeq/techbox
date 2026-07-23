import { modulePageMetadata } from "@/lib/seo";
import ForumList from "@/features/forum/components/ForumList";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata("forum", "انجمن گفتگوی فنی تکباکس — پرسش و پاسخ، تجربیات و راه‌حل‌ها.");
export default async function ForumPage() {
  const dbItems = await getDbModulePosts("forum", 80);
  return (
    <div dir="rtl">
      <ForumList serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
