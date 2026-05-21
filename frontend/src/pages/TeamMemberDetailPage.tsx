import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Clock, Calendar, Briefcase, AlertCircle,
    CheckCircle2, TrendingUp, Target, FolderKanban, Timer,
    ChevronRight
} from 'lucide-react';
import { useStore } from '../store/projectStore';
import { timeTrackingApi, type TimeTrackingSession } from '../features/hr/time-tracking/api/time-tracking.api';
import { adminApi } from '../api/admin.api';
import type { User } from '../types/auth.types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Configurations built inside component to use t()

export const TeamMemberDetailPage: React.FC = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { state } = useStore();
    const [history, setHistory] = useState<TimeTrackingSession[]>([]);
    const [activeSession, setActiveSession] = useState<TimeTrackingSession | null>(null);
    const [loading, setLoading] = useState(true);

    const AVATAR_GRADIENTS = [
        'from-indigo-500 to-blue-600',
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-500',
        'from-teal-500 to-emerald-600',
    ];
    const getGradient = (id: string) => AVATAR_GRADIENTS[id.charCodeAt(id.length - 1) % AVATAR_GRADIENTS.length];

    const ROLE_LABELS: Record<string, string> = {
        ADMIN: t('admin.roles.ADMIN'),
        PROJECT_MANAGER: t('admin.roles.PROJECT_MANAGER'),
        DEVELOPER: t('admin.roles.DEVELOPER'),
        DESIGNER: t('admin.roles.DESIGNER'),
        TESTER: t('admin.roles.TESTER'),
        TEAM_MEMBER: t('team_custom.member'),
        RH: t('admin.roles.RH'),
    };

    const STATUS_MAP: Record<string, { label: string; dot: string; bg: string; text: string }> = {
        TODO:        { label: t('projects.task_status.TODO'),   dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600' },
        IN_PROGRESS: { label: t('projects.task_status.IN_PROGRESS'),  dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700' },
        IN_TEST:     { label: t('projects.task_status.IN_TEST'),   dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700' },
        DONE:        { label: t('projects.task_status.DONE'),   dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    };

    const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
        LOW:      { label: t('projects.task_priority.LOW'),     color: 'text-slate-400' },
        MEDIUM:   { label: t('projects.task_priority.MEDIUM'),   color: 'text-amber-500' },
        HIGH:     { label: t('projects.task_priority.HIGH'),     color: 'text-orange-500' },
        CRITICAL: { label: t('projects.task_priority.CRITICAL'),  color: 'text-rose-500' },
    };

    useEffect(() => {
        if (!memberId) return;
        setLoading(true);
        Promise.all([
            timeTrackingApi.getHistory(memberId),
            timeTrackingApi.getActive(memberId).catch(() => null)
        ])
            .then(([hist, active]) => {
                setHistory(hist);
                setActiveSession(active);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [memberId]);

    const [userGlobal, setUserGlobal] = useState<User | null>(null);

    useEffect(() => {
        if (!memberId) return;
        adminApi.getUserById(memberId)
            .then(setUserGlobal)
            .catch(console.error);
    }, [memberId]);

    const member = useMemo(() => {
        if (userGlobal) {
            return {
                id: userGlobal.id,
                fullName: userGlobal.fullName || '',
                role: userGlobal.role,
                avatar: userGlobal.fullName ? userGlobal.fullName.charAt(0).toUpperCase() : 'U',
                tjm: 0
            };
        }
        for (const project of state.projects) {
            const found = (project.members || []).find(m => m.id === memberId);
            if (found) return found;
        }
        return null;
    }, [state.projects, memberId, userGlobal]);

    const memberProjects = useMemo(() => {
        const projs: { id: string; name: string; role: string }[] = [];
        state.projects.forEach(p => {
            const m = (p.members || []).find(m => m.id === memberId);
            if (m) projs.push({ id: p.id, name: p.name, role: m.role || 'TEAM_MEMBER' });
        });
        return projs;
    }, [state.projects, memberId]);

    const memberTasks = useMemo(() => {
        return state.tasks?.filter(t => t.assigneeId === memberId) || [];
    }, [state.tasks, memberId]);

    const importantTasks = useMemo(() => {
        return memberTasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
    }, [memberTasks]);

    // ─── TIME CALCULATIONS ───
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    const startOfWeek = (() => {
        const date = new Date(now);
        const day = date.getDay();
        date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    })();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Helper: compute effective minutes for a session (handles active AND paused sessions)
    const effectiveMinutes = (session: { startTime: string; status: string; durationMinutes: number; totalPauseMinutes: number; pauseStartTime?: string | null }) => {
        if (session.durationMinutes > 0) return session.durationMinutes;
        if (session.status === 'IN_PROGRESS' || session.status === 'PAUSED') {
            const elapsedMs = now.getTime() - new Date(session.startTime).getTime();
            let pauseMs = (session.totalPauseMinutes || 0) * 60000;
            // If currently paused, also count the ongoing pause duration
            if (session.status === 'PAUSED' && session.pauseStartTime) {
                pauseMs += now.getTime() - new Date(session.pauseStartTime).getTime();
            }
            return Math.max(0, Math.floor((elapsedMs - pauseMs) / 60000));
        }
        return 0;
    };

    let totalMinutesDaily = 0;
    let totalMinutesWeekly = 0;
    let totalMinutesMonthly = 0;

    history.forEach(session => {
        const sessionDate = new Date(session.startTime || session.date);
        const mins = effectiveMinutes(session);
        
        if (sessionDate.getFullYear() === y && sessionDate.getMonth() === m && sessionDate.getDate() === d) {
            totalMinutesDaily += mins;
        }
        if (sessionDate.getTime() >= startOfWeek) {
            totalMinutesWeekly += mins;
        }
        if (sessionDate.getTime() >= startOfMonth) {
            totalMinutesMonthly += mins;
        }
    });

    // If there's an active session NOT already in history (edge case), include it
    if (activeSession && !history.find(h => h.id === activeSession.id)) {
        const sessionDate = new Date(activeSession.startTime || activeSession.date);
        const mins = effectiveMinutes(activeSession);
        if (sessionDate.getFullYear() === y && sessionDate.getMonth() === m && sessionDate.getDate() === d) totalMinutesDaily += mins;
        if (sessionDate.getTime() >= startOfWeek) totalMinutesWeekly += mins;
        if (sessionDate.getTime() >= startOfMonth) totalMinutesMonthly += mins;
    }

    // ─── CHART DATA ───
    const chartData = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - (6 - i));
            
            const daySessions = history.filter(s => {
                const sd = new Date(s.startTime || s.date);
                return sd.getFullYear() === dateObj.getFullYear() && 
                       sd.getMonth() === dateObj.getMonth() && 
                       sd.getDate() === dateObj.getDate();
            });
            const totalMins = daySessions.reduce((acc, curr) => acc + effectiveMinutes(curr), 0);
            return {
                name: dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                heures: parseFloat((totalMins / 60).toFixed(1))
            };
        });
    }, [history]);

    // ─── LATENESS DETECTION ───
    const EXPECTED_START = "09:15:00";

    const enrichedHistory = useMemo(() => {
        return history.map(session => {
            const startTimeOnly = new Date(session.startTime).toTimeString().split(' ')[0];
            const earlierSessions = history.filter(
                s => s.date === session.date && new Date(s.startTime) < new Date(session.startTime)
            );
            let isLate = false;
            let lateMinutes = 0;
            if (earlierSessions.length === 0 && startTimeOnly > EXPECTED_START) {
                isLate = true;
                const actual = new Date(session.startTime);
                const expected = new Date(actual);
                expected.setHours(9, 0, 0, 0);
                lateMinutes = Math.floor((actual.getTime() - expected.getTime()) / 60000);
            }
            return { ...session, isLate, lateMinutes };
        }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [history]);

    // ─── TASK STATS ───
    const doneTasks = memberTasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = memberTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const taskPercent = memberTasks.length > 0 ? Math.round((doneTasks / memberTasks.length) * 100) : 0;
    const initials = (member?.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const gradient = memberId ? getGradient(memberId) : 'from-slate-400 to-slate-500';

    if (!member && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-lg font-semibold text-slate-700">{t('team_custom.member_not_found')}</h2>
                <button onClick={() => navigate('/team')} className="mt-4 text-indigo-600 font-medium flex items-center gap-2 text-sm">
                    <ArrowLeft className="w-4 h-4" /> {t('common.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f8f9fb]">
            {/* ─── HEADER ─── */}
            <div className="bg-white border-b border-slate-200/60">
                <div className="max-w-[1200px] mx-auto px-8 py-5">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                        <button onClick={() => navigate('/team')} className="hover:text-indigo-600 transition-colors">
                            {t('common.team')}
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-600">{member?.fullName}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{member?.fullName}</h1>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                                {ROLE_LABELS[member?.role || ''] || member?.role || t('team_custom.member')}
                                {memberProjects.length > 0 && (
                                    <span className="text-slate-300 mx-2">·</span>
                                )}
                                <span className="text-slate-400">{memberProjects.length} {memberProjects.length > 1 ? t('common.projects_plural') : t('common.project')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-8 py-8 space-y-8">

                {/* ─── STAT CARDS ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label={t('calendar_custom.today')} value={`${(totalMinutesDaily / 60).toFixed(1)}h`} icon={<Clock className="w-4 h-4" />} color="text-slate-700" />
                    <StatCard label={t('dashboard_custom.weekly_progress').split(' ')[0]} value={`${(totalMinutesWeekly / 60).toFixed(1)}h`} icon={<Calendar className="w-4 h-4" />} color="text-indigo-600" />
                    <StatCard label={t('common.this_month', { defaultValue: 'Ce Mois' })} value={`${(totalMinutesMonthly / 60).toFixed(1)}h`} icon={<TrendingUp className="w-4 h-4" />} color="text-emerald-600" />
                    <StatCard label={t('team_custom.completion', { defaultValue: 'Complétion' })} value={`${taskPercent}%`} icon={<Target className="w-4 h-4" />} color="text-blue-600" subtitle={`${doneTasks}/${memberTasks.length} ${t('team_custom.tasks').toLowerCase()}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ─── LEFT: CHART + POINTAGE ─── */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                            <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-500" />
                                {t('team_custom.hours_worked')}
                            </h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-8} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '13px' }}
                                            formatter={(value: any) => [`${value}h`, t('team_custom.hours')]}
                                        />
                                        <Line type="monotone" dataKey="heures" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pointage History */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-slate-400" />
                                    {t('team_custom.time_tracking_history')}
                                </h3>
                                <span className="text-[11px] font-medium text-slate-400">{enrichedHistory.length} {t('team_custom.sessions')}</span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {enrichedHistory.slice(0, 10).map(session => (
                                    <div key={session.id} className="grid grid-cols-[1fr_140px_80px_100px] gap-4 items-center px-6 py-3.5 text-sm">
                                        <div>
                                            <p className="font-medium text-slate-700">
                                                {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <div className="text-slate-500 text-xs font-medium">
                                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {' → '}
                                            {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </div>
                                        <div className="text-center font-semibold text-slate-700 text-xs">
                                            {(() => {
                                                const mins = effectiveMinutes(session);
                                                if (session.status === 'IN_PROGRESS') {
                                                    return <span className="text-indigo-500 animate-pulse">{(mins / 60).toFixed(1)}h ▶</span>;
                                                }
                                                if (session.status === 'PAUSED') {
                                                    return <span className="text-amber-500">{(mins / 60).toFixed(1)}h ⏸</span>;
                                                }
                                                return mins > 0 ? `${(mins / 60).toFixed(1)}h` : '—';
                                            })()}
                                        </div>
                                        <div className="flex justify-end">
                                            {session.isLate ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-semibold">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {t('team_custom.late', { count: session.lateMinutes })}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {t('team_custom.on_time')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {enrichedHistory.length === 0 && (
                                    <div className="py-12 text-center text-slate-400 text-sm">
                                        {t('team_custom.no_time_history')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: TASKS + PROJECTS ─── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Task Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-500" />
                                {t('team_custom.tasks')}
                            </h3>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${taskPercent}%` }} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{taskPercent}%</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center mb-5">
                                <div className="bg-slate-50 rounded-xl py-2">
                                    <p className="text-lg font-bold text-slate-800">{memberTasks.length}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{t('team_custom.total')}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl py-2">
                                    <p className="text-lg font-bold text-blue-600">{inProgressTasks}</p>
                                    <p className="text-[10px] text-blue-400 font-medium">{t('projects.task_status.IN_PROGRESS')}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl py-2">
                                    <p className="text-lg font-bold text-emerald-600">{doneTasks}</p>
                                    <p className="text-[10px] text-emerald-400 font-medium">{t('projects.task_status.DONE')}</p>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                {importantTasks.map(task => {
                                    const statusConf = STATUS_MAP[task.status] || STATUS_MAP.TODO;
                                    const prioConf = PRIORITY_MAP[task.priority] || PRIORITY_MAP.LOW;
                                    return (
                                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusConf.dot}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-medium ${statusConf.text}`}>{statusConf.label}</span>
                                                    <span className="text-slate-200">·</span>
                                                    <span className={`text-[10px] font-medium ${prioConf.color}`}>{prioConf.label}</span>
                                                    {task.dueDate && (
                                                        <>
                                                            <span className="text-slate-200">·</span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {importantTasks.length === 0 && (
                                    <p className="text-center text-slate-400 text-xs py-6">{t('team_custom.no_important_tasks')}</p>
                                )}
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-indigo-500" />
                                {t('team_custom.assigned_projects')}
                            </h3>
                            <div className="space-y-2">
                                {memberProjects.map(proj => (
                                    <button
                                        key={proj.id}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/${proj.id}`); }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100/50 hover:bg-indigo-50 hover:border-indigo-100 text-left transition-colors group"
                                    >
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">{proj.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{ROLE_LABELS[proj.role] || proj.role}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </button>
                                ))}
                                {memberProjects.length === 0 && (
                                    <p className="text-center text-slate-400 text-xs py-4">{t('team_custom.no_projects')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── STAT CARD ─── */
const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string; subtitle?: string }> = ({ label, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
            {icon}
            <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
        </div>
        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
);
