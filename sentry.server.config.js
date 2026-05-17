import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  // Cloudflare Workers runtime rejects addEventListener() with useCapture=true.
  // Browser-only integrations (BrowserTracing, Replay) use capture listeners and
  // must not run in the SSR/prerender context.
  defaultIntegrations: false,
});
