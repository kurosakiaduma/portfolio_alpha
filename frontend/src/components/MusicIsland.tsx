import { useState, useEffect, useMemo } from "react";
import type { MusicEntry } from "../types/music";
import { getMusic } from "../lib/api";

// ── Fisher-Yates shuffle (pure, returns a new array) ─────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function MusicCardSkeleton() {
  return (
    <div
      className="rounded-xl bg-slate-800/60 animate-pulse flex-shrink-0"
      style={{ width: "200px", height: "240px" }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <MusicCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

// ── Hidden YouTube iframe player ──────────────────────────────────────────────
interface YouTubeEmbedProps {
  videoId: string;
}

function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
  return (
    <iframe
      key={videoId}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=0`}
      allow="autoplay; encrypted-media"
      allowFullScreen
      style={{ display: "none" }}
      title="YouTube player"
    />
  );
}

// ── Music card ────────────────────────────────────────────────────────────────
interface MusicCardProps {
  entry: MusicEntry;
  isPlaying: boolean;
  onPlay: (entry: MusicEntry) => void;
}

function MusicCard({ entry, isPlaying, onPlay }: MusicCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 flex-shrink-0"
      style={{ width: "200px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Artwork */}
      <div className="relative w-full" style={{ height: "200px" }}>
        {entry.artwork_url ? (
          <img
            src={entry.artwork_url}
            alt={`${entry.title} artwork`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-slate-500 font-mono text-xs">♪</span>
          </div>
        )}

        {/* Play overlay — only for entries with a YouTube video ID */}
        {entry.youtube_video_id && (
          <div
            className={`absolute inset-0 bg-slate-900/70 flex items-center justify-center transition-opacity duration-200 ${hovered || isPlaying ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={() => onPlay(entry)}
              className="text-cyan-300 hover:text-white transition-colors"
              aria-label={`Play ${entry.title}`}
            >
              <PlayIcon />
            </button>
          </div>
        )}

        {/* Now-playing badge */}
        {isPlaying && (
          <span className="absolute top-2 left-2 bg-cyan-500/20 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-400/40">
            ▶ Playing
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3">
        <p className="text-white font-mono text-xs font-semibold leading-tight line-clamp-1">
          {entry.title}
        </p>
        <p className="text-slate-400 font-mono text-[11px] mt-0.5 line-clamp-1">{entry.artist}</p>
        {/* Display-only link for entries without YouTube playback */}
        {!entry.youtube_video_id && entry.source_url && (
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-400 font-mono text-[10px] mt-1 block transition-colors"
          >
            {entry.source_platform} ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ── Now Playing bar ───────────────────────────────────────────────────────────
interface NowPlayingBarProps {
  entry: MusicEntry;
  onStop: () => void;
}

function NowPlayingBar({ entry, onStop }: NowPlayingBarProps) {
  return (
    <div className="mt-6 rounded-xl border border-cyan-400/20 bg-slate-900/90 p-3 flex items-center gap-4">
      {/* Artwork thumbnail */}
      <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "44px", height: "44px" }}>
        {entry.artwork_url ? (
          <img src={entry.artwork_url} alt={entry.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <span className="text-slate-500 text-xs">♪</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-mono text-xs font-semibold line-clamp-1">{entry.title}</p>
        <p className="text-slate-400 font-mono text-[11px] line-clamp-1">{entry.artist}</p>
      </div>

      {/* Playing badge */}
      <span className="flex-shrink-0 text-cyan-300 font-mono text-[10px] flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
        Now Playing
      </span>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors"
        aria-label="Stop playback"
      >
        <StopIcon />
      </button>
    </div>
  );
}

// ── Main island ───────────────────────────────────────────────────────────────
export default function MusicIsland() {
  const [entries, setEntries] = useState<MusicEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<MusicEntry | null>(null);

  useEffect(() => {
    getMusic()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  // One-time Fisher-Yates shuffle applied after entries are loaded (Req 7)
  const shuffledEntries = useMemo(() => shuffleArray(entries), [entries]);

  const handlePlay = (entry: MusicEntry) => {
    if (!entry.youtube_video_id) return;
    setActiveEntry(entry);
  };

  const handleStop = () => {
    setActiveEntry(null);
  };

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
        <p className="text-center text-slate-500 font-mono">No music entries to display yet.</p>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Hidden YouTube iframe — renders only while a track is active */}
      {activeEntry?.youtube_video_id && (
        <YouTubeEmbed videoId={activeEntry.youtube_video_id} />
      )}

      {/* Card grid */}
      <div className="flex flex-wrap gap-4">
        {shuffledEntries.map((entry) => (
          <MusicCard
            key={entry.id ?? `${entry.title}-${entry.artist}`}
            entry={entry}
            isPlaying={activeEntry?.id === entry.id}
            onPlay={handlePlay}
          />
        ))}
      </div>

      {/* Now Playing bar */}
      {activeEntry && (
        <NowPlayingBar entry={activeEntry} onStop={handleStop} />
      )}
    </section>
  );
}
