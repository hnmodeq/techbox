import { getModuleItems } from "@/lib/content";
import BlogGridAsync from "@/features/blog/components/BlogGridAsync";
export const metadata = { title: "مجله | تکباکس" };
export default async function BlogPage(){ 
  const items = await getModuleItems("blog");
  return <BlogGridAsync items={items} />;
}