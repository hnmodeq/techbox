import type { ComponentType } from "react";
import HeroSection from "@/features/home/components/HeroSection";
import ToolsShowcase from "@/features/home/components/ToolsShowcase";
import WhyTechBox from "@/features/home/components/WhyTechBox";
import CtaSection from "@/features/home/components/CtaSection";
import MagazineRow from "@/features/home/components/MagazineRow";
import VideoReelsRow from "@/features/home/components/VideoReelsRow";
import ShopRow from "@/features/home/components/ShopRow";
import ForumRow from "@/features/home/components/ForumRow";
import ReviewRow from "@/features/home/components/ReviewRow";
import HomeTimelineRow from "@/features/home/components/HomeTimelineRow";
import { HomeDataProvider } from "@/features/home/lib/home-data";
import { getHomeData } from "@/lib/home-server";
import { getModuleConfig, type ModuleSlug } from "@/lib/module-config";

type RowProps = {
  homeTitle?: string;
  homeMoreLabel?: string;
  showHomeTitle?: boolean;
  showHomeMoreLabel?: boolean;
};

const ROW_COMPONENTS: Partial<Record<ModuleSlug, ComponentType<RowProps>>> = {
  blog: MagazineRow,
  media: VideoReelsRow,
  shop: ShopRow,
  forum: ForumRow,
  review: ReviewRow,
  timeline: HomeTimelineRow,
};

export default async function HomePage() {
  const [config, data] = await Promise.all([getModuleConfig(), getHomeData()]);
  const visibleRows = (Object.keys(ROW_COMPONENTS) as ModuleSlug[])
    .filter((slug) => config[slug]?.enabled && config[slug]?.showOnHome)
    .sort((a, b) => (config[a]?.homeOrder ?? 99) - (config[b]?.homeOrder ?? 99));

  return (
    <HomeDataProvider initialData={data}>
      <main className="flex w-full max-w-full flex-col overflow-x-hidden">
        {config.heroVisible === false && (
          <h1 className="sr-only">تکباکس؛ رسانه، ابزار و فروشگاه تخصصی زیرساخت فناوری اطلاعات</h1>
        )}
        {config.heroVisible !== false && <HeroSection />}
        <WhyTechBox />
        {config.tools?.enabled !== false && <ToolsShowcase />}
        {visibleRows.map((slug) => {
          const Component = ROW_COMPONENTS[slug];
          if (!Component) return null;
          const row = config[slug];
          return (
            <Component
              key={slug}
              homeTitle={row?.homeTitle || undefined}
              homeMoreLabel={row?.homeMoreLabel || undefined}
              showHomeTitle={row?.showHomeTitle}
              showHomeMoreLabel={row?.showHomeMoreLabel}
            />
          );
        })}
        <CtaSection />
      </main>
    </HomeDataProvider>
  );
}
