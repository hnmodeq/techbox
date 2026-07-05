import { getRelated, type ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";

export default function SuggestionGrid({ current }: { current: ContentItem }) {
 const related = getRelated(current, 6);
 if (!related.length) return null;
 return (
 <section className="mt-16 border-t border-[var(--border-color)] pt-10">
 <h3 className="h2-font-size h2-font-color font-bold mb-5">پیشنهاد مرتبط از همه ماژول‌ها</h3>
 <p className="paragraph-font-size paragraph-color text-muted-foreground mb-4">
 بر اساس برچسب‌ها: {(current.tags || []).map(t=>`#${t}`).join(" ")}
 </p>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {related.map(r => (
 <ContentCard key={r.module + r.slug} item={r} />
 ))}
 </div>
 </section>
 );
}
