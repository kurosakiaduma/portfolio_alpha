import { useEffect, useState } from 'react';
import { getAuthToken, logout, getStoredUser } from '../../lib/auth';
import { AdminSidebar } from './AdminSidebar.tsx';
import { ToastProvider } from './components/ToastContext';
import { DashboardPage } from './pages/DashboardPage';
import { SkillsPage } from './pages/SkillsPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MusicPage } from './pages/MusicPage';
import { BlogPage } from './pages/BlogPage';
import './admin.css';

type AdminPage = 'dashboard' | 'skills' | 'certifications' | 'projects' | 'music' | 'blog';

const PAGE_COMPONENTS: Record<AdminPage, React.ComponentType> = {
    dashboard: DashboardPage,
    skills: SkillsPage,
    certifications: CertificationsPage,
    projects: ProjectsPage,
    music: MusicPage,
    blog: BlogPage,
};

interface AdminShellProps {
    page: AdminPage;
}

export default function AdminShell({ page }: AdminShellProps) {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/alter/login';
            return;
        }

        fetch('/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => {
                if (!r.ok) { logout(); return; }
                setIsAuth(true);
            })
            .catch(() => logout());
    }, []);

    if (isAuth === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p style={{ color: '#00ffd5', fontFamily: 'monospace' }}>Verifying credentials...</p>
            </div>
        );
    }

    if (!isAuth) return null;

    const user = getStoredUser();
    const PageComponent = PAGE_COMPONENTS[page];
    const currentPath = `/alter/${page === 'dashboard' ? 'dashboard' : page}`;

    return (
        <div className="admin-theme min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="text-xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">
                        /alter
                    </div>
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400">{user?.email ?? 'admin'}</div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar currentPath={currentPath} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <ToastProvider>
                        <PageComponent />
                    </ToastProvider>
                </main>
            </div>
        </div>
    );
}
