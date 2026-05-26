import { useState, useEffect } from "react";
import type { Skill, Certification, DegreeData } from "../types/skills";
import SkillCard from "./SkillCard";

const API_BASE_URL = (import.meta as any).env?.PUBLIC_API_URL || "/api";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonTile({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`${wide ? "col-span-2 row-span-2" : "col-span-1 row-span-1"} rounded-lg bg-slate-800/60 animate-pulse`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="skills-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonTile key={i} wide={i === 0} />
      ))}
    </div>
  );
}

// ── Degree card (React version of the Astro degree card) ─────────────────────
function DegreeCard({ item }: { item: DegreeData }) {
  return (
    <div className="skill-tile-2x2 skill-card-perspective">
      <div className="degree-card-container">
        <div className="degree-card-inner">
          <div className="degree-card-front">
            <img
              src={`/icons/skills/${item.icon}`}
              alt="Degree"
              className="degree-card-icon"
            />
            <div className="degree-card-title">{item.name}</div>
            <div className="text-xs text-cyan-400/60 font-mono">
              Hover to reveal
            </div>
          </div>
          <div className="degree-card-back">
            <div className="flex flex-col gap-2 text-center">
              <div className="degree-card-title">{item.name}</div>
              <div className="degree-card-issuer">{item.issuer}</div>
              <div className="degree-card-year">Graduated {item.year}</div>
              {item.description && (
                <div className="degree-card-description">{item.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Certification card ────────────────────────────────────────────────────────
function CertificationCard({ item }: { item: Certification }) {
  const gridClass =
    item.grid_size === "2x1" ? "skill-tile-2x1" : "skill-tile-1x1";
  return (
    <div className={`${gridClass} skill-card-perspective`}>
      <div className="skill-card">
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
          <img
            src={`/icons/skills/${item.icon}`}
            alt={item.title}
            className="skill-icon"
          />
          <div className="skill-tooltip">{item.title}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main island ───────────────────────────────────────────────────────────────
export default function SkillsIsland() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [skillsRes, certsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/skills`),
          fetch(`${API_BASE_URL}/certifications`),
        ]);
        const [skillsData, certsData] = await Promise.all([
          skillsRes.ok ? skillsRes.json() : [],
          certsRes.ok ? certsRes.json() : [],
        ]);
        setSkills(skillsData);
        setCertifications(certsData);
      } catch {
        // silently fall through to empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <LoadingSkeleton />
      </section>
    );
  }

  const degree = certifications.find(
    (c) => c.skill_type === "degree"
  ) as DegreeData | undefined;

  const regularCerts = certifications.filter(
    (c) => c.skill_type !== "degree"
  );

  // Combine and sort all items by display_order
  type AnyItem = Skill | Certification | DegreeData;
  const allItems: AnyItem[] = [
    ...(degree ? [degree] : []),
    ...regularCerts,
    ...skills,
  ].sort((a, b) => a.display_order - b.display_order);

  if (allItems.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-text-muted font-mono">
          No skills to display yet.
        </p>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="skills-grid">
        {allItems.map((item, idx) => {
          if (item.skill_type === "degree") {
            return <DegreeCard key={item.id ?? idx} item={item as DegreeData} />;
          }
          if (item.skill_type === "certificate") {
            return (
              <CertificationCard
                key={item.id ?? idx}
                item={item as Certification}
              />
            );
          }
          return <SkillCard key={item.id ?? idx} skill={item as Skill} />;
        })}
      </div>
    </section>
  );
}
