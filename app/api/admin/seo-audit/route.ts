import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Find posts with issues
    const allPosts = await prisma.post.findMany({
      where: { published: true, deletedAt: null },
      select: {
        id: true,
        module: true,
        slug: true,
        title: true,
        image: true,
        seoTitle: true,
        seoDescription: true,
        excerpt: true,
        content: true,
        category: true,
        views: true,
      },
      take: 500,
      orderBy: { date: "desc" },
    });

    const issues: Array<{
      id: string;
      module: string;
      slug: string;
      title: string;
      views: number;
      issues: string[];
    }> = [];

    for (const post of allPosts) {
      const postIssues: string[] = [];

      // SEO issues
      if (!post.seoTitle) postIssues.push("missing_seo_title");
      if (!post.seoDescription) postIssues.push("missing_seo_description");
      if (post.seoDescription && post.seoDescription.length < 120) postIssues.push("short_seo_description");
      if (post.seoTitle && post.seoTitle.length > 60) postIssues.push("long_seo_title");

      // Content issues
      if (!post.image) postIssues.push("missing_image");
      if (!post.excerpt || post.excerpt.length < 50) postIssues.push("weak_excerpt");
      if (!post.category) postIssues.push("missing_category");

      // Content quality
      if (post.content && post.content.length < 300) postIssues.push("thin_content");

      // Image alt text (check if content has images without alt)
      if (post.content) {
        const imgMatches = post.content.match(/<img[^>]*>/gi) || [];
        for (const img of imgMatches) {
          if (!img.includes("alt=") || img.match(/alt=["']\s*["']/)) {
            postIssues.push("images_missing_alt");
            break; // Only flag once per post
          }
        }
      }

      if (postIssues.length > 0) {
        issues.push({
          id: post.id,
          module: post.module,
          slug: post.slug,
          title: post.title,
          views: post.views,
          issues: postIssues,
        });
      }
    }

    // Summary
    const issueCounts: Record<string, number> = {};
    for (const item of issues) {
      for (const issue of item.issues) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    }

    return NextResponse.json({
      total: allPosts.length,
      withIssues: issues.length,
      issueCounts,
      issues: issues.sort((a, b) => b.views - a.views), // Sort by views (most important first)
    });
  } catch (error) {
    console.error("[seo-audit]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
