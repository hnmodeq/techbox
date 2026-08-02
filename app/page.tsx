/**
 * TechBox homepage.
 *
 * Sections are modelled on Spiceworks and Tom's Guide, adapted to Persian
 * RTL, and every card is backed by a live database row — there is no
 * placeholder content anywhere on this page. A section whose query comes
 * back empty renders `null` and disappears entirely rather than showing a
 * skeleton or dummy card.
 *
 * All sections except Magazine arrive from a single cached `getHomeData()`
 * call. Magazine intentionally makes one server-side refresh-time selection:
 * its lead is always the newest article and its four compact cards are real
 * random articles. Nothing fetches on the client during first paint.
 *
 * Section order and visibility remain admin-controlled through
 * `getModuleConfig()` — `enabled`, `showOnHome`, `homeOrder`, plus the
 * per-module title and "more" label overrides.
 *
 * Docs: docs/homepage-upgrade/
 */
import { HomeDataProvider } from "@/features/home/lib/home-data";
import { getHomeData, getMagazinePosts } from "@/lib/home-server";
import { getModuleConfig, type ModuleSlug } from "@/lib/module-config";
import { resolveModuleColor } from "@/config/module-colors";

import { MagazineSection } from "@/features/home/components/sections/MagazineSection";
import { VideoSection } from "@/features/home/components/sections/VideoSection";
import { InsightsSection } from "@/features/home/components/sections/InsightsSection";
import { TimelineSection } from "@/features/home/components/sections/TimelineSection";
import { CommunitySection } from "@/features/home/components/sections/CommunitySection";
import { FinderSection } from "@/features/home/components/sections/FinderSection";
import { DealsSection } from "@/features/home/components/sections/DealsSection";
import { ToolsSection } from "@/features/home/components/sections/ToolsSection";
import { TopPicksSection } from "@/features/home/components/sections/TopPicksSection";
import { FamilyCommentsSection } from "@/features/home/components/sections/FamilyCommentsSection";
import { MoreToExploreSection } from "@/features/home/components/sections/MoreToExploreSection";
import { AuthorsSection } from "@/features/home/components/sections/AuthorsSection";
import { AnnouncementBar } from "@/features/home/components/sections/AnnouncementBar";
import { TooltipColorScope } from "@/components/ui/tooltip";
import { FamilyProfilesSection } from "@/features/home/components/sections/FamilyProfilesSection";
import { PartnersSection } from "@/features/home/components/sections/PartnersSection";

/**
 * Which module slug gates each section, so the admin panel keeps control.
 * Sections not tied to a module (Insights) are always eligible and rely on
 * their own empty-state guard.
 */
type SectionKey =
  | "magazine"
  | "video"
  | "insights"
  | "finder"
  | "topPicks"
  | "timeline"
  | "deals"
  | "tools"
  | "community"
  | "familyComments"
  | "moreToExplore"
  | "authors"
  | "familyProfiles"
  | "partners";

const SECTION_MODULE: Record<SectionKey, ModuleSlug | null> = {
  magazine: "blog",
  video: "media",
  insights: null, // news-backed, but has no dedicated home row in the config
  finder: null,   // search, not a content module
  topPicks: "review",
  timeline: "timeline",
  deals: "shop",
  tools: "tools",
  community: "forum",
  familyComments: null, // sampled across every module
  moreToExplore: null,  // mixed-module rediscovery
  authors: null,        // people, not a content module
  familyProfiles: null, // community members
  partners: null,       // companies, admin-managed
};

/** Fallback ordering when a module has no explicit homeOrder. */
const SECTION_FALLBACK_ORDER: Record<SectionKey, number> = {
  magazine: 1,
  video: 2,
  insights: 3,
  finder: 4,
  topPicks: 5,
  timeline: 6,
  deals: 7,
  tools: 8,
  community: 9,
  familyComments: 10,
  moreToExplore: 11,
  authors: 12,
  familyProfiles: 13,
  partners: 14,
};

// Keep the public homepage in Next's route cache and refresh it hourly.
// The magazine rail is cached separately in lib/home-server.ts, so it still
// rotates without making every visitor hit the database.
export const revalidate = 3600;

export default async function HomePage() {
  const [config, data] = await Promise.all([getModuleConfig(), getHomeData()]);
  const magazinePosts = config.blog?.enabled && config.blog?.showOnHome
    ? await getMagazinePosts()
    : [];

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
      description: cfg?.homeDescription?.trim() || undefined,
      showTags: cfg?.showHomeTags ?? true,
      // Disabled means ordinary shadcn tokens. Sections only receive a
      // custom value when the administrator has turned module colours on.
      accentColor: slug && config.moduleColorsEnabled !== false
        ? resolveModuleColor(slug, config.moduleColors[slug])
        : undefined,
    };
  };

  const tooltipColorFor = (slug: ModuleSlug | null) =>
    slug && config.moduleColorsEnabled !== false
      ? resolveModuleColor(slug, config.moduleColors[slug])
      : undefined;

  const withModuleTooltip = (slug: ModuleSlug | null, node: React.ReactNode) => (
    <TooltipColorScope color={tooltipColorFor(slug)}>{node}</TooltipColorScope>
  );

  const sections: Array<{ key: SectionKey; node: React.ReactNode }> = [
    {
      key: "magazine",
      node: withModuleTooltip("blog", <MagazineSection posts={magazinePosts} {...textFor("magazine")} />),
    },
    {
      key: "video",
      node: withModuleTooltip(
        "media",
        <VideoSection
          videos={data.modules.media ?? []}
          highlightComments={data.videoHighlightComments}
          {...textFor("video")}
        />,
      ),
    },
    {
      key: "insights",
      node: withModuleTooltip(
        "news",
        <InsightsSection
          data={data.latestInsights}
          accentColor={config.moduleColorsEnabled !== false
            ? resolveModuleColor("news", config.moduleColors.news)
            : undefined}
        />,
      ),
    },
    {
      key: "finder",
      node: <FinderSection chips={data.finderChips} />,
    },
    {
      key: "topPicks",
      node: withModuleTooltip("review", <TopPicksSection picks={data.topPicks ?? []} {...textFor("topPicks")} />),
    },
    {
      key: "timeline",
      node: withModuleTooltip("timeline", <TimelineSection events={data.timeline ?? []} {...textFor("timeline")} />),
    },
    {
      key: "deals",
      node: withModuleTooltip("shop", <DealsSection products={data.modules.shop ?? []} {...textFor("deals")} />),
    },
    {
      key: "tools",
      node: withModuleTooltip("tools", <ToolsSection featured={data.toolsFeatured} {...textFor("tools")} />),
    },
    {
      key: "community",
      node: withModuleTooltip(
        "forum",
        <CommunitySection
          featuredTopic={data.community?.featured}
          topics={data.community?.topics ?? []}
          {...textFor("community")}
        />,
      ),
    },
    {
      key: "familyComments",
      node: <FamilyCommentsSection comments={data.familyComments ?? []} />,
    },
    {
      key: "moreToExplore",
      node: <MoreToExploreSection data={data.moreToExplore} />,
    },
    {
      key: "authors",
      node: <AuthorsSection authors={data.authors ?? []} />,
    },
    {
      key: "familyProfiles",
      node: <FamilyProfilesSection profiles={data.familyProfiles ?? []} />,
    },
    {
      key: "partners",
      node: <PartnersSection partners={data.partners ?? []} />,
    },
  ];

  const visible = sections
    .filter((s) => isVisible(s.key))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key));

  return (
    <HomeDataProvider initialData={data}>
      <div className="flex w-full max-w-full flex-col overflow-x-hidden bg-[color:var(--hp-bg)]">
        {/* §0 sits above the ordered sections and is not part of the
            module-config ordering — it is chrome, not content. */}
        <AnnouncementBar announcement={data.announcement} />

        {/* Screen readers need one h1; the visual hierarchy starts at h2. */}
        <h1 className="sr-only">تکباکس — پاتوق بچه‌های فناوری اطلاعات</h1>
        {/* Alternating full-bleed bands.
            The stripe is computed from the RENDERED index, not from a colour
            baked into each section, so hiding or reordering any section in
            the admin panel keeps the light/dark/light rhythm intact. Each
            wrapper is full-width; the sections themselves still centre their
            own 1280 container. */}
        {visible.map((s, index) => (
          <div
            key={s.key}
            className="w-full"
            style={{
              background: index % 2 === 0 ? "var(--hp-band-a)" : "var(--hp-band-b)",
            }}
          >
            {s.node}
          </div>
        ))}
      </div>
    </HomeDataProvider>
  );
}
