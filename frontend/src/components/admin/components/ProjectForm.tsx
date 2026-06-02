import { useState } from 'react';
import { adminCreateProject, adminUpdateProject, adminFetchFromGitHub } from '../../../lib/adminApi';
import type { Project } from '../../../types/projects';
import { Save, X, SquareCode, Loader2 } from 'lucide-react';
import { TechTagInput } from './TechTagInput';
import { CoverImageInput } from './CoverImageInput';
import { AdminImageGallery } from './AdminImageGallery';

interface ProjectFormProps {
    project: Project | null;
    onSave: () => void;
    onCancel: () => void;
}

const EMPTY_FORM: Omit<Project, 'id'> = {
    slug: '',
    title: '',
    description: '',
    short_description: '',
    tech: [],
    github_url: '',
    live_url: '',
    cover_image: '',
    images: [],
    year: new Date().getFullYear(),
    featured: false,
    source: 'manual',
    display_order: 0,
};

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
    const isEditing = !!project;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);
    const [githubUrl, setGithubUrl] = useState('');

    const [formData, setFormData] = useState<Omit<Project, 'id'>>({
        slug: project?.slug || '',
        title: project?.title || '',
        description: project?.description || '',
        short_description: project?.short_description || '',
        tech: project?.tech || [],
        github_url: project?.github_url || '',
        live_url: project?.live_url || '',
        cover_image: project?.cover_image || '',
        images: project?.images || [],
        year: project?.year || new Date().getFullYear(),
        featured: project?.featured || false,
        source: project?.source || 'manual',
        display_order: project?.display_order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleTechChange = (tags: string[]) => {
        setFormData(prev => ({ ...prev, tech: tags }));
    };

    const handleFetchFromGitHub = async () => {
        if (!githubUrl.trim()) return;
        setFetching(true);
        setError(null);
        try {
            const data = await adminFetchFromGitHub(githubUrl.trim());
            setFormData(prev => ({
                ...prev,
                ...data,
                source: 'github',
                github_url: githubUrl.trim(),
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch from GitHub');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEditing && project.id) {
                await adminUpdateProject(project.id, formData);
            } else {
                await adminCreateProject(formData);
            }
            onSave();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";

    return (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/50">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">
                <h2 className="text-lg font-semibold text-white">
                    {isEditing ? `Edit Project: ${project.title}` : 'Create New Project'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-950/50 text-red-400 text-sm border border-red-900 rounded-md">
                        {error}
                    </div>
                )}

                {/* GitHub fetch */}
                <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <SquareCode size={16} /> Fetch from GitHub
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="https://github.com/username/repo"
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            className={inputClass + " flex-1"}
                        />
                        <button
                            type="button"
                            onClick={handleFetchFromGitHub}
                            disabled={fetching || !githubUrl.trim()}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md flex items-center gap-2 transition disabled:opacity-50 whitespace-nowrap"
                        >
                            {fetching ? <Loader2 size={16} className="animate-spin" /> : <SquareCode size={16} />}
                            {fetching ? 'Fetching...' : 'Fetch'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Title *</label>
                        <input required name="title" value={formData.title} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Slug</label>
                        <input name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated if empty" className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Short Description</label>
                        <input name="short_description" value={formData.short_description} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Full Description *</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Tech Tags</label>
                        <TechTagInput
                            tags={formData.tech}
                            onChange={handleTechChange}
                            placeholder="React, TypeScript, FastAPI"
                        />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">GitHub URL</label>
                        <input type="url" name="github_url" value={formData.github_url || ''} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Live URL</label>
                        <input type="url" name="live_url" value={formData.live_url || ''} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Cover Image</label>
                        <CoverImageInput
                            value={formData.cover_image || ''}
                            onChange={url => setFormData(prev => ({ ...prev, cover_image: url }))}
                        />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Additional Images</label>
                        <AdminImageGallery
                            images={formData.images || []}
                            onChange={images => setFormData(prev => ({ ...prev, images }))}
                        />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Year *</label>
                        <input required type="number" name="year" min="2000" max={new Date().getFullYear() + 1} value={formData.year} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Display Order</label>
                        <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Source</label>
                        <select name="source" value={formData.source} onChange={handleChange} className={inputClass}>
                            <option value="manual">Manual</option>
                            <option value="github">GitHub</option>
                        </select>
                    </div>

                    <div className="col-span-2 flex gap-6 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Featured project</span>
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
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
