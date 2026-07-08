import { modulePageMetadata } from "@/lib/seo";
import ForumList from "@/features/forum/components/ForumList";
export const metadata = modulePageMetadata("forum", "انجمن پرسش و پاسخ تخصصی تکباکس برای مسائل شبکه، زیرساخت، بکاپ، امنیت و سرور.");
export default function ForumPage(){ return <ForumList />; }
