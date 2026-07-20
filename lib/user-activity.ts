import { prisma } from "@/lib/db"
import type { UserActivity } from "@/components/profile/UserActivityList"
import { getEnabledModules, type ModuleSlug } from "@/lib/module-config"

const DEFAULT_PROFILE_MODULES: ModuleSlug[] = ["blog", "review", "media", "forum", "news"]

export async function getProfileContentModules(): Promise<ModuleSlug[]> {
  try {
    const enabled = await getEnabledModules()
    const contentModules: ModuleSlug[] = ["blog", "review", "media", "forum", "news"]
    return contentModules.filter((m) => enabled.includes(m))
  } catch {
    return DEFAULT_PROFILE_MODULES
  }
}

export const PROFILE_CONTENT_MODULES = ["blog", "review", "media", "forum", "news"]

/**
 * Modules that are org-level content with no personal author.
 * These are excluded from the author content tab.
 */
export const AUTHOR_CONTENT_MODULES: ModuleSlug[] = ["blog", "review", "forum"]

export async function getProfileContentModulesForAuthor(): Promise<ModuleSlug[]> {
  try {
    const enabled = await getEnabledModules()
    return AUTHOR_CONTENT_MODULES.filter((m) => enabled.includes(m))
  } catch {
    return AUTHOR_CONTENT_MODULES
  }
}

export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  const enabledModules = await getProfileContentModules()

  const likes = await prisma.like.findMany({
    where: {
      OR: [{ userId }, { fingerprint: userId }],
      module: { in: enabledModules },
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 150,
  }).catch(() => [])

  const likedPostMap = new Map<string, any>()
  if (likes.length) {
    const likedPosts = await prisma.post.findMany({
      where: { published: true, deletedAt: null, OR: likes.map((like: any) => ({ module: like.module, slug: like.slug })) },
    }).catch(() => [])
    likedPosts.forEach((post: any) => likedPostMap.set(`${post.module}:${post.slug}`, post))
  }

  const likeActivities: UserActivity[] = likes
    .map((like: any) => {
      const post = likedPostMap.get(`${like.module}:${like.slug}`)
      if (!post) return null
      return {
        id: `like-${like.id}`,
        type: "like" as const,
        module: post.module,
        slug: post.slug,
        title: post.title,
        image: post.image,
        excerpt: post.excerpt,
        createdAt: like.createdAt.toISOString(),
      }
    })
    .filter(Boolean) as UserActivity[]

  const comments = await prisma.comment.findMany({
    where: {
      authorId: userId,
      deletedAt: null,
      post: { module: { in: enabledModules }, published: true, deletedAt: null },
    },
    include: { post: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  }).catch(() => [])

  const commentActivities: UserActivity[] = comments.map((comment: any) => ({
    id: `comment-${comment.id}`,
    type: "comment" as const,
    module: comment.post.module,
    slug: comment.post.slug,
    title: comment.post.title,
    image: comment.post.image,
    excerpt: comment.post.excerpt,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  }))

  return [...likeActivities, ...commentActivities].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}
