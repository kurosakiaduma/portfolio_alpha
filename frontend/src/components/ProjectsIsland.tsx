import { useState, useEffect, useMemo } from "react";
import type { Project } from "../types/projects";
import { getProjects } from "../lib/api";
import { filterProjects } from "../lib/projectFilters";
import type { ProjectFilters } from "../lib/projectFilters";
import { ImageGallery } from "./ImageGallery";

const API_BASE_URL = (import.meta as any).env?.PUBLIC_API_URL || "/api";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl bg-slate-800/60 animate-pulse" style={{ minHeight: "320px" }} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Tech tag pill ─────────────────────────────────────────────────────────────
function TagPill({ tag, small = false }: { tag: string; small?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border border-cyan-400/30 text-cyan-300/80 font-mono bg-slate-800/60
        ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
    >
      {tag}
    </span>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const visibleTags = project.tech.slice(0, 3);
  const extraCount = project.tech.length - 3;

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80
        transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 cursor-pointer"
      style={{ minHeight: "320px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image / gallery */}
      <div className="relative w-full overflow-hidden" style={{ height: "160px" }}>
        <ImageGallery
          images={project.images || []}
          cover={project.cover_image}
          alt={project.title}
          className="w-full h-full"
        />
        {/* Year badge */}
        <span className="absolute top-2 right-2 bg-slate-900/90 text-cyan-300 font-mono text-xs px-2 py-1 rounded border border-cyan-400/30">
          {project.year}
        </span>
        {project.featured && (
          <span className="absolute top-2 left-2 bg-retro-magenta/20 text-pink-300 font-mono text-[10px] px-2 py-1 rounded border border-pink-400/40">
            ★ Featured
          </span>
        )}
      </div>

      {/* Default content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-white font-mono font-semibold text-sm leading-tight line-clamp-1">
          {project.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
          {project.short_description || project.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {visibleTags.map((tag) => (
            <TagPill key={tag} tag={tag} small />
          ))}
          {extraCount > 0 && (
            <span className="text-slate-500 font-mono text-[10px] px-2 py-0.5">
              +{extraCount} more
            </span>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-slate-900/95 p-4 flex flex-col gap-3 transition-all duration-300
          ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <h3 className="text-cyan-300 font-mono font-semibold text-sm">{project.title}</h3>
        <p className="text-slate-300 text-xs leading-relaxed flex-1 overflow-y-auto">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {project.tech.map((tag) => (
            <TagPill key={tag} tag={tag} small />
          ))}
        </div>
        <div className="flex gap-3 mt-auto pt-2 border-t border-slate-700/50">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub →
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-pink-400 hover:text-pink-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Live Demo →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Featured strip card (wider) ───────────────────────────────────────────────
function FeaturedCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-pink-400/30 bg-slate-900/80
        transition-all duration-300 hover:border-pink-400/60 hover:-translate-y-1 cursor-pointer flex-shrink-0"
      style={{ width: "320px", minHeight: "200px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {project.cover_image ? (
        <img
          src={project.cover_image}
          alt={project.title}
          className="w-full object-cover"
          style={{ height: "110px" }}
        />
      ) : (
        <div
          className="w-full bg-gradient-to-br from-purple-900/60 to-slate-800 flex items-center justify-center"
          style={{ height: "110px" }}
        >
          <span className="text-slate-500 font-mono text-xs">No image</span>
        </div>
      )}

      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-pink-300 font-mono text-[10px]">★ Featured</span>
          <span className="text-slate-500 font-mono text-[10px]">{project.year}</span>
        </div>
        <h3 className="text-white font-mono font-semibold text-sm line-clamp-1">{project.title}</h3>
        <p className="text-slate-400 text-xs line-clamp-2">{project.short_description || project.description}</p>
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-slate-900/95 p-3 flex flex-col gap-2 transition-all duration-300
          ${hovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <h3 className="text-cyan-300 font-mono font-semibold text-sm">{project.title}</h3>
        <p className="text-slate-300 text-xs leading-relaxed flex-1 overflow-y-auto">{project.description}</p>
        <div className="flex flex-wrap gap-1">
          {project.tech.slice(0, 4).map((tag) => (
            <TagPill key={tag} tag={tag} small />
          ))}
        </div>
        <div className="flex gap-3 pt-2 border-t border-slate-700/50">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              onClick={(e) => e.stopPropagation()}>
              GitHub →
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-pink-400 hover:text-pink-300 transition-colors"
              onClick={(e) => e.stopPropagation()}>
              Live Demo →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({
  allTags,
  allYears,
  filters,
  onChange,
}: {
  allTags: string[];
  allYears: number[];
  filters: ProjectFilters;
  onChange: (f: ProjectFilters) => void;
}) {
  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`filter-pill ${filters.tags.includes(tag) ? "active" : ""}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Year dropdown */}
      <select
        value={filters.year}
        onChange={(e) => onChange({ ...filters, year: e.target.value })}
        className="bg-slate-800/60 border border-slate-600/50 text-slate-300 font-mono text-xs
          rounded px-3 py-1.5 focus:border-cyan-400/50 focus:outline-none"
      >
        <option value="">All years</option>
        {allYears.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {/* Featured toggle */}
      <button
        onClick={() => onChange({ ...filters, featuredOnly: !filters.featuredOnly })}
        className={`filter-pill ${filters.featuredOnly ? "active" : ""}`}
      >
        ★ Featured only
      </button>

      {/* Clear */}
      {(filters.tags.length > 0 || filters.year || filters.featuredOnly) && (
        <button
          onClick={() => onChange({ tags: [], year: "", featuredOnly: false })}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Main island ───────────────────────────────────────────────────────────────
export default function ProjectsIsland() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({ tags: [], year: "", featuredOnly: false });

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  // Derive filter options from data
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tech.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const allYears = useMemo(() => {
    const set = new Set<number>();
    projects.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [projects]);

  // Client-side filtering (sub-200ms — pure array ops)
  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  const featuredProjects = useMemo(() => filtered.filter((p) => p.featured), [filtered]);
  const gridProjects = useMemo(
    () => filtered.filter((p) => !p.featured || filters.featuredOnly || filters.tags.length > 0 || filters.year),
    [filtered, filters]
  );

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <LoadingSkeleton />
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-text-muted font-mono">No projects to display yet.</p>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Filter bar */}
      {(allTags.length > 0 || allYears.length > 1) && (
        <FilterBar
          allTags={allTags}
          allYears={allYears}
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* Featured horizontal strip — only shown when no active filters */}
      {featuredProjects.length > 0 && !filters.featuredOnly && filters.tags.length === 0 && !filters.year && (
        <div className="mb-8">
          <h3 className="text-xs font-mono text-pink-300/70 uppercase tracking-widest mb-3">
            ★ Featured
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {featuredProjects.map((p) => (
              <FeaturedCard key={p.id ?? p.slug} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-text-muted font-mono py-8">No projects match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectCard key={p.id ?? p.slug} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
