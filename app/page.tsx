import {
  HeroSection,
  FeaturedProduct,
  LatestArticles,
  LatestVideos,
  ModuleStrip,
  HotForumTopics,
  QuickTools,
  FinalCTA,
} from "@/features/home/components/sections";
import SectionDivider from "@/features/home/components/SectionDivider";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero - Big statement */}
      <HeroSection />
      
      <SectionDivider />

      {/* 2. Featured Product - Shop priority */}
      <FeaturedProduct />
      
      <SectionDivider />

      {/* 3. Latest Articles - Magazine */}
      <LatestArticles />
      
      <SectionDivider />

      {/* 4. Latest Videos - Reels */}
      <LatestVideos />
      
      <SectionDivider />

      {/* 5. Module Strip - All modules at a glance */}
      <ModuleStrip />
      
      <SectionDivider />

      {/* 6. Hot Forum Topics */}
      <HotForumTopics />
      
      <SectionDivider />

      {/* 7. Quick Tools */}
      <QuickTools />
      
      <SectionDivider />

      {/* 8. Final CTA */}
      <FinalCTA />
    </main>
  );
}
