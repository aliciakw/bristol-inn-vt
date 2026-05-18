import * as Sentry from "@sentry/cloudflare";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  defaultIntegrations: false,
});
