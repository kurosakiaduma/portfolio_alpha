import { useState, useEffect } from 'react';
import { adminGetCertifications, adminDeleteCertification } from '../../../lib/adminApi';
import type { Certification } from '../../../types/certifications';
import { Pencil, Trash2, Plus, RefreshCw, Award } from 'lucide-react';
import { CertificationForm } from '../components/CertificationForm';
import { useToast } from '../components/ToastContext';

export function CertificationsPage() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const loadCertifications = async () => {
        try {
            setLoading(true);
            const data = await adminGetCertifications();
            setCertifications(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCertifications();
    }, []);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        toast.confirm('Are you sure you want to delete this certification?', async () => {
            try {
                await adminDeleteCertification(id);
                setCertifications(prev => prev.filter(c => c.id !== id));
                toast.success('Certification deleted');
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    if (editingCert || isCreating) {
        return (
            <CertificationForm
                certification={editingCert}
                onCancel={() => {
                    setEditingCert(null);
                    setIsCreating(false);
                }}
                onSave={() => {
                    setEditingCert(null);
                    setIsCreating(false);
                    loadCertifications();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Certifications</h1>
                    <p className="text-slate-400 text-sm">Manage your certifications, degrees, and professional credentials.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadCertifications}
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
                        Add Certification
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-800">
                    {certifications.map(cert => (
                        <div key={cert.id}
                            className="group flex items-center gap-3 px-4 h-14 hover:bg-slate-800/40 transition-colors">
                            {/* Icon thumbnail */}
                            <div className="w-9 h-9 flex-shrink-0 rounded bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                                {cert.icon ? (
                                    <img
                                        src={`/icons/certifications/${cert.icon}`}
                                        alt=""
                                        className="max-w-full max-h-full object-contain"
                                        onError={e => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.removeAttribute('style');
                                        }}
                                    />
                                ) : null}
                                <Award size={14} className="text-slate-500" style={cert.icon ? { display: 'none' } : {}} />
                            </div>

                            {/* Title + issuer */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">{cert.title}</p>
                                <p className="text-xs text-slate-500 truncate">{cert.issuer} · {cert.year}</p>
                            </div>

                            {/* Type badge */}
                            <span className="hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded font-mono">
                                {cert.skill_type}
                            </span>

                            {/* Academic badge */}
                            {cert.is_academic && (
                                <span className="hidden md:inline-flex flex-shrink-0 px-2 py-0.5 bg-cyan-950/50 border border-cyan-800 text-cyan-400 rounded text-xs font-medium">
                                    Academic
                                </span>
                            )}

                            {/* Actions — hidden until hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingCert(cert)}
                                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded transition"
                                    title="Edit"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cert.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                                    title="Delete"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && certifications.length === 0 && (
                        <div className="px-6 py-8 text-center text-slate-500 text-sm">
                            No certifications found. Click "Add Certification" to create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
