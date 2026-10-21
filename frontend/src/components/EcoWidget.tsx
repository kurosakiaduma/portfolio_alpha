import { useEffect, useState } from "react";

const ecoNotes = [
  "Light payloads, fast pages, lower energy cost.",
  "Efficient client islands reduce unnecessary work on mobile.",
  "Dark mode, trimmed assets, and smart caching help keep carbon down.",
  "Optimized rendering for greener browsing across devices.",
];

interface EcoWidgetProps {
  compact?: boolean;
}

export default function EcoWidget({ compact = false }: EcoWidgetProps) {
  const [note, setNote] = useState(ecoNotes[0]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNote((prev) => {
        const next = ecoNotes.filter((item) => item !== prev);
        return next[Math.floor(Math.random() * next.length)];
      });
    }, 9000);

    return () => window.clearInterval(interval);
  }, []);

  const displayNote = compact ? "Trimmed assets and smart caching." : note;

  return (
    <div className={`eco-widget ${compact ? "eco-widget-compact" : ""} relative overflow-hidden rounded-none border-0 bg-slate-900/85 py-2 px-3 shadow-none backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5`}>
      <div className={`flex ${compact ? "items-center gap-2" : "flex-col gap-3 sm:flex-row sm:items-center"}`}>
        <div className={`flex ${compact ? "h-9 w-9" : "h-12 w-12"} items-center justify-center rounded-none bg-retro-lime/10 text-retro-lime shadow-none`}>
          <span className={compact ? "text-base" : "text-xl"}>🌿</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`uppercase tracking-[0.24em] text-retro-lime/70 font-mono ${compact ? "text-[9px] mb-0" : "text-[10px] mb-1"}`}>
            Eco-aware design
          </p>
          <p className={`font-semibold text-white ${compact ? "text-sm" : "text-sm"}`}>
            Sustainable performance.
          </p>
          <p className={`text-text-secondary ${compact ? "text-[10px]" : "text-xs"} leading-tight mt-0.5 ${compact ? "line-clamp-1" : "line-clamp-2"}`}>
            {displayNote}
          </p>
        </div>
      </div>
    </div>
  );
}
