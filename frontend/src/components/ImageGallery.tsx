import { useState, useEffect, useRef, useCallback } from "react";

interface ImageGalleryProps {
  images: string[];
  cover?: string;
  alt: string;
  className?: string;
}

/**
 * Client-side image gallery with cross-fade slideshow.
 * - Multiple images: auto-advances every 3s, pauses on hover, shows dot indicators
 * - Single image / cover only: static render
 * - No images: gradient placeholder
 */
export function ImageGallery({ images, cover, alt, className = "" }: ImageGalleryProps) {
  // Build the full image list: prefer images[], fall back to cover
  const allImages = images.length > 0 ? images : cover ? [cover] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVisibleRef = useRef(true);

  const isSlideshow = allImages.length > 1;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  // Start / stop interval based on visibility and hover
  const startInterval = useCallback(() => {
    if (!isSlideshow) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current && !hovered) {
        advance();
      }
    }, 3000);
  }, [isSlideshow, hovered, advance]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // IntersectionObserver — pause when card scrolls off screen
  useEffect(() => {
    if (!isSlideshow || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isSlideshow]);

  // Manage interval lifecycle
  useEffect(() => {
    if (!isSlideshow) return;
    if (!hovered) {
      startInterval();
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [isSlideshow, hovered, startInterval, stopInterval]);

  const handleImageError = (index: number) => {
    setBrokenImages((prev) => new Set(prev).add(index));
  };

  // No images — gradient placeholder
  if (allImages.length === 0) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ${className}`}
      >
        <span className="text-slate-500 font-mono text-xs">No image</span>
      </div>
    );
  }

  // Single image — static render
  if (!isSlideshow) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {brokenImages.has(0) ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-slate-500 font-mono text-xs">No image</span>
          </div>
        ) : (
          <img
            src={allImages[0]}
            alt={alt}
            onError={() => handleImageError(0)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  // Slideshow — cross-fade between images
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {allImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
          aria-hidden={i !== currentIndex}
        >
          {brokenImages.has(i) ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <span className="text-slate-500 font-mono text-xs">No image</span>
            </div>
          ) : (
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              onError={() => handleImageError(i)}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          )}
        </div>
      ))}

      {/* Dot indicators — visible on hover */}
      {hovered && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-cyan-400 scale-125"
                  : "bg-slate-400/60 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
