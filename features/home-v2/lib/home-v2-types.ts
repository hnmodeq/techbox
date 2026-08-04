import type { ContentItem } from "@/lib/content";
import type { HomeAdvertisement } from "@/features/home/lib/home-advertisements";
import type { AuthorCard, CommunityData, FamilyProfile, TimelineCard } from "@/features/home/lib/home-types";

export type HomeV2Product = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  model: string | null;
  priceAmount: number | null;
  discountPercent: number | null;
  availability: string | null;
  formFactor: "rackmount" | "tower";
  salesCount: number;
};

export type HomeV2Metrics = {
  solvedTopics: number;
  approvedForumAnswers: number;
  activeMembers: number;
  publishedReviews: number;
};

export type HomeV2Data = {
  lead: ContentItem | null;
  articles: ContentItem[];
  news: ContentItem[];
  videos: ContentItem[];
  reviews: ContentItem[];
  community: CommunityData;
  timeline: TimelineCard[];
  products: HomeV2Product[];
  authors: AuthorCard[];
  profiles: FamilyProfile[];
  advertisements: HomeAdvertisement[];
  metrics: HomeV2Metrics;
  generatedAt: string;
};
