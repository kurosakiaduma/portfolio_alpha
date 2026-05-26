import { useState, useEffect } from "react";
import type { DegreeData } from "../types/skills";

interface DegreeCardProps {
  degree: DegreeData;
  isDimmed?: boolean;
}

export default function DegreeCard({ degree, isDimmed = false }: DegreeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion on mount
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleCardInteraction = () => {
    if (!prefersReducedMotion) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`skill-tile-2x2 skill-card-perspective ${isDimmed ? "skill-dimmed" : ""}`}
      onMouseEnter={() => !prefersReducedMotion && setIsFlipped(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsFlipped(false)}
      onClick={handleCardInteraction}
    >
      <div className={`degree-card-container ${isFlipped ? "flipped" : ""}`}>
        <div className="degree-card-inner">
          {/* FRONT FACE: Crest and Title */}
          <div className="degree-card-front">
            <img
              src={`/icons/skills/${degree.icon}`}
              alt="Degree"
              className="degree-card-icon"
            />
            <div className="degree-card-title">{degree.name}</div>
            <div className="text-xs text-cyan-400/60 font-mono">Hover to reveal</div>
          </div>

          {/* BACK FACE: Details */}
          <div className="degree-card-back">
            <div className="flex flex-col gap-2 text-center">
              <div className="degree-card-title">{degree.name}</div>
              <div className="degree-card-issuer">{degree.issuer}</div>
              <div className="degree-card-year">Graduated {degree.year}</div>
              {degree.description && (
                <div className="degree-card-description">{degree.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}