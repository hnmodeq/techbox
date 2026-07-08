import type { ContentItem, ModuleSlug } from "@/lib/content";
import { getAllAcross, getModuleItems } from "@/lib/content";

export interface RecommendationOptions {
  currentSlug?: string;
  currentModule?: ModuleSlug;
  limit?: number;
  boostTags?: string[];
  excludeModules?: ModuleSlug[];
}

/**
 * Advanced Recommendation Engine (Step 14)
 * Scores items based on:
 * - Tag overlap (high weight)
 * - Category match
 * - Same module (slight penalty for diversity)
 * - Popularity (views + likes)
 */
export function getRecommendations(
  currentItem: ContentItem | null,
  options: RecommendationOptions = {}
): ContentItem[] {
  const {
    currentSlug,
    currentModule,
    limit = 6,
    boostTags = [],
    excludeModules = [],
  } = options;

  const allItems = getAllAcross();

  // Filter out current item and excluded modules
  const candidates = allItems.filter((item) => {
    if (item.slug === currentSlug) return false;
    if (excludeModules.includes(item.module)) return false;
    return true;
  });

  if (candidates.length === 0) return [];

  const scored = candidates.map((item) => {
    let score = 0;

    // 1. Tag similarity (strongest signal)
    if (currentItem?.tags?.length) {
      const currentTags = new Set(currentItem.tags.map((t) => t.toLowerCase()));
      const itemTags = item.tags.map((t) => t.toLowerCase());

      const overlap = itemTags.filter((t) => currentTags.has(t)).length;
      score += overlap * 12; // High weight for tags
    }

    // 2. Category match
    if (currentItem?.category && item.category === currentItem.category) {
      score += 25;
    }

    // 3. Boost specific tags (used in homepage recommendations)
    if (boostTags.length > 0) {
      const itemTagsLower = item.tags.map((t) => t.toLowerCase());
      const boostMatches = boostTags.filter((tag) =>
        itemTagsLower.includes(tag.toLowerCase())
      ).length;
      score += boostMatches * 8;
    }

    // 4. Popularity boost
    score += Math.min((item.views || 0) / 120, 18);
    score += Math.min((item.likes || 0) / 4, 10);

    // 5. Diversity penalty (prefer different modules)
    if (currentModule && item.module === currentModule) {
      score -= 8;
    }

    // 6. Recency bonus (last 30 days)
    const itemDate = new Date(item.date);
    const daysOld = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 30) {
      score += Math.max(0, 12 - daysOld / 3);
    }

    return { item, score };
  });

  // Sort by score and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

/**
 * Get personalized recommendations for homepage
 */
export function getHomepageRecommendations(limit = 8): ContentItem[] {
  const all = getAllAcross();

  // Boost popular + recent content
  return all
    .map((item) => {
      let score = 0;
      score += Math.min((item.views || 0) / 80, 25);
      score += Math.min((item.likes || 0) / 2, 15);

      const daysOld = (Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 14) score += 18;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

/**
 * Get "You might also like" for a specific item
 */
export function getYouMightAlsoLike(
  current: ContentItem,
  limit = 5
): ContentItem[] {
  return getRecommendations(current, {
    currentSlug: current.slug,
    currentModule: current.module,
    limit,
  });
}
