/**
 * TechBox homepage.
 *
 * Sections are modelled on Spiceworks and Tom's Guide, adapted to Persian
 * RTL, and every card is backed by a live database row — there is no
 * placeholder content anywhere on this page. A section whose query comes
 * back empty renders `null` and disappears entirely rather than showing a
 * skeleton or dummy card.
 *
 * All data arrives from a single cached `getHomeData()` call; no section
 * fetches on its own, and nothing fetches on the client during first
 * paint.
 *
 * Section order and visibility remain admin-controlled through
 * `getModuleConfig()` — `enabled`, `showOnHome`, `homeOrder`, plus the
 * per-module title and "more" label overrides.
 *
 * Docs: docs/homepage-upgrade/
 */
import { HomeDataProvider } from "@/features/home/lib/home-data";
import { getHomeData } from "@/lib/home-server";
import { getModuleConfig, type ModuleSlug } from "@/lib/module-config";

import { MagazineSection } from "@/features/home/components/sections/MagazineSection";
import { VideoSection } from "@/features/home/components/sections/VideoSection";
import { InsightsSection } from "@/features/home/components/sections/InsightsSection";
import { TimelineSection } from "@/features/home/components/sections/TimelineSection";
import { CommunitySection } from "@/features/home/components/sections/CommunitySection";

/**
 * Which module slug gates each section, so the admin panel keeps control.
 * Sections not tied to a module (Insights) are always eligible and rely on
 * their own empty-state guard.
 */
type SectionKey = "magazine" | "video" | "insights" | "timeline" | "community";

const SECTION_MODULE: Record<SectionKey, ModuleSlug | null> = {
  magazine: "blog",
  video: "media",
  insights: null, // news-backed, but has no dedicated home row in the config
  timeline: "timeline",
  community: "forum",
};

/** Fallback ordering when a module has no explicit homeOrder. */
const SECTION_FALLBACK_ORDER: Record<SectionKey, number> = {
  magazine: 1,
  video: 2,
  insights: 3,
  timeline: 6,
  community: 9,
};

export default async function HomePage() {
  const [config, data] = await Promise.all([getModuleConfig(), getHomeData()]);

  const isVisible = (key: SectionKey) => {
    const slug = SECTION_MODULE[key];
    if (!slug) return true;
    return Boolean(config[slug]?.enabled && config[slug]?.showOnHome);
  };

  const orderOf = (key: SectionKey) => {
    const slug = SECTION_MODULE[key];
    return config[slug as ModuleSlug]?.homeOrder ?? SECTION_FALLBACK_ORDER[key];
  };

  /** Admin title/label overrides; empty string means "use the default". */
  const textFor = (key: SectionKey) => {
    const slug = SECTION_MODULE[key];
    const cfg = slug ? config[slug] : undefined;
    return {
      title: cfg?.homeTitle?.trim() || undefined,
      moreLabel: cfg?.homeMoreLabel?.trim() || undefined,
      showTitle: cfg?.showHomeTitle ?? true,
      showMore: cfg?.showHomeMoreLabel ?? true,
    };
  };

  const sections: Array<{ key: SectionKey; node: React.ReactNode }> = [
    {
      key: "magazine",
      node: <MagazineSection posts={data.modules.blog ?? []} {...textFor("magazine")} />,
    },
    {
      key: "video",
      node: <VideoSection videos={data.modules.media ?? []} {...textFor("video")} />,
    },
    {
      key: "insights",
      node: <InsightsSection insights={data.insights ?? []} />,
    },
    {
      key: "timeline",
      node: <TimelineSection events={data.timeline ?? []} {...textFor("timeline")} />,
    },
    {
      key: "community",
      node: <CommunitySection topics={data.modules.forum ?? []} {...textFor("community")} />,
    },
  ];

  const visible = sections
    .filter((s) => isVisible(s.key))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key));

  return (
    <HomeDataProvider initialData={data}>
      <div className="flex w-full max-w-full flex-col overflow-x-hidden bg-[color:var(--hp-bg)]">
        {/* Screen readers need one h1; the visual hierarchy starts at h2. */}
        <h1 className="sr-only">تکباکس — پاتوق بچه‌های فناوری اطلاعات</h1>
        {visible.map((s) => (
          <div key={s.key}>{s.node}</div>
        ))}
      </div>
    </HomeDataProvider>
  );
}
