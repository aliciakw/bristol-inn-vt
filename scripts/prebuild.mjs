import { writeFileSync } from 'fs';

// Miniflare (used by @astrojs/cloudflare during static prerendering) reads
// secrets from .dev.vars rather than inheriting process.env. This script
// writes the CI build environment secrets to .dev.vars so prerendering works.
if (process.env.CI !== 'true') {
  console.log('Skipping .dev.vars generation outside CI.');
  process.exit(0);
}

const keys = ['HOSTAWAY_ACCESS_TOKEN', 'SANITY_API_TOKEN', 'PREVIEW_SECRET', 'SENTRY_AUTH_TOKEN'];
const content = keys
  .filter((k) => process.env[k])
  .map((k) => `${k}=${process.env[k]}`)
  .join('\n');

writeFileSync('.dev.vars', content ? `${content}\n` : '');
