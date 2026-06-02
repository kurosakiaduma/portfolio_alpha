import { useState } from 'react';
import { adminCreateMusic, adminUpdateMusic } from '../../../lib/adminApi';
import { extractYouTubeId } from '../../../lib/youtube';
import type { MusicEntry } from '../../../types/music';
import { Save, X } from 'lucide-react';

function YoutubeIcon({ size = 15, className = '' }: { size?: number; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
            fill="currentColor" className={className}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    );
}

interface MusicFormProps {
    entry: MusicEntry | null;
    onSave: () => void;
    onCancel: () => void;
}

export function MusicForm({ entry, onSave, onCancel }: MusicFormProps) {
    const isEditing = !!entry;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derive the initial YouTube URL from existing youtube_video_id if editing
    const initialYouTubeUrl = entry?.youtube_video_id
        ? `https://www.youtube.com/watch?v=${entry.youtube_video_id}`
        : '';

    const [youtubeUrl, setYoutubeUrl] = useState(initialYouTubeUrl);
    const [youtubeError, setYoutubeError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<MusicEntry, 'id'>>({
        title: entry?.title || '',
        artist: entry?.artist || '',
        artwork_url: entry?.artwork_url || '',
        youtube_video_id: entry?.youtube_video_id || undefined,
        source_platform: entry?.source_platform || 'manual',
        source_url: entry?.source_url || '',
        playable: entry?.playable || false,
        display_order: entry?.display_order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleYouTubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setYoutubeUrl(url);
        setYoutubeError(null);

        if (!url.trim()) {
            // Cleared — remove the video ID
            setFormData(prev => ({ ...prev, youtube_video_id: undefined, playable: false }));
            return;
        }

        const id = extractYouTubeId(url);
        if (id) {
            setFormData(prev => ({ ...prev, youtube_video_id: id, playable: true }));
        } else {
            setYoutubeError('Could not extract a YouTube video ID from this URL.');
            setFormData(prev => ({ ...prev, youtube_video_id: undefined, playable: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block submission if a YouTube URL is entered but invalid
        if (youtubeUrl.trim() && !formData.youtube_video_id) {
            setYoutubeError('Could not extract a YouTube video ID from this URL. Please correct or clear it.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Never send audio_url; playable is derived server-side from youtube_video_id
            const payload: Omit<MusicEntry, 'id'> = {
                ...formData,
                audio_url: undefined,
                playable: !!formData.youtube_video_id,
            };

            if (isEditing && entry.id) {
                await adminUpdateMusic(entry.id, payload);
            } else {
                await adminCreateMusic(payload);
            }
            onSave();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/50">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">
                <h2 className="text-lg font-semibold text-white">
                    {isEditing ? `Edit: ${entry.title}` : 'Add Music Entry'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-950/50 text-red-400 text-sm border border-red-900 rounded-md">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Title *</label>
                        <input required name="title" value={formData.title} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Artist *</label>
                        <input required name="artist" value={formData.artist} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Artwork URL</label>
                        <input
                            name="artwork_url"
                            value={formData.artwork_url || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                            className={inputClass}
                        />
                    </div>

                    {/* YouTube URL — sole playback source */}
                    <div className="col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <YoutubeIcon size={15} className="text-red-400" />
                            YouTube URL
                            <span className="text-slate-500 font-normal text-xs">(enables playback)</span>
                        </label>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={handleYouTubeUrlChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={inputClass + (youtubeError ? ' border-red-500 focus:border-red-500 focus:ring-red-500' : '')}
                        />
                        {youtubeError && (
                            <p className="text-red-400 text-xs">{youtubeError}</p>
                        )}
                        {formData.youtube_video_id && (
                            <p className="text-green-400 text-xs">
                                Video ID: <span className="font-mono">{formData.youtube_video_id}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Source Platform</label>
                        <select name="source_platform" value={formData.source_platform} onChange={handleChange} className={inputClass}>
                            <option value="manual">Manual</option>
                            <option value="spotify">Spotify</option>
                            <option value="soundcloud">SoundCloud</option>
                            <option value="youtube">YouTube</option>
                            <option value="lastfm">Last.fm</option>
                        </select>
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">
                            Source URL
                            <span className="text-slate-500 font-normal text-xs ml-1">(Spotify/SoundCloud reference link)</span>
                        </label>
                        <input
                            type="url"
                            name="source_url"
                            value={formData.source_url || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Display Order</label>
                        <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} disabled={loading}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md flex items-center gap-2 transition">
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-md flex items-center gap-2 transition disabled:opacity-50">
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
}
