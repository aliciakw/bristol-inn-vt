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
      HOSTAWAY_ACCESS_TOKEN: envField.string({
        // Generated 05/15/2026, exp 05/15/2028
        context: "server",
        access: "secret",
        optional: false,
      }),
      SANITY_API_TOKEN: envField.string({
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
  output: "static",
  adapter: cloudflare({
    prerenderEnvironment: "node",
    imageService: "passthrough",
  }),
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      // TODO: add Hostaway CDN hostname after first getRooms() call logs listing.listingImages[0].url
    ],
  },
  outDir: "./dist",
  server: { host: "127.0.0.1", port: 4321 },
  integrations: [
    sentry({
      project: "bristol-inn-vt",
      // authToken is read from SENTRY_AUTH_TOKEN env var
      // Server-side SDK disabled: this is a static site with no SSR routes.
      // Disabling server prevents @sentry/node (Node.js-only) from being bundled
      // into the Cloudflare Worker, which cannot run Node.js built-ins.
      enabled: { client: true, server: false },
    }),
  ],
});