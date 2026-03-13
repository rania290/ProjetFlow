import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FolderKanban, CheckSquare, Users, FileText,
    MessageSquare, BarChart3, Calendar, ChevronDown,
    ChevronRight, Layers, Bell, Search, LogOut, Menu, X, Settings,
    Ticket, TrendingUp, Download, ShieldCheck, Sparkles, Circle,
    ArrowLeftRight, Briefcase
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/projectStore';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { id: 'projects', label: 'Tous les Projets', icon: <FolderKanban className="w-4 h-4" />, path: '/projects' },
    { id: 'tasks', label: 'Mes tâches', icon: <CheckSquare className="w-4 h-4" />, path: '/my-tasks' },
    { id: 'team', label: 'Équipe', icon: <Users className="w-4 h-4" />, path: '/team' },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, path: '/documents' },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, path: '/messages', badge: 3 },
    { id: 'tickets', label: 'Tickets', icon: <Ticket className="w-4 h-4" />, path: '/tickets' },
    { id: 'analytics', label: 'Reporting', icon: <BarChart3 className="w-4 h-4" />, path: '/analytics' },
    { id: 'client-portal', label: 'Portail Client', icon: <Sparkles className="w-4 h-4" />, path: '/client-portal' },
    { id: 'calendar', label: 'Calendrier', icon: <Calendar className="w-4 h-4" />, path: '/calendar' },
];

export const ADMIN_NAV_ITEMS = [
    { id: 'admin-dash', label: 'Vue Globale', icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin/dashboard' },
    { id: 'admin-my-projects', label: 'Mes Projets', icon: <Briefcase className="w-4 h-4" />, path: '/admin/my-projects' },
    { id: 'admin-users', label: 'Utilisateurs & Rôles', icon: <Users className="w-4 h-4" />, path: '/admin/users' },
    { id: 'admin-permissions', label: 'Permissions d\'Accès', icon: <ShieldCheck className="w-4 h-4" />, path: '/admin/permissions' },
    { id: 'admin-roles', label: 'Assignation de Rôles', icon: <Settings className="w-4 h-4" />, path: '/admin/roles' },
    { id: 'admin-settings', label: 'Configuration', icon: <Settings className="w-4 h-4" />, path: '/admin/settings' },
    { id: 'admin-logs', label: 'Journaux', icon: <FileText className="w-4 h-4" />, path: '/admin/logs' },
    { id: 'admin-export', label: 'Exports', icon: <Download className="w-4 h-4" />, path: '/admin/export' },
];

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle }) => {
    const { logout, user } = useAuth();
    const { state, dispatch } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isAdmin = location.pathname.startsWith('/admin');
    const isAdminUser = user?.role === 'ROOT' || user?.role === 'ADMIN';

    const allActiveProjects = state.projects.filter(p => ['IN_PROGRESS', 'PLANNED'].includes(p.status));

    const userInitials = (user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const NOTIFICATIONS = [
        { id: 'n1', text: 'Sprint 1 se termine dans 4 jours', time: 'Il y a 1h', type: 'warning' },
        { id: 'n2', text: 'Nouvelle tâche assignée : Intégration OAuth', time: 'Il y a 2h', type: 'info' },
        { id: 'n3', text: 'Bug critique signalé sur Portail Client', time: 'Il y a 3h', type: 'error' },
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#f0f2f8' }}>

            {/* ===== SIDEBAR ===== */}
            <AnimatePresence>
                {state.sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 flex flex-col h-full overflow-hidden z-20"
                        style={{
                            background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
                            boxShadow: '4px 0 24px rgba(0,0,0,0.25)'
                        }}
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <Layers className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-sm font-bold font-display text-white tracking-tight uppercase">VAERDIA</span>
                                <p className="text-[10px] text-indigo-300/60 font-medium">ProjectFlow</p>
                            </div>
                        </div>

                        {/* Mode indicator — visible for admin routes */}
                        {isAdmin && (
                            <div className={`px-4 py-2.5 flex items-center gap-2 border-b border-white/5 ${isAdmin ? 'bg-emerald-600/15' : 'bg-indigo-600/10'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isAdmin ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                    {isAdmin ? 'Mode Administration' : 'Mode Application'}
                                </span>
                            </div>
                        )}

                        {/* Search */}
                        <div className="px-3 py-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl text-white/70 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                                />
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                            {isAdmin ? (
                                <>
                                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                                        Administration
                                    </div>
                                    {ADMIN_NAV_ITEMS.map(item => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                                                    }`}
                                                style={isActive ? {
                                                    background: 'rgba(52,211,153,0.12)',
                                                    borderLeft: '2px solid rgb(52,211,153)'
                                                } : { borderLeft: '2px solid transparent' }}
                                            >
                                                <span className={isActive ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">{item.label}</span>
                                            </Link>
                                        );
                                    })}

                                    {/* Switch to App mode */}
                                    <div className="pt-4">
                                        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            Accès rapide
                                        </div>
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-300/80 hover:text-indigo-200 transition-all border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-indigo-500/10"
                                        >
                                            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                                            <span>Passer en mode App</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                                        Navigation
                                    </div>
                                    {NAV_ITEMS.map(item => {
                                        const isActive = location.pathname === item.path
                                            || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                                                    }`}
                                                style={isActive ? {
                                                    background: 'rgba(99,102,241,0.18)',
                                                    borderLeft: '2px solid rgb(129,140,248)'
                                                } : { borderLeft: '2px solid transparent' }}
                                            >
                                                <span className={isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60'}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">{item.label}</span>
                                                {item.badge && (
                                                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}

                                    {/* Recent projects */}
                                    <div className="pt-4 pb-1">
                                        <button
                                            onClick={() => setProjectsOpen(v => !v)}
                                            className="flex items-center gap-2 w-full px-2 py-1 text-[10px] font-bold text-white/25 uppercase tracking-widest hover:text-white/50 transition-colors"
                                        >
                                            {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            Projets récents
                                        </button>
                                        <AnimatePresence>
                                            {projectsOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden mt-1 space-y-0.5"
                                                >
                                                    {allActiveProjects.length === 0 ? (
                                                        <p className="text-[11px] text-white/20 px-3 py-2 italic">Aucun projet actif</p>
                                                    ) : (
                                                        allActiveProjects.slice(0, 5).map(p => {
                                                            const isSelected = location.pathname === `/projects/${p.id}`;
                                                            return (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => {
                                                                        dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                                                        navigate(`/projects/${p.id}`);
                                                                    }}
                                                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isSelected ? 'text-white bg-white/6' : 'text-white/40 hover:text-white/70'
                                                                        }`}
                                                                >
                                                                    <Circle className={`w-2 h-2 fill-current flex-shrink-0 text-indigo-400`} />
                                                                    <span className="truncate">{p.name}</span>
                                                                    <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400`}>
                                                                        Vue {p.viewMode}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Aura AI widget */}
                                    <div className="pt-3">
                                        <div className="p-3 rounded-xl border" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.18)' }}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-white/80">Aura IA</span>
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            </div>
                                            <p className="text-[10px] text-white/40 leading-relaxed">
                                                {state.projects.length === 0
                                                    ? 'Créez votre premier projet pour commencer.'
                                                    : 'Aucune alerte active. Tout se déroule normalement.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Switch to Admin mode */}
                                    {!isAdmin && isAdminUser && (
                                        <div className="pt-3">
                                            <Link
                                                to="/admin/dashboard"
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-300/80 hover:text-emerald-200 transition-all border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/8"
                                            >
                                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                                <span>Passer en mode Admin</span>
                                                <ArrowLeftRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* User footer */}
                        <div className="p-3 border-t border-white/5">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                                    {userInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white/80 truncate">{user?.fullName || 'Utilisateur'}</p>
                                    <p className="text-[10px] text-white/30">
                                        {user?.role === 'ROOT' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'PROJECT_MANAGER' ? 'Chef de projet' : 'Collaborateur'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Se déconnecter"
                                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex flex-col overflow-hidden">



                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            {state.sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                        {title && (
                            <div>
                                <h1 className="text-sm font-bold text-slate-900">{title}</h1>
                                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Link to="/analytics">
                            <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                <TrendingUp className="w-4 h-4" />
                            </button>
                        </Link>
                        {isAdminUser ? (
                            <Link to="/admin/settings">
                                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </Link>
                        ) : (
                            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        )}

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(v => !v)}
                                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <AnimatePresence>
                                {notifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-800">Notifications</span>
                                            <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Tout lire</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {NOTIFICATIONS.map(n => (
                                                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-700">{n.text}</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User avatar */}
                        <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {userInitials}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-semibold text-slate-700">{user?.fullName || 'Utilisateur'}</p>
                                <p className="text-[10px] text-slate-400">
                                    {user?.role === 'ROOT' ? 'Super Admin' : user?.role === 'PROJECT_MANAGER' ? 'Chef de projet' : 'Collaborateur'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
