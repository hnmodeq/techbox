import { getModuleItems, moduleMeta, type ModuleSlug } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";
import Link from "next/link";

export default function ModuleList({ module }: { module: ModuleSlug }) {
 const items = getModuleItems(module);
 const meta = moduleMeta[module];
 return (
 <main className="mx-auto max-w-5xl px-5 py-14" dir="rtl">
 <div className="flex items-end justify-between mb-8">
 <div>
 <h1 className={`tb-text-hero ${meta.color}`}>{meta.titleFa}</h1>
 <p className="tb-text-md text-muted-foreground mt-2">{items.length} مطلب • مرتب‌سازی تازه‌ترین</p>
 </div>
 <Link href="/" className="tb-text-sm text-muted-foreground hover:text-foreground">خانه →</Link>
 </div>
 <div className="grid gap-4 md:grid-cols-2">
 {items.map(i => <ContentCard key={i.slug} item={i} />)}
 </div>
 {items.length === 0 && <p className="text-center text-muted-foreground py-16">محتوایی ثبت نشده</p>}
 </main>
 );
}
