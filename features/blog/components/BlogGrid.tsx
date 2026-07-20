import { type ContentItem } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { MagazineCard } from "@/components/content/MagazineCard";

export default function BlogGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const items = serverItems ?? [];

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-semibold">هنوز مقاله‌ای منتشر نشده</h3>
            <p className="text-sm text-muted-foreground">
              به زودی مقالات تخصصی منتشر خواهد شد.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <MagazineCard key={p.slug} item={p} />
        ))}
      </div>
    </main>
  );
}
