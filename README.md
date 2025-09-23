# Portfolio Website Plan

---

## Tech Stack

- **Frontend:** Astro, Tailwind CSS, GSAP  
    _Optional UI kits:_ rippleui, shadcn (selective imports)
- **Backend:** FastAPI, Uvicorn, MongoDB (via Motor)
- **Deploy:**  
    - Frontend: Vercel or Netlify  
    - Backend: Fly.io or Render  
    - Database: MongoDB Atlas (prod)

---

## Visual Direction

- **Retro vibe:** Synthwave neon + pixel art influences
- **Contemporary retro:** Inspired by modern stylization (e.g., Steven Universe)
- **Typography:**  
    - Headlines: Press Start 2P or Pixeloid  
    - Accents: IBM Plex Mono or JetBrains Mono  
    - Body: Inter
- **Color:** Deep near-black base with cyan, magenta, lime, and amber highlights
- **Motifs:** Soft glow, scanlines, subtle noise, vignette corners, duotone gradient vectors, 8-bit iconography
- **Accessibility:**  
    - Respect `prefers-reduced-motion`  
    - Provide a toggle to disable animations

---

## Information Architecture

- **Hero**
- **About/Bio**
- **Projects**
- **Skills**
- **Certifications**
- **Gallery**
- **Music** (free API powered)
- **Footer**

---

### Projects UX (Anti-Clutter)

- **Filters & Facets:** by tech, year, type, and “featured”
- **Segmented Views:**
    - Featured carousel or marquee with big visuals
    - Grid list for all projects with condensed cards
- **Progressive Disclosure:**
    - Short summary on card
    - Expandable details (modal or inline)
- **Smart Defaults:** Sort by featured desc, then year desc
- **Optional:** Infinite scroll or pagination for large lists

---

### Music Section

- **API Approach:**  
    - Last.fm recent tracks API (now-playing/history)  
    - iTunes Search API (metadata/artwork)
- **Backend:** Cache API responses to avoid rate limits and speed up loads
- **Display:** Compact now-playing widget + history list with cover art

---

## Frontend Structure (`src/`)

```
pages/
    index.astro
components/
    Hero.astro
    Nav.astro
    RetroBackground.astro
    About.astro
    ProjectsIsland.tsx
    CertificationsIsland.tsx
    SkillsIsland.tsx
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

- **Islands:** For dynamic, animated, or data-driven sections

---

### Tailwind Setup

- JIT enabled; `content: src/**/*.{astro,ts,tsx,vue}`
- **Theme:** Add retro colors and font stacks
- **Globals:** Noise texture, scanlines layer, glow utilities

---

### GSAP and Motion

- Enter timeline for hero and nav
- ScrollTrigger for section reveals and pinned scenes
- Reverse-before-navigate animation for in-page anchor transitions
- **Performance:** Use `quickTo`, avoid layout thrashing, throttle heavy effects

---

## Backend Structure (`app/`)

```
main.py
core/
    config.py
db/
    mongo.py
models/
    bio.py
    project.py
    certification.py
    skill.py
    gallery.py
    music.py
routers/
    bio.py
    projects.py
    certifications.py
    skills.py
    gallery.py
    music.py
requirements.txt
```

- **Dependencies:** fastapi, uvicorn[standard], motor, pydantic[email], python-multipart, python-dotenv, orjson

---

### MongoDB Collections

- **bio:**  
    `{ name, headline, summary, avatarUrl, location, social{ github, linkedin, x, email } }`
- **projects:**  
    `{ slug, title, description, tech[], github?, live?, images[], year, featured }`
- **certifications:**  
    `{ title, issuer, date, credentialUrl?, tags[] }`
- **skills:**  
    `{ category, items[] }`
- **gallery:**  
    `{ id, title, url, thumbnailUrl, year, tags[] }`
- **music:** Backend caches API responses

**Indexes:**

- `projects.slug` (unique)
- `certifications` (title + issuer, unique compound)
- `gallery` (year) and (tags) for filtering

---

### API Endpoints (Examples)

- `GET /bio`
- `GET /projects`
- `GET /projects/{slug}`
- `GET /certifications`
- `GET /skills`
- `GET /gallery`
- `GET /music/now`
- `GET /music/recent`

---

### Frontend Data Fetch

- Use `PUBLIC_API_URL` in Astro env

**Example:**

```ts
getProjects(): GET /projects
getBio(): GET /bio
getMusicNow(): GET /music/now
```

---

### SPA Feel in Astro

- Single `index.astro` with section anchors:  
    `#about #projects #skills #certs #gallery #music`
- Smooth scroll + active link highlighting
- Before navigating to a new section:
    1. Play exit animation timeline
    2. Scroll to target
    3. Play enter timeline

---

## Performance and Accessibility

- **Images:** Astro Image for AVIF/WebP, lazy load gallery, prefetch featured images
- **SVG:** Inline for styling and filters
- **Motion:** Respect `prefers-reduced-motion`; provide UI toggle
- **SEO:** meta, OG tags, JSON-LD for Person and Project
- **Lighthouse targets:** 90+

---

## Deployment and Migration

- **Local:**  
    - `uvicorn app.main:app --reload`  
    - MongoDB via Docker
- **Production:**  
    - Backend: Fly.io or Render, set `MONGODB_URI` to Atlas  
    - Frontend: Vercel or Netlify, set `PUBLIC_API_URL`
- **Migrations:**  
    - Scripts that upsert JSON seeds to Atlas  
    - Keep versioned migration files and idempotent operations

---

## Styling Snippets

- **Retro glow:**

    ```css
    .retro-glow {
        text-shadow: 0 0 8px rgba(0,255,213,.6), 0 0 16px rgba(0,255,213,.4);
    }
    ```

- **Scanlines overlay:**  
    `.scanlines::after` with `repeating-linear-gradient` and `multiply` blend

- **Neon SVG glow:**  
    Use `feGaussianBlur` + `feColorMatrix` + `blend` for outer glows

---

## Week-by-Week Plan

- **Day 1–2:** Scaffold Astro + Tailwind, fonts, base theme, Hero + Nav + RetroBackground, GSAP wiring
- **Day 3–4:** FastAPI + Mongo models and seed data; implement `/bio` and `/projects`
- **Day 5–6:** Projects section with filters, modal details, and animations
- **Day 7:** Gallery grid with lightbox and lazy loading; Music section placeholder
- **Week 2:** Hook up free music APIs, accessibility, SEO, deploy backend and frontend, create indexes, migrate seed data

---

## To Decide Next

- Confirm font pairings for headings and body
- Pick exact neon palette swatches
- List of featured projects for the carousel
- Music API choice: Last.fm for now, iTunes for artwork, optional Spotify later if you add auth

