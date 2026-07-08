import React from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import NewsTicker from '@/features/news/components/NewsTicker';
import MagazineRow from '@/features/home/components/MagazineRow';
import VideoReelsRow from '@/features/home/components/VideoReelsRow';
import ShopRow from '@/features/home/components/ShopRow';
import ForumRow from '@/features/home/components/ForumRow';
import ReviewRow from '@/features/home/components/ReviewRow';
import DownloadRow from '@/features/home/components/DownloadRow';
import HomeTimelineRow from '@/features/home/components/HomeTimelineRow';
import LandingStats from '@/features/home/components/LandingStats';
import TrustSection from '@/features/home/components/TrustSection';
import RecommendationRow from '@/features/home/components/RecommendationRow';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';
import { HomeDataProvider } from '@/features/home/lib/home-data';
import { getHomepageRecommendations } from '@/lib/recommendations';

export default function Page() {
  return (
    <HomeDataProvider>
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      {/* 1. Ticker Bar right at the top of the page */}
      <NewsTicker items={[]} className="border-b-[length:var(--border-size)] border-[var(--border-color)]/60 bg-[var(--card-background)]/40" />

      {/* 2. Hero Section (Big Website Title & Tagline Rotator) */}
      <HeroSection />

      {/* NEW: Stats Section (Step 12) */}
      <LandingStats />

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

      {/* NEW: Trust / Social Proof Section (Step 12) */}
      <TrustSection />

      {/* NEW: Recommendation Engine (Step 14) */}
      <RecommendationRow 
        items={getHomepageRecommendations(8)} 
        title="پیشنهادهای هوشمند برای شما" 
      />

      {/* NEW: Newsletter Signup (Step 16) */}
      <div className="mx-auto max-w-4xl px-4 py-16">
        <NewsletterSignup />
      </div>

    </main>
    </HomeDataProvider>
  );
}
