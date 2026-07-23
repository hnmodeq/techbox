import React from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import ToolsShowcase from '@/features/home/components/ToolsShowcase';
import WhyTechBox from '@/features/home/components/WhyTechBox';
import CtaSection from '@/features/home/components/CtaSection';
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

function GradientDivider() {
  return <hr className="home-divider" />;
}

export default async function Page() {
  const config = await getModuleConfig();

  const visibleRows = (Object.keys(ROW_COMPONENTS) as ModuleSlug[])
    .filter((slug) => config[slug]?.enabled && config[slug]?.showOnHome)
    .sort((a, b) => (config[a]?.homeOrder ?? 99) - (config[b]?.homeOrder ?? 99));

  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {/* Hero with terminal */}
      {config.heroVisible !== false && <HeroSection />}

      <GradientDivider />

      {/* Why TechBox */}
      <WhyTechBox />

      <GradientDivider />

      {/* Tools showcase */}
      <ToolsShowcase />

      <GradientDivider />

      {/* Module rows */}
      {visibleRows.map((slug) => {
        const Component = ROW_COMPONENTS[slug];
        if (!Component) return null;
        const cfg = config[slug];
        return (
          <React.Fragment key={slug}>
            <Component
              homeTitle={cfg?.homeTitle || undefined}
              homeMoreLabel={cfg?.homeMoreLabel || undefined}
              showHomeTitle={cfg?.showHomeTitle}
              showHomeMoreLabel={cfg?.showHomeMoreLabel}
            />
            <GradientDivider />
          </React.Fragment>
        );
      })}

      {/* Recommendations */}
      {visibleRows.length > 0 && (
        <>
          <RecommendationRow
            items={getHomepageRecommendations(8)}
            title="پیشنهادهای هوشمند برای شما"
          />
          <GradientDivider />
        </>
      )}

      {/* CTA */}
      <CtaSection />
    </main>
  );
}
