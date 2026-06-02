import { LayoutDashboard, Code, ShieldCheck, FolderGit2, Music, MessageSquareText } from 'lucide-react';

const navItems = [
    { href: '/alter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/alter/skills', label: 'Skills', icon: Code },
    { href: '/alter/certifications', label: 'Certifications', icon: ShieldCheck },
    { href: '/alter/projects', label: 'Projects', icon: FolderGit2 },
    { href: '/alter/music', label: 'Music', icon: Music },
    { href: '/alter/blog', label: 'Blog', icon: MessageSquareText },
];

interface AdminSidebarProps {
    currentPath: string;
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col pt-4 overflow-y-auto z-10 hidden md:block">
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                                ${isActive
                                    ? 'bg-slate-800 text-cyan-400 font-medium border border-slate-700'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <Icon size={18} className="opacity-80" />
                            {item.label}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}
