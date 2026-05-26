import { useState, useRef } from 'react';
import { adminCreateMusic, adminUpdateMusic, adminUploadAudio } from '../../../lib/adminApi';
import type { MusicEntry } from '../../../types/music';
import { Save, X, Upload } from 'lucide-react';

interface MusicFormProps {
    entry: MusicEntry | null;
    onSave: () => void;
    onCancel: () => void;
}

export function MusicForm({ entry, onSave, onCancel }: MusicFormProps) {
    const isEditing = !!entry;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Omit<MusicEntry, 'id'>>({
        title: entry?.title || '',
        artist: entry?.artist || '',
        artwork_url: entry?.artwork_url || '',
        audio_url: entry?.audio_url || '',
        source_platform: entry?.source_platform || 'manual',
        source_url: entry?.source_url || '',
        playable: entry?.playable || false,
        display_order: entry?.display_order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const result = await adminUploadAudio(file);
            setFormData(prev => ({ ...prev, audio_url: result.url }));
            if (audioInputRef.current) audioInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || 'Failed to upload audio');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.playable && !formData.audio_url) {
            setError('An audio file URL is required when playable is enabled.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (isEditing && entry.id) {
                await adminUpdateMusic(entry.id, formData);
            } else {
                await adminCreateMusic(formData);
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
                        <input name="artwork_url" value={formData.artwork_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
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
                        <label className="text-sm font-medium text-slate-300">Source URL</label>
                        <input type="url" name="source_url" value={formData.source_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Display Order</label>
                        <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className={inputClass} />
                    </div>

                    {/* Playable toggle */}
                    <div className="col-span-2 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="playable"
                                checked={formData.playable}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                Playable (non-copyrighted track with audio file)
                            </span>
                        </label>
                    </div>

                    {/* Audio section — shown when playable */}
                    {formData.playable && (
                        <div className="col-span-2 space-y-3 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
                            <p className="text-sm font-medium text-slate-300">Audio File <span className="text-red-400">*</span></p>

                            <div className="flex gap-2">
                                <input
                                    name="audio_url"
                                    value={formData.audio_url || ''}
                                    onChange={handleChange}
                                    placeholder="/audio/track.mp3 or https://..."
                                    className={inputClass + " flex-1"}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="audio-upload"
                                />
                                <button
                                    type="button"
                                    onClick={() => audioInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-md text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50 text-sm"
                                >
                                    <Upload size={15} />
                                    {uploading ? 'Uploading...' : 'Upload Audio File'}
                                </button>
                                <span className="text-xs text-slate-500">or paste a URL above</span>
                            </div>
                        </div>
                    )}
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
