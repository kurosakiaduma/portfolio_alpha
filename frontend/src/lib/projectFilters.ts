import type { Project } from '../types/projects';

export interface ProjectFilters {
  tags: string[];
  year: string;
  featuredOnly: boolean;
}

/** Pure filter function — used by ProjectsIsland and unit tests. */
export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter((p) => {
    if (filters.featuredOnly && !p.featured) return false;
    if (filters.year && String(p.year) !== filters.year) return false;
    if (filters.tags.length > 0 && !filters.tags.every((t) => p.tech.includes(t))) return false;
    return true;
  });
}
