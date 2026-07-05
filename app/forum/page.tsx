import { getModuleItems } from "@/lib/content";
import ForumListAsync from "@/features/forum/components/ForumListAsync";
export const metadata = { title: "انجمن | تکباکس" };
export default async function ForumPage(){ 
  const items = await getModuleItems("forum");
  return <ForumListAsync items={items} />;
}