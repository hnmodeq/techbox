/**
 * Database error classification and rate-limited logging.
 *
 * When Neon is unreachable, every query in every render fails. A single
 * page load fans out into dozens of identical multi-line Prisma stack
 * traces, each one repeating the same "Can't reach database server"
 * paragraph plus a code frame. The real signal — *which* layer broke and
 * what to do about it — is buried under hundreds of lines of noise, and
 * any other error happening at the same time is impossible to spot.
 *
 * These helpers keep the first occurrence (with full detail) and collapse
 * the repeats into nothing until the situation changes or the cooldown
 * expires. Recovery is logged too, so the terminal shows the transition
 * rather than just going quiet.
 *
 * Additive: nothing here changes control flow. Callers still catch and
 * degrade exactly as they did before.
 */

/** Prisma error codes that mean "the database is not reachable right now",
 *  as opposed to "your query or data is wrong". */
const CONNECTIVITY_CODES = new Set([
  "P1000", // authentication failed
  "P1001", // can't reach database server
  "P1002", // server reached but timed out
  "P1008", // operation timed out
  "P1017", // server closed the connection
  "P2024", // connection pool timeout
]);

function errorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}

/** True when the failure is infrastructure, not application logic. */
export function isDbUnreachable(error: unknown): boolean {
  const code = errorCode(error);
  if (code && CONNECTIVITY_CODES.has(code)) return true;
  const message = String((error as { message?: unknown } | null)?.message ?? "");
  return /Can't reach database server|Server has closed the connection|Timed out fetching a new connection/i.test(
    message
  );
}

/**
 * A stale generated client reports as `Cannot read properties of undefined
 * (reading 'findMany')` — a TypeError with no mention of Prisma at all.
 * It has bitten this repo three times (User.createdAt, reviewedProductId,
 * Partner), so it gets named explicitly rather than rediscovered.
 */
export function isStalePrismaClient(error: unknown): boolean {
  const message = String((error as { message?: unknown } | null)?.message ?? "");
  return /Cannot read properties of undefined \(reading '(findMany|findUnique|findFirst|count|create|update|updateMany|upsert|delete|deleteMany|groupBy|aggregate)'\)/.test(
    message
  );
}

/** One-line summary instead of a 30-line Prisma stack trace. */
export function describeDbError(error: unknown): string {
  const code = errorCode(error);
  if (isStalePrismaClient(error)) {
    return "generated Prisma client is stale (a model is missing) — run `pnpm prisma generate`";
  }
  if (isDbUnreachable(error)) {
    const host =
      (error as { meta?: { database_location?: unknown } } | null)?.meta?.database_location;
    const where = typeof host === "string" ? ` (${host})` : "";
    switch (code) {
      case "P1000":
        return `database authentication failed${where}`;
      case "P1002":
        return `database connection timed out during handshake${where}`;
      case "P1017":
        return `database closed the connection${where}`;
      case "P2024":
        return "connection pool timeout — too many concurrent queries";
      default:
        return `database unreachable${where}`;
    }
  }
  const message = String((error as { message?: unknown } | null)?.message ?? error);
  const first = message.split("\n").find((line) => line.trim()) ?? message;
  return `${first.trim()}${code ? ` [${code}]` : ""}`;
}

// ─── rate-limited logging ─────────────────────────────────────────────

const COOLDOWN_MS = 30_000;
const lastLogged = new Map<string, { at: number; summary: string; suppressed: number }>();

/**
 * Log a database failure at most once per cooldown window per scope.
 *
 * Returns true if it actually logged, so callers can attach extra context
 * only when something was printed.
 */
export function logDbFailure(scope: string, error: unknown): boolean {
  const summary = describeDbError(error);
  const now = Date.now();
  const previous = lastLogged.get(scope);

  if (previous && previous.summary === summary && now - previous.at < COOLDOWN_MS) {
    previous.suppressed++;
    return false;
  }

  const repeat =
    previous && previous.summary === summary && previous.suppressed > 0
      ? ` (+${previous.suppressed} identical suppressed)`
      : "";
  lastLogged.set(scope, { at: now, summary, suppressed: 0 });

  if (isDbUnreachable(error) || isStalePrismaClient(error)) {
    // Infrastructure problem: the one-line summary plus the fix is the
    // whole useful payload. The stack trace points at whichever query
    // happened to run first, which is never the cause.
    //
    // console.warn, not console.error. Every caller of this function
    // CATCHES and degrades — the section hides, the page still returns
    // 200. Next's dev overlay promotes console.error into a blocking red
    // "Console Error" modal, so using error severity for a handled
    // fallback buries the screen in popups for something that is working
    // as designed. Reserve error for bugs that need fixing.
    console.warn(`[${scope}] ${summary}${repeat}`);
    const hint = remedyFor(error);
    if (hint) console.warn(`[${scope}] → ${hint}`);
    return true;
  }

  // Anything else is a real bug: keep the full error.
  console.error(`[${scope}] ${summary}${repeat}`, error);
  return true;
}

/** Clear the suppression window for a scope after a successful query, so a
 *  later failure is reported immediately rather than swallowed. */
export function noteDbSuccess(scope: string): void {
  const previous = lastLogged.get(scope);
  if (!previous) return;
  lastLogged.delete(scope);
  if (previous.suppressed > 0) {
    console.log(`[${scope}] recovered (${previous.suppressed} suppressed errors)`);
  }
}

function remedyFor(error: unknown): string {
  if (isStalePrismaClient(error)) {
    return "run `pnpm prisma generate` (or restart `pnpm dev`, which does it for you)";
  }
  const code = errorCode(error);
  if (code === "P1000") return "the password in DATABASE_URL is wrong or not percent-encoded";
  if (code === "P2024") return "raise PRISMA_CONNECTION_LIMIT, or reduce concurrent queries";
  return "run `pnpm db:doctor` to find which layer is failing";
}
