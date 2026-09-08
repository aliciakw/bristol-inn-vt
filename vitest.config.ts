/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config';
import { resolve } from 'node:path';

export default getViteConfig(
  {
    resolve: {
      alias: {
        // Prevent vitest from trying to resolve the Astro virtual module when
        // unit-testing library files that import from 'astro:env/server'.
        'astro:env/server': resolve('./tests/__mocks__/astro-env-server.ts'),
        '@components': resolve('./src/components'),
        '@lib': resolve('./src/lib'),
      },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  },
  { configFile: false },
);
