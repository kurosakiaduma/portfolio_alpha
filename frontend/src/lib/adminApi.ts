/**
 * Typed API calls to the /api/admin/* endpoints.
 */
import type { Skill } from '../types/skills';
import type { Certification } from '../types/certifications';
import type { Project } from '../types/projects';
import type { MusicEntry } from '../types/music';
import type { BlogEntry } from '../types/blog';
import type { AdminStats } from '../types/admin';

const API_BASE = '/api/admin';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('admin_token');
    const headers = new Headers(options?.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(API_BASE + url, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'API request failed');
    }
    if (res.status === 204) {
        return {} as T;
    }
    return res.json();
}

// -------------------------------------------------------------
// STATS
// -------------------------------------------------------------

export type { AdminStats } from '../types/admin';

export function adminGetStats(): Promise<AdminStats> {
    return fetchJson<AdminStats>('/stats');
}

// -------------------------------------------------------------
// SKILLS
// -------------------------------------------------------------

export function adminGetSkills(): Promise<Skill[]> {
    return fetchJson<Skill[]>('/skills');
}

export function adminCreateSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    return fetchJson<Skill>('/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
    });
}

export function adminUpdateSkill(id: string, skill: Omit<Skill, 'id'>): Promise<Skill> {
    return fetchJson<Skill>(`/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
    });
}

export function adminDeleteSkill(id: string): Promise<void> {
    return fetchJson<void>(`/skills/${id}`, { method: 'DELETE' });
}

// -------------------------------------------------------------
// CERTIFICATIONS
// -------------------------------------------------------------

export function adminGetCertifications(): Promise<Certification[]> {
    return fetchJson<Certification[]>('/certifications');
}

export function adminCreateCertification(cert: Omit<Certification, 'id'>): Promise<Certification> {
    return fetchJson<Certification>('/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert),
    });
}

export function adminUpdateCertification(id: string, cert: Omit<Certification, 'id'>): Promise<Certification> {
    return fetchJson<Certification>(`/certifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert),
    });
}

export function adminDeleteCertification(id: string): Promise<void> {
    return fetchJson<void>(`/certifications/${id}`, { method: 'DELETE' });
}

// -------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------

export function adminGetProjects(): Promise<Project[]> {
    return fetchJson<Project[]>('/projects');
}

export function adminCreateProject(project: Omit<Project, 'id'>): Promise<Project> {
    return fetchJson<Project>('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
}

export function adminUpdateProject(id: string, project: Omit<Project, 'id'>): Promise<Project> {
    return fetchJson<Project>(`/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
}

export function adminDeleteProject(id: string): Promise<void> {
    return fetchJson<void>(`/projects/${id}`, { method: 'DELETE' });
}

export function adminFetchFromGitHub(githubUrl: string): Promise<Partial<Omit<Project, 'id'>>> {
    return fetchJson<Partial<Omit<Project, 'id'>>>('/projects/github-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: githubUrl }),
    });
}

// -------------------------------------------------------------
// MUSIC
// -------------------------------------------------------------

export function adminGetMusic(): Promise<MusicEntry[]> {
    return fetchJson<MusicEntry[]>('/music');
}

export function adminCreateMusic(entry: Omit<MusicEntry, 'id'>): Promise<MusicEntry> {
    return fetchJson<MusicEntry>('/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
}

export function adminUpdateMusic(id: string, entry: Omit<MusicEntry, 'id'>): Promise<MusicEntry> {
    return fetchJson<MusicEntry>(`/music/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
}

export function adminDeleteMusic(id: string): Promise<void> {
    return fetchJson<void>(`/music/${id}`, { method: 'DELETE' });
}

export async function adminUploadAudio(file: File): Promise<{ filename: string; url: string }> {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload-audio`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Audio upload failed');
    }
    return res.json();
}

// -------------------------------------------------------------
// BLOG
// -------------------------------------------------------------

export function adminGetBlog(): Promise<BlogEntry[]> {
    return fetchJson<BlogEntry[]>('/blog');
}

export function adminCreateBlog(entry: Omit<BlogEntry, 'id'>): Promise<BlogEntry> {
    return fetchJson<BlogEntry>('/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
}

export function adminUpdateBlog(id: string, entry: Omit<BlogEntry, 'id'>): Promise<BlogEntry> {
    return fetchJson<BlogEntry>(`/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
}

export function adminDeleteBlog(id: string): Promise<void> {
    return fetchJson<void>(`/blog/${id}`, { method: 'DELETE' });
}

// -------------------------------------------------------------
// FILE UPLOADS
// -------------------------------------------------------------

export async function adminUploadImage(file: File): Promise<{ filename: string; url: string }> {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Image upload failed');
    }
    return res.json();
}

export async function adminUploadIcon(
    file: File,
    iconType: 'skills' | 'certifications' = 'skills'
): Promise<{ filename: string; url: string }> {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('icon_type', iconType);

    const res = await fetch(`${API_BASE}/upload-icon`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Icon upload failed');
    }
    return res.json();
}
