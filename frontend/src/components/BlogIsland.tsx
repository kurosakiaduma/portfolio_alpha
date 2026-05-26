import { useState, useEffect, useMemo } from "react";
import type { BlogEntry } from "../types/blog";
import { getBlog } from "../lib/api";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function BlogCardSkeleton() {
  return (
    <div className="rounded-xl bg-slate-800/60 animate-pulse" style={{ height: "160px" }} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function TagPill({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  const base =
    "inline-block rounded-full border font-mono text-[10px] px-2 py-0.5 transition-colors cursor-pointer";
  const style = active
    ? "border-cyan-400/70 text-cyan-300 bg-cyan-400/10"
    : "border-slate-600/50 text-slate-400 bg-slate-800/40 hover:border-cyan-400/40 hover:text-cyan-300/80";
  return (
    <span className={`${base} ${style}`} onClick={onClick} role={onClick ? "button" : undefined}>
      {tag}
    </span>
  );
}

// ── Blog card ─────────────────────────────────────────────────────────────────
function BlogCard({ entry }: { entry: BlogEntry }) {
  const dateStr = entry.published_date
    ? new Date(entry.published_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border bg-slate-900/80 p-4 transition-all duration-300
        hover:-translate-y-0.5 hover:bg-slate-900/95 no-underline
        ${entry.is_own
          ? "border-cyan-400/50 hover:border-cyan-400/80"
          : "border-slate-700/50 hover:border-slate-600/70"
        }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-mono font-semibold text-sm leading-snug line-clamp-2 flex-1">
          {entry.title}
        </h3>
        {entry.is_own && (
          <span className="flex-shrink-0 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/50 text-cyan-300 bg-cyan-400/10 whitespace-nowrap">
            My Post
          </span>
        )}
      </div>

      {/* Source + date */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-500 font-mono text-[11px]">{entry.source_name}</span>
        {dateStr && (
          <>
            <span className="text-slate-700 font-mono text-[11px]">·</span>
            <span className="text-slate-500 font-mono text-[11px]">{dateStr}</span>
          </>
        )}
      </div>

      {/* Excerpt */}
      {entry.excerpt && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-3">
          {entry.excerpt}
        </p>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      )}
    </a>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({
  allTags,
  activeTags,
  onToggleTag,
  onClear,
}: {
  allTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClear: () => void;
}) {
  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      {allTags.map((tag) => (
        <TagPill
          key={tag}
          tag={tag}
          active={activeTags.includes(tag)}
          onClick={() => onToggleTag(tag)}
        />
      ))}
      {activeTags.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors ml-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Main island ───────────────────────────────────────────────────────────────
export default function BlogIsland() {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    getBlog()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [entries]);

  // Client-side tag filtering — pure array ops, sub-200ms
  const filtered = useMemo(() => {
    if (activeTags.length === 0) return entries;
    return entries.filter((e) => activeTags.every((t) => e.tags.includes(t)));
  }, [entries, activeTags]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <LoadingSkeleton />
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-slate-500 font-mono">No blog entries to display yet.</p>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <FilterBar
        allTags={allTags}
        activeTags={activeTags}
        onToggleTag={toggleTag}
        onClear={() => setActiveTags([])}
      />

      {filtered.length === 0 ? (
        <p className="text-center text-slate-500 font-mono py-8">
          No entries match the selected tags.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <BlogCard key={entry.id ?? entry.url} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
