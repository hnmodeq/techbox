import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  withCircuit,
  isCircuitOpenError,
  circuitState,
  resetCircuit,
} from "@/lib/db-circuit";

/**
 * Circuit breaker behaviour.
 *
 * Context: one homepage render issues ~18 queries. When Neon's free-tier
 * compute suspends it closes pooled connections, every query fails, and
 * each one waited the full pool_timeout for a slot that was never coming.
 * With the page under repeated requests, demand became 18 x N against 5
 * connections and a brief blip presented as a sustained outage.
 */

function connErr(code = "P1001") {
  const e = new Error("Can't reach database server at `host:5432`") as Error & { code?: string };
  e.code = code;
  return e;
}

function appErr(code = "P2002") {
  const e = new Error("Unique constraint failed") as Error & { code?: string };
  e.code = code;
  return e;
}

describe("circuit breaker", () => {
  beforeEach(() => {
    resetCircuit();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("stays closed and passes values through when healthy", async () => {
    await expect(withCircuit(async () => "ok")).resolves.toBe("ok");
    expect(circuitState()).toBe("closed");
  });

  it("opens after three consecutive connectivity failures", async () => {
    for (let i = 0; i < 3; i++) {
      await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
    }
    expect(circuitState()).toBe("open");
  });

  it("sheds the flood instead of queueing on the pool", async () => {
    // The number that matters: 5 renders x 18 queries with the DB down.
    let hits = 0;
    let shed = 0;
    for (let r = 0; r < 5; r++) {
      for (let q = 0; q < 18; q++) {
        try {
          await withCircuit(async () => { hits++; throw connErr(); });
        } catch (e) {
          if (isCircuitOpenError(e)) shed++;
        }
      }
    }
    expect(hits).toBe(3);   // only the failures that opened it
    expect(shed).toBe(87);  // the rest never touched the pool
  });

  it("does NOT open for application errors", async () => {
    // A unique-constraint violation means the connection is fine. Letting
    // it trip the breaker would suppress every unrelated read on the page.
    for (let i = 0; i < 10; i++) {
      await expect(withCircuit(async () => { throw appErr(); })).rejects.toThrow();
    }
    expect(circuitState()).toBe("closed");
  });

  it("resets its failure count after a success", async () => {
    for (let i = 0; i < 2; i++) {
      await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
    }
    await withCircuit(async () => "ok");
    // Two more failures must not be enough on their own.
    for (let i = 0; i < 2; i++) {
      await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
    }
    expect(circuitState()).toBe("closed");
  });

  it("half-opens after the cooldown and closes on a successful probe", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 3; i++) {
        await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
      }
      expect(circuitState()).toBe("open");
      vi.advanceTimersByTime(5_001);
      expect(circuitState()).toBe("half-open");
      await expect(withCircuit(async () => "back")).resolves.toBe("back");
      expect(circuitState()).toBe("closed");
    } finally {
      vi.useRealTimers();
    }
  });

  it("lets only one probe through while half-open", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 3; i++) {
        await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
      }
      vi.advanceTimersByTime(5_001);

      // A slow probe holds the half-open slot.
      let release: (v: string) => void = () => {};
      const probe = withCircuit(() => new Promise<string>((r) => { release = r; }));

      // Concurrent callers must fail fast rather than pile on during recovery.
      await expect(withCircuit(async () => "second")).rejects.toSatisfy(isCircuitOpenError);

      release("done");
      await expect(probe).resolves.toBe("done");
      expect(circuitState()).toBe("closed");
    } finally {
      vi.useRealTimers();
    }
  });

  it("opening the circuit warns rather than errors", async () => {
    // Opening is the mitigation working, not a fault. console.error would
    // become a blocking red modal in Next's dev overlay and make correct
    // load-shedding look like a crash.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    for (let i = 0; i < 3; i++) {
      await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
    }
    expect(warn).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("marks its own error so callers can stay quiet", async () => {
    for (let i = 0; i < 3; i++) {
      await expect(withCircuit(async () => { throw connErr(); })).rejects.toThrow();
    }
    const err = await withCircuit(async () => "x").catch((e) => e);
    expect(isCircuitOpenError(err)).toBe(true);
    // Distinguishable from a genuine failure, so logs are not duplicated.
    expect(isCircuitOpenError(connErr())).toBe(false);
  });
});
