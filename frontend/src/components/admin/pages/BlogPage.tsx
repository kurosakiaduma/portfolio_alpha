import { useState, useEffect } from 'react';
import { adminGetBlog, adminDeleteBlog } from '../../../lib/adminApi';
import type { BlogEntry } from '../../../types/blog';
import { Pencil, Trash2, Plus, RefreshCw, ExternalLink, FileText } from 'lucide-react';
import { BlogForm } from '../components/BlogForm';
import { useToast } from '../components/ToastContext';

export function BlogPage() {
    const [entries, setEntries] = useState<BlogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<BlogEntry | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await adminGetBlog();
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
        toast.confirm('Are you sure you want to delete this blog entry?', async () => {
            try {
                await adminDeleteBlog(id);
                setEntries(prev => prev.filter(e => e.id !== id));
                toast.success('Blog entry deleted');
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    if (editingEntry || isCreating) {
        return (
            <BlogForm
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
                    <h1 className="text-2xl font-bold text-white mb-1">Blog</h1>
                    <p className="text-slate-400 text-sm">Manage curated blog posts and articles displayed on your portfolio.</p>
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
                            {/* Icon placeholder */}
                            <div className="w-9 h-9 flex-shrink-0 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <FileText size={14} className="text-slate-500" />
                            </div>

                            {/* Title + source */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-slate-200 truncate">{entry.title}</p>
                                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                                        className="text-slate-600 hover:text-slate-400 transition flex-shrink-0"
                                        onClick={e => e.stopPropagation()}>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{entry.source_name} · {entry.published_date}</p>
                            </div>

                            {/* My Post badge */}
                            {entry.is_own && (
                                <span className="hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 bg-cyan-950/50 border border-cyan-800 text-cyan-400 rounded text-xs font-medium">
                                    My Post
                                </span>
                            )}

                            {/* First tag badge */}
                            {entry.tags.length > 0 && (
                                <span className="hidden md:inline-flex flex-shrink-0 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded text-xs">
                                    {entry.tags[0]}{entry.tags.length > 1 ? ` +${entry.tags.length - 1}` : ''}
                                </span>
                            )}

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
                            No blog entries found. Click "Add Entry" to create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
