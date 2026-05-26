import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
//import tailwind from '@astrojs/tailwind';//

export default defineConfig({
  site: 'https://taduma.me',
  integrations: [
    react(),
    //tailwind()//
  ],

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:6543',
          changeOrigin: true
        }
      }
    }
  },
});