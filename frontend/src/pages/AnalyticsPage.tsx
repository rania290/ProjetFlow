import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
    TrendingUp, BarChart3, Users,
    CheckCircle2, Target, Printer,
    AlertCircle, Loader2, AlertTriangle, Clock,
    ArrowDownRight, Lock
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import { reportingService, type GlobalAnalytics } from '../api/reporting.service';
import { ChartComponent } from '../components/charts/ChartComponent';
import { useAuth } from '../hooks/useAuth';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface ProjectAnalytics {
    id: string;
    name: string;
    type: string;
    progress: number;
    status: string;
    budget: number;
    totalTasks: number;
    doneTasks: number;
    overdueTasks: number;
    spentAmount: number;
}

export const AnalyticsPage: React.FC = () => {
    const { t } = useTranslation();
    const { state } = useStore();
    const { user } = useAuth();

    const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSprintId, setSelectedSprintId] = useState<string>('');

    // Check authorization - only PROJECT_MANAGER, RH, and ADMIN can access analytics
    const isAuthorized = user?.role === 'PROJECT_MANAGER' || user?.role === 'RH' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN';

    if (!isAuthorized) {
        return (
            <AppLayout title={t('analytics.reporting_analytics')}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Lock className="w-16 h-16 text-red-400" />
                    <h2 className="text-2xl font-bold text-slate-900">{t('common.access_denied', { defaultValue: 'Accès refusé' })}</h2>
                    <p className="text-slate-500">{t('analytics.requires_permission', { defaultValue: 'Vous devez être Chef de Projet, RH ou Admin pour accéder à cette page.' })}</p>
                </div>
            </AppLayout>
        );
    }

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await reportingService.getGlobalAnalytics();
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <AppLayout title={t('analytics.reporting_analytics')}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">{t('analytics.loading_data')}</p>
                </div>
            </AppLayout>
        );
    }

    const { summary, resources, projects } = analytics || {
        summary: { totalProjects: 0, totalBudget: 0, totalTasks: 0, completionRate: 0, delayedTasksCount: 0, criticalTasksCount: 0, tasksByStatus: { TODO: 0, IN_PROGRESS: 0, IN_TEST: 0, DONE: 0 } },
        resources: [],
        projects: []
    };

    const tasksByStatus = summary.tasksByStatus;
    const completionRate = summary.completionRate;
    const totalBudget = summary.totalBudget;

    // Remaining logic for finances
    const DEFAULT_TJM = 450;
    
    // Calculate real consumed budget from project data
    const globalConsumedBudget = (summary as any).invoices?.totalAmount || projects.reduce((acc, p) => acc + ((p as any).spentAmount || 0), 0);
    
    // Calculate estimated cost based on actual task completion and TJM (if hours/points available)
    // Fallback to 80% only if we have NO project data at all
    const globalEstimatedCost = (summary as any).invoices?.paidAmount || (globalConsumedBudget > 0 ? globalConsumedBudget * 0.85 : (totalBudget > 0 ? totalBudget * 0.8 : 0));

    // Compute Real Burndown Data from Store
    let realBurndownData = [];
    const activeSprint = selectedSprintId 
        ? state.sprints.find(s => s.id === selectedSprintId) 
        : (state.sprints.find(s => s.status === 'ACTIVE') || state.sprints[0]);

    if (activeSprint) {
        const sprintTasksStore = state.tasks.filter(t => t.sprintId === activeSprint.id);
        const sprintTasksSprint = activeSprint.tasks || [];
        const sprintTasks = sprintTasksStore.length >= sprintTasksSprint.length ? sprintTasksStore : sprintTasksSprint;
        
        const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
        
        const startDate = new Date(activeSprint.startDate);
        const endDate = new Date(activeSprint.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        realBurndownData = Array.from({ length: totalDays + 1 }).map((_, i) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const ideal = Math.max(0, totalPoints - (totalPoints / totalDays) * i);
            
            // Calculate how many points were completed UP TO this date
            const completedPoints = sprintTasks
                .filter(t => t.status === 'DONE' && t.completedAt && new Date(t.completedAt).getTime() <= currentDate.getTime() + 86400000) // End of day
                .reduce((sum, t) => sum + (t.storyPoints || 1), 0);
                
            const remaining = Math.max(0, totalPoints - completedPoints);
            
            return {
                day: i,
                remaining: remaining,
                ideal: ideal,
                date: currentDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
            };
        });
    } else {
        // Fallback: use all tasks in last 14 days ONLY if tasks exist
        const today = new Date();
        const totalPoints = state.tasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
        
        if (totalPoints > 0) {
            realBurndownData = Array.from({ length: 15 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - (14 - i));
                
                const completedUpToDate = state.tasks
                    .filter(t => t.status === 'DONE' && t.completedAt && new Date(t.completedAt).getTime() <= date.getTime() + 86400000)
                    .reduce((sum, t) => sum + (t.storyPoints || 1), 0);
                    
                return {
                    day: i,
                    remaining: Math.max(0, totalPoints - completedUpToDate),
                    ideal: Math.max(0, totalPoints - (totalPoints / 14) * i),
                    date: date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                };
            });
        } else {
            // Truly no data
            realBurndownData = [
                { day: 0, remaining: 0, ideal: 0, date: today.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }) }
            ];
        }
    }

    const burndownData = realBurndownData;
    
    const maxBurndownPoint = Math.max(...burndownData.map(d => d.ideal), ...burndownData.map(d => d.remaining), 10);
    const totalChartDays = Math.max(1, burndownData.length - 1);

    const getX = (index: number) => (index / totalChartDays) * 600;
    const getY = (val: number) => ((maxBurndownPoint - val) / maxBurndownPoint) * 160;

    // Velocity from real sprints
    const completedSprints = state.sprints.filter(s => s.status === 'COMPLETED' || s.status === 'ACTIVE');
    const velocityData = completedSprints.length > 0
        ? completedSprints.slice(-4).map(s => ({
            sprint: s.name,
            points: state.tasks.filter(t => t.sprintId === s.id && t.status === 'DONE').reduce((sum, t) => sum + (t.storyPoints || 1), 0)
          }))
        : [
            { sprint: 'S-3', points: 0 },
            { sprint: 'S-2', points: 0 },
            { sprint: 'S-1', points: 0 },
            { sprint: 'S Actuel', points: summary.tasksByStatus.DONE },
          ];
    const maxVelocity = Math.max(...velocityData.map(v => v.points), 1);

    // Skills distribution from real resources
    const rolesMap = resources.reduce((acc: Record<string, number>, res) => {
        const role = res.role || t('admin.roles.TEAM_MEMBER');
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const skillsData = {
        labels: Object.keys(rolesMap).length > 0 ? Object.keys(rolesMap) : [t('common.no_data')],
        datasets: [{
            data: Object.values(rolesMap).length > 0 ? Object.values(rolesMap) : [1],
            backgroundColor: ['#5c7cfa', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
            borderWidth: 0
        }]
    };

    // Productivity from real task completion per month
    const now = new Date();
    const monthlyPoints = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        const next = new Date(now.getFullYear(), now.getMonth() - (4 - i) + 1, 1);
        return state.tasks.filter(t =>
            t.status === 'DONE' && t.completedAt &&
            new Date(t.completedAt) >= d && new Date(t.completedAt) < next
        ).reduce((sum, t) => sum + (t.storyPoints || 1), 0);
    });
    const monthLabels = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        return d.toLocaleDateString(undefined, { month: 'short' });
    });
    const productivityData = {
        labels: monthLabels,
        datasets: [{
            label: 'Story points réalisés',
            data: monthlyPoints,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            tension: 0.4,
            fill: true
        }]
    };

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <AppLayout 
            title={t('analytics.reporting_analytics', { defaultValue: 'Reporting & Analytics' })} 
            subtitle={t('analytics.global_metrics', { defaultValue: 'Vue globale des performances et métriques' })}
        >
            <div className="p-6 space-y-6">

                {/* Period selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {state.sprints.length > 0 && (
                            <Select 
                                value={selectedSprintId || (activeSprint?.id || '')} 
                                onValueChange={(v) => setSelectedSprintId(v || '')}
                            >
                                <SelectTrigger className="w-[200px] h-9 bg-white border-slate-200 text-xs font-bold rounded-xl">
                                    <SelectValue placeholder="Choisir un sprint">
                                        {(() => {
                                            const id = selectedSprintId || (activeSprint?.id || '');
                                            const sprint = state.sprints.find((s) => s.id === id);
                                            if (!sprint) return 'Choisir un sprint';
                                            return `${sprint.name}${sprint.status === 'ACTIVE' ? ` (${t('common.active')})` : ''}`;
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    {state.sprints.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="text-xs font-bold">
                                            {s.name} {s.status === 'ACTIVE' ? `(${t('common.active')})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-sm print:hidden">
                            <Printer className="w-3.5 h-3.5" /> {t('analytics.export_pdf')}
                        </button>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[
                        { label: t('dashboard.finances'), value: `${(totalBudget / 1000).toFixed(0)}k ${t('common.currency_dt') || 'DT'}`, sub: t('dashboard.active_projects', { count: summary.totalProjects }), icon: <Target className="w-5 h-5" />, color: 'from-amber-500 to-amber-600' },
                        { label: t('dashboard.global_completion'), value: `${completionRate}%`, sub: `${tasksByStatus.DONE}/${summary.totalTasks} ${t('common.tasks')}`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-primary-500 to-primary-600' },
                        { label: t('dashboard.task_volume'), value: `${summary.totalTasks}`, sub: `${tasksByStatus.IN_PROGRESS} ${t('dashboard.admin_dashboard')}`, icon: <TrendingUp className="w-5 h-5" />, color: 'from-violet-500 to-violet-600' },
                        { label: t('dashboard.critical_alerts'), value: `${(summary as any).criticalTasksCount || 0}`, sub: `${(summary as any).delayedTasksCount || 0} ${t('analytics.delayed')}`, icon: <AlertTriangle className="w-5 h-5" />, color: (summary as any).criticalTasksCount > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600' },
                        { label: t('common.team'), value: `${resources.length}`, sub: t('analytics.active_team'), icon: <Users className="w-5 h-5" />, color: 'from-blue-400 to-blue-500' },
                    ].map((kpi, i) => (
                        <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-sm`}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-display text-slate-900 mb-0.5 tracking-tight">{kpi.value}</div>
                                <div className="text-xs font-bold text-slate-600 mb-0.5">{kpi.label}</div>
                                <div className="text-[10px] text-slate-400">{kpi.sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== BURNDOWN CHART ===== */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">{t('analytics.burndown')} – {activeSprint ? activeSprint.name : t('analytics.current_sprint')}</h3>
                                <p className="text-[11px] text-slate-400">{t('analytics.story_points_evolution')}</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-primary-500 rounded" /> {t('analytics.real')}</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-slate-300 rounded" style={{ borderStyle: 'dashed' }} /> {t('analytics.ideal')}</div>
                            </div>
                        </div>
                        <div className="relative h-48">
                            <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5c7cfa" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#5c7cfa" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {[0, 1, 2, 3, 4].map((i) => {
                                    const y = i * 40;
                                    const val = Math.round(maxBurndownPoint * (1 - i / 4));
                                    return (
                                        <g key={i}>
                                            <line x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                                            <text x="0" y={y > 0 ? y - 4 : 10} fontSize="10" fill="#94a3b8">{val}</text>
                                        </g>
                                    );
                                })}
                                <path d={`M ${burndownData.map((d, i) => `${getX(i)},${getY(d.ideal)}`).join(' L ')}`} stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="6,4" />
                                <path d={`M ${burndownData.map((d, i) => `${getX(i)},${getY(d.remaining)}`).join(' L ')} L 600,160 L 0,160 Z`} fill="url(#burnGrad)" />
                                <path d={`M ${burndownData.map((d, i) => `${getX(i)},${getY(d.remaining)}`).join(' L ')}`} stroke="#5c7cfa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                {burndownData.map((d, i) => (
                                    <circle key={i} cx={getX(i)} cy={getY(d.remaining)} r="3.5" fill="#5c7cfa" stroke="white" strokeWidth="2" />
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* ===== SPRINT SUMMARY CARD ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">{t('analytics.sprint_summary')}</h3>
                            <p className="text-[11px] text-slate-400">{activeSprint ? activeSprint.name : t('analytics.no_active_sprint')}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 flex-1">
                            {(() => {
                                // Double check task source: global store OR embedded in sprint
                                const sTasksStore = activeSprint ? state.tasks.filter(t => t.sprintId === activeSprint.id) : [];
                                const sTasksSprint = activeSprint?.tasks || [];
                                const sTasks = sTasksStore.length >= sTasksSprint.length ? sTasksStore : sTasksSprint;
                                
                                return [
                                    { label: t('analytics.sprint_tasks'), value: sTasks.length, color: 'text-slate-800' },
                                    { label: t('projects.task_status.DONE'), value: sTasks.filter(t => t.status === 'DONE').length, color: 'text-emerald-600' },
                                    { label: t('projects.task_status.IN_PROGRESS'), value: sTasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-primary-600' },
                                    { label: t('projects.task_status.TODO'), value: sTasks.filter(t => t.status === 'TODO').length, color: 'text-slate-500' },
                                ].map(item => (
                                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                                        <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{item.label}</p>
                                    </div>
                                ));
                            })()}
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            {(() => {
                                const sTasks = activeSprint ? state.tasks.filter(t => t.sprintId === activeSprint.id) : [];
                                const sDone = sTasks.filter(t => t.status === 'DONE').length;
                                const sTotal = sTasks.length;
                                // Fix: If sprint is empty, show 0% instead of global fallback
                                const sRate = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
                                
                                return (
                                    <>
                                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                            <span>{t('analytics.productivity')}</span>
                                            <span className="font-bold text-slate-700">{sRate}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sRate}%` }}
                                                transition={{ duration: 1, type: 'spring' }}
                                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
                                            />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== PRODUCTIVITÉ MENSUELLE ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">{t('analytics.productivity')}</h3>
                                <p className="text-[11px] text-slate-400">{t('analytics.performance_index')}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                {(() => {
                                    const last = monthlyPoints[monthlyPoints.length - 1] || 0;
                                    const prev = monthlyPoints[monthlyPoints.length - 2] || 0;
                                    const diff = last - prev;
                                    const trend = prev > 0 ? Math.round((diff / prev) * 100) : (last > 0 ? 100 : 0);
                                    const isUp = trend >= 0;
                                    
                                    return (
                                        <>
                                            <span className={`${isUp ? 'text-emerald-500' : 'text-rose-500'} text-xs font-bold flex items-center gap-1`}>
                                                {isUp ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} 
                                                {isUp ? '+' : ''}{trend}%
                                            </span>
                                            <span className="text-[10px] text-slate-400">{t('analytics.vs_prev_month')}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="h-48">
                            <ChartComponent type="line" data={productivityData} height={180} showGrid={false} />
                        </div>
                    </div>

                    {/* ===== RÉPARTITION DES COMPÉTENCES ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{t('analytics.skills_distribution')}</h3>
                        <p className="text-[11px] text-slate-400 mb-5">{t('analytics.expertise_pôle')}</p>

                        <div className="h-48 flex items-center justify-center">
                            <ChartComponent type="doughnut" data={skillsData} height={180} />
                        </div>
                    </div>

                    {/* ===== TASK STATUS PIE ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{t('analytics.tasks_distribution')}</h3>
                        <p className="text-[11px] text-slate-400 mb-5">{t('analytics.all_projects_status')}</p>

                        {/* Donut SVG */}
                        <div className="flex justify-center mb-5">
                            <DonutChart data={[
                                { label: t('projects.task_status.TODO'), value: tasksByStatus.TODO, color: '#94a3b8' },
                                { label: t('projects.task_status.IN_PROGRESS'), value: tasksByStatus.IN_PROGRESS, color: '#5c7cfa' },
                                { label: t('projects.task_status.IN_TEST'), value: tasksByStatus.IN_TEST, color: '#a78bfa' },
                                { label: t('projects.task_status.DONE'), value: tasksByStatus.DONE, color: '#10b981' },
                            ]} t={t} />
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: t('projects.task_status.TODO'), value: tasksByStatus.TODO, color: 'bg-slate-400' },
                                { label: t('projects.task_status.IN_PROGRESS'), value: tasksByStatus.IN_PROGRESS, color: 'bg-primary-500' },
                                { label: t('projects.task_status.IN_TEST'), value: tasksByStatus.IN_TEST, color: 'bg-violet-500' },
                                { label: t('projects.task_status.DONE'), value: tasksByStatus.DONE, color: 'bg-emerald-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2.5">
                                    <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                                    <span className="text-xs text-slate-600 flex-1">{item.label}</span>
                                    <span className="text-xs font-bold text-slate-800">{item.value}</span>
                                    <span className="text-[10px] text-slate-400 w-8 text-right">
                                        {Math.round((item.value / Math.max(summary.totalTasks, 1)) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ===== VELOCITY ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <BarChart3 className="w-4 h-4 text-primary-500" />
                            <h3 className="text-sm font-bold text-slate-800">{t('analytics.team_velocity')}</h3>
                            <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t('analytics.last_sprints')}</span>
                        </div>
                        <div className="flex items-end justify-around gap-3 h-36">
                            {velocityData.map((v, i) => (
                                <div key={v.sprint} className="flex flex-col items-center gap-2 flex-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(v.points / maxVelocity) * 100}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.1 }}
                                        className={`w-full rounded-t-xl ${i === velocityData.length - 1 ? 'bg-gradient-to-t from-primary-600 to-primary-400' : 'bg-slate-100 hover:bg-slate-200 transition-colors'}`}
                                        style={{ minHeight: '8px' }}
                                    />
                                    <div className="text-center">
                                        <p className="text-[11px] font-bold text-slate-700">{v.points}</p>
                                        <p className="text-[9px] text-slate-400">{v.sprint}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                            <span>{t('analytics.avg_velocity')}</span>
                            <span className="font-bold text-slate-800">{Math.round(velocityData.reduce((a, v) => a + v.points, 0) / velocityData.length)} {t('analytics.pts_sprint')}</span>
                        </div>
                    </div>

                    {/* ===== PROJECTS PROGRESS & FINANCES ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">

                        {/* Progress Tracker — Avancement par projet actif */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold text-slate-800">{t('analytics.active_project_progress')}</h3>
                                <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t('dashboard.active_projects', { count: projects.length })}</span>
                            </div>
                            {projects.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs italic">{t('analytics.no_active_projects')}</div>
                            ) : (
                                <div className="space-y-4">
                                    {[...projects].sort((a, b) => b.progress - a.progress).map((p, i) => (
                                        <div key={p.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                        p.status === 'IN_PROGRESS' ? 'bg-primary-100 text-primary-600'
                                                        : p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600'
                                                        : p.status === 'SUSPENDED' ? 'bg-red-100 text-red-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {p.status === 'IN_PROGRESS' ? t('common.in_progress').toUpperCase() : p.status === 'COMPLETED' ? t('common.completed').toUpperCase() : p.status === 'SUSPENDED' ? t('projects.status_labels.SUSPENDED').toUpperCase() : p.status || t('common.planned').toUpperCase()}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">{p.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(p as any).overdueTasks > 0 && (
                                                        <span className="flex items-center gap-0.5 text-[9px] text-red-500 font-bold">
                                                            <Clock className="w-3 h-3" />{(p as any).overdueTasks}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold text-slate-600">{p.progress}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.progress}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${p.progress === 100 ? 'bg-emerald-500' : p.status === 'SUSPENDED' ? 'bg-red-400' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span>{(p as any).doneTasks || 0}/{(p as any).totalTasks || 0} {t('analytics.tasks_completed')}</span>
                                                <span>{Number(p.budget || 0).toLocaleString()} {t('common.currency_dt') || 'DT'} {t('analytics.allocated')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Financial Report */}
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-sm font-bold text-slate-800">{t('analytics.portfolio_financial_health')}</h3>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                    {t('analytics.real_time')}
                                </span>
                            </div>

                            {/* Dynamic Calculations */}
                            {(() => {
                                const consumedBudget = globalConsumedBudget || 0;
                                const estimatedTotalCost = globalEstimatedCost || 0;
                                let rawBurn = Math.round((consumedBudget / Math.max(totalBudget, 1)) * 100);
                                const burnRate = isNaN(rawBurn) ? 0 : Math.min(100, rawBurn);
                                const margin = totalBudget - (estimatedTotalCost || consumedBudget);
                                const isOverBudget = margin < 0;

                                return (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Budget Alloué */}
                                            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors" />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t('analytics.allocated_budget')}</p>
                                                <p className="text-lg font-black text-slate-900">{totalBudget.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{t('common.currency_dt') || 'DT'}</span></p>
                                            </div>

                                            {/* Dépensé */}
                                            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-10 group-hover:bg-amber-100 transition-colors" />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t('analytics.consumed')}</p>
                                                <p className="text-lg font-black text-slate-900">{consumedBudget.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{t('common.currency_dt') || 'DT'}</span></p>
                                            </div>

                                            {/* Reste à allouer */}
                                            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors" />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t('analytics.remaining_available')}</p>
                                                <p className="text-lg font-black text-slate-900">{(totalBudget - consumedBudget).toLocaleString()} <span className="text-sm font-semibold text-slate-400">{t('common.currency_dt') || 'DT'}</span></p>
                                            </div>

                                            {/* Prévisionnel (Marge) */}
                                            <div className={`bg-white rounded-xl p-3 border shadow-sm relative overflow-hidden group transition-colors ${isOverBudget ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-purple-200'}`}>
                                                <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full -z-10 transition-colors ${isOverBudget ? 'bg-red-50 group-hover:bg-red-100' : 'bg-purple-50 group-hover:bg-purple-100'}`} />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t('analytics.estimated_margin')}</p>
                                                <p className={`text-lg font-black ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>{Math.abs(margin).toLocaleString()} <span className="text-sm font-semibold opacity-50">{t('common.currency_dt') || 'DT'}</span></p>
                                            </div>
                                        </div>

                                        {/* Burn Rate Bar */}
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('analytics.burn_rate')}</div>
                                                    <div className="text-xs font-semibold text-slate-700">{t('analytics.consumption_speed')}</div>
                                                </div>
                                                <div className={`text-lg font-black ${burnRate > 90 ? 'text-red-500' : burnRate > 75 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {burnRate}%
                                                </div>
                                            </div>
                                            <div className="h-3 bg-white border border-slate-200 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${burnRate}%` }}
                                                    transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                                                    className={`h-full rounded-full ${
                                                        burnRate > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                                                        burnRate > 75 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                                                        'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                    }`}
                                                />
                                            </div>
                                            {isOverBudget && (
                                                <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] font-semibold leading-relaxed">
                                                        {t('analytics.budget_warning', { margin: `${Math.abs(margin / 1000).toFixed(1)}k ${t('common.currency_dt') || 'DT'}` })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cost Efficiency */}
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                                            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {t('analytics.avg_tjm')}</span>
                                            <span className="font-bold text-slate-700">{DEFAULT_TJM} {t('analytics.dt_day')}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* ===== TEAM TABLE ===== */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                        <Users className="w-4 h-4 text-violet-500" />
                        <h3 className="text-sm font-bold text-slate-800">{t('analytics.resource_load')}</h3>
                        <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t('analytics.all_teams')}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {resources.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                {t('analytics.no_members_assigned')}
                            </div>
                        ) : resources.map((member, i) => {
                            const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            return (
                                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm relative">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <span className="tracking-tighter">{initials || '?'}</span>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div className="w-40">
                                        <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">{member.role}</p>
                                    </div>
                                    <div className="w-16 text-center">
                                        <p className="text-xs font-bold text-slate-700">{member.tasksCount}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t('common.tasks')}</p>
                                    </div>
                                    <div className="w-16 text-center">
                                        <p className="text-xs font-bold text-primary-600">{Math.round(member.assignedPoints)}</p>
                                        <p className="text-[9px] text-slate-400">{t('analytics.points')}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${member.load}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    className={`h-full rounded-full bg-gradient-to-r ${member.load > 85 ? 'from-red-400 to-red-500' : member.load > 60 ? 'from-amber-400 to-amber-500' : 'from-emerald-400 to-emerald-500'}`}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold w-8 ${member.load > 85 ? 'text-red-600' : member.load > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {member.load}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

// ===== DONUT CHART SVG =====
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; t: any }> = ({ data, t }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) return <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">{t('common.no_data')}</div>;

    let currentAngle = -90;
    const cx = 60, cy = 60, r = 50, innerR = 32;

    const slices = data.map(d => {
        const angle = (d.value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        const endAngle = currentAngle;

        const toRad = (a: number) => (a * Math.PI) / 180;
        const x1 = cx + r * Math.cos(toRad(startAngle));
        const y1 = cy + r * Math.sin(toRad(startAngle));
        const x2 = cx + r * Math.cos(toRad(endAngle));
        const y2 = cy + r * Math.sin(toRad(endAngle));
        const xi1 = cx + innerR * Math.cos(toRad(startAngle));
        const yi1 = cy + innerR * Math.sin(toRad(startAngle));
        const xi2 = cx + innerR * Math.cos(toRad(endAngle));
        const yi2 = cy + innerR * Math.sin(toRad(endAngle));
        const largeArc = angle > 180 ? 1 : 0;

        return {
            path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1} Z`,
            color: d.color,
        };
    });

    return (
        <svg viewBox="0 0 120 120" className="w-32 h-32">
            {slices.map((s, i) => (
                <path key={i} d={s.path} fill={s.color} opacity="0.85" className="hover:opacity-100 transition-opacity" />
            ))}
            <text x="60" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">{total}</text>
            <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">{t('common.tasks')}</text>
        </svg>
    );
};
