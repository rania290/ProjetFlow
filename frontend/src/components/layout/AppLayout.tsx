import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FolderKanban, CheckSquare, Users, FileText,
    MessageSquare, BarChart3, Calendar, ChevronDown,
    ChevronRight, Layers, Bell, Search, LogOut, Menu, X, Settings,
    Ticket, TrendingUp, Download, ShieldCheck, Sparkles, Circle,
    ArrowLeftRight, Briefcase, UserCog, HeartPulse, ClipboardList, Network, Clock, Plus,
    Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/auth.service';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useStore } from '../../store/projectStore';
import { useAuraStore } from '../../store/auraStore';
import { projectsService } from '../../api/projects.service';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraChatPanel } from '../aura/AuraChatPanel';
import { useTranslation } from 'react-i18next';
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



interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle }) => {
    const { t, i18n } = useTranslation();
    const { logout, user, updateProfile: updateUserProfile } = useAuth();
    const { state, dispatch } = useStore();

    React.useEffect(() => {
        if (user?.preferredLanguage) {
            void i18n.changeLanguage(user.preferredLanguage);
        } else {
            void i18n.changeLanguage('fr');
        }
    }, [user?.preferredLanguage, i18n]);

    const NAV_ITEMS = [
        { id: 'dashboard', label: t('common.dashboard'), icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
        { id: 'projects', label: t('common.projects'), icon: <FolderKanban className="w-4 h-4" />, path: '/projects' },
        { id: 'tasks', label: t('common.tasks'), icon: <CheckSquare className="w-4 h-4" />, path: '/my-tasks' },
        { id: 'team', label: t('common.team'), icon: <Users className="w-4 h-4" />, path: '/team' },
        { id: 'documents', label: t('common.documents'), icon: <FileText className="w-4 h-4" />, path: '/documents' },
        { id: 'messages', label: t('common.messages'), icon: <MessageSquare className="w-4 h-4" />, path: '/messages' },
        { id: 'analytics', label: t('common.reporting'), icon: <TrendingUp className="w-4 h-4" />, path: '/analytics', roles: ['ADMIN', 'SUPER_ADMIN', 'RH', 'HR_ADMIN'] },
        { id: 'client-portal', label: t('common.client_portal'), icon: <Circle className="w-4 h-4 text-emerald-500" />, path: '/client-portal', roles: ['ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'CLIENT'] },
        { id: 'hr', label: t('common.hr'), icon: <HeartPulse className="w-4 h-4" />, path: '/hr' },
        { id: 'calendar', label: t('common.calendar'), icon: <Calendar className="w-4 h-4" />, path: '/calendar' },
        { id: 'aura', label: t('common.aura_ai'), icon: <Sparkles className="w-4 h-4 text-indigo-500" />, onClick: true },
    ];

    const ADMIN_NAV_ITEMS = [
        { id: 'admin-dash', label: t('common.global_view'), icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin/dashboard' },
        { id: 'admin-my-projects', label: t('common.my_projects'), icon: <Briefcase className="w-4 h-4" />, path: '/admin/my-projects' },
        { id: 'admin-users', label: t('common.users_roles'), icon: <Users className="w-4 h-4" />, path: '/admin/users' },
        { id: 'admin-roles', label: t('common.role_assignment'), icon: <Settings className="w-4 h-4" />, path: '/admin/roles' },
        { id: 'admin-settings', label: t('common.configuration'), icon: <Settings className="w-4 h-4" />, path: '/admin/settings' },
    ];

    // Pure CLIENT role: show Tickets + Aura in the sidebar
    // Admins/PMs who visit client portal see the full navigation
    const isClient = user?.role === 'CLIENT';
    const CLIENT_NAV_ITEMS = isClient ? [
        { id: 'client-tickets', label: t('client.tickets_title'), icon: <Ticket className="w-4 h-4" />, path: '/client-portal/tickets' },
    ] : [
        { id: 'client-dash', label: t('common.dashboard'), icon: <LayoutDashboard className="w-4 h-4" />, path: '/client-portal' },
        { id: 'client-projects', label: t('common.my_projects'), icon: <FolderKanban className="w-4 h-4" />, path: '/client-portal/projects' },
        { id: 'client-tickets', label: t('client.tickets_title'), icon: <Ticket className="w-4 h-4" />, path: '/client-portal/tickets' },
        { id: 'client-docs', label: t('common.documents'), icon: <FileText className="w-4 h-4" />, path: '/client-portal/documents' },
    ];

    const HR_NAV_ITEMS = [
        { id: 'hr-dash', label: t('common.dashboard'), icon: <LayoutDashboard className="w-4 h-4" />, path: '/hr' },
        { id: 'hr-my-leaves', label: t('common.my_leaves'), icon: <ClipboardList className="w-4 h-4" />, path: '/hr/my-leaves' },
        { id: 'hr-validations', label: t('common.validations'), icon: <CheckSquare className="w-4 h-4" />, path: '/hr/validations', roles: ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'PROJECT_MANAGER', 'MANAGER'] },
        { id: 'hr-pointage', label: t('common.attendance'), icon: <Clock className="w-4 h-4" />, path: '/hr/pointage' },
        { id: 'hr-annuaire', label: t('common.directory'), icon: <Users className="w-4 h-4" />, path: '/hr/directory' },
    ];

    const { toggleOpen } = useAuraStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const jwtToken = localStorage.getItem('token');
    const notificationTriggered = useRef(false);

    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN';
    const isProjectManager =
        user?.role === 'PROJECT_MANAGER' || user?.role === 'MANAGER';
    const canSeeAllProjects = isAdminUser || isProjectManager;
    const isAdmin = location.pathname.startsWith('/admin');
    const isClientPortal = location.pathname.startsWith('/client-portal');
    const isHRPortal = location.pathname.startsWith('/hr');
    const canSeeReporting = user?.role && ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'RH'].includes(user.role);

    React.useEffect(() => {
        if (user?.id) {
            const lastUserId = localStorage.getItem('last_user_id');
            if (lastUserId && lastUserId !== user.id) {
                dispatch({ type: 'WIPE_DATA' });
            }
            localStorage.setItem('last_user_id', user.id);
        }
    }, [user?.id, dispatch]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (jwtToken && user) {
                try {
                    const [projectsData, tasksData, sprintsData] = await Promise.all([
                        projectsService.getAll().catch(() => []),
                        projectsService.getAllTasks().catch(() => []),
                        projectsService.getAllSprints().catch(() => []),
                    ]);

                    let filteredProjects = projectsData;
                    if (!canSeeAllProjects) {
                        filteredProjects = projectsData.filter(p =>
                            p.managerId === user.id ||
                            (p.members || []).some((m: any) => m.id === user.id || m.email === user.email) ||
                            (p.clientName === user.fullName && user.role === 'CLIENT')
                        );
                    }

                    const projectIds = new Set(filteredProjects.map(p => p.id));
                    const filteredTasks = tasksData.filter(t => projectIds.has(t.projectId));
                    const filteredSprints = sprintsData.filter(s => projectIds.has(s.projectId));

                    dispatch({ type: 'SET_PROJECTS', projects: filteredProjects });
                    dispatch({ type: 'SET_TASKS', tasks: filteredTasks });
                    dispatch({ type: 'SET_SPRINTS', sprints: filteredSprints });

                    // Trigger automated notifications for Demo
                    if (!notificationTriggered.current && filteredTasks.length > 0) {
                        const now = new Date();
                        const delayed = filteredTasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now);
                        const urgent = filteredTasks.filter(t => t.status !== 'DONE' && t.priority === 'HIGH');

                        if (delayed.length > 0) {
                            window.dispatchEvent(new CustomEvent('app-notify', {
                                detail: {
                                    id: 'delayed-' + Date.now(),
                                    type: 'warning',
                                    title: t('common.delayed_tasks_title'),
                                    message: t('common.delayed_tasks_msg', { count: delayed.length }),
                                }
                            }));
                        }

                        if (urgent.length > 0) {
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('app-notify', {
                                    detail: {
                                        id: 'urgent-' + Date.now(),
                                        type: 'error',
                                        title: t('common.priority_alert_title'),
                                        message: t('common.priority_alert_msg', { count: urgent.length }),
                                    }
                                }));
                            }, 1000);
                        }
                        
                        notificationTriggered.current = true;
                    }

                } catch (err) {
                    console.error('Failed to load data:', err);
                }
            }
        };
        fetchData();
    }, [jwtToken, user, dispatch, canSeeAllProjects]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const allActiveProjects = state.projects.filter(p => {
        const isMember = (p.members || []).some(m => m.id === user?.id);
        const isManager = p.managerId === user?.id;
        const matchesStatus = ['IN_PROGRESS', 'PLANNED', 'SUSPENDED'].includes(p.status);
        return matchesStatus && (canSeeAllProjects || isMember || isManager);
    });

    const userInitials = (user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getUserRoleLabel = (role?: string) => {
        switch (role) {
            case 'ADMIN': return t('common.role_admin');
            case 'PROJECT_MANAGER': return t('common.role_pm');
            case 'CLIENT': return t('common.role_client');
            default: return t('common.role_collaborator');
        }
    };

    const q = searchQuery.toLowerCase();
    const filteredAdminNavItems = ADMIN_NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q));
    const filteredClientNavItems = CLIENT_NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q));
    const filteredHRNavItems = HR_NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q) && (!item.roles || (user?.role && item.roles.includes(user.role))));
    const filteredNavItems = NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q) && (!item.roles || (user?.role && item.roles.includes(user.role))));
    const filteredRecentProjects = allActiveProjects.filter(p => p.name.toLowerCase().includes(q) && p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()));
    const displayedProjects = showAllProjects || searchQuery || projectSearchQuery ? filteredRecentProjects : filteredRecentProjects.slice(0, 5);

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-background text-slate-900 dark:text-foreground font-sans print:overflow-visible print:h-auto print:bg-white print:text-slate-900">
            {/* Sidebar */}
            <AnimatePresence>
                {state.sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex-shrink-0 flex flex-col h-full overflow-hidden z-20 bg-slate-950 border-r border-slate-900 print:hidden"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/5 overflow-hidden">
                                <svg viewBox="0 0 100 100" className="w-7 h-7">
                                    <defs>
                                        <linearGradient id="logo-gradient-app" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#2bd8a7', stopOpacity: 1 }} />
                                            <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M30 65c-8 0-15-7-15-15s7-15 15-15c5 0 10 3 13 8l4-7c-5-6-11-10-17-10-14 0-25 11-25 25s11 25 25 25c6 0 12-4 17-10l-4-7c-3 5-8 8-13 8z"
                                        fill="url(#logo-gradient-app)"
                                    />
                                    <path
                                        d="M70 35c8 0 15 7 15 15s-7 15-15 15c-5 0-10-3-13-8l-4 7c5 6 11 10 17 10 14 0 25-11 25-25s-11-25-25-25c-6 0-12 4-17 10l4 7c3-5 8-8 13-8z"
                                        fill="url(#logo-gradient-app)"
                                    />
                                    <rect x="47" y="25" width="6" height="30" rx="3" fill="#0f172a" />
                                    <circle cx="50" cy="18" r="4" fill="#0f172a" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white tracking-widest uppercase">VAERDIA</span>
                            </div>
                        </div>

                        {/* Mode indicator */}
                        {(isAdmin || isClientPortal || isHRPortal) && (
                            <div className={`px-4 py-3 flex items-center justify-center gap-2 border-b border-white/5 ${isAdmin ? 'bg-emerald-500/10 text-emerald-400' : isHRPortal ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? 'bg-emerald-500' : isHRPortal ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">
                                    {isAdmin ? t('common.admin_mode') : isHRPortal ? t('common.hr_portal') : t('common.client_space')}
                                </span>
                            </div>
                        )}

                        {/* Search */}
                        <div className="px-3 py-3 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={t('common.search')}
                                    className="pl-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                            {isAdmin ? (
                                <>
                                    {filteredAdminNavItems.length > 0 && <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/20 uppercase tracking-widest">{t('common.admin_mode')}</div>}
                                    {filteredAdminNavItems.map(item => (
                                        <Link
                                            key={item.id}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                    <div className="pt-4">
                                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/5">
                                            <ArrowLeftRight className="w-4 h-4" />
                                            <span>{t('common.app_mode')}</span>
                                        </Link>
                                    </div>
                                </>
                            ) : isClientPortal ? (
                                <>
                                    {filteredClientNavItems.length > 0 && <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('common.client_space')}</div>}
                                    {filteredClientNavItems.map(item => (
                                        item.onClick ? (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.id === 'client-aura') toggleOpen();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ) : (
                                            <Link
                                                key={item.id}
                                                to={item.path!}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    ))}
                                    <div className="pt-4">
                                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/5">
                                            <ArrowLeftRight className="w-4 h-4" />
                                            <span>{isClient ? t('common.back_to_home') : t('common.exit_portal')}</span>
                                        </Link>
                                    </div>
                                </>
                            ) : isHRPortal ? (
                                <>
                                    {filteredHRNavItems.length > 0 && <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest">{t('common.hr_portal')}</div>}
                                    {filteredHRNavItems.map(item => (
                                        <Link
                                            key={item.id}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname.startsWith(item.path) ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                    <div className="pt-4">
                                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-white/5">
                                            <ArrowLeftRight className="w-4 h-4" />
                                            <span>{t('common.exit_portal')}</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {filteredNavItems.length > 0 && <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-white/20 uppercase tracking-widest">{t('common.navigation')}</div>}
                                    {filteredNavItems.map(item => (
                                        item.onClick ? (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.id === 'aura') toggleOpen();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ) : (
                                            <Link
                                                key={item.id}
                                                to={item.path!}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    ))}
                                    {(!searchQuery || filteredRecentProjects.length > 0) && (
                                        <div className="pt-4">
                                            <button onClick={() => setProjectsOpen(!projectsOpen)} className="flex items-center gap-2 w-full px-2 py-1 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                                {projectsOpen || searchQuery ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                {t('common.recent_projects')}
                                            </button>
                                            {(projectsOpen || searchQuery) && (
                                                <div className="mt-1 space-y-0.5">
                                                    <div className="px-3 py-1.5 mb-1">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-500" />
                                                            <input
                                                                value={projectSearchQuery}
                                                                onChange={e => setProjectSearchQuery(e.target.value)}
                                                                placeholder="Filtrer vos projets..."
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-2 py-1 text-[10px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                    {displayedProjects.map(p => (
                                                        <Link key={p.id} to={`/projects/${p.id}`} className="block px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 truncate">
                                                            <Circle className="w-1.5 h-1.5 inline-block mr-2 fill-indigo-500 text-indigo-500" />
                                                            {p.name}
                                                        </Link>
                                                    ))}
                                                    {!searchQuery && !projectSearchQuery && filteredRecentProjects.length > 5 && (
                                                        <button 
                                                            onClick={() => setShowAllProjects(!showAllProjects)} 
                                                            className="block w-full text-left px-3 py-1.5 mt-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                                                        >
                                                            {showAllProjects ? "Voir moins" : `+ ${filteredRecentProjects.length - 5} autres projets`}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!isAdmin && isAdminUser && (
                                        <div className="pt-4">
                                            <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-400/80 hover:text-emerald-400 border border-emerald-500/20">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span>{t('common.admin_mode')}</span>
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/5">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.profilePhoto} />
                                    <AvatarFallback className="bg-indigo-500 text-white text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white/80 truncate">{user?.fullName}</p>
                                    <p className="text-[10px] text-white/30 capitalize">{user?.role?.toLowerCase()}</p>
                                </div>
                                <button onClick={handleLogout} className="p-1.5 text-white/30 hover:text-red-400">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 dark:bg-background print:overflow-visible print:w-full print:bg-white">
                <header className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-card z-10 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="p-2 text-slate-400 hover:text-slate-600">
                            {state.sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                        {title && (
                            <div>
                                <h1 className="text-sm font-bold text-slate-900">{title}</h1>
                                {subtitle && <p className="text-[10px] text-slate-400 uppercase tracking-widest">{subtitle}</p>}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {canSeeReporting && (
                            <Link to="/analytics">
                                <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                    <TrendingUp className="w-4 h-4" />
                                </button>
                            </Link>
                        )}

                        {isAdminUser && (
                            <Link to="/admin/settings">
                                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </Link>
                        )}

                        <NotificationCenter token={jwtToken || ''} />

                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                            <AvatarImage src={user?.profilePhoto} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-0">
                    {children}
                </main>
                {!isClient && <AuraChatPanel />}
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
};
