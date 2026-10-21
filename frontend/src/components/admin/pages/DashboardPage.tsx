import { useEffect, useState } from 'react';
import { Code, ShieldCheck, FolderGit2, Music, BookOpen, Bot, ChevronRight } from 'lucide-react';
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
        { label: 'Blog Entries', key: 'blogs' as const, icon: BookOpen, color: 'amber' },
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

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Quick Links Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
                    <div className="space-y-2">
                        {cards.map(({ label, key, icon: Icon, color }) => (
                            <a
                                key={key}
                                href={`/alter/${key === 'blogs' ? 'blog' : key}`}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${colorMap[color]} group-hover:bg-slate-800 transition-colors`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                                        Manage {label}
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* ChatbotSettingsPanel Placeholder */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400">
                            <Bot size={20} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Chatbot Settings</h2>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/50 rounded-xl border border-slate-800/50 relative overflow-hidden">
                        {/* Construction Tape Style Background */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #eab308 10px, #eab308 20px)' }}></div>

                        <div className="mb-4 inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-sm relative z-10">
                            Under Construction
                        </div>

                        <p className="text-slate-400 max-w-[280px] leading-relaxed relative z-10 text-sm">
                            RAG knowledge base and model configuration will be available here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
