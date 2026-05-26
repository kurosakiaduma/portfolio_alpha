import { useState, useEffect, useRef, useCallback } from "react";
import type { MusicEntry } from "../types/music";
import { getMusic } from "../lib/api";

// ── Loading skeleton ──────────────────────────────────────────────────────────
function MusicCardSkeleton() {
  return (
    <div className="rounded-xl bg-slate-800/60 animate-pulse" style={{ width: "200px", height: "240px" }} />
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

// ── Play icon ─────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PlaySmallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5v14l11-7z" />
    </svg>
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
      className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80
        transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 flex-shrink-0"
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

        {/* Play overlay — only for playable entries */}
        {entry.playable && (
          <div
            className={`absolute inset-0 bg-slate-900/70 flex items-center justify-center
              transition-opacity duration-200 ${hovered || isPlaying ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={() => onPlay(entry)}
              className="text-cyan-300 hover:text-white transition-colors"
              aria-label={isPlaying ? `Pause ${entry.title}` : `Play ${entry.title}`}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        )}

        {/* Now-playing indicator */}
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
        {entry.source_url && (
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

// ── Mini player bar ───────────────────────────────────────────────────────────
interface MiniPlayerProps {
  entry: MusicEntry;
  isPlaying: boolean;
  progress: number;       // 0–1
  duration: number;
  onToggle: () => void;
  onSeek: (ratio: number) => void;
}

function MiniPlayer({ entry, isPlaying, progress, duration, onToggle, onSeek }: MiniPlayerProps) {
  function formatTime(secs: number) {
    if (!isFinite(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const elapsed = progress * duration;

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
      <div className="flex-shrink-0 min-w-0" style={{ width: "120px" }}>
        <p className="text-white font-mono text-xs font-semibold line-clamp-1">{entry.title}</p>
        <p className="text-slate-400 font-mono text-[11px] line-clamp-1">{entry.artist}</p>
      </div>

      {/* Play/pause */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 text-cyan-300 hover:text-white transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlaySmallIcon />}
      </button>

      {/* Progress scrubber */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-slate-500 font-mono text-[10px] flex-shrink-0">{formatTime(elapsed)}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="flex-1 h-1 accent-cyan-400 cursor-pointer"
          aria-label="Seek"
        />
        <span className="text-slate-500 font-mono text-[10px] flex-shrink-0">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

// ── Main island ───────────────────────────────────────────────────────────────
export default function MusicIsland() {
  const [entries, setEntries] = useState<MusicEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<MusicEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialise the shared audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    getMusic()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = useCallback((entry: MusicEntry) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeEntry?.id === entry.id) {
      // Toggle play/pause for the same track
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    // Switch to a new track
    audio.pause();
    audio.src = entry.audio_url ?? "";
    audio.currentTime = 0;
    setProgress(0);
    setDuration(0);
    setActiveEntry(entry);
    audio.play().catch(console.error);
    setIsPlaying(true);
  }, [activeEntry, isPlaying]);

  const handleToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeEntry) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [activeEntry, isPlaying]);

  const handleSeek = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }, []);

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
      {/* Responsive grid */}
      <div className="flex flex-wrap gap-4">
        {entries.map((entry) => (
          <MusicCard
            key={entry.id ?? `${entry.title}-${entry.artist}`}
            entry={entry}
            isPlaying={isPlaying && activeEntry?.id === entry.id}
            onPlay={handlePlay}
          />
        ))}
      </div>

      {/* Mini player — visible while a track is active */}
      {activeEntry && (
        <MiniPlayer
          entry={activeEntry}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          onToggle={handleToggle}
          onSeek={handleSeek}
        />
      )}
    </section>
  );
}
