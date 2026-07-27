/**
 * Circuit breaker for database reads.
 *
 * The failure mode this exists for
 * --------------------------------
 * One homepage render issues ~18 queries (measured). When Neon's free-tier
 * compute suspends after idle, it closes pooled connections; Prisma keeps
 * handing out the dead handles, every one of those 18 queries fails, and
 * each failure waits up to `pool_timeout` (30s in dev) for a slot that is
 * never coming. With the page being requested repeatedly, demand becomes
 * 18 x N against 5 connections and a two-second blip turns into a
 * multi-minute outage that looks like "the database is down".
 *
 * Nothing in the stack backed off. Every section retried independently,
 * forever, as fast as requests arrived.
 *
 * What this does
 * --------------
 * After `THRESHOLD` consecutive connectivity failures the breaker opens and
 * subsequent calls fail *immediately* with a marker error instead of
 * queueing on the pool. After `COOLDOWN_MS` it half-opens and lets exactly
 * one probe through: success closes it, failure re-opens the timer.
 *
 * Callers already degrade gracefully — `section()` in home-server returns a
 * fallback and the page renders without that block — so opening the circuit
 * turns a 30-second hang into an instant empty section that self-heals.
 *
 * Deliberately NOT applied to writes. Failing a write fast is worse than
 * waiting for it: the user loses data either way, but a slow success is
 * still a success. Only read paths wrap themselves in `withCircuit`.
 */
import { isDbUnreachable } from "@/lib/db-error";

const THRESHOLD = 3;
const COOLDOWN_MS = 5_000;

type State = "closed" | "open" | "half-open";

type Circuit = {
  state: State;
  failures: number;
  openedAt: number;
  probeInFlight: boolean;
};

// Survives HMR in dev, where module state is otherwise discarded on every
// edit and the breaker would reset mid-incident.
const globalForCircuit = globalThis as unknown as { __dbCircuit?: Circuit };
const circuit: Circuit =
  globalForCircuit.__dbCircuit ??
  (globalForCircuit.__dbCircuit = {
    state: "closed",
    failures: 0,
    openedAt: 0,
    probeInFlight: false,
  });

/** Thrown instead of touching the pool while the breaker is open. */
export class CircuitOpenError extends Error {
  readonly code = "DB_CIRCUIT_OPEN";
  constructor(msWaited: number) {
    super(
      `database circuit open — skipping query (retrying in ${Math.max(
        0,
        COOLDOWN_MS - msWaited,
      )}ms)`,
    );
    this.name = "CircuitOpenError";
  }
}

export function isCircuitOpenError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "DB_CIRCUIT_OPEN";
}

function now() {
  return Date.now();
}

/** Current state, for diagnostics and tests. */
export function circuitState(): State {
  if (circuit.state === "open" && now() - circuit.openedAt >= COOLDOWN_MS) {
    return "half-open";
  }
  return circuit.state;
}

/** Test helper. Not used by application code. */
export function resetCircuit(): void {
  circuit.state = "closed";
  circuit.failures = 0;
  circuit.openedAt = 0;
  circuit.probeInFlight = false;
}

function recordSuccess() {
  if (circuit.state !== "closed") {
    console.log("[db-circuit] database recovered — resuming normal queries");
  }
  circuit.state = "closed";
  circuit.failures = 0;
  circuit.probeInFlight = false;
}

function recordFailure() {
  circuit.probeInFlight = false;
  circuit.failures++;
  if (circuit.failures >= THRESHOLD && circuit.state !== "open") {
    circuit.state = "open";
    circuit.openedAt = now();
    // warn, not error: opening the circuit is the mitigation working, not
    // a fault. Callers degrade to empty sections and the page still
    // serves. Next's dev overlay turns console.error into a blocking
    // modal, which would make load-shedding look like a crash.
    console.warn(
      `[db-circuit] ${circuit.failures} consecutive connectivity failures — ` +
        `pausing database reads for ${COOLDOWN_MS}ms to let the pool recover`,
    );
  } else if (circuit.state === "open") {
    // Probe failed; restart the cooldown rather than retrying immediately.
    circuit.openedAt = now();
  }
}

/**
 * A dead pooled handle fails instantly and deterministically: Neon has
 * closed the socket, Prisma hands it out anyway, the query dies. Retrying
 * once forces the pool to dial a fresh connection, which then succeeds.
 *
 * This is the difference between "the compute went to sleep, wake it" and
 * "the network is down". Without it the first request after every idle
 * period burns three failures and opens the breaker for something that
 * would have worked on the second attempt.
 *
 * One retry only, and only for connectivity errors — anything more turns
 * a genuine outage back into the retry storm the breaker exists to stop.
 */
const RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS ?? 150);

export async function retryOnStaleConnection<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isDbUnreachable(error)) throw error;
    if (RETRY_DELAY_MS > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
    return run();
  }
}

/**
 * Run a read through the breaker.
 *
 * Only *connectivity* failures count toward opening it. A P2002 or a bad
 * query is an application bug and must not suppress unrelated reads.
 */
export async function withCircuit<T>(run: () => Promise<T>): Promise<T> {
  const state = circuitState();

  if (state === "open") {
    throw new CircuitOpenError(now() - circuit.openedAt);
  }

  if (state === "half-open") {
    if (circuit.probeInFlight) {
      // Another request is already probing. Everyone else fails fast so a
      // recovery attempt cannot itself become a thundering herd.
      throw new CircuitOpenError(now() - circuit.openedAt);
    }
    circuit.probeInFlight = true;
    circuit.state = "half-open";
  }

  try {
    const value = await retryOnStaleConnection(run);
    recordSuccess();
    return value;
  } catch (error) {
    if (isDbUnreachable(error)) {
      recordFailure();
    } else {
      // Application-level error: the connection is fine.
      circuit.probeInFlight = false;
      circuit.failures = 0;
      if (circuit.state !== "closed") circuit.state = "closed";
    }
    throw error;
  }
}
