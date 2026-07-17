import React from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import MagazineRow from '@/features/home/components/MagazineRow';
import VideoReelsRow from '@/features/home/components/VideoReelsRow';
import ShopRow from '@/features/home/components/ShopRow';
import ForumRow from '@/features/home/components/ForumRow';
import ReviewRow from '@/features/home/components/ReviewRow';
import DownloadRow from '@/features/home/components/DownloadRow';
import HomeTimelineRow from '@/features/home/components/HomeTimelineRow';
import RecommendationRow from '@/features/home/components/RecommendationRow';
import { getHomepageRecommendations } from '@/lib/recommendations';
import { getModuleConfig, type ModuleSlug } from '@/lib/module-config';

const ROW_COMPONENTS: Record<string, React.ComponentType<{ homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }>> = {
  blog: MagazineRow,
  media: VideoReelsRow,
  shop: ShopRow,
  forum: ForumRow,
  review: ReviewRow,
  download: DownloadRow,
  timeline: HomeTimelineRow,
};

export default async function Page() {
  const config = await getModuleConfig();

  // Build ordered list of visible rows
  const visibleRows = (Object.keys(ROW_COMPONENTS) as ModuleSlug[])
    .filter((slug) => config[slug]?.enabled && config[slug]?.showOnHome)
    .sort((a, b) => (config[a]?.homeOrder ?? 99) - (config[b]?.homeOrder ?? 99));

  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {config.heroVisible !== false && <HeroSection />}

      {visibleRows.map((slug) => {
        const Component = ROW_COMPONENTS[slug];
        if (!Component) return null;
        const cfg = config[slug];
        return (
          <Component
            key={slug}
            homeTitle={cfg?.homeTitle || undefined}
            homeMoreLabel={cfg?.homeMoreLabel || undefined}
            showHomeTitle={cfg?.showHomeTitle}
            showHomeMoreLabel={cfg?.showHomeMoreLabel}
          />
        );
      })}

      {/* Only show recommendations if at least some modules are enabled */}
      {visibleRows.length > 0 && (
        <RecommendationRow
          items={getHomepageRecommendations(8)}
          title="پیشنهادهای هوشمند برای شما"
        />
      )}
    </main>
  );
}
