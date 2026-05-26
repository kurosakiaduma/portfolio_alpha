import { useState, useEffect } from 'react';
import { adminGetSkills, adminDeleteSkill } from '../../../lib/adminApi';
import type { Skill } from '../../../types/skills';
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import { SkillForm } from '../components/SkillForm';

export function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const loadSkills = async () => {
        try {
            setLoading(true);
            const data = await adminGetSkills();
            setSkills(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSkills();
    }, []);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this skill?')) return;

        try {
            await adminDeleteSkill(id);
            setSkills(skills.filter(s => s.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (editingSkill || isCreating) {
        return (
            <SkillForm
                skill={editingSkill}
                onCancel={() => {
                    setEditingSkill(null);
                    setIsCreating(false);
                }}
                onSave={() => {
                    setEditingSkill(null);
                    setIsCreating(false);
                    loadSkills();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Skills</h1>
                    <p className="text-slate-400 text-sm">Manage the technologies and tools displayed on your portfolio.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadSkills}
                        className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700 transition"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md flex items-center gap-2 transition shadow-lg shadow-cyan-900/20"
                    >
                        <Plus size={18} />
                        Add Skill
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-medium">Icon</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Grid</th>
                            <th className="px-6 py-4 font-medium">Order</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {skills.map(skill => (
                            <tr key={skill.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                                        <img src={`/icons/skills/${skill.icon}`} alt="" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-200">{skill.name}</td>
                                <td className="px-6 py-3">{skill.category}</td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono border border-slate-700">
                                        {skill.grid_size}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-400 text-center w-12">{skill.display_order}</td>
                                <td className="px-6 py-3 text-right space-x-2">
                                    <button
                                        onClick={() => setEditingSkill(skill)}
                                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(skill.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && skills.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No skills found. Click "Add Skill" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
