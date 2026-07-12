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

export default function Page() {
  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Magazine Row */}
      <MagazineRow />

      {/* Video Reels Row */}
      <VideoReelsRow />

      {/* Shop Row */}
      <ShopRow />

      {/* Forum Row */}
      <ForumRow />

      {/* Reviews Row */}
      <ReviewRow />

      {/* Downloads Row */}
      <DownloadRow />

      {/* Technology Timeline Preview Row */}
      <HomeTimelineRow />

      {/* Recommendation Engine */}
      <RecommendationRow
        items={getHomepageRecommendations(8)}
        title="پیشنهادهای هوشمند برای شما"
      />
    </main>
  );
}
