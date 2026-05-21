import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Search, FolderKanban, Users, Shield, Briefcase,
    ArrowRight, Clock, CheckCircle2, X
} from 'lucide-react';
import { useStore } from '../store/projectStore';
import type { ProjectMember, Project } from '../types/project.types';
import { useAuth } from '../hooks/useAuth';
import { timeTrackingApi, type TimeTrackingSession } from '../features/hr/time-tracking/api/time-tracking.api';
import { adminApi } from '../api/admin.api';
import type { User } from '../types/auth.types';

interface EnrichedMember extends ProjectMember {
    projects: { id: string; name: string }[];
    totalTasksAssigned: number;
    completedTasksCount: number;
    hoursWorked: number;
}

// ROLE_CONFIG is built inside the component to use t()

const ROLE_STYLES: Record<string, { gradient: string; text: string; Icon: React.ElementType }> = {
    ADMIN:           { gradient: 'from-purple-500 to-violet-600', text: 'text-purple-600', Icon: Shield },
    PROJECT_MANAGER: { gradient: 'from-blue-500 to-indigo-600',   text: 'text-blue-600',   Icon: Briefcase },
    DEVELOPER:       { gradient: 'from-emerald-500 to-teal-600',  text: 'text-emerald-600', Icon: Users },
    DESIGNER:        { gradient: 'from-pink-500 to-rose-600',     text: 'text-pink-600',   Icon: Users },
    TESTER:          { gradient: 'from-amber-500 to-orange-600',  text: 'text-amber-600',  Icon: Users },
    TEAM_MEMBER:     { gradient: 'from-slate-500 to-gray-600',    text: 'text-slate-600',  Icon: Users },
    RH:              { gradient: 'from-violet-500 to-purple-600', text: 'text-violet-600', Icon: Users },
};

const AVATAR_GRADIENTS = [
    'from-indigo-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-teal-500 to-emerald-600',
];
const getAvatarGradient = (id: string) => AVATAR_GRADIENTS[id.charCodeAt(id.length - 1) % AVATAR_GRADIENTS.length];

export const TeamPage: React.FC = () => {
    const { state } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [teamHistory, setTeamHistory] = useState<TimeTrackingSession[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [myHistory, setMyHistory] = useState<TimeTrackingSession[]>([]);

    const ROLE_CONFIG: Record<string, { label: string; gradient: string; text: string; Icon: React.ElementType }> = {
        ADMIN:           { label: t('admin.roles.ADMIN'),           ...ROLE_STYLES.ADMIN },
        PROJECT_MANAGER: { label: t('admin.roles.PROJECT_MANAGER'), ...ROLE_STYLES.PROJECT_MANAGER },
        DEVELOPER:       { label: t('admin.roles.DEVELOPER'),       ...ROLE_STYLES.DEVELOPER },
        DESIGNER:        { label: t('admin.roles.DESIGNER'),        ...ROLE_STYLES.DESIGNER },
        TESTER:          { label: t('admin.roles.TESTER'),          ...ROLE_STYLES.TESTER },
        TEAM_MEMBER:     { label: t('team_custom.member'),          ...ROLE_STYLES.TEAM_MEMBER },
        RH:              { label: t('admin.roles.RH'),              ...ROLE_STYLES.RH },
    };

    const getRoleConf = (role: string) =>
        ROLE_CONFIG[role] ?? { label: role, gradient: 'from-slate-400 to-slate-500', text: 'text-slate-500', Icon: Users };

    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'PROJECT_MANAGER' || user?.role === 'HR_ADMIN';

    // Admins/managers fetch the full team
    useEffect(() => {
        if (isAdminOrManager) {
            timeTrackingApi.getTeam().then(setTeamHistory).catch(console.error);
            adminApi.getAllUsers().then(setUsers).catch(console.error);
        }
    }, [isAdminOrManager]);

    // Every user fetches their own time-tracking history
    useEffect(() => {
        if (!user?.id) return;
        timeTrackingApi.getHistory(user.id).then(setMyHistory).catch(console.error);
    }, [user?.id]);

    const enrichedMembers = useMemo((): EnrichedMember[] => {
        const memberMap = new Map<string, EnrichedMember>();

        if (users.length === 0) {
            state.projects.forEach((project: Project) => {
                (project.members || []).forEach(member => {
                    if (member.role === 'ADMIN') return;
                    if (memberMap.has(member.id)) {
                        const existing = memberMap.get(member.id)!;
                        if (!existing.projects.find(p => p.id === project.id)) {
                            existing.projects.push({ id: project.id, name: project.name });
                        }
                    } else {
                        memberMap.set(member.id, {
                            ...member,
                            projects: [{ id: project.id, name: project.name }],
                            totalTasksAssigned: 0,
                            completedTasksCount: 0,
                            hoursWorked: 0
                        });
                    }
                });
            });
        } else {
            users.forEach(u => {
                if (u.role === 'ADMIN' || u.role === 'CLIENT' || u.role === 'AURA_AI') return;
                memberMap.set(u.id, {
                    id: u.id,
                    fullName: u.fullName || '',
                    role: u.role,
                    avatar: u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U',
                    tjm: 0,
                    projects: [],
                    totalTasksAssigned: 0,
                    completedTasksCount: 0,
                    hoursWorked: 0
                });
            });

            state.projects.forEach((project: Project) => {
                (project.members || []).forEach(member => {
                    if (memberMap.has(member.id)) {
                        const existing = memberMap.get(member.id)!;
                        if (!existing.projects.find(p => p.id === project.id)) {
                            existing.projects.push({ id: project.id, name: project.name });
                        }
                    }
                });
            });
        }

        return Array.from(memberMap.values())
            .filter(m => {
                const name = (m.fullName || '').toLowerCase().trim();
                return name !== '' && name !== 'user' && name !== 'user utilisateur' && name !== 'utilisateur';
            })
            .map(m => {
                const mTasks = state.tasks?.filter(t => t.assigneeId === m.id) || [];
                const doneTasks = mTasks.filter(t => t.status === 'DONE');
                const mHistory = teamHistory.filter(h => h.employeeId === m.id);
                const totalMins = mHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);
                return {
                    ...m,
                    totalTasksAssigned: mTasks.length,
                    completedTasksCount: doneTasks.length,
                    hoursWorked: parseFloat((totalMins / 60).toFixed(1))
                };
            });
    }, [users, state.projects, state.tasks, teamHistory]);

    const filteredMembers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return enrichedMembers.filter(m => {
            const name = (m.fullName || '').toLowerCase();
            const role = m.role || '';
            const roleLabel = getRoleConf(role).label.toLowerCase();
            const email = (m as any).email ? (m as any).email.toLowerCase() : '';
            const matchSearch = !q || name.includes(q) || roleLabel.includes(q) || email.includes(q) || role.toLowerCase().includes(q);
            const matchRole = roleFilter === 'ALL' || role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [enrichedMembers, search, roleFilter]);

    // Unique roles from members for filter pills
    const availableRoles = useMemo(() => {
        const roles = new Set(enrichedMembers.map(m => m.role).filter(Boolean));
        return ['ALL', ...Array.from(roles)];
    }, [enrichedMembers]);

    if (!isAdminOrManager) {
        // Redirect non-admin/manager users to their personal dashboard
        useEffect(() => {
            if (user?.id) {
                navigate(`/team/${user.id}`);
            }
        }, [user?.id, navigate]);

        // Return empty while redirecting
        return null;
    }

    const hasProjects = state.projects.length > 0;
    const hasMembers = enrichedMembers.length > 0;
    const totalHours = enrichedMembers.reduce((a, m) => a + m.hoursWorked, 0);
    const totalTasks = enrichedMembers.reduce((a, m) => a + m.totalTasksAssigned, 0);
    const totalDone = enrichedMembers.reduce((a, m) => a + m.completedTasksCount, 0);

    return (
        <div className="min-h-full bg-[#f8f9fb]">
            {/* ─── HEADER ─── */}
            <div className="bg-white border-b border-slate-200/60">
                <div className="max-w-[1400px] mx-auto px-8 py-7">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-[0.15em] mb-1">{t('common.management')}</p>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                {t('team_custom.team_management')}
                            </h1>
                        </div>

                        {/* Summary Pills */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-bold text-slate-700">{enrichedMembers.length}</span>
                                <span className="text-xs text-slate-400 font-medium">{t('team_custom.members')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700">{totalHours.toFixed(0)}h</span>
                                <span className="text-xs text-slate-400 font-medium">{t('team_custom.total')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-bold text-slate-700">{totalDone}/{totalTasks}</span>
                                <span className="text-xs text-slate-400 font-medium">{t('team_custom.tasks')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 py-6">
                {/* ─── SEARCH & FILTERS ─── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('team_custom.search_placeholder')}
                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        {availableRoles.map(r => {
                            const isActive = roleFilter === r;
                            const conf = r === 'ALL' ? null : getRoleConf(r);
                            return (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                                >
                                    {r === 'ALL' ? t('team_custom.all_roles') : conf?.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── MEMBERS TABLE ─── */}
                {!hasProjects ? (
                    <EmptyState icon={<FolderKanban className="w-8 h-8 text-slate-300" />} title={t('team_custom.no_projects')} subtitle={t('team_custom.create_project_hint')} action={() => navigate('/projects')} actionLabel={t('team_custom.create_project')} />
                ) : !hasMembers ? (
                    <EmptyState icon={<Users className="w-8 h-8 text-slate-300" />} title={t('team_custom.no_members')} subtitle={t('team_custom.add_members_hint')} />
                ) : filteredMembers.length === 0 ? (
                    <EmptyState icon={<Search className="w-8 h-8 text-slate-300" />} title={t('team_custom.no_results')} subtitle={t('team_custom.search_hint')} />
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_150px_150px_100px] gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span>{t('team_custom.member')}</span>
                            <span>{t('team_custom.role')}</span>
                            <span className="text-center">{t('team_custom.tasks')}</span>
                            <span className="text-right">{t('team_custom.actions')}</span>
                        </div>

                        {/* Table Body */}
                        <AnimatePresence>
                            {filteredMembers.map((member, i) => {
                                const roleConf = getRoleConf(member.role);
                                const initials = (member.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const gradient = getAvatarGradient(member.id);
                                const taskPercent = member.totalTasksAssigned > 0
                                    ? Math.round((member.completedTasksCount / member.totalTasksAssigned) * 100)
                                    : 0;

                                return (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => navigate(`/team/${member.id}`)}
                                        className="grid grid-cols-[1fr_150px_150px_100px] gap-4 items-center px-6 py-4 border-b border-slate-50 last:border-b-0 hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                    >
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{member.fullName}</p>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {member.projects.length} {member.projects.length > 1 ? t('common.projects_plural') : t('common.project')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role Badge */}
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${roleConf.text} bg-opacity-10`}
                                                style={{ backgroundColor: `color-mix(in srgb, currentColor 8%, transparent)` }}
                                            >
                                                {roleConf.label}
                                            </span>
                                        </div>



                                        {/* Tasks Progress */}
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex items-center gap-2 w-full max-w-[120px]">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${taskPercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-500 w-8 text-right">{taskPercent}%</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {member.completedTasksCount}/{member.totalTasksAssigned}
                                            </span>
                                        </div>

                                        {/* Action */}
                                        <div className="flex justify-end">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-500 flex items-center justify-center transition-colors duration-200">
                                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── EMPTY STATES ─── */
interface EmptyProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action?: () => void;
    actionLabel?: string;
}

const EmptyState: React.FC<EmptyProps> = ({ icon, title, subtitle, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-5">
            {icon}
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{subtitle}</p>
        {action && actionLabel && (
            <button onClick={action} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                {actionLabel}
            </button>
        )}
    </div>
);
