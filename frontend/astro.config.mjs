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
  },
});