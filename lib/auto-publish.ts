import { prisma } from "@/lib/db";

/**
 * Auto-publish scheduled posts whose date has passed.
 * Called on homepage load with a 60-second cooldown to avoid hammering the DB.
 * Fire-and-forget — errors are silently ignored.
 */

let lastCheck = 0;
const COOLDOWN_MS = 60 * 1000; // 1 minute

export async function autoPublishScheduled(): Promise<void> {
  const now = Date.now();
  if (now - lastCheck < COOLDOWN_MS) return; // Skip if checked recently
  lastCheck = now;

  try {
    const result = await prisma.post.updateMany({
      where: {
        status: "scheduled",
        date: { lte: new Date() },
      },
      data: {
        status: "published",
        published: true,
      },
    });

    if (result.count > 0) {
      console.log(`[auto-publish] Published ${result.count} scheduled post(s)`);
    }
  } catch {
    // Never throw — this is a background task
  }
}
