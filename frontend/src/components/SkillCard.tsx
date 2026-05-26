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
            src={`/icons/skills/${skill.icon}`}
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