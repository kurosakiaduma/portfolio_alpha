import { useState, useEffect } from 'react';
import { adminGetMusic, adminDeleteMusic } from '../../../lib/adminApi';
import type { MusicEntry } from '../../../types/music';
import { Pencil, Trash2, Plus, RefreshCw, Music } from 'lucide-react';
import { MusicForm } from '../components/MusicForm';

export function MusicPage() {
    const [entries, setEntries] = useState<MusicEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<MusicEntry | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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
        if (!confirm('Are you sure you want to delete this music entry?')) return;
        try {
            await adminDeleteMusic(id);
            setEntries(entries.filter(e => e.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
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
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-medium">Artwork</th>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Artist</th>
                            <th className="px-6 py-4 font-medium">Source</th>
                            <th className="px-6 py-4 font-medium">Playable</th>
                            <th className="px-6 py-4 font-medium">Order</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {entries.map(entry => (
                            <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                        {entry.artwork_url ? (
                                            <img src={entry.artwork_url} alt={entry.title}
                                                className="w-full h-full object-cover"
                                                onError={e => (e.currentTarget.style.display = 'none')} />
                                        ) : (
                                            <Music size={16} className="text-slate-600" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-200">{entry.title}</td>
                                <td className="px-6 py-3 text-slate-400">{entry.artist}</td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono border border-slate-700">
                                        {entry.source_platform}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    {entry.playable ? (
                                        <span className="px-2 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-400 rounded text-xs font-medium">
                                            Playable
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-500 rounded text-xs">
                                            Display only
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-slate-400 text-center">{entry.display_order}</td>
                                <td className="px-6 py-3 text-right space-x-2">
                                    <button onClick={() => setEditingEntry(entry)}
                                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(entry.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && entries.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    No music entries found. Click "Add Entry" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
