import { useState, useRef } from 'react';
import { adminCreateSkill, adminUpdateSkill, adminUploadIcon } from '../../../lib/adminApi';
import type { Skill } from '../../../types/skills';
import { Save, X, Upload } from 'lucide-react';

interface SkillFormProps {
    skill: Skill | null;
    onSave: () => void;
    onCancel: () => void;
}

export function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
    const isEditing = !!skill;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
        name: skill?.name || '',
        icon: skill?.icon || '',
        category: skill?.category || 'Frontend',
        description: skill?.description || '',
        grid_size: skill?.grid_size || '1x1',
        is_academic: skill?.is_academic || false,
        display_order: skill?.display_order || 0,
        icon_type: skill?.icon_type || 'brand',
        skill_type: skill?.skill_type || 'skill'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.svg')) {
            setError('Only SVG files are allowed');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const result = await adminUploadIcon(file, 'skills');
            setFormData(prev => ({
                ...prev,
                icon: result.filename
            }));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload icon');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing && skill.id) {
                await adminUpdateSkill(skill.id, formData);
            } else {
                await adminCreateSkill(formData);
            }
            onSave();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/50">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">
                <h2 className="text-lg font-semibold text-white">
                    {isEditing ? `Edit Skill: ${skill.name}` : 'Create New Skill'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-950/50 text-red-400 text-sm border border-red-900 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Name</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <label className="text-sm font-medium text-slate-300">Icon (SVG)</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".svg"
                                    onChange={handleIconUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="icon-upload"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-md text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50"
                                >
                                    <Upload size={16} />
                                    {uploading ? 'Uploading...' : 'Choose Icon File'}
                                </button>
                            </div>
                            {formData.icon && (
                                <div className="flex items-center gap-3 p-2 bg-slate-950 border border-slate-700 rounded-md">
                                    <img 
                                        src={`/icons/skills/${formData.icon}`} 
                                        alt={formData.icon}
                                        className="w-6 h-6 object-contain"
                                    />
                                    <span className="text-sm text-slate-300 flex-1">{formData.icon}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                                        className="text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <input
                            required
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Display Order</label>
                        <input
                            required
                            type="number"
                            name="display_order"
                            value={formData.display_order}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Grid Size</label>
                        <select
                            name="grid_size"
                            value={formData.grid_size}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                        >
                            <option value="1x1">1x1</option>
                            <option value="2x1">2x1</option>
                            <option value="2x2">2x2</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Icon Type</label>
                        <select
                            name="icon_type"
                            value={formData.icon_type}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                        >
                            <option value="brand">Brand</option>
                            <option value="custom">Custom</option>
                            <option value="degree">Degree</option>
                        </select>
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                        ></textarea>
                    </div>

                    <div className="space-y-2 col-span-2 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="is_academic"
                                checked={formData.is_academic}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Is Academic Skill / Concept</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md flex items-center gap-2 transition"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-md flex items-center gap-2 transition opacity-100 disabled:opacity-50"
                    >
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Skill'}
                    </button>
                </div>
            </form>
        </div>
    );
}
