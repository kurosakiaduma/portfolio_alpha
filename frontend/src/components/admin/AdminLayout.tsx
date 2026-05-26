import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Code, ShieldCheck, FolderGit2, Music, MessageSquareText, LogOut } from 'lucide-react';
import { logout, getStoredUser } from '../../lib/auth';

export function AdminLayout() {
    const [user] = useState(() => getStoredUser());
    
    const handleLogout = async () => {
        logout();
    };

    const navItems = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/skills", label: "Skills", icon: Code },
        { to: "/certifications", label: "Certifications", icon: ShieldCheck },
        { to: "/projects", label: "Projects", icon: FolderGit2 },
        { to: "/music", label: "Music", icon: Music },
        { to: "/blog", label: "Blog", icon: MessageSquareText },
    ];

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
                    <div className="text-sm text-slate-400">{user?.email || 'admin@taduma.me'}</div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col pt-4 overflow-y-auto z-10 hidden md:block">
                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                    ${isActive
                                            ? 'bg-slate-800 text-cyan-400 font-medium border border-slate-700'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                        }`
                                    }
                                >
                                    <Icon size={18} className="opacity-80" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
