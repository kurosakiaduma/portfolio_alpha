/**
 * Extracts the 11-character YouTube video ID from common YouTube URL formats.
 * Returns null if the ID cannot be determined.
 *
 * Supported patterns:
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtu.be/dQw4w9WgXcQ
 *   https://www.youtube.com/embed/dQw4w9WgXcQ
 *   https://www.youtube.com/shorts/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || !url.trim()) return null;

  const patterns = [
    // Standard watch URL: ?v=ID or &v=ID
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URL: /embed/ID
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    // Shorts URL: /shorts/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
