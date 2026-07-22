import { prisma } from "@/lib/db";

/**
 * Log an admin action to the audit trail.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function logAudit(params: {
  userId?: string;
  userName?: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName || "",
        action: params.action,
        target: params.target,
        details: params.details ? JSON.stringify(params.details) : undefined,
      },
    });
  } catch (e) {
    // Never throw — audit logging should never break the main operation
    console.error("[audit-log] Failed to write:", e);
  }
}
