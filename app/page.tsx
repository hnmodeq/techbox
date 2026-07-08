import React from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import NewsTicker from '@/features/news/components/NewsTicker';
import NewsSidebar from '@/features/home/components/NewsSidebar';
import MagazineRow from '@/features/home/components/MagazineRow';
import VideoReelsRow from '@/features/home/components/VideoReelsRow';
import ShopRow from '@/features/home/components/ShopRow';
import ForumRow from '@/features/home/components/ForumRow';
import ReviewRow from '@/features/home/components/ReviewRow';
import DownloadRow from '@/features/home/components/DownloadRow';
import HomeTimelineRow from '@/features/home/components/HomeTimelineRow';

export default function Page() {
  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {/* 1. Ticker Bar right at the top of the page */}
      <NewsTicker items={[]} className="border-b-[length:var(--border-size)] border-[var(--border-color)]/60 bg-[var(--card-background)]/40" />

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

      {/* 9. Technology Timeline Preview Row */}
      <HomeTimelineRow />

    </main>
  );
}
