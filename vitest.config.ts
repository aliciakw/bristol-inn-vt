import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // Prevent vitest from trying to resolve the Astro virtual module when
      // unit-testing library files that import from 'astro:env/server'.
      'astro:env/server': resolve('./tests/__mocks__/astro-env-server.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
