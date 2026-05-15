// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

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
      HOSTAWAY_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      PRISMIC_TOKEN: envField.string({
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