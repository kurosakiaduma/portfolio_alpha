import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';
const DEV_API_TARGET = process.env.API_TARGET ?? 'http://127.0.0.1:6543';

export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()],
  output: 'server',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    server: {
      // This proxy ONLY applies during `astro dev` — not in production
      proxy: {
        '/api': {
          target: DEV_API_TARGET,
          changeOrigin: true
        }
      }
    }
  },
});