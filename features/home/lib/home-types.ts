/**
 * Types for the homepage sections added by the upgrade.
 *
 * These sit alongside the existing `ContentItem` rather than replacing it —
 * most sections consume plain ContentItems, and only the ones with extra
 * shape (product-linked reviews, timeline events, sampled comments,
 * author cards) need their own type.
 *
 * Docs: docs/homepage-upgrade/03-DATA-CONTRACTS.md §1
 */
import type { ContentItem } from "@/lib/content";

/** §5 Our Top Picks — a review joined to the shop product it reviews. */
export type TopPickCard = ContentItem & {
  product: {
    slug: string;
    title: string;
    image: string | null;
    /** Final Toman price, computed server-side. Never trust a client price. */
    priceAmount: number | null;
    discountPercent: number | null;
    discountEndsAt: string | null;
    warranty: string | null;
    availability: string | null;
    brand: string | null;
    model: string | null;
  };
};

/** §6 Timeline — an IT/computing milestone. */
export type TimelineCard = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  dateFa: string;
  year: number;
  yearFa: number;
  /** 1–10. Events at >= 8 get the accent treatment. */
  importance: number;
  tags: string[];
  likes: number;
};

/** §10 Family Comments — a sampled comment from anywhere on the site. */
export type FamilyComment = {
  id: string;
  text: string;
  /** Persian year the author joined, e.g. "۱۳۹۸". */
  memberSince: string;
  author: {
    name: string;
    username: string | null;
    avatar: string | null;
    verifiedType: string | null;
  };
  origin: {
    /** Module label for the chip, e.g. "از انجمن". */
    label: string;
    /** Deep link to the comment anchor. */
    href: string;
  };
};

/** §12 Authors — a contributor card. */
export type AuthorCard = {
  name: string;
  username: string;
  role: string;
  bio: string;
  avatar: string | null;
  verifiedType: string | null;
  verifiedLabel: string | null;
  postCount: number;
};

/** §11 More to Explore — one hero plus a row of oldest-per-module cards. */
export type MoreToExplore = {
  hero: ContentItem | null;
  cards: ContentItem[];
};

/** §13 Family Profiles — a randomly sampled community member (not staff). */
export type FamilyProfile = {
  name: string;
  username: string;
  /** Their real job title, e.g. "مهندس ذخیره‌سازی". */
  job: string;
  avatar: string | null;
  /** Persian year they joined. */
  memberSince: string;
  verifiedType: string | null;
  postCount: number;
  commentCount: number;
};

/** §14 Partners — a company TechBox works with. */
export type PartnerCard = {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  tagline: string | null;
};
