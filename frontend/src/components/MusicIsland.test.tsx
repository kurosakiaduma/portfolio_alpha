import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MusicIsland from './MusicIsland';
import type { MusicEntry } from '../types/music';

// ── Fixture data ──────────────────────────────────────────────────────────────
const youtubeEntry: MusicEntry = {
  id: '1',
  title: 'Track One',
  artist: 'Artist A',
  artwork_url: undefined,
  youtube_video_id: 'dQw4w9WgXcQ',
  source_platform: 'youtube',
  playable: true,
  display_order: 0,
};

const nonPlayableEntry: MusicEntry = {
  id: '2',
  title: 'Track Two',
  artist: 'Artist B',
  artwork_url: undefined,
  youtube_video_id: undefined,
  source_platform: 'spotify',
  source_url: 'https://open.spotify.com/track/example',
  playable: false,
  display_order: 1,
};

// ── Mock fetch ────────────────────────────────────────────────────────────────
function mockFetch(entries: MusicEntry[]) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(entries),
  }));
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('MusicIsland — playback via YouTube', () => {
  it('renders no play button for a non-playable entry', async () => {
    mockFetch([nonPlayableEntry]);
    render(<MusicIsland />);

    await waitFor(() => expect(screen.getByText('Track Two')).toBeTruthy());

    const playButtons = screen.queryAllByRole('button', { name: /play track two/i });
    expect(playButtons).toHaveLength(0);
  });

  it('renders a play button for an entry with a youtube_video_id', async () => {
    mockFetch([youtubeEntry]);
    render(<MusicIsland />);

    await waitFor(() => expect(screen.getByText('Track One')).toBeTruthy());

    const playButton = screen.getByRole('button', { name: /play track one/i });
    expect(playButton).toBeTruthy();
  });

  it('shows the Now Playing bar and YouTube iframe after clicking play', async () => {
    mockFetch([youtubeEntry]);
    render(<MusicIsland />);

    await waitFor(() => expect(screen.getByText('Track One')).toBeTruthy());

    const playButton = screen.getByRole('button', { name: /play track one/i });
    fireEvent.click(playButton);

    // Now Playing bar should appear
    expect(screen.getByText('Now Playing')).toBeTruthy();
    // YouTube iframe should be in the DOM
    const iframe = document.querySelector('iframe[title="YouTube player"]') as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    expect(iframe.src).toContain('dQw4w9WgXcQ');
  });

  it('removes the Now Playing bar when stop is clicked', async () => {
    mockFetch([youtubeEntry]);
    render(<MusicIsland />);

    await waitFor(() => expect(screen.getByText('Track One')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: /play track one/i }));
    expect(screen.getByText('Now Playing')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /stop playback/i }));
    expect(screen.queryByText('Now Playing')).toBeNull();
  });

  it('displays a source link for non-playable entries with a source_url', async () => {
    mockFetch([nonPlayableEntry]);
    render(<MusicIsland />);

    await waitFor(() => expect(screen.getByText('Track Two')).toBeTruthy());

    const link = screen.getByRole('link', { name: /spotify/i });
    expect(link).toBeTruthy();
    expect((link as HTMLAnchorElement).href).toContain('spotify');
  });
});
