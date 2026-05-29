import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban, Plus, Users, CheckCircle2,
    Clock, AlertTriangle, Zap, Bot, ArrowUpRight,

    CalendarDays, Target, Activity, Sparkles, ShieldCheck
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/projectStore';
import { useAuraStore } from '../store/auraStore';

import type { Project } from '../types/project.types';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const PRIORITY_BADGES = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const DashboardPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { state, dashboardStats, dispatch } = useStore();
    const { insights, fetchInsights, toggleOpen } = useAuraStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const statusLabels = useMemo(
        () => ({
            PLANNED: { label: t('common.planned'), color: 'text-slate-500', bg: 'bg-slate-100' },
            IN_PROGRESS: { label: t('common.in_progress'), color: 'text-blue-600', bg: 'bg-blue-50' },
            DELIVERED: { label: t('dashboard.status_delivered'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
            SUSPENDED: { label: t('dashboard.status_suspended'), color: 'text-red-500', bg: 'bg-red-50' },
        }),
        [t, i18n.language],
    );

    const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';

    const userRole = (user?.role || '').toUpperCase();
    const canSeeAllProjects =
        userRole === 'ADMIN' ||
        userRole === 'SUPER_ADMIN' ||
        userRole === 'HR_ADMIN' ||
        userRole === 'PROJECT_MANAGER' ||
        userRole === 'MANAGER';
    const canSeeClientPortal = canSeeAllProjects || userRole === 'CLIENT';

    const visibleProjects = state.projects.filter(p => {
        if (canSeeAllProjects) return true;
        const isMember = (p.members || []).some(m => m.id === user?.id || (m as any).email === user?.email);
        const isManager = p.managerId === user?.id;
        const isClient = userRole === 'CLIENT' && p.clientName === user?.fullName;
        return isMember || isManager || isClient;
    });


    useEffect(() => {
        // Fetch Aura insights if there's a selected project or at least one project
        const projectId = state.selectedProjectId || state.projects[0]?.id;
        if (projectId) {
            fetchInsights(projectId);
        }
    }, [state.selectedProjectId, state.projects.length, fetchInsights]);


    // Use current updated state instead of stale state
    const criticalTasks = state.tasks.filter(t => t.priority === 'CRITICAL' || (t.priority === 'HIGH' && t.status !== 'DONE'));

    const kpiCards = [
        { label: t('dashboard.total_projects'), value: dashboardStats.totalProjects, icon: <FolderKanban />, color: 'text-indigo-600' },
        { label: t('common.in_progress'), value: dashboardStats.activeProjects, icon: <Activity />, color: 'text-blue-600' },
        { label: t('dashboard.tasks_kpi'), value: dashboardStats.totalTasks, icon: <CheckCircle2 />, color: 'text-slate-600' },
        { label: t('dashboard.completed_kpi'), value: dashboardStats.completedTasks, icon: <Target />, color: 'text-emerald-600' },
        { label: t('dashboard.team'), value: dashboardStats.teamMembers, icon: <Users />, color: 'text-violet-600' },
        { label: t('dashboard.upcoming_deadlines'), value: dashboardStats.upcomingDeadlines, icon: <Clock />, color: 'text-amber-600' },
    ];

    return (
        <AppLayout
            title={t('common.dashboard')}
            subtitle={t('dashboard.welcome_workspace', { name: state.workspaceName })}
        >
            <div className="p-6 space-y-6">

                {/* ===== KPI CARDS ===== */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiCards.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Card className="hover:shadow-md transition-all h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {kpi.label}
                                    </CardTitle>
                                    <div className={`p-1.5 rounded-md bg-slate-50 ${kpi.color}`}>
                                        {React.cloneElement(kpi.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== PROJETS ===== */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">{t('dashboard.my_projects')}</h2>
                        </div>

                        <div className="space-y-3">
                            {visibleProjects.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                                    <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-slate-600">{t('dashboard_custom.no_assigned_projects')}</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-4">{t('dashboard.browse_or_create')}</p>
                                    <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                                        {t('dashboard.view_all_projects')}
                                    </Button>
                                </div>
                            ) : (
                                visibleProjects.map((p, i) => (
                                    <ProjectRow
                                        key={p.id}
                                        project={p}
                                        index={i}
                                        statusLabels={statusLabels}
                                        dateLocale={dateLocale}
                                        onOpen={() => {
                                            dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                            navigate(`/projects/${p.id}`);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN ===== */}
                    <div className="space-y-4">

                        {/* Aura AI */}
                        <Card className="bg-slate-900 text-white overflow-hidden shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                       <Bot className="w-4 h-4 text-indigo-400" />
                                   </div>
                                   <CardTitle className="text-sm">{t('common.aura_ai')}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">{t('dashboard.aura_online')}</Badge>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {insights.length > 0 ? (
                                    insights.map((msg, i) => (
                                        <div key={i} className="text-xs text-slate-300 bg-white/5 rounded-lg px-3 py-2 leading-relaxed border border-white/5">
                                            {msg}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-slate-400 italic px-3 py-2">
                                        {t('dashboard.aura_analyzing')}
                                    </div>
                                )}
                                <Button 
                                    className="w-full mt-2" 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={toggleOpen}
                                >
                                    {t('dashboard.open_aura')} &rarr;
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Portail Client Shortcut */}
                        {canSeeClientPortal && (
                            <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50 group hover:border-indigo-300 transition-all cursor-pointer"
                                onClick={() => navigate('/client-portal')}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-slate-800">{t('common.client_portal')}</span>
                                    <ArrowUpRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    {t('dashboard.client_portal_desc')}
                                </p>
                            </div>
                        )}


                        {/* Tâches urgentes */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    {t('dashboard.urgent_tasks')}
                                </span>
                                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{criticalTasks.length}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {criticalTasks.slice(0, 4).map(task => (
                                    <div key={task.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-2">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${PRIORITY_BADGES[task.priority]} flex-shrink-0 mt-0.5`}>
                                                {task.priority}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-slate-700 truncate">{task.title}</p>
                                                {task.dueDate && (
                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <CalendarDays className="w-2.5 h-2.5" />
                                                        {new Date(task.dueDate).toLocaleDateString(dateLocale)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

// ===== PROJECT ROW CARD =====
const ProjectRow: React.FC<{
    project: Project;
    index: number;
    statusLabels: Record<string, { label: string; color: string; bg: string }>;
    dateLocale: string;
    onOpen: () => void;
}> = ({ project, index, statusLabels, onOpen }) => {
    const { t } = useTranslation();
    const { label, color, bg } = statusLabels[project.status] ?? statusLabels.PLANNED;
    const isBoardView = project.viewMode === 'BOARD';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onOpen}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden"
        >
            {/* Top accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${isBoardView ? 'from-indigo-500 to-primary-500' : 'from-violet-500 to-accent-500'}`} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                                {project.name}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBoardView ? 'bg-indigo-50 text-indigo-700' : 'bg-violet-50 text-violet-700'}`}>
                                {t('dashboard.view_mode', { mode: project.viewMode })}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600`}>
                                {project.type}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>
                                {label}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3 truncate">{project.description}</p>

                        {/* Progress bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>{t('dashboard.progress_label')}</span>
                                <span className="font-semibold text-slate-600">{project.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${isBoardView ? 'from-indigo-500 to-primary-500' : 'from-violet-500 to-accent-500'}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="flex -space-x-1.5">
                            {(project.members || []).slice(0, 3).map(m => (
                                <div key={m.id} title={m.fullName}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                                    {m.avatar}
                                </div>
                            ))}
                            {(!project.members || project.members.length === 0) && (
                                <span className="text-[10px] text-slate-400">{t('dashboard.member_count')}</span>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400">{t('common.budget')}</p>
                            <p className="text-xs font-bold text-slate-700">{project.budget.toLocaleString()} DT</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                        {project.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
