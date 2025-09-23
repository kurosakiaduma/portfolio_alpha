const BASE = import.meta.env.PUBLIC_API_URL!;
export const getBio = () => fetch(`${BASE}/bio`).then(r => r.json());
export const getProjects = () => fetch(`${BASE}/projects`).then(r => r.json());
export const getProject = (id: string) => fetch(`${BASE}/projects/${id}`).then(r => r.json());
export const getCertifications = () => fetch(`${BASE}/certifications`).then(r => r.json());
export const getSkills = () => fetch(`${BASE}/skills`).then(r => r.json());
export const getGallery = () => fetch(`${BASE}/gallery`).then(r => r.json());
export const getMusicRecent = () => fetch(`${BASE}/music/recent`).then(r => r.json());
export const getMusicNow = () => fetch(`${BASE}/music/now`).then(r => r.json());
