import { useEffect, useState } from 'react';
import { Code, ShieldCheck, FolderGit2, Music, BookOpen } from 'lucide-react';
import { adminGetStats, type AdminStats } from '../../../lib/adminApi';

export function DashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminGetStats()
            .then(setStats)
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { label: 'Skills', key: 'skills' as const, icon: Code, color: 'cyan' },
        { label: 'Certifications', key: 'certifications' as const, icon: ShieldCheck, color: 'fuchsia' },
        { label: 'Projects', key: 'projects' as const, icon: FolderGit2, color: 'emerald' },
        { label: 'Music', key: 'music' as const, icon: Music, color: 'purple' },
        { label: 'Blog Entries', key: 'blog' as const, icon: BookOpen, color: 'amber' },
    ] as const;

    const colorMap = {
        cyan: 'bg-cyan-950/50 text-cyan-400',
        fuchsia: 'bg-fuchsia-950/50 text-fuchsia-400',
        emerald: 'bg-emerald-950/50 text-emerald-400',
        purple: 'bg-purple-950/50 text-purple-400',
        amber: 'bg-amber-950/50 text-amber-400',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome to the portfolio admin panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {cards.map(({ label, key, icon: Icon, color }) => (
                    <div key={key} className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {loading ? (
                                    <span className="inline-block w-6 h-6 rounded bg-slate-700 animate-pulse" />
                                ) : (
                                    stats?.[key] ?? '—'
                                )}
                            </div>
                            <div className="text-sm text-slate-400">{label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
