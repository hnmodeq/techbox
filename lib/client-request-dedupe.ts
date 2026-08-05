"use client";

export type SharedJsonResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

type Entry = {
  promise: Promise<SharedJsonResponse<unknown>>;
  expiresAt: number;
  settled: boolean;
};
const requests = new Map<string, Entry>();
const REUSE_MS = 1_000;

/** Share identical client GETs across React Strict Mode's development effect
 * replay. Only parsed JSON is shared, so no caller competes for a consumed
 * Response body. Entries expire quickly and never become application state. */
export function sharedJsonRequest<T>(key: string, input: RequestInfo | URL, init?: RequestInit): Promise<SharedJsonResponse<T>> {
  const now = Date.now();
  const current = requests.get(key);
  if (current && (!current.settled || current.expiresAt > now)) {
    return current.promise as Promise<SharedJsonResponse<T>>;
  }

  const entry: Entry = {
    promise: fetch(input, init).then(async (response) => ({
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => null),
    })),
    expiresAt: Number.POSITIVE_INFINITY,
    settled: false,
  };
  requests.set(key, entry);
  entry.promise.then(
    () => {
      entry.settled = true;
      entry.expiresAt = Date.now() + REUSE_MS;
    },
    () => requests.delete(key),
  );
  return entry.promise as Promise<SharedJsonResponse<T>>;
}
