import React from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import NewsTicker from '@/features/news/components/NewsTicker';
import TechLogoLoopSection from '@/features/home/components/TechLogoLoopSection';
import NewsSidebar from '@/features/home/components/NewsSidebar';
import MagazineRow from '@/features/home/components/MagazineRow';
import VideoReelsRow from '@/features/home/components/VideoReelsRow';
import ShopRow from '@/features/home/components/ShopRow';
import ForumRow from '@/features/home/components/ForumRow';
import ReviewRow from '@/features/home/components/ReviewRow';
import DownloadRow from '@/features/home/components/DownloadRow';
import HomeToolsRow from '@/features/home/components/HomeToolsRow';
import HomeTimelineRow from '@/features/home/components/HomeTimelineRow';
import { getAllAcross } from '@/lib/content';

export default function Page() {
  const tickerItems = getAllAcross()
    .filter((i) => ['news', 'blog', 'media', 'forum', 'download', 'review'].includes(i.module))
    .slice(0, 16);

  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {/* Left Collapsible News Sidebar */}
      <NewsSidebar />

      {/* 1. Ticker Bar right at the top of the page */}
      <NewsTicker items={tickerItems} className="border-b border-[var(--tb-border)]/60 bg-[var(--tb-bg-secondary)]/40" />

      {/* 2. Hero Section (Big Website Title & Tagline Rotator) */}
      <HeroSection />

      {/* 3. Full Width Magazine Row */}
      <MagazineRow />

      {/* 4. Full Width Video Reels Row */}
      <VideoReelsRow />

      {/* 5. Full Width Shop Row */}
      <ShopRow />

      {/* 6. Full Width Forum Row */}
      <ForumRow />

      {/* 7. Full Width Reviews Row */}
      <ReviewRow />

      {/* 8. Full Width Downloads Row */}
      <DownloadRow />

      {/* 9. Full Usable Embedded RAID Calculator & Tools Redirects Row */}
      <HomeToolsRow />

      {/* 10. Technology Timeline Preview Row */}
      <HomeTimelineRow />

      {/* 11. Expanded Infrastructure Tech Stack Companies Row */}
      <TechLogoLoopSection />
    </main>
  );
}
