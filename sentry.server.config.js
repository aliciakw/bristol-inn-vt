// Sentry on Cloudflare Workers is initialized via withSentry() at the Worker entry
// point, injected by @sentry/astro's sentryCloudflareVitePlugin. No Sentry.init()
// is available from @sentry/cloudflare — per-request context is handled by withSentry.
// This file exists so @sentry/astro uses it instead of the default buildServerSnippet,
// which would otherwise bundle @sentry/node (Node.js-only) into the Worker.
import '@sentry/cloudflare';
