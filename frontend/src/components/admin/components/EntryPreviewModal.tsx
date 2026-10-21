import { useState } from 'react';
import type { Project } from '../../../types/projects';
import type { Skill } from '../../../types/skills';
import type { MusicEntry } from '../../../types/music';
import type { BlogEntry } from '../../../types/blog';
import { Trash2, Check, X } from 'lucide-react';

type EntryType = 'project' | 'skill' | 'music' | 'blog';

interface EntryPreviewModalProps {
    entryType: EntryType;
    entry: Project | Skill | MusicEntry | BlogEntry | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => Promise<void>;
    onDelete?: () => Promise<void>;
    saveLabel?: string;
    deleteLabel?: string;
    isCreating?: boolean;
}

// Formatting helpers removed since real cards are used.

import { ProjectCard } from '../../ProjectsIsland';
import { AdminSkillCard } from './AdminSkillCard';
import { MusicCard } from '../../MusicIsland';
import { BlogCard } from '../../BlogIsland';
// For Certifications, it says "correct client-side card". Let's check if CertificationCard exists or if it's missing from the design.
// Design says: EntryPreviewModal renders correct card type. But wait, we don't have a certification preview card listed in the mock ones. I'll just remove the mock ones and use the real ones.

export function EntryPreviewModal({
    entryType,
    entry,
    isOpen,
    onClose,
    onSave,
    onDelete,
    saveLabel,
    deleteLabel,
    isCreating = false,
}: EntryPreviewModalProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !entry) {
        return null;
    }

    const entryNames: Record<EntryType, string> = {
        project: 'Project',
        skill: 'Skill',
        music: 'Music Entry',
        blog: 'Blog Entry',
    };

    const renderCard = () => {
        switch (entryType) {
            case 'project':
                return <div className="max-w-sm mx-auto"><ProjectCard project={entry as Project} /></div>;
            case 'skill':
                return <div className="max-w-xs mx-auto"><AdminSkillCard skill={entry as Skill} /></div>;
            case 'music':
                return <div className="max-w-sm mx-auto"><MusicCard entry={entry as MusicEntry} isPlaying={false} onPlay={() => {}} /></div>;
            case 'blog':
                return <div className="max-w-sm mx-auto"><BlogCard entry={entry as BlogEntry} /></div>;
            default:
                return null;
        }
    };

    const handleSave = async () => {
        if (!onSave) return;
        setLoading(true);
        setError(null);

        try {
            await onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save entry');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        setLoading(true);
        setError(null);

        try {
            await onDelete();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to delete entry');
        } finally {
            setLoading(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60">
                <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Preview {entryNames[entryType]}</h2>
                        <p className="text-sm text-slate-400">Review how this entry will appear before confirming your action.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 transition hover:border-slate-500 hover:text-white"
                        aria-label="Close preview"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {renderCard()}

                    {error && (
                        <div className="rounded-2xl border border-red-700 bg-red-950/80 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                        <p className="text-sm text-slate-400">
                            {isCreating
                                ? 'This preview shows how the new entry will render once saved.'
                                : 'Save to persist the changes, or delete to remove the entry entirely.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {onDelete && !confirmDelete && (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-2xl border border-red-500 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/15 disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                <span className="ml-2">{deleteLabel || 'Delete'}</span>
                            </button>
                        )}

                        {onDelete && confirmDelete && (
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                    Confirm deletion? This cannot be undone.
                                </span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center rounded-2xl border border-red-500 bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
                                >
                                    Delete now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        {onSave && (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                            >
                                <Check size={16} />
                                <span className="ml-2">{saveLabel || 'Save'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
