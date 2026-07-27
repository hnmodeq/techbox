import { prisma } from "@/lib/db";
import { circuitState, retryOnStaleConnection } from "@/lib/db-circuit";

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

  // Never open a connection while the database is already struggling. This
  // is a best-effort background write on every layout render; making it
  // compete with user-facing reads for one of five pool slots is how a
  // transient blip becomes a queue.
  if (circuitState() === "open") return;

  lastCheck = now;

  try {
    // Retried like every read: the first query after Neon's compute
    // suspends hits a dead pooled handle and fails instantly, and this
    // runs on every layout render, so it was a reliable source of
    // connectivity errors on an otherwise healthy database.
    //
    // Safe to retry despite being a write: the where clause is
    // status="scheduled", which the update itself clears, so a duplicate
    // execution matches zero rows. Idempotent by construction.
    const result = await retryOnStaleConnection(() => prisma.post.updateMany({
      where: {
        status: "scheduled",
        date: { lte: new Date() },
      },
      data: {
        status: "published",
        published: true,
      },
    }));

    if (result.count > 0) {
      console.log(`[auto-publish] Published ${result.count} scheduled post(s)`);
    }
  } catch {
    // Never throw — this is a background task
  }
}
