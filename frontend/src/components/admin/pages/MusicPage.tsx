import { useState, useEffect } from 'react';
import { adminGetMusic, adminDeleteMusic } from '../../../lib/adminApi';
import type { MusicEntry } from '../../../types/music';
import { Pencil, Trash2, Plus, RefreshCw, Music } from 'lucide-react';
import { MusicForm } from '../components/MusicForm';
import { useToast } from '../components/ToastContext';

export function MusicPage() {
    const [entries, setEntries] = useState<MusicEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<MusicEntry | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await adminGetMusic();
            setEntries(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
    }, []);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        toast.confirm('Are you sure you want to delete this music entry?', async () => {
            try {
                await adminDeleteMusic(id);
                setEntries(prev => prev.filter(e => e.id !== id));
                toast.success('Music entry deleted');
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    if (editingEntry || isCreating) {
        return (
            <MusicForm
                entry={editingEntry}
                onCancel={() => { setEditingEntry(null); setIsCreating(false); }}
                onSave={() => { setEditingEntry(null); setIsCreating(false); loadEntries(); }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Music</h1>
                    <p className="text-slate-400 text-sm">Manage the music entries displayed on your portfolio.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadEntries}
                        className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700 transition"
                        title="Refresh">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md flex items-center gap-2 transition shadow-lg shadow-cyan-900/20">
                        <Plus size={18} /> Add Entry
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-md">{error}</div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-800">
                    {entries.map(entry => (
                        <div key={entry.id}
                            className="group flex items-center gap-3 px-4 h-14 hover:bg-slate-800/40 transition-colors">
                            {/* Thumbnail */}
                            <div className="w-9 h-9 flex-shrink-0 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                {entry.artwork_url ? (
                                    <img src={entry.artwork_url} alt={entry.title}
                                        className="w-full h-full object-cover"
                                        onError={e => (e.currentTarget.style.display = 'none')} />
                                ) : (
                                    <Music size={14} className="text-slate-600" />
                                )}
                            </div>

                            {/* Title + artist */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">{entry.title}</p>
                                <p className="text-xs text-slate-500 truncate">{entry.artist}</p>
                            </div>

                            {/* Platform badge */}
                            <span className="hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded font-mono">
                                {entry.source_platform}
                            </span>

                            {/* Playable badge */}
                            <span className={`hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                                entry.playable
                                    ? 'bg-cyan-950/50 border border-cyan-800 text-cyan-400'
                                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                            }`}>
                                {entry.playable ? 'Playable' : 'Display'}
                            </span>

                            {/* Actions — hidden until hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingEntry(entry)}
                                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded transition"
                                    title="Edit">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDelete(entry.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                                    title="Delete">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && entries.length === 0 && (
                        <div className="px-6 py-8 text-center text-slate-500 text-sm">
                            No music entries found. Click "Add Entry" to create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
