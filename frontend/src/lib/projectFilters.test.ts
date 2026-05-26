import { describe, it, expect } from 'vitest';
import { filterProjects } from './projectFilters';
import type { Project } from '../types/projects';

const makeProject = (overrides: Partial<Project>): Project => ({
  slug: 'test',
  title: 'Test',
  description: 'desc',
  short_description: '',
  tech: [],
  images: [],
  year: 2024,
  featured: false,
  source: 'manual',
  display_order: 0,
  ...overrides,
});

const projects: Project[] = [
  makeProject({ slug: 'a', title: 'Alpha', tech: ['React', 'TypeScript'], year: 2023, featured: true }),
  makeProject({ slug: 'b', title: 'Beta',  tech: ['Python', 'FastAPI'],   year: 2022, featured: false }),
  makeProject({ slug: 'c', title: 'Gamma', tech: ['React', 'Python'],     year: 2024, featured: false }),
];

describe('filterProjects — tag filter', () => {
  it('returns all projects when no tags selected', () => {
    const result = filterProjects(projects, { tags: [], year: '', featuredOnly: false });
    expect(result).toHaveLength(3);
  });

  it('filters to projects containing the selected tag', () => {
    const result = filterProjects(projects, { tags: ['React'], year: '', featuredOnly: false });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.slug)).toEqual(expect.arrayContaining(['a', 'c']));
  });

  it('filters to projects matching ALL selected tags', () => {
    const result = filterProjects(projects, { tags: ['React', 'Python'], year: '', featuredOnly: false });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('c');
  });

  it('returns empty array when no project matches the tag', () => {
    const result = filterProjects(projects, { tags: ['Vue'], year: '', featuredOnly: false });
    expect(result).toHaveLength(0);
  });
});

describe('filterProjects — featured toggle', () => {
  it('returns only featured projects when featuredOnly is true', () => {
    const result = filterProjects(projects, { tags: [], year: '', featuredOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('returns all projects when featuredOnly is false', () => {
    const result = filterProjects(projects, { tags: [], year: '', featuredOnly: false });
    expect(result).toHaveLength(3);
  });
});

describe('filterProjects — year filter', () => {
  it('filters to projects matching the selected year', () => {
    const result = filterProjects(projects, { tags: [], year: '2022', featuredOnly: false });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('b');
  });
});

describe('filterProjects — combined filters', () => {
  it('applies tag and year filters together', () => {
    const result = filterProjects(projects, { tags: ['React'], year: '2023', featuredOnly: false });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });
});
