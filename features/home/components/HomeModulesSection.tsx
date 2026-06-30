import BentoCard from "@/features/content/components/BentoCard";
import { modules } from "@/config/modules.config";
import { getLatest, moduleMeta, type ModuleSlug } from "@/lib/content";
import { ContentFeedList } from "@/features/content/components/ContentCard";

const feedVariant: Record<ModuleSlug, "image"|"video"|"forum"|"product"|"download"|"review"|"compact"> = {
  blog: "image",
  news: "image",
  media: "video",
  review: "review",
  tools: "compact",
  download: "download",
  shop: "product",
  forum: "forum",
};

export default function HomeModulesSection() {
  const sortedModules = [...modules]
    .filter(m => m.slug !== "tools") // tools moved to sidebar
    .sort((a, b) => a.order - b.order);

  return (
    <section className="px-4 md:px-10 lg:px-20 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-6 px-1">
          <h2 className="text-2xl font-black">آخرین‌ها از تکباکس</h2>
          <span className="text-xs text-muted-foreground">فید زنده ماژول‌ها</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-7 md:auto-rows-min">
          {sortedModules.map((module) => {
            const slug = module.slug as ModuleSlug;
            const feedCount = slug === "shop" ? 6 : slug === "review" ? 4 : slug === "forum" ? 4 : slug === "news" ? 6 : slug === "media" ? 2 : 3;
            const feed = getLatest(slug, feedCount);
            const meta = moduleMeta[slug];
            const variant = feedVariant[slug] || "image";
            return (
              <BentoCard
                key={module.slug}
                title={module.title}
                description={module.description}
                href={`/${module.slug}`}
                color={module.color}
                className={`${module.cols ?? ""} ${module.rows ?? ""} !p-4 hover:translate-y-0 hover:shadow-[var(--tb-shadow)]`} /* disable card hover – inner items hover separately */
                badge={`${feed.length} جدید`}
                footerLink={`/${module.slug}`}
                footerLabel={`همه ${meta.titleFa} →`}
              >
                <div className="[&>*>a:hover]:scale-[1.01] transition-transform">
                  <ContentFeedList items={feed} variant={variant as any} />
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
