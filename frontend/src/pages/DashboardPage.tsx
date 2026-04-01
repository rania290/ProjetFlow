import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban, Plus, Users, CheckCircle2,
    Clock, AlertTriangle, Zap, Bot, ArrowUpRight,
    CalendarDays, Target, Activity, Sparkles
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { Project } from '../types/project.types';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
                        { label: 'Projets total', value: dashboardStats.totalProjects, icon: <FolderKanban />, color: 'text-indigo-600' },
                        { label: 'En cours', value: dashboardStats.activeProjects, icon: <Activity />, color: 'text-blue-600' },
                        { label: 'Tâches', value: dashboardStats.totalTasks, icon: <CheckCircle2 />, color: 'text-slate-600' },
                        { label: 'Terminées', value: dashboardStats.completedTasks, icon: <Target />, color: 'text-emerald-600' },
                        { label: 'Membres', value: dashboardStats.teamMembers, icon: <Users />, color: 'text-violet-600' },
                        { label: 'Échéances', value: dashboardStats.upcomingDeadlines, icon: <Clock />, color: 'text-amber-600' },
                    ].map((kpi, i) => (
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
                            <h2 className="text-base font-bold text-slate-800">Mes projets</h2>
                            <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Nouveau projet
                            </Button>
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
                        <Card className="bg-slate-900 text-white overflow-hidden shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                       <Bot className="w-4 h-4 text-indigo-400" />
                                   </div>
                                   <CardTitle className="text-sm">Aura IA</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">En ligne</Badge>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {[
                                    'Sprint 1 se termine dans 4 jours — 2 tâches non assignées',
                                    'Portail Client à 62% — en avance sur le planning',
                                    'Bug critique non assigné depuis 2 jours',
                                ].map((msg, i) => (
                                    <div key={i} className="text-xs text-slate-300 bg-white/5 rounded-lg px-3 py-2 leading-relaxed border border-white/5">
                                        {msg}
                                    </div>
                                ))}
                                <Button className="w-full mt-2" variant="secondary" size="sm">Ouvrir Aura &rarr;</Button>
                            </CardContent>
                        </Card>

                        {/* Portail Client Shortcut */}
                        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm shadow-indigo-50 group hover:border-indigo-300 transition-all cursor-pointer"
                            onClick={() => navigate('/client-portal')}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm text-slate-800">Portail Client</span>
                                <ArrowUpRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Accédez à l'interface dédiée pour vos clients. Validez les livrables et gérez le support.
                            </p>
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
