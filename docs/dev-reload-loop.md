# The localhost non-stop refresh loop — diagnosis

## Current local-development policy

`pnpm dev` and `pnpm dev:clean` use **Webpack** by default. The production
build is unchanged; this only avoids a Windows/Turbopack HMR reload loop seen
with stale browser chunks. `pnpm dev:turbo` and `pnpm dev:turbo:clean` remain
available as explicit opt-ins once a browser profile has been verified clean.

## Original diagnosis

`next.config.mjs` applied production security headers (CSP) and `immutable`
cache headers **in development too**. Both break `next dev`. The service worker
was never the cause.

## Why the previous three fixes didn't work

`1879f0d`, `b22e2d2` and `a258cfe` all assumed a stale service worker
was navigating the page. But:

- `public/register-sw.js` is **never loaded** — no `<script>` tag, no
  import, nothing references it. It was dead code from day one.
- `RuntimeEffects` / `sw.js` only register on
  `protocol === "https:" && !isLocalhost`, so a worker can't be created
  on `http://localhost:3000` in the first place.

So there was no worker on localhost to unregister. Each commit added
more cleanup code for a worker that didn't exist, and the loop stayed.

## The actual causes (both verified by experiment)

### 1. `immutable` cache headers override dev's `no-store`

`headers()` had no environment guard, so these ran under `next dev`:

```js
{ source: '/fonts/:path*',  headers: [{ key: 'Cache-Control',
  value: 'public, max-age=31536000, immutable' }] }
// same for /images/:path* and /assets/:path*
```

Measured on Next 16.2.12 with a minimal app using exactly this rule:

| Path                  | Cache-Control served in dev          |
|-----------------------|--------------------------------------|
| `/fonts/test.woff2`   | `public, max-age=31536000, immutable` |
| `/other/test.woff2`   | `public, max-age=0` (Next's default)  |

In dev Next deliberately sends `no-store`/`max-age=0` so assets are
re-fetched. Pinning them `immutable` for a year makes the browser reuse
stale copies, Fast Refresh can't reconcile them, and it escalates to a
full page reload. This is a known Next issue — see
vercel/next.js#69600, where the identical `Cache-Control` override in
`next.config.js` produced an infinite reload loop.

It also explains the "failed hashed Kalameh font requests": the browser
was serving cached font URLs whose hashes no longer exist on the server.

### 2. The CSP is enforced in dev and doesn't cover the dev client

Confirmed the CSP really is applied by `next dev` — including on
`/_next/*` and the HMR endpoint:

```
GET /                              -> Content-Security-Policy: default-src 'self'; ...
GET /_next/static/chunks/main-app.js -> Content-Security-Policy: default-src 'self'; ...
GET /_next/webpack-hmr             -> Content-Security-Policy: default-src 'self'; ...
```

The policy has `default-src 'self'` and a `connect-src` with no
`ws:`/`wss:` origin. Under CSP, `'self'` does **not** cover the `ws:`
scheme on a plain-HTTP origin — that's the documented behaviour in
w3c/webappsec-csp#7 and the reason `connect-src` needs an explicit
`ws://localhost:3000`. When the HMR socket is blocked the dev client
retries and falls back to reloading.

On Next 16 + React 19 this is worse than a lost socket: a failed HMR
WebSocket leaves React's debug channel stream unclosed and hydration
never completes (vercel/next.js discussion #91770) — a hanging,
self-reloading page exactly like the one reported.

## What I changed

- **`next.config.mjs`** — `headers()` now returns `[]` unless
  `NODE_ENV === 'production'`. Dev gets Next's own correct headers;
  production is byte-for-byte unchanged. `script-src` no longer needs
  its dev `'unsafe-eval'` branch.
- **`package.json`** — `dev` returns to Turbopack (the default);
  the webpack fallback is kept as `dev:webpack`. It was masking the
  header problem, not fixing it.
- **`public/register-sw.js`** — deleted. Dead file, never loaded, and
  removed from the `sw.js` precache list that referenced it.
- **`RuntimeEffects.tsx`** — dropped the duplicate cleanup; the
  pre-hydration script in `layout.tsx` already does it. Kept as a
  one-shot escape hatch for anyone whose browser profile still has a
  worker from the deployed site, with an honest comment.

`pnpm typecheck` clean, `pnpm test` 201/201 green.

## How to verify locally

The stale state lives in *your browser*, so the code fix alone won't
clear a browser that's already looping:

```bash
rm -rf .next
pnpm dev
```

Then in DevTools once: Application -> Storage -> **Clear site data**
(ticking "Unregister service workers"), or load `http://localhost:3000`
in a private window. After that, check Network -> the font/image
requests should show `Cache-Control: no-store` or `max-age=0`, and
`/_next/webpack-hmr` should stay open as a live WebSocket (status 101).

To test the CSP before shipping, use `pnpm build && pnpm start` —
never `next dev`.
