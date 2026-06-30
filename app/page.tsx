import HeroSection from "@/features/home/components/HeroSection";
import HomeModulesSection from "@/features/home/components/HomeModulesSection";
import NewsTicker from "@/features/news/components/NewsTicker";
import TechLogoLoopSection from "@/features/home/components/TechLogoLoopSection";
import { getAllAcross } from "@/lib/content";

export default function Page() {
  const ticker = getAllAcross().filter(i => ["news","blog"].includes(i.module)).slice(0,12);
  return (
    <main className="relative">
      <HeroSection />
      <NewsTicker items={ticker} className="pb-10" />
      <HomeModulesSection />
      <TechLogoLoopSection />
    </main>
  );
}
