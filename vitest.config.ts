import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    env: {
      // The db circuit breaker sleeps between its single retry. In tests
      // that is dead wall-clock time in every failure path, and it fights
      // vi.useFakeTimers(). Zero the delay; the retry itself is still
      // exercised.
      DB_RETRY_DELAY_MS: "0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
