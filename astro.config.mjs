// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import cloudflare from '@astrojs/cloudflare';

import sentry from '@sentry/astro';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_SENTRY_DSN: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_GA4_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      HOSTAWAY_ACCESS_TOKEN: envField.string({ // Generated 05/15/2026, exp 05/15/2028
        context: "server",
        access: "secret",
        optional: false,
      }),
      PRISMIC_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      SENTRY_AUTH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  adapter: cloudflare(),
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.prismic.io' },
      { protocol: 'https', hostname: '**.prismic.io' },
      // TODO: add Hostaway CDN hostname after first getRooms() call logs listing.listingImages[0].url
    ],
  },
  outDir: "./dist",
  server: { host: "127.0.0.1", port: 4321 },
  integrations: [
    sentry({
      project: "bristol-inn-vt",
      org: "aleeshza-llc",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});