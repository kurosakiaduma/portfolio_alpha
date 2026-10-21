import { useState, useEffect } from 'react';
import { adminGetSkills, adminDeleteSkill } from '../../../lib/adminApi';
import type { Skill } from '../../../types/skills';
import { Plus, RefreshCw } from 'lucide-react';
import { SkillForm } from '../components/SkillForm';
import { AdminSkillCard } from '../components/AdminSkillCard';
import { useToast } from '../components/ToastContext';
import { EntryPreviewModal } from '../components/EntryPreviewModal';

export function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);
    const toast = useToast();

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

    const openDeletePreview = (skill: Skill) => {
        setPreviewSkill(skill);
        setDeleteAction(() => async () => {
            await adminDeleteSkill(skill.id);
            setSkills(prev => prev.filter(s => s.id !== skill.id));
            toast.success('Skill deleted');
        });
        setIsPreviewOpen(true);
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

            {!loading && skills.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-12 text-center text-slate-500">
                    No skills found. Click "Add Skill" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {skills.map(skill => (
                        <AdminSkillCard
                            key={skill.id}
                            skill={skill}
                            onEdit={() => setEditingSkill(skill)}
                            onDelete={() => openDeletePreview(skill)}
                        />
                    ))}
                </div>
            )}
            {previewSkill && deleteAction && (
                <EntryPreviewModal
                    entryType="skill"
                    entry={previewSkill}
                    isOpen={isPreviewOpen}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewSkill(null);
                        setDeleteAction(null);
                    }}
                    onDelete={deleteAction}
                    deleteLabel="Delete Skill"
                />
            )}
        </div>
    );
}
