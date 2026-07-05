import { getModuleItems } from "@/lib/content";
import NewsListAsync from "@/features/news/components/NewsListAsync";
export const metadata = { title: "اخبار | تکباکس" };
export default async function NewsPage(){ 
  const items = await getModuleItems("news");
  return <NewsListAsync items={items} />;
}