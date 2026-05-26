import { useState } from 'react';
import { adminCreateBlog, adminUpdateBlog } from '../../../lib/adminApi';
import type { BlogEntry } from '../../../types/blog';
import { Save, X } from 'lucide-react';

interface BlogFormProps {
    entry: BlogEntry | null;
    onSave: () => void;
    onCancel: () => void;
}

export function BlogForm({ entry, onSave, onCancel }: BlogFormProps) {
    const isEditing = !!entry;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<BlogEntry, 'id'>>({
        title: entry?.title || '',
        url: entry?.url || '',
        source_name: entry?.source_name || '',
        excerpt: entry?.excerpt || '',
        published_date: entry?.published_date || new Date().toISOString().split('T')[0],
        tags: entry?.tags || [],
        is_own: entry?.is_own || false,
        display_order: entry?.display_order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, tags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEditing && entry.id) {
                await adminUpdateBlog(entry.id, formData);
            } else {
                await adminCreateBlog(formData);
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
                    {isEditing ? `Edit: ${entry.title}` : 'Add Blog Entry'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-950/50 text-red-400 text-sm border border-red-900 rounded-md">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Title *</label>
                        <input required name="title" value={formData.title} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">URL *</label>
                        <input required type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://..." className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Source Name *</label>
                        <input required name="source_name" value={formData.source_name} onChange={handleChange} placeholder="Medium, Dev.to, Personal Blog..." className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Published Date *</label>
                        <input required type="date" name="published_date" value={formData.published_date} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Excerpt</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
                            placeholder="A short description of the article..." className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Tags (comma-separated)</label>
                        <input value={formData.tags.join(', ')} onChange={handleTagsChange}
                            placeholder="AI, Python, Web Development" className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Display Order</label>
                        <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="col-span-2 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="is_own"
                                checked={formData.is_own}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                Authored by me (shows a distinct badge on the public site)
                            </span>
                        </label>
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
