import { useState, useEffect } from 'react';
import { adminGetProjects, adminDeleteProject } from '../../../lib/adminApi';
import type { Project } from '../../../types/projects';
import { Pencil, Trash2, Plus, RefreshCw, Star, SquareCode, ExternalLink } from 'lucide-react';
import { ProjectForm } from '../components/ProjectForm';
import { useToast } from '../components/ToastContext';

export function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await adminGetProjects();
            setProjects(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        toast.confirm('Are you sure you want to delete this project?', async () => {
            try {
                await adminDeleteProject(id);
                setProjects(prev => prev.filter(p => p.id !== id));
                toast.success('Project deleted');
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    if (editingProject || isCreating) {
        return (
            <ProjectForm
                project={editingProject}
                onCancel={() => { setEditingProject(null); setIsCreating(false); }}
                onSave={() => { setEditingProject(null); setIsCreating(false); loadProjects(); }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
                    <p className="text-slate-400 text-sm">Manage the portfolio projects displayed on your site.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadProjects}
                        className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700 transition"
                        title="Refresh">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md flex items-center gap-2 transition shadow-lg shadow-cyan-900/20">
                        <Plus size={18} /> Add Project
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
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Year</th>
                            <th className="px-6 py-4 font-medium">Featured</th>
                            <th className="px-6 py-4 font-medium">Source</th>
                            <th className="px-6 py-4 font-medium">Links</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {projects.map(project => (
                            <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div>
                                        <p className="font-medium text-slate-200">{project.title}</p>
                                        {project.short_description && (
                                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{project.short_description}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-slate-400">{project.year}</td>
                                <td className="px-6 py-3">
                                    {project.featured ? (
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
                                            <Star size={13} fill="currentColor" /> Featured
                                        </span>
                                    ) : (
                                        <span className="text-slate-600 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono border border-slate-700">
                                        {project.source}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex gap-2">
                                        {project.github_url && (
                                            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                                                className="text-slate-500 hover:text-slate-300 transition" title="GitHub">
                                                <SquareCode size={15} />
                                            </a>
                                        )}
                                        {project.live_url && (
                                            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                                                className="text-slate-500 hover:text-slate-300 transition" title="Live">
                                                <ExternalLink size={15} />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right space-x-2">
                                    <button onClick={() => setEditingProject(project)}
                                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(project.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && projects.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No projects found. Click "Add Project" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
