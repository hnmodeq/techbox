import { prisma } from "@/lib/db";

/**
 * Log a search query for analytics.
 * Fire-and-forget — errors are silently ignored.
 */
export async function logSearch(params: {
  query: string;
  results: number;
  userId?: string;
}) {
  try {
    await prisma.searchLog.create({
      data: {
        query: params.query,
        results: params.results,
        userId: params.userId,
      },
    });
  } catch {
    // Never throw — search logging should never break search
  }
}
