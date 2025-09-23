# ADUMA TEVIN JOEL • Portfolio Frontend

[![Astro](https://img.shields.io/badge/Astro-3C1E5E?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=000)](https://greensock.com/gsap/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-AWS-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows)

A retro-modern single-page portfolio with synthwave neon, pixel-art flavors, and smooth GSAP motion. Built with Astro islands for performance and a “SPA feel” via animated section transitions.

---

## ✨ Features

- **Retro-contemporary art direction:** synthwave + pixel with Steven Universe-esque gradients and glow
- **Smooth GSAP transitions** and ScrollTrigger reveals
- **Projects with anti-clutter UX:** featured carousel, filters, modal details
- **Music widget** powered by backend APIs (free sources)
- **Accessible by default:** prefers-reduced-motion support and an “Animations” toggle
- **Fast by design:** Astro islands, optimized images, lazy-loaded gallery

---

## 🧱 Tech Stack

- Astro + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Optional: rippleui and shadcn components (selective import)

---

## 📁 Project Structure

```
src/
    pages/
        index.astro
    components/
        Hero.astro
        Nav.astro
        RetroBackground.astro
        About.astro
        ProjectsIsland.tsx
        SkillsIsland.tsx
        CertificationsIsland.tsx
        GalleryIsland.tsx
        MusicIsland.tsx
        Footer.astro
    lib/
        api.ts
        gsap.ts
    styles/
        globals.css
    assets/
        vectors/
```

---

## 🔧 Setup

**Prerequisites:** Node 18+

```sh
pnpm i        # or npm i / yarn
pnpm dev      # starts Astro dev server
pnpm build    # production build
pnpm preview  # preview the build
```

Create a `.env` file:

```env
PUBLIC_API_URL=https://taduma.me/api
PUBLIC_SITE_URL=https://taduma.me
```

---

## 🖼️ Theming

- **Fonts:** Press Start 2P or Pixeloid for headings, IBM Plex Mono / JetBrains Mono for accents, Inter for body
- **Colors:** Near-black background with neon cyan, magenta, lime, amber

**Utilities:**

```css
.retro-glow {
    text-shadow: 0 0 8px rgba(0,255,213,.6), 0 0 16px rgba(0,255,213,.4);
}
.scanlines::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(to bottom, rgba(0,0,0,.12) 0 1px, transparent 1px 3px);
    pointer-events: none;
    mix-blend-mode: multiply;
}
```

---

## 🎬 Motion

- Entrance timeline for hero and nav
- Section reveals with ScrollTrigger
- “SPA feel” via exit-before-scroll-to-anchor, then enter timeline

**Respect user motion preferences:**

```css
@media (prefers-reduced-motion: reduce) {
    /* reduce or disable animations */
}
```

---

## 🔗 API Integration

See backend README for endpoints. Example usage in `src/lib/api.ts`:

```ts
const BASE = import.meta.env.PUBLIC_API_URL!;
export const getProjects = () => fetch(`${BASE}/projects`).then(r => r.json());
export const getMusicNow = () => fetch(`${BASE}/music/now`).then(r => r.json());
```

---

## 🧪 Scripts

- `dev`: `pnpm dev`
- `build`: `pnpm build`
- `preview`: `pnpm preview`
- `lint`: add ESLint/Prettier if desired

---

## 🚀 Deploy

- Vercel or Netlify recommended
- Set `PUBLIC_API_URL` env to your backend URL
- Ensure CORS is allowed on backend for your frontend domain

---

## 🔒 Accessibility and SEO

- Prefers-reduced-motion and animation toggle
- Astro `<Image />` for AVIF/WebP, lazy gallery
- Meta, Open Graph tags, and JSON-LD for Person and Project

---

## 📸 Screenshots

- Hero and featured projects
- Projects grid with filters
- Gallery with lightbox
- Music widget

---

## 📝 License

MIT © ADUMA TEVIN JOEL