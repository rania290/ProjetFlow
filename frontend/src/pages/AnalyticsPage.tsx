import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, BarChart3, Users,
    CheckCircle2, Target, Printer,
    AlertCircle, Loader2, AlertTriangle, Clock
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import { reportingService, type GlobalAnalytics } from '../api/reporting.service';

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
    const { state } = useStore();
    const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
    const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

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
            <AppLayout title="Reporting & Analytics">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Chargement des données réelles...</p>
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
    // For now we use the summary data, but we can compute more if needed.
    let globalConsumedBudget = totalBudget * (completionRate / 100); 
    let globalEstimatedCost = totalBudget * 0.8; // Example fallback until cost details from backend implementation

    // Mock burndown data (kept for UI aesthetics until backend supports historical data)
    const burndownData = [
        { day: 1, remaining: 55, ideal: 55 },
        { day: 3, remaining: 52, ideal: 47 },
        { day: 5, remaining: 45, ideal: 39 },
        { day: 7, remaining: 40, ideal: 31 },
        { day: 9, remaining: 38, ideal: 23 },
        { day: 11, remaining: 30, ideal: 15 },
        { day: 13, remaining: 24, ideal: 7 },
        { day: 14, remaining: 18, ideal: 0 },
    ];

    // Velocity based on real completion if available
    const velocityData = [
        { sprint: 'S-3', points: 34 },
        { sprint: 'S-2', points: 42 },
        { sprint: 'S-1', points: 38 },
        { sprint: 'S Actuel', points: summary.tasksByStatus.DONE * 2 }, // Approximation
    ];
    const maxVelocity = Math.max(...velocityData.map(v => v.points));

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <AppLayout title="Reporting & Analytics" subtitle="Vue globale des performances et métriques">
            <div className="p-6 space-y-6">

                {/* Period selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        {(['week', 'month', 'quarter'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Trimestre'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-sm print:hidden">
                            <Printer className="w-3.5 h-3.5" /> Exporter PDF
                        </button>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Budget total', value: `${(totalBudget / 1000).toFixed(0)}k DT`, sub: `${summary.totalProjects} projets actifs`, icon: <Target className="w-5 h-5" />, color: 'from-amber-500 to-amber-600' },
                        { label: '% Réalisé Global', value: `${completionRate}%`, sub: `${tasksByStatus.DONE}/${summary.totalTasks} tâches`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-primary-500 to-primary-600' },
                        { label: 'Volume de Tâches', value: `${summary.totalTasks}`, sub: `${tasksByStatus.IN_PROGRESS} en cours`, icon: <TrendingUp className="w-5 h-5" />, color: 'from-violet-500 to-violet-600' },
                        { label: 'Alertes Critiques', value: `${(summary as any).criticalTasksCount || 0}`, sub: `${(summary as any).delayedTasksCount || 0} en retard`, icon: <AlertTriangle className="w-5 h-5" />, color: (summary as any).criticalTasksCount > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600' },
                        { label: 'Intervenants', value: `${resources.length}`, sub: `Équipe active`, icon: <Users className="w-5 h-5" />, color: 'from-blue-400 to-blue-500' },
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
                                <h3 className="text-sm font-bold text-slate-800">Burndown Chart – Sprint 1</h3>
                                <p className="text-[11px] text-slate-400">Évolution des story points restants</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-primary-500 rounded" /> Réel</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-slate-300 rounded border-dashed border" style={{ borderStyle: 'dashed' }} /> Idéal</div>
                            </div>
                        </div>

                        {/* SVG Burndown */}
                        <div className="relative h-48">
                            <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5c7cfa" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#5c7cfa" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                {[0, 25, 50, 75, 100].map((v, i) => (
                                    <g key={v}>
                                        <line x1="0" y1={i * 36} x2="600" y2={i * 36} stroke="#f1f5f9" strokeWidth="1" />
                                        <text x="0" y={i * 36 - 4} fontSize="10" fill="#94a3b8">{100 - v * 0.55}</text>
                                    </g>
                                ))}
                                {/* Ideal line */}
                                <path
                                    d={`M ${burndownData.map(d => `${(d.day / 14) * 600},${((55 - d.ideal) / 55) * 160}`).join(' L ')}`}
                                    stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="6,4"
                                />
                                {/* Real area */}
                                <path
                                    d={`M ${burndownData.map(d => `${(d.day / 14) * 600},${((55 - d.remaining) / 55) * 160}`).join(' L ')} L 600,160 L 0,160 Z`}
                                    fill="url(#burnGrad)"
                                />
                                {/* Real line */}
                                <path
                                    d={`M ${burndownData.map(d => `${(d.day / 14) * 600},${((55 - d.remaining) / 55) * 160}`).join(' L ')}`}
                                    stroke="#5c7cfa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
                                />
                                {/* Dots */}
                                {burndownData.map(d => (
                                    <circle key={d.day}
                                        cx={(d.day / 14) * 600}
                                        cy={((55 - d.remaining) / 55) * 160}
                                        r="3.5" fill="#5c7cfa" stroke="white" strokeWidth="2"
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* ===== TASK STATUS PIE ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Répartition des tâches</h3>
                        <p className="text-[11px] text-slate-400 mb-5">Par statut dans tous les projets</p>

                        {/* Donut SVG */}
                        <div className="flex justify-center mb-5">
                            <DonutChart data={[
                                { label: 'À faire', value: tasksByStatus.TODO, color: '#94a3b8' },
                                { label: 'En cours', value: tasksByStatus.IN_PROGRESS, color: '#5c7cfa' },
                                { label: 'En test', value: tasksByStatus.IN_TEST, color: '#a78bfa' },
                                { label: 'Terminé', value: tasksByStatus.DONE, color: '#10b981' },
                            ]} />
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'À faire', value: tasksByStatus.TODO, color: 'bg-slate-400' },
                                { label: 'En cours', value: tasksByStatus.IN_PROGRESS, color: 'bg-primary-500' },
                                { label: 'En test', value: tasksByStatus.IN_TEST, color: 'bg-violet-500' },
                                { label: 'Terminé', value: tasksByStatus.DONE, color: 'bg-emerald-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2.5">
                                    <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                                    <span className="text-xs text-slate-600 flex-1">{item.label}</span>
                                    <span className="text-xs font-bold text-slate-800">{item.value}</span>
                                    <span className="text-[10px] text-slate-400 w-8 text-right">
                                        {Math.round((item.value / Math.max(state.tasks.length, 1)) * 100)}%
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
                            <h3 className="text-sm font-bold text-slate-800">Vélocité de l'équipe</h3>
                            <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">4 derniers sprints</span>
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
                            <span>Vélocité moyenne</span>
                            <span className="font-bold text-slate-800">{Math.round(velocityData.reduce((a, v) => a + v.points, 0) / velocityData.length)} pts/sprint</span>
                        </div>
                    </div>

                    {/* ===== PROJECTS PROGRESS & FINANCES ===== */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">

                        {/* Progress Tracker — Avancement par projet actif */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold text-slate-800">Avancement par projet actif</h3>
                                <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{projects.length} projets</span>
                            </div>
                            {projects.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs italic">Aucun projet actif trouvé.</div>
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
                                                        {p.status === 'IN_PROGRESS' ? 'EN COURS' : p.status === 'COMPLETED' ? 'TERMINÉ' : p.status === 'SUSPENDED' ? 'SUSPENDU' : p.status || 'PLANIFIÉ'}
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
                                                <span>{(p as any).doneTasks || 0}/{(p as any).totalTasks || 0} tâches terminées</span>
                                                <span>{Number(p.budget || 0).toLocaleString('fr-FR')} DT alloué</span>
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
                                    <h3 className="text-sm font-bold text-slate-800">Santé Financière du Portefeuille</h3>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                    Temps Réel
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
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Budget Alloué</p>
                                                <p className="text-lg font-black text-slate-900">{(totalBudget / 1000).toFixed(0)}k <span className="text-sm font-semibold text-slate-400">DT</span></p>
                                            </div>

                                            {/* Dépensé */}
                                            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-10 group-hover:bg-amber-100 transition-colors" />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Consommé</p>
                                                <p className="text-lg font-black text-slate-900">{(consumedBudget / 1000).toFixed(1)}k <span className="text-sm font-semibold text-slate-400">DT</span></p>
                                            </div>

                                            {/* Reste à allouer */}
                                            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors" />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Reste (Disponible)</p>
                                                <p className="text-lg font-black text-slate-900">{((totalBudget - consumedBudget) / 1000).toFixed(1)}k <span className="text-sm font-semibold text-slate-400">DT</span></p>
                                            </div>

                                            {/* Prévisionnel (Marge) */}
                                            <div className={`bg-white rounded-xl p-3 border shadow-sm relative overflow-hidden group transition-colors ${isOverBudget ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-purple-200'}`}>
                                                <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full -z-10 transition-colors ${isOverBudget ? 'bg-red-50 group-hover:bg-red-100' : 'bg-purple-50 group-hover:bg-purple-100'}`} />
                                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Marge Estimée</p>
                                                <p className={`text-lg font-black ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>{Math.abs(margin / 1000).toFixed(1)}k <span className="text-sm font-semibold opacity-50">DT</span></p>
                                            </div>
                                        </div>

                                        {/* Burn Rate Bar */}
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Burn Rate</div>
                                                    <div className="text-xs font-semibold text-slate-700">Vitesse de consommation</div>
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
                                                        Attention : La projection actuelle dépasse le budget alloué d'environ {Math.abs(margin / 1000).toFixed(1)}k DT.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cost Efficiency */}
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                                            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Moyenne TJM (Taux Journalier)</span>
                                            <span className="font-bold text-slate-700">{DEFAULT_TJM} DT / Jour</span>
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
                        <h3 className="text-sm font-bold text-slate-800">Charge par ressource</h3>
                        <span className="ml-auto text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">Toutes équipes</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {resources.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                Aucun membre d'équipe assigné aux projets actifs.
                            </div>
                        ) : resources.map((member, i) => {
                            const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            return (
                                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm relative group/avatar`}>
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
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">tâches</p>
                                    </div>
                                <div className="w-16 text-center">
                                    <p className="text-xs font-bold text-primary-600">{Math.round(member.assignedPoints)}</p>
                                    <p className="text-[9px] text-slate-400">points</p>
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
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) return <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">Vide</div>;

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
            <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8">tâches</text>
        </svg>
    );
};
