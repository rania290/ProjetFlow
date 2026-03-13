import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban, Plus, Users, CheckCircle2,
    Clock, AlertTriangle, Zap, Bot, ArrowUpRight,
    CalendarDays, Target, Activity
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { Project } from '../types/project.types';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    PLANNED: { label: 'Planifié', color: 'text-slate-500', bg: 'bg-slate-100' },
    IN_PROGRESS: { label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-50' },
    DELIVERED: { label: 'Livré', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    SUSPENDED: { label: 'Suspendu', color: 'text-red-500', bg: 'bg-red-50' },
};


const PRIORITY_BADGES = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const DashboardPage: React.FC = () => {
    const { state, dashboardStats, dispatch } = useStore();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const criticalTasks = state.tasks.filter(t => t.priority === 'CRITICAL' || (t.priority === 'HIGH' && t.status !== 'DONE'));

    return (
        <AppLayout title="Dashboard" subtitle={`Bienvenue dans votre espace ${state.workspaceName}`}>
            <div className="p-6 space-y-6">

                {/* ===== KPI CARDS ===== */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Projets total', value: dashboardStats.totalProjects, icon: <FolderKanban className="w-5 h-5" />, color: 'text-indigo-600', bg: 'from-indigo-500 to-primary-600', lightBg: 'bg-indigo-50', border: 'border-indigo-100', shadow: 'shadow-indigo-100' },
                        { label: 'En cours', value: dashboardStats.activeProjects, icon: <Activity className="w-5 h-5" />, color: 'text-blue-600', bg: 'from-blue-500 to-cyan-500', lightBg: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-100' },
                        { label: 'Tâches', value: dashboardStats.totalTasks, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-slate-600', bg: 'from-slate-500 to-slate-600', lightBg: 'bg-slate-50', border: 'border-slate-200', shadow: 'shadow-slate-100' },
                        { label: 'Terminées', value: dashboardStats.completedTasks, icon: <Target className="w-5 h-5" />, color: 'text-emerald-600', bg: 'from-emerald-500 to-teal-500', lightBg: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-100' },
                        { label: 'Membres', value: dashboardStats.teamMembers, icon: <Users className="w-5 h-5" />, color: 'text-violet-600', bg: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-100' },
                        { label: 'Échéances', value: dashboardStats.upcomingDeadlines, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-100' },
                    ].map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`bg-white rounded-2xl p-4 border ${kpi.border} shadow-sm ${kpi.shadow} hover:shadow-lg transition-all group`}
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.bg} flex items-center justify-center mb-3 shadow-sm text-white group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                            <div className={`text-2xl font-bold font-display ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-xs text-slate-400 mt-0.5 font-medium">{kpi.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== PROJETS ===== */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">Mes projets</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
                            >
                                <Plus className="w-3.5 h-3.5" /> Nouveau projet
                            </button>
                        </div>

                        <div className="space-y-3">
                            {state.projects.map((p, i) => (
                                <ProjectRow key={p.id} project={p} index={i} onOpen={() => {
                                    dispatch({ type: 'SELECT_PROJECT', id: p.id });
                                    navigate(`/projects/${p.id}`);
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN ===== */}
                    <div className="space-y-4">

                        {/* Aura AI */}
                        <div className="bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm">Aura IA</span>
                                <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">En ligne</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    'Sprint 1 se termine dans 4 jours — 2 tâches non assignées',
                                    'Portail Client à 62% — en avance sur le planning',
                                    'Bug critique non assigné depuis 2 jours',
                                ].map((msg, i) => (
                                    <div key={i} className="text-[11px] text-white/85 bg-white/10 rounded-xl px-3 py-2 leading-relaxed">
                                        {msg}
                                    </div>
                                ))}
                            </div>
                            <button className="mt-3 w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold">
                                Ouvrir Aura →
                            </button>
                        </div>

                        {/* Tâches urgentes */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Tâches urgentes
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
                                                        {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activité récente */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50">
                                <Zap className="w-4 h-4 text-primary-500" />
                                <span className="text-sm font-bold text-slate-800">Activité récente</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {[
                                    { action: 'Tâche terminée', desc: 'Refonte page accueil', time: 'Il y a 1h', avatar: 'KM', color: 'bg-emerald-500' },
                                    { action: 'Sprint démarré', desc: 'Sprint 1 – Portail Client', time: 'Il y a 3h', avatar: 'RB', color: 'bg-primary-500' },
                                    { action: 'Bug signalé', desc: 'Bouton CTA mobile', time: 'Il y a 5h', avatar: 'SL', color: 'bg-red-500' },
                                    { action: 'Tâche assignée', desc: 'OAuth Google → Adam T.', time: 'Hier', avatar: 'RB', color: 'bg-primary-500' },
                                ].map((a, i) => (
                                    <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                        <div className={`w-6 h-6 rounded-full ${a.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                                            {a.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-slate-700">{a.action}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{a.desc}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 flex-shrink-0">{a.time}</span>
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
                    <CreateProjectModal onClose={() => setShowCreateModal(false)} />
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

// ===== PROJECT ROW CARD =====
const ProjectRow: React.FC<{ project: Project; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
    const { label, color, bg } = STATUS_LABELS[project.status];
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
                                Vue {project.viewMode}
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
                                <span>Avancement</span>
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
                                <span className="text-[10px] text-slate-400">0 membre</span>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400">Budget</p>
                            <p className="text-xs font-bold text-slate-700">{project.budget.toLocaleString()} €</p>
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
