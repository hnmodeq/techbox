import React from 'react';
import { getAllAcross } from '@/lib/content';
import HeroSection from '@/features/home/components/HeroSection';
import NewsTicker from '@/features/news/components/NewsTicker';
import TechLogoLoopSection from '@/features/home/components/TechLogoLoopSection';
import NewsSidebar from '@/features/home/components/NewsSidebar';
import MagazineRowAsync from '@/features/home/components/MagazineRowAsync';
import VideoReelsRowAsync from '@/features/home/components/VideoReelsRowAsync';
import ShopRowAsync from '@/features/home/components/ShopRowAsync';
import ForumRowAsync from '@/features/home/components/ForumRowAsync';
import ReviewRowAsync from '@/features/home/components/ReviewRowAsync';
import DownloadRowAsync from '@/features/home/components/DownloadRowAsync';
import HomeToolsRow from '@/features/home/components/HomeToolsRow';
import HomeTimelineRow from '@/features/home/components/HomeTimelineRow';

export default async function Page() {
  const allItems = await getAllAcross();
  const tickerItems = allItems
    .filter((i) => ['news', 'blog', 'media', 'forum', 'download', 'review'].includes(i.module))
    .slice(0, 16);

  return (
    <main className="relative overflow-x-hidden w-full max-w-full flex flex-col">
      <NewsTicker items={tickerItems} className="border-b-[length:var(--border-size)] border-[var(--border-color)]/60 bg-[var(--card-background)]/40" />
      <HeroSection />
      <MagazineRowAsync />
      <VideoReelsRowAsync />
      <ShopRowAsync />
      <ForumRowAsync />
      <ReviewRowAsync />
      <DownloadRowAsync />
      <HomeToolsRow />
      <HomeTimelineRow />
      <TechLogoLoopSection />
    </main>
  );
}