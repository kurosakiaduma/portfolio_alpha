export interface BlogEntry {
  id?: string;
  title: string;
  url: string;
  source_name: string;
  excerpt: string;
  published_date: string; // ISO date string
  tags: string[];
  is_own: boolean;
  display_order: number;
}
