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
 <h1 className={`text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ${meta.color}`}>{meta.titleFa}</h1>
 <p className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-muted-foreground mt-2">{items.length} مطلب • مرتب‌سازی تازه‌ترین</p>
 </div>
 <Link href="/" className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground hover:text-foreground">خانه →</Link>
 </div>
 <div className="grid gap-4 md:grid-cols-2">
 {items.map(i => <ContentCard key={i.slug} item={i} />)}
 </div>
 {items.length === 0 && <p className="text-center text-muted-foreground py-16">محتوایی ثبت نشده</p>}
 </main>
 );
}
