import React, { useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import {

    LayoutDashboard, FolderKanban, CheckSquare, Users, FileText,

    MessageSquare, BarChart3, Calendar, ChevronDown,

    ChevronRight, Layers, Bell, Search, LogOut, Menu, X, Settings,

    Ticket, TrendingUp, Download, ShieldCheck, Sparkles, Circle,

    ArrowLeftRight, Briefcase, UserCog, HeartPulse, ClipboardList, Network

} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../notifications/NotificationCenter';

import { useStore } from '../../store/projectStore';

import { motion, AnimatePresence } from 'framer-motion';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';

const NAV_ITEMS = [

    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },

    { id: 'projects', label: 'Tous les Projets', icon: <FolderKanban className="w-4 h-4" />, path: '/projects' },

    { id: 'tasks', label: 'Mes tâches', icon: <CheckSquare className="w-4 h-4" />, path: '/my-tasks' },

    { id: 'team', label: 'Équipe', icon: <Users className="w-4 h-4" />, path: '/team' },

    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, path: '/documents' },

    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, path: '/messages' },

    { id: 'analytics', label: 'Reporting', icon: <BarChart3 className="w-4 h-4" />, path: '/analytics' },

    { id: 'client-portal', label: 'Portail Client', icon: <Sparkles className="w-4 h-4" />, path: '/client-portal' },

    { id: 'hr', label: 'Ressources Humaines', icon: <HeartPulse className="w-4 h-4" />, path: '/hr' },

    { id: 'calendar', label: 'Calendrier', icon: <Calendar className="w-4 h-4" />, path: '/calendar' },

];



export const ADMIN_NAV_ITEMS = [
    { id: 'admin-dash', label: 'Vue Globale', icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin/dashboard' },
    { id: 'admin-my-projects', label: 'Mes Projets', icon: <Briefcase className="w-4 h-4" />, path: '/admin/my-projects' },
    { id: 'admin-users', label: 'Utilisateurs & Rôles', icon: <Users className="w-4 h-4" />, path: '/admin/users' },
    { id: 'admin-roles', label: 'Assignation de Rôles', icon: <Settings className="w-4 h-4" />, path: '/admin/roles' },
    { id: 'admin-settings', label: 'Configuration', icon: <Settings className="w-4 h-4" />, path: '/admin/settings' },
];

export const CLIENT_NAV_ITEMS = [
    { id: 'client-dash', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" />, path: '/client-portal' },
    { id: 'client-projects', label: 'Mes Projets', icon: <FolderKanban className="w-4 h-4" />, path: '/client-portal/projects' },
    { id: 'client-tickets', label: 'Support & Tickets', icon: <Ticket className="w-4 h-4" />, path: '/client-portal/tickets' },
    { id: 'client-docs', label: 'Mes Documents', icon: <FileText className="w-4 h-4" />, path: '/client-portal/documents' },
];

export const HR_NAV_ITEMS = [
    { id: 'hr-dash', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" />, path: '/hr' },
    { id: 'hr-my-leaves', label: 'Mes Congés', icon: <ClipboardList className="w-4 h-4" />, path: '/hr/my-leaves' },
    { id: 'hr-validations', label: 'Validations', icon: <CheckSquare className="w-4 h-4" />, path: '/hr/validations', rolls: ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'PROJECT_MANAGER', 'MANAGER'] },
    { id: 'hr-hierarchy', label: 'Organigramme', icon: <Network className="w-4 h-4" />, path: '/hr/hierarchy' },
    { id: 'hr-annuaire', label: 'Annuaire', icon: <Users className="w-4 h-4" />, path: '/hr/directory' },
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




    const handleLogout = async () => {

        await logout();

        navigate('/login');

    };



    const isAdmin = location.pathname.startsWith('/admin');
    const isClientPortal = location.pathname.startsWith('/client-portal');
    const isHRPortal = location.pathname.startsWith('/hr');
    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN';
    const isHRManager = isAdminUser || user?.role === 'PROJECT_MANAGER' || user?.role === 'MANAGER';
    const isClient = user?.role === 'CLIENT';



    const allActiveProjects = state.projects.filter(p => ['IN_PROGRESS', 'PLANNED'].includes(p.status));



    const userInitials = (user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);



    const [profileOpen, setProfileOpen] = useState(false);



    const getUserRoleLabel = (role?: string) => {

        switch (role) {

            case 'ADMIN': return 'Administrateur';

            case 'PROJECT_MANAGER': return 'Chef de projet';

            default: return 'Collaborateur';

        }

    };



    const jwtToken = localStorage.getItem('token');



    return (

        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>



            {/* ===== SIDEBAR ===== */}

            <AnimatePresence>

                {state.sidebarOpen && (

                    <motion.aside

                        initial={{ width: 0, opacity: 0 }}

                        animate={{ width: 256, opacity: 1 }}

                        exit={{ width: 0, opacity: 0 }}

                        transition={{ duration: 0.2 }}

                        className="flex-shrink-0 flex flex-col h-full overflow-hidden z-20 bg-slate-950 border-r border-slate-900 shadow-xl"

                    >

                        {/* Logo */}
                        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                            <div className="relative group/logo cursor-pointer">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover/logo:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all duration-300 overflow-hidden">
                                    <svg viewBox="0 0 100 100" className="w-7 h-7">
                                        <defs>
                                            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#2bd8a7', stopOpacity: 1 }} />
                                                <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M30 65c-8 0-15-7-15-15s7-15 15-15c5 0 10 3 13 8l4-7c-5-6-11-10-17-10-14 0-25 11-25 25s11 25 25 25c6 0 12-4 17-10l-4-7c-3 5-8 8-13 8z"
                                            fill="url(#logo-gradient)"
                                        />
                                        <path
                                            d="M70 35c8 0 15 7 15 15s-7 15-15 15c-5 0-10-3-13-8l-4 7c5 6 11 10 17 10 14 0 25-11 25-25s-11-25-25-25c-6 0-12 4-17 10l4 7c3-5 8-8 13-8z"
                                            fill="url(#logo-gradient)"
                                        />
                                        <rect x="47" y="25" width="6" height="30" rx="3" fill="#0f172a" />
                                        <circle cx="50" cy="18" r="4" fill="#0f172a" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black font-display text-white tracking-[0.15em] uppercase leading-none">
                                    VAER<span className="text-emerald-400">DIA</span>
                                </span>
                                <p className="text-[9px] text-indigo-300/50 font-bold uppercase tracking-widest mt-1">ProjectFlow</p>
                            </div>
                        </div>



                        {/* Mode indicator — visible for admin, client portal or HR */}
                        {(isAdmin || isClientPortal || isHRPortal) && (
                            <div className={`px-4 py-3 flex items-center justify-center gap-2 border-b border-white/5 ${isAdmin ? 'bg-emerald-500/10' : isHRPortal ? 'bg-pink-500/10' : 'bg-green-500/10'}`}>
                                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-500' : isHRPortal ? 'bg-pink-500' : 'bg-green-500'} animate-pulse shadow-sm`} />
                                <span className={`text-[11px] font-bold uppercase tracking-widest ${isAdmin ? 'text-emerald-400' : isHRPortal ? 'text-pink-400' : 'text-green-400'}`}>
                                    {isAdmin ? 'Mode Administration' : isHRPortal ? 'Portail RH' : 'Espace Client'}
                                </span>
                            </div>
                        )}



                        {/* Search */}
                        <div className="px-3 py-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="pl-9 bg-white/10 border-white/10 text-slate-200 placeholder:text-slate-400 focus-visible:ring-indigo-500/50"
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
                            ) : isClientPortal ? (
                                <>
                                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-green-400/80 uppercase tracking-[0.2em]">
                                        Espace Client
                                    </div>
                                    {CLIENT_NAV_ITEMS.map(item => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                                                    }`}
                                                style={isActive ? {
                                                    background: 'rgba(34,197,94,0.18)',
                                                    borderLeft: '2px solid rgb(34,197,94)'
                                                } : { borderLeft: '2px solid transparent' }}
                                            >
                                                <span className={isActive ? 'text-green-400' : 'text-white/30 group-hover:text-white/60'}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">{item.label}</span>
                                            </Link>
                                        );
                                    })}

                                    {/* Switch back to App mode if not exclusively client */}
                                    {(!isClient || isAdminUser) && (
                                        <div className="pt-4">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-green-300/80 hover:text-green-200 transition-all border border-green-500/20 hover:border-green-400/40 hover:bg-green-500/10"
                                            >
                                                <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                                                <span>Retour à l'application</span>
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : isHRPortal ? (
                                <>
                                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-pink-400/80 uppercase tracking-[0.2em]">
                                        Espace RH
                                    </div>
                                    {HR_NAV_ITEMS.filter(item => !item.rolls || (user?.role && item.rolls.includes(user.role))).map(item => {
                                        const isActive = item.path === '/hr' ? location.pathname === '/hr' : location.pathname.startsWith(item.path);
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                                                    }`}
                                                style={isActive ? {
                                                    background: 'rgba(236,72,153,0.18)',
                                                    borderLeft: '2px solid rgb(236,72,153)'
                                                } : { borderLeft: '2px solid transparent' }}
                                            >
                                                <span className={isActive ? 'text-pink-400' : 'text-white/30 group-hover:text-white/60'}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">{item.label}</span>
                                            </Link>
                                        );
                                    })}

                                    <div className="pt-4">
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-pink-300/80 hover:text-pink-200 transition-all border border-pink-500/20 hover:border-pink-400/40 hover:bg-pink-500/10"
                                        >
                                            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                                            <span>Quitter le Portail RH</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (

                                <>

                                    <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">

                                        Navigation

                                    </div>

                                    {NAV_ITEMS.map(item => {

                                        const isActive = item.path === '/projects'
                                            ? location.pathname === item.path
                                            : location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

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
                                <Avatar className="h-9 w-9 border-2 border-indigo-500/30">
                                    <AvatarImage src={user?.profilePhoto} alt={user?.fullName} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white/80 truncate">{user?.fullName || 'Utilisateur'}</p>
                                    <p className="text-[10px] text-white/30">{getUserRoleLabel(user?.role)}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Se déconnecter"
                                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </motion.aside>

                )}

            </AnimatePresence>



            {/* ===== MAIN CONTENT ===== */}

            <div className="flex-1 flex flex-col overflow-hidden">







                {/* Top bar */}

                <header
                    className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
                >

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



                        {/* Notifications — Real-time via WebSocket */}
                        <NotificationCenter token={jwtToken} />



                        {/* User avatar with Dropdown */}
                        <div className="relative flex items-center ml-2 pl-3 border-l border-slate-200">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.profilePhoto} alt={user?.fullName} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px]">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-xs font-semibold text-slate-700">{user?.fullName || 'Utilisateur'}</p>
                                        <p className="text-[10px] text-slate-500">{getUserRoleLabel(user?.role)}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 font-sans">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                                        <p className="text-xs leading-none text-slate-500">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <span>Mon Profil</span>
                                    </DropdownMenuItem>
                                    {isAdminUser && (
                                        <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="cursor-pointer flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-slate-500" />
                                            <span>Paramètres Système</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        <span>Déconnexion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>

                </header>



                {/* Page content */}

                <main className="flex-1 overflow-y-auto">

                    {children}

                </main>

            </div>

            <Toaster position="bottom-right" />
        </div>

    );

};

