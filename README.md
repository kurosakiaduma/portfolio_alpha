# taduma.me

[![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009485?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

Personal portfolio — retro-synthwave aesthetic, Astro static frontend with React islands, FastAPI backend serving content from MongoDB.

---

## Structure

```
frontend/   Astro site
backend/    FastAPI API
scripts/    Utility scripts
```

---

## Visual Direction

Synthwave neon on a near-black base. Cyan, magenta, lime, and amber highlights. Soft glow, scanlines, subtle noise.

Typography:
- Headlines: Press Start 2P / Pixeloid
- Accents: IBM Plex Mono / JetBrains Mono
- Body: Inter

Accessibility: `prefers-reduced-motion` respected, animation toggle available.

---

## Frontend

Built with Astro (static output). Dynamic sections are React islands — only hydrated where needed.

**Islands:**
- `ProjectsIsland` — filterable project grid with featured strip
- `MusicIsland` — music cards with inline audio playback and mini player
- `SkillsIsland` — skills grid with degree card flip and cert tiles
- `BlogIsland` — blog entry listing

**Config:**
- Tailwind via `@tailwindcss/vite` (Vite plugin, not the Astro integration)
- Vite dev proxy: `/api` → `http://127.0.0.1:6543`
- `PUBLIC_API_URL` env var for production API base

**Run locally:**

```bash
cd frontend
npm install
npm run dev
```

---

## Backend

See [`backend/README.md`](backend/README.md).

---

## Admin CMS

Available at `/alter`. Login at `/alter/login`. JWT-authenticated, talks to the same API under `/api/admin/*`.

---

## Deployment

- Frontend: Vercel or Netlify — set `PUBLIC_API_URL`
- Backend: Fly.io or Render — set `MONGO_URI`, `JWT_SECRET`, `PUBLIC_SITE_URL`
- Database: MongoDB Atlas
