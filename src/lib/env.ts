/**
 * Environment variable validation
 * Runs at build time and startup; throws clear error if critical vars missing
 *
 * Critical vars for Phase 1:
 * - HOSTAWAY_API_KEY: Hostaway API authentication (server-only)
 * - PRISMIC_TOKEN: Prismic CMS API token (server-only)
 * - PUBLIC_SENTRY_DSN: Sentry error tracking (client-visible)
 * - PUBLIC_GA4_ID: Google Analytics 4 measurement ID (client-visible)
 */

interface EnvConfig {
  hostawayApiKey: string;
  pricmicToken: string;
  sentryDsn: string;
  ga4Id: string;
}

export function validateEnv(): EnvConfig {
  const env = {
    hostawayApiKey: process.env.HOSTAWAY_API_KEY,
    pricmicToken: process.env.PRISMIC_TOKEN,
    sentryDsn: process.env.PUBLIC_SENTRY_DSN,
    ga4Id: process.env.PUBLIC_GA4_ID
  };

  const missing = Object.entries(env)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message =
      `\n❌ CONFIGURATION ERROR\n\n` +
      `Missing critical environment variables:\n` +
      missing.map(key => `  - ${key}`).join('\n') +
      `\n\nFor local development:\n` +
      `  1. Copy .env.example to .env.local\n` +
      `  2. Fill in all placeholder values\n` +
      `  3. Do NOT commit .env.local to git\n\n` +
      `For Cloudflare Pages production:\n` +
      `  1. Configure in Cloudflare project settings → Environment Variables\n` +
      `  2. Use PUBLIC_ prefix only for client-visible vars\n\n`;
    throw new Error(message);
  }

  return env as EnvConfig;
}

// Export as singleton for app-wide access
export const env = validateEnv();
