import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  outDir: './dist',
  server: { host: '127.0.0.1', port: 3000 }
});
