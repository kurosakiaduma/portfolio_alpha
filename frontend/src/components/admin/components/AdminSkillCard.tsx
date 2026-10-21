import { Pencil, Trash2 } from 'lucide-react';
import type { Skill } from '../../../types/skills';

interface AdminSkillCardProps {
    skill: Skill;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function AdminSkillCard({ skill, onEdit, onDelete }: AdminSkillCardProps) {
    return (
        <div className="group relative bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square">
            {/* Icon */}
            <img
                src={`/icons/skills/${skill.icon}`}
                alt={skill.name}
                className="w-8 h-8 object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
            />

            {/* Name */}
            <span className="text-xs font-medium text-slate-200 text-center leading-tight truncate w-full text-center">
                {skill.name}
            </span>

            {/* Category */}
            <span className="text-xs text-slate-500 text-center leading-tight truncate w-full text-center">
                {skill.category}
            </span>

            {/* Hover overlay with Edit/Delete buttons (only if provided) */}
            {(onEdit || onDelete) && (
                <div className="absolute inset-0 rounded-xl bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 bg-slate-800 hover:bg-cyan-900 text-slate-300 hover:text-cyan-400 rounded-lg border border-slate-700 hover:border-cyan-700 transition"
                            title="Edit"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-700 transition"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
