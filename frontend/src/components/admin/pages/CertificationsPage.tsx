import { useState, useEffect } from 'react';
import { adminGetCertifications, adminDeleteCertification } from '../../../lib/adminApi';
import type { Certification } from '../../../types/certifications';
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import { CertificationForm } from '../components/CertificationForm';

export function CertificationsPage() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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
        if (!confirm('Are you sure you want to delete this certification?')) return;

        try {
            await adminDeleteCertification(id);
            setCertifications(certifications.filter(c => c.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
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
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-medium">Icon</th>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Issuer</th>
                            <th className="px-6 py-4 font-medium">Year</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Order</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {certifications.map(cert => (
                            <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                                        <img 
                                            src={`/icons/certifications/${cert.icon}`} 
                                            alt="" 
                                            className="max-w-full max-h-full object-contain" 
                                            onError={(e) => (e.currentTarget.style.display = 'none')} 
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-200">{cert.title}</td>
                                <td className="px-6 py-3">{cert.issuer}</td>
                                <td className="px-6 py-3 text-slate-400">{cert.year}</td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono border border-slate-700">
                                        {cert.skill_type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-400 text-center w-12">{cert.display_order}</td>
                                <td className="px-6 py-3 text-right space-x-2">
                                    <button
                                        onClick={() => setEditingCert(cert)}
                                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && certifications.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    No certifications found. Click "Add Certification" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
