# Skills Island UI Code Snippets

Complete, ready-to-edit code snippets for the minimalist Bento Box skills grid with premium degree trading card (Option A).

---

## 1. TypeScript Interfaces

### `frontend/src/types/skills.ts`

```typescript
export type GridSize = "1x1" | "2x1" | "2x2";
export type IconType = "brand" | "custom" | "degree";
export type SkillType = "skill" | "certificate" | "degree";

export interface Skill {
  id?: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  grid_size: GridSize;
  is_academic: boolean;
  display_order: number;
  icon_type: IconType;
  skill_type: SkillType;
}

export interface Certification extends Skill {
  title: string;
  issuer: string;
  year: number;
}

export interface DegreeData extends Certification {
  skill_type: "degree";
  grid_size: "2x2";
  icon_type: "degree";
}
```

---

## 2. Global CSS & Animations

### `frontend/src/styles/global.css` (Add to existing file)

```css
/* ============================================================================
   SKILLS ISLAND BENTO BOX STYLES
   ============================================================================ */

/* Perspective for 3D flip effect */
.skill-card-perspective {
  perspective: 1000px;
}

/* Skill card container with entrance animation */
.skill-card {
  @apply relative w-full h-full rounded-lg transition-all duration-300;
  transform-style: preserve-3d;
}

/* Default state: grayscale, muted color */
.skill-card {
  @apply bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/30;
  filter: grayscale(1) opacity(0.75);
}

/* Hover: color burst, elevation, glow */
.skill-card:hover,
.skill-card.active {
  @apply shadow-lg;
  filter: grayscale(0) opacity(1);
  box-shadow: 0 0 24px rgba(0, 255, 213, 0.3), 0 0 12px rgba(147, 51, 234, 0.2);
  transform: translateY(-4px);
}

/* Icon styling within skill card */
.skill-icon {
  @apply w-12 h-12 mx-auto;
  filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
}

/* Tooltip on hover */
.skill-tooltip {
  @apply absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2
    bg-slate-900 text-cyan-300 px-3 py-1 rounded text-xs font-mono whitespace-nowrap
    opacity-0 pointer-events-none transition-opacity duration-200;
}

.skill-card:hover .skill-tooltip,
.skill-card.active .skill-tooltip {
  @apply opacity-100;
}

/* ============================================================================
   DEGREE CARD - PREMIUM TRADING CARD FLIP
   ============================================================================ */

/* 3D flip container */
.degree-card-container {
  @apply relative w-full h-full;
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* The actual flipper element */
.degree-card-inner {
  @apply relative w-full h-full transition-transform duration-500;
  transform-style: preserve-3d;
}

/* Set initial rotation state */
.degree-card-container:hover .degree-card-inner,
.degree-card-container.flipped .degree-card-inner {
  transform: rotateY(180deg);
}

/* Front face */
.degree-card-front {
  @apply absolute w-full h-full flex flex-col items-center justify-center
    rounded-xl bg-gradient-to-br from-purple-900 via-slate-800 to-slate-900
    border-2 border-cyan-400/40 p-4;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 
    0 0 40px rgba(0, 255, 213, 0.2),
    0 0 80px rgba(147, 51, 234, 0.15),
    inset 0 0 40px rgba(147, 51, 234, 0.1);
}

/* Back face */
.degree-card-back {
  @apply absolute w-full h-full flex flex-col items-center justify-center
    rounded-xl bg-gradient-to-br from-cyan-900 via-slate-800 to-slate-900
    border-2 border-purple-400/40 p-4;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: rotateY(180deg);
  box-shadow: 
    0 0 40px rgba(147, 51, 234, 0.2),
    0 0 80px rgba(0, 255, 213, 0.15),
    inset 0 0 40px rgba(0, 255, 213, 0.1);
}

/* Degree card content */
.degree-card-icon {
  @apply w-16 h-16 mb-3 filter drop-shadow-lg;
}

.degree-card-title {
  @apply text-lg font-bold text-center text-cyan-300 font-mono mb-1;
  text-shadow: 0 0 12px rgba(0, 255, 213, 0.6);
}

.degree-card-issuer {
  @apply text-sm text-purple-300 text-center font-mono;
  text-shadow: 0 0 8px rgba(147, 51, 234, 0.4);
}

.degree-card-year {
  @apply text-xs text-slate-400 text-center mt-2 font-mono;
}

.degree-card-description {
  @apply text-xs text-slate-300 text-center mt-3 leading-relaxed;
}

/* ============================================================================
   BENTO GRID LAYOUT
   ============================================================================ */

.skills-grid {
  @apply grid gap-4 w-full;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  grid-auto-rows: 120px;
}

/* Responsive grid sizes */
@media (min-width: 640px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 120px;
  }
}

@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 120px;
  }
}

@media (min-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 120px;
  }
}

/* Tile size modifiers */
.skill-tile-1x1 {
  @apply col-span-1 row-span-1;
}

.skill-tile-2x1 {
  @apply col-span-2 row-span-1;
}

.skill-tile-2x2 {
  @apply col-span-2 row-span-2;
}

/* Adjust for mobile responsiveness */
@media (max-width: 639px) {
  .skill-tile-2x1,
  .skill-tile-2x2 {
    @apply col-span-1 row-span-1;
  }
}

/* ============================================================================
   FILTER PILLS
   ============================================================================ */

.filter-pills {
  @apply flex gap-2 mb-6 flex-wrap;
}

.filter-pill {
  @apply px-3 py-1 rounded-full text-xs font-mono border border-slate-600/50
    text-slate-400 bg-slate-800/40 cursor-pointer transition-all duration-200
    hover:border-cyan-400/50 hover:text-cyan-300;
}

.filter-pill.active {
  @apply border-cyan-400 text-cyan-300 bg-slate-800/80;
  box-shadow: 0 0 12px rgba(0, 255, 213, 0.3);
}

/* ============================================================================
   DIMMED STATE (WHEN FILTER IS ACTIVE)
   ============================================================================ */

.skill-dimmed {
  @apply opacity-20;
  filter: grayscale(1) opacity(0.2);
}

.skill-dimmed:hover {
  @apply opacity-20;
  filter: grayscale(1) opacity(0.2);
  transform: none;
  box-shadow: none;
}

/* ============================================================================
   REDUCED MOTION FALLBACK
   ============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .skill-card,
  .degree-card-inner,
  .skill-tooltip {
    @apply transition-none;
  }

  .skill-card:hover {
    transform: none;
  }

  .degree-card-container:hover .degree-card-inner,
  .degree-card-container.flipped .degree-card-inner {
    transform: none;
  }

  /* Show text overlay instead of flip on reduced-motion */
  .degree-card-back {
    @apply flex opacity-100 absolute;
    transform: rotateY(0deg);
  }

  .degree-card-back {
    position: static;
    transform: rotateY(0deg);
  }
}
```

---

## 3. SkillCard Component

### `frontend/src/components/SkillCard.tsx`

```typescript
import type { Skill } from "../types/skills";
import { useState } from "react";

interface SkillCardProps {
  skill: Skill;
  isDimmed?: boolean;
}

export default function SkillCard({ skill, isDimmed = false }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const gridClass = {
    "1x1": "skill-tile-1x1",
    "2x1": "skill-tile-2x1",
    "2x2": "skill-tile-2x2",
  }[skill.grid_size];

  return (
    <div
      className={`${gridClass} skill-card-perspective ${isDimmed ? "skill-dimmed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`skill-card ${isHovered ? "active" : ""}`}>
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
          {/* Icon */}
          <img
            src={`/icons/skills/${skill.icon}.svg`}
            alt={skill.name}
            className="skill-icon"
          />

          {/* Tooltip label (fades in on hover) */}
          <div className="skill-tooltip">{skill.name}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. DegreeCard Component (Option A - Premium Trading Card)

### `frontend/src/components/DegreeCard.tsx`

```typescript
import { useState, useEffect } from "react";
import type { DegreeData } from "../types/skills";

interface DegreeCardProps {
  degree: DegreeData;
  isDimmed?: boolean;
}

export default function DegreeCard({ degree, isDimmed = false }: DegreeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion on mount
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleCardInteraction = () => {
    if (!prefersReducedMotion) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`skill-tile-2x2 skill-card-perspective ${isDimmed ? "skill-dimmed" : ""}`}
      onMouseEnter={() => !prefersReducedMotion && setIsFlipped(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsFlipped(false)}
      onClick={handleCardInteraction}
    >
      <div className={`degree-card-container ${isFlipped ? "flipped" : ""}`}>
        <div className="degree-card-inner">
          {/* FRONT FACE: Crest and Title */}
          <div className="degree-card-front">
            <img
              src={`/icons/skills/${degree.icon}.svg`}
              alt="Degree"
              className="degree-card-icon"
            />
            <div className="degree-card-title">{degree.name}</div>
            <div className="text-xs text-cyan-400/60 font-mono">Hover to reveal</div>
          </div>

          {/* BACK FACE: Details */}
          <div className="degree-card-back">
            <div className="flex flex-col gap-2 text-center">
              <div className="degree-card-title">{degree.name}</div>
              <div className="degree-card-issuer">{degree.issuer}</div>
              <div className="degree-card-year">Graduated {degree.year}</div>
              {degree.description && (
                <div className="degree-card-description">{degree.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. SkillsIsland Main Component

### `frontend/src/components/SkillsIsland.tsx`

```typescript
import { useState, useEffect } from "react";
import type { Skill, DegreeData } from "../types/skills";
import SkillCard from "./SkillCard";
import DegreeCard from "./DegreeCard";

interface SkillsIslandProps {
  skills?: Skill[];
  certifications?: Skill[];
  degree?: DegreeData;
}

export default function SkillsIsland({
  skills = [],
  certifications = [],
  degree,
}: SkillsIslandProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [displayedItems, setDisplayedItems] = useState<Skill[]>([]);

  // Combine all items: degree first (if exists), then certs, then skills
  const allItems: Skill[] = [
    ...(degree ? [degree] : []),
    ...certifications,
    ...skills,
  ].sort((a, b) => a.display_order - b.display_order);

  useEffect(() => {
    // Filter items based on active filter
    if (activeFilter === "all") {
      setDisplayedItems(allItems);
    } else if (activeFilter === "academic") {
      setDisplayedItems(allItems.filter((item) => item.is_academic));
    } else if (activeFilter === "tech") {
      setDisplayedItems(allItems.filter((item) => !item.is_academic));
    } else {
      // Filter by category
      setDisplayedItems(
        allItems.filter((item) => item.category === activeFilter)
      );
    }
  }, [activeFilter, allItems]);

  // Extract unique categories for filter pills
  const categories = Array.from(new Set(allItems.map((item) => item.category)));

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 font-mono">
        Skills & Expertise
      </h2>

      {/* Filter Pills */}
      <div className="filter-pills">
        <button
          className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-pill ${activeFilter === "academic" ? "active" : ""}`}
          onClick={() => setActiveFilter("academic")}
        >
          Academic
        </button>
        <button
          className={`filter-pill ${activeFilter === "tech" ? "active" : ""}`}
          onClick={() => setActiveFilter("tech")}
        >
          Tech
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${activeFilter === cat ? "active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="skills-grid">
        {displayedItems.map((item) => {
          const isDimmed = activeFilter !== "all" && !displayedItems.includes(item);

          // Render degree card differently
          if (item.skill_type === "degree" && degree) {
            return (
              <DegreeCard
                key={`degree-${item.name}`}
                degree={degree as DegreeData}
                isDimmed={isDimmed}
              />
            );
          }

          // Render regular skill/cert card
          return (
            <SkillCard
              key={`${item.skill_type}-${item.name}`}
              skill={item}
              isDimmed={isDimmed}
            />
          );
        })}
      </div>
    </section>
  );
}
```

---

## 6. Static Astro Integration

### `frontend/src/components/SkillsIsland.astro` (If using pure Astro)

```astro
---
import type { Skill, DegreeData } from "../types/skills";

interface Props {
  skills?: Skill[];
  certifications?: Skill[];
  degree?: DegreeData;
}

const { skills = [], certifications = [], degree } = Astro.props;

// Combine and sort all items
const allItems: Skill[] = [
  ...(degree ? [degree] : []),
  ...certifications,
  ...skills,
].sort((a, b) => a.display_order - b.display_order);
---

<section class="py-12 px-4 md:px-8 lg:px-12">
  <h2 class="text-3xl font-bold mb-8 text-cyan-300 font-mono">
    Skills & Expertise
  </h2>

  <!-- Bento Grid -->
  <div class="skills-grid">
    {allItems.map((item) => {
      const gridClass = {
        "1x1": "skill-tile-1x1",
        "2x1": "skill-tile-2x1",
        "2x2": "skill-tile-2x2",
      }[item.grid_size];

      // Degree card (static, no flip without JS)
      if (item.skill_type === "degree") {
        return (
          <div class={`${gridClass} skill-card-perspective`}>
            <div class="degree-card-container">
              <div class="degree-card-inner">
                <div class="degree-card-front">
                  <img
                    src={`/icons/skills/${item.icon}.svg`}
                    alt="Degree"
                    class="degree-card-icon"
                  />
                  <div class="degree-card-title">{item.name}</div>
                  <div class="text-xs text-cyan-400/60 font-mono">
                    Hover to reveal
                  </div>
                </div>
                <div class="degree-card-back">
                  <div class="flex flex-col gap-2 text-center">
                    <div class="degree-card-title">{item.name}</div>
                    <div class="degree-card-issuer">{item.issuer}</div>
                    <div class="degree-card-year">
                      Graduated {item.year}
                    </div>
                    {item.description && (
                      <div class="degree-card-description">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Regular skill card
      return (
        <div class={`${gridClass} skill-card-perspective`}>
          <div class="skill-card">
            <div class="flex flex-col items-center justify-center w-full h-full gap-2">
              <img
                src={`/icons/skills/${item.icon}.svg`}
                alt={item.name}
                class="skill-icon"
              />
              <div class="skill-tooltip">{item.name}</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</section>

<style is:global>
  /* Include styles from global.css section above */
</style>
```

---

## 7. Fetching Skills from Backend

### `frontend/src/lib/api.ts` (Add or update)

```typescript
import type { Skill, DegreeData, Certification } from "../types/skills";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) throw new Error("Failed to fetch skills");
    return await response.json();
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

export async function fetchCertifications(): Promise<Certification[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/certifications`);
    if (!response.ok) throw new Error("Failed to fetch certifications");
    return await response.json();
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return [];
  }
}

export async function fetchDegree(): Promise<DegreeData | null> {
  try {
    const certs = await fetchCertifications();
    const degree = certs.find((cert) => cert.skill_type === "degree");
    return degree ? (degree as DegreeData) : null;
  } catch (error) {
    console.error("Error fetching degree:", error);
    return null;
  }
}
```

---

## 8. Integration into Page

### `frontend/src/pages/index.astro` (Update skills section)

```astro
---
import SkillsIsland from "../components/SkillsIsland.astro";
import { fetchSkills, fetchCertifications, fetchDegree } from "../lib/api";

const skills = await fetchSkills();
const certifications = await fetchCertifications();
const degree = await fetchDegree();
---

<main>
  <!-- Other sections... -->

  <SkillsIsland {skills} {certifications} {degree} client:load />

  <!-- Other sections... -->
</main>
```

---

## 9. Tailwind Config Additions

### `frontend/tailwind.config.js` (Add to theme)

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        "flip-x": "flipX 0.6s ease-in-out",
        "color-burst": "colorBurst 0.4s ease-out",
      },
      keyframes: {
        flipX: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        colorBurst: {
          "0%": { filter: "grayscale(1) opacity(0.75)" },
          "100%": { filter: "grayscale(0) opacity(1)" },
        },
      },
    },
  },
};
```

---

## 10. Icon Assets Needed

Place SVG icons in `frontend/public/icons/skills/`:

- `python.svg`, `react.svg`, `fastapi.svg`, `mongodb.svg`, etc. (brand/tech icons)
- `degree-seal.svg` or `degree-card.svg` (custom degree crest icon)
- `certification-badge.svg` (optional, for cert styling)

Ensure all SVGs are simple, monochrome (will be colorized via CSS filters), and fit within a 64x64px canvas.
