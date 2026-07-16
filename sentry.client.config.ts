import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Lower sampling for free tier — 5% of transactions
  tracesSampleRate: 0.05,

  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // Lower session replay sampling for free tier
  replaysSessionSampleRate: 0.05,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore AbortError — fires when video modal closes while loading
  ignoreErrors: [
    'AbortError',
    'The fetching process for the media resource was aborted',
    'The play() request was interrupted',
  ],
});
