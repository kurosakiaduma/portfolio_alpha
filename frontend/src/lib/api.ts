import type { Skill, DegreeData, Certification } from "../types/skills";
import type { Project } from "../types/projects";
import type { MusicEntry } from "../types/music";
import type { BlogEntry } from "../types/blog";

// Default to relative `/api` proxy when PUBLIC_API_URL is not provided.
// This avoids malformed/empty env values causing "bad port" fetch errors.
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "/api";
export const getBio = () => fetch(`${API_BASE_URL}/bio`).then(r => r.json());

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return await res.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch project");
    return await res.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}
export async function getMusic(): Promise<MusicEntry[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/music`);
    if (!res.ok) throw new Error("Failed to fetch music");
    return await res.json();
  } catch (error) {
    console.error("Error fetching music:", error);
    return [];
  }
}

export async function getBlog(): Promise<BlogEntry[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog`);
    if (!res.ok) throw new Error("Failed to fetch blog entries");
    return await res.json();
  } catch (error) {
    console.error("Error fetching blog entries:", error);
    return [];
  }
}

export const getCertifications = () => fetch(`${API_BASE_URL}/certifications`).then(r => r.json());
export const getSkills = () => fetch(`${API_BASE_URL}/skills`).then(r => r.json());
export const getGallery = () => fetch(`${API_BASE_URL}/gallery`).then(r => r.json());
export const getMusicRecent = () => fetch(`${API_BASE_URL}/music/recent`).then(r => r.json());
export const getMusicNow = () => fetch(`${API_BASE_URL}/music/now`).then(r => r.json());

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