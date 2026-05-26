export interface MusicEntry {
  id?: string;
  title: string;
  artist: string;
  artwork_url?: string;
  audio_url?: string;
  source_platform: 'spotify' | 'soundcloud' | 'youtube' | 'lastfm' | 'manual';
  source_url?: string;
  playable: boolean;
  display_order: number;
}
