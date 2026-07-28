import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin Turbopack's project root.
  //
  // With no explicit root Turbopack infers one by walking up for a lockfile.
  // A stray package-lock.json or pnpm-workspace.yaml above this directory
  // moves the inferred root, which changes where the dev cache lives and can
  // leave two different builds' chunks addressable at once — the state that
  // produces a dev reload loop.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.zarinpal.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    // Optimized device sizes for better caching & responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 95, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  // Security headers + better caching for static assets.
  //
  // IMPORTANT: these are PRODUCTION-ONLY. In `next dev` they actively break
  // the dev server:
  //   * `immutable, max-age=31536000` on /fonts, /images, /assets overrides
  //     the `no-store` Next normally sends in dev, so the browser serves
  //     stale assets and Fast Refresh falls back to full page reloads.
  //   * a strict CSP has to be kept permanently in sync with whatever the
  //     dev overlay / HMR client happens to need this release.
  // Test CSP against `next build && next start`, not `next dev`.
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // Content-Security-Policy — enforced. Tune Supabase/Sentry hosts to real origins.
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
          "img-src 'self' data: blob: https:",
          "media-src 'self' https://*.supabase.co",
          "font-src 'self' data:",
          // CSP wildcards must occupy the entire left-most label. `o*.…`
          // is invalid in Firefox and makes the browser discard this policy.
          "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://*.ingest.sentry.io https://va.vercel-scripts.com",
          "frame-src 'self' https://www.openstreetmap.org",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    return [
      // Apply security headers to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/product/crons/
  // https://docs.sentry.io/product/crons/getting-started/#configure-your-cron-monitor
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs

webpack: {
  treeshake: {
    removeDebugLogging: true,
  },
  automaticVercelMonitors: true,
}
};


export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
