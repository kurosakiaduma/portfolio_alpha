export interface Project {
  id?: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  tech: string[];
  github_url?: string;
  live_url?: string;
  cover_image?: string;
  images: string[];
  year: number;
  featured: boolean;
  source: 'github' | 'manual';
  display_order: number;
}
