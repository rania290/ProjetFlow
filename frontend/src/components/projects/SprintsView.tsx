import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Zap, 
    Play, 
    Calendar, 
    CheckSquare, 
    Activity,
    TrendingUp,
    Clock,
    AlertCircle,
    Circle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Task, Sprint, TaskStatus, TaskPriority, TaskType } from '@/types/project.types';

// ===== CONSTANTS =====
const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string; headerBg: string; dot: string }[] = [
    { id: 'TODO', label: 'À faire', color: 'text-slate-500', headerBg: 'bg-slate-50', dot: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'En cours', color: 'text-blue-600', headerBg: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'IN_TEST', label: 'En test', color: 'text-violet-600', headerBg: 'bg-violet-50', dot: 'bg-violet-500' },
    { id: 'DONE', label: 'Terminé', color: 'text-emerald-600', headerBg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    CRITICAL: { label: 'Critique', dot: 'bg-red-500', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3 h-3 text-red-500" /> },
    HIGH: { label: 'Haute', dot: 'bg-orange-500', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <TrendingUp className="w-3 h-3 text-orange-500" /> },
    MEDIUM: { label: 'Moyenne', dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Circle className="w-3 h-3 text-amber-500" /> },
    LOW: { label: 'Basse', dot: 'bg-blue-400', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Clock className="w-3 h-3 text-blue-500" /> },
};

const TYPE_CONFIG: Record<TaskType, { label: string; icon: React.ReactNode }> = {
    STORY: { label: 'Story', icon: <div className="w-5 h-5 bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black rounded-md">S</div> },
    TASK: { label: 'Tâche', icon: <div className="w-5 h-5 bg-slate-100 text-slate-500 flex items-center justify-center rounded-md"><CheckSquare className="w-3 h-3" /></div> },
    BUG: { label: 'Bug', icon: <div className="w-5 h-5 bg-red-100 text-red-500 flex items-center justify-center rounded-md"><AlertCircle className="w-3 h-3" /></div> },
    IMPROVEMENT: { label: 'Amélioration', icon: <div className="w-5 h-5 bg-violet-100 text-violet-500 flex items-center justify-center rounded-md"><TrendingUp className="w-3 h-3" /></div> },
};

// ===== HELPER COMPONENT =====
const CircularProgress = ({ value, max, colorClass, gradientFrom, gradientTo }: { value: number, max: number, colorClass: string, gradientFrom: string, gradientTo: string }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const percentage = max > 0 ? Math.min(1, value / max) : 0;
    const strokeDashoffset = circumference - percentage * circumference;
    
    return (
        <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
                <defs>
                    <linearGradient id={`grad-${gradientFrom.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={gradientFrom} />
                        <stop offset="100%" stopColor={gradientTo} />
                    </linearGradient>
                </defs>
                <circle cx="28" cy="28" r={radius} className="stroke-slate-100" strokeWidth="4" fill="none" />
                <circle 
                    cx="28" 
                    cy="28" 
                    r={radius} 
                    stroke={`url(#grad-${gradientFrom.replace('#','')})`}
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[11px] font-black ${colorClass}`}>{Math.round(percentage * 100)}%</span>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
interface SprintsViewProps {
    sprints: Sprint[];
    projectTasks: Task[];
    onCreateSprint: () => void;
    onActivateSprint: (id: string) => void;
    onCloseSprint: (id: string) => void;
    onViewReport: (id: string) => void;
}

export const SprintsView: React.FC<SprintsViewProps> = ({ 
    sprints, 
    projectTasks, 
    onCreateSprint, 
    onActivateSprint, 
    onCloseSprint,
    onViewReport
}) => {
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PLANNED' | 'COMPLETED'>('ALL');
    const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

    const activeSprints = (sprints || []).filter((s) => s.status === 'ACTIVE');
    const activeSprintIds = new Set(activeSprints.map((s) => s.id));
    const activeTasks = (projectTasks || []).filter((t) => t.sprintId && activeSprintIds.has(t.sprintId));
    const activePoints = activeTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedSprints);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedSprints(next);
    };

    const getWeekNumber = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    const filteredSprints = (sprints || []).filter(s => filter === 'ALL' ? true : s.status === filter);
    const sortedSprints = [...filteredSprints].sort((a, b) => {
        const order = { 'ACTIVE': 0, 'PLANNED': 1, 'COMPLETED': 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full font-sans">
            
            {/* PREMIUM HEADER */}
            <div className="relative overflow-hidden bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transform hover:scale-105 transition-transform">
                            <Zap className="w-6 h-6 fill-white/20" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Gestion des Sprints</h2>
                            <p className="text-sm font-medium text-slate-500">Planifiez et exécutez vos cycles de développement avec précision</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 xl:gap-8">
                        <div className="flex gap-8 px-0 sm:px-8 sm:border-r border-slate-200">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sprints Actifs</span>
                                <span className="text-2xl font-black text-indigo-600 leading-none">{activeSprints.length}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points en cours</span>
                                <span className="text-2xl font-black text-slate-800 leading-none">{activePoints}</span>
                            </div>
                        </div>
                        
                        <Button
                            onClick={onCreateSprint}
                            className="h-12 px-6 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-xl shadow-slate-900/20 flex items-center gap-2 border-none transform hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Nouveau Sprint
                        </Button>
                    </div>
                </div>
            </div>



            {/* SPRINTS LIST */}
            <div className="space-y-6">
                {sortedSprints.length === 0 ? (
                    <Card className="bg-white rounded-3xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center shadow-sm border-dashed">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
                            <Zap className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Aucun sprint trouvé</h3>
                        <p className="text-sm text-slate-400 max-w-[320px] leading-relaxed">
                            {filter === 'ALL' 
                                ? "Commencez par créer votre premier sprint pour organiser votre travail."
                                : "Aucun sprint ne correspond à ce statut actuellement."}
                        </p>
                    </Card>
                ) : (
                    sortedSprints.map((sprint, idx) => {
                        const sprintTasks = (projectTasks || []).filter(t => t.sprintId === sprint.id);
                        const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                        const donePoints = sprintTasks.filter(t => t.status === 'DONE').reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                        const capacity = sprint.capacity || 0;
                        
                        const start = new Date(sprint.startDate);
                        const end = new Date(sprint.endDate);
                        const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
                        const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
                        
                        const isExpanded = expandedSprints.has(sprint.id) || (sprint.status === 'ACTIVE' && idx === 0);

                        return (
                            <motion.div 
                                key={sprint.id} 
                                initial={{ opacity: 0, y: 30 }} 
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24, delay: idx * 0.05 }}
                            >
                                <Card className={cn(
                                    "bg-white rounded-3xl border shadow-lg overflow-hidden transition-all duration-500 relative",
                                    sprint.status === 'ACTIVE' ? 'border-indigo-200 ring-4 ring-indigo-500/10 shadow-indigo-500/10' : 'border-slate-200/60 shadow-slate-200/30 hover:shadow-xl hover:border-slate-300'
                                )}>
                                    {sprint.status === 'ACTIVE' && (
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
                                    )}
                                    
                                    <div className="p-6 md:p-8 relative z-10">
                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                                            
                                            {/* Left Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{sprint.name}</h3>
                                                    <Badge className={cn(
                                                        "text-[10px] font-black px-3 py-1.5 rounded-xl border-none uppercase tracking-widest",
                                                        sprint.status === 'ACTIVE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 
                                                        sprint.status === 'PLANNED' ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-200'
                                                    )}>
                                                        {sprint.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2 inline-block" />}
                                                        {sprint.status === 'ACTIVE' ? 'ACTIF' : sprint.status === 'PLANNED' ? 'PLANIFIÉ' : 'TERMINÉ'}
                                                    </Badge>
                                                </div>
                                                
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-3xl">{sprint.goal}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                                        {start.toLocaleDateString('fr-FR')} <span className="text-slate-300">→</span> {end.toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                                                        Durée: {durationDays} jours
                                                    </div>
                                                    {sprint.status === 'ACTIVE' && daysLeft > 0 && (
                                                        <div className={cn(
                                                            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all",
                                                            daysLeft <= 3 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-200'
                                                        )}>
                                                            <Clock className="w-4 h-4" />
                                                            {daysLeft} jours restants
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Metrics & Actions */}
                                            <div className="flex flex-wrap md:flex-nowrap items-center gap-6 xl:gap-10 xl:border-l xl:border-slate-100 xl:pl-10">
                                                {sprint.status !== 'COMPLETED' && capacity > 0 && (
                                                    <div className="flex items-center gap-4">
                                                        <CircularProgress 
                                                            value={totalPoints} 
                                                            max={capacity} 
                                                            colorClass={totalPoints > capacity ? 'text-red-500' : 'text-indigo-600'} 
                                                            gradientFrom={totalPoints > capacity ? '#ef4444' : '#6366f1'} 
                                                            gradientTo={totalPoints > capacity ? '#f87171' : '#a855f7'} 
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charge</span>
                                                            <span className="text-sm font-black text-slate-900">{totalPoints} <span className="text-slate-400 text-xs">/ {capacity} pts</span></span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-4">
                                                    <CircularProgress 
                                                        value={donePoints} 
                                                        max={totalPoints} 
                                                        colorClass="text-emerald-500" 
                                                        gradientFrom="#10b981" 
                                                        gradientTo="#34d399" 
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complétion</span>
                                                        <span className="text-sm font-black text-slate-900">{donePoints} <span className="text-slate-400 text-xs">/ {totalPoints} pts</span></span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    {sprint.status === 'PLANNED' && (
                                                        <Button
                                                            onClick={() => onActivateSprint(sprint.id)}
                                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-bold h-10 border-none transition-transform active:scale-95"
                                                        >
                                                            <Play className="w-4 h-4 mr-2 fill-current" /> Démarrer
                                                        </Button>
                                                    )}
                                                    {sprint.status === 'ACTIVE' && (
                                                        <Button
                                                            onClick={() => onCloseSprint(sprint.id)}
                                                            className="w-full bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 rounded-xl font-bold h-10 border-none transition-transform active:scale-95"
                                                        >
                                                            <CheckSquare className="w-4 h-4 mr-2" /> Clôturer
                                                        </Button>
                                                    )}
                                                    {sprint.status === 'COMPLETED' && (
                                                        <Button
                                                            onClick={() => onViewReport(sprint.id)}
                                                            variant="outline"
                                                            className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold h-10"
                                                        >
                                                            Voir Rapport
                                                        </Button>
                                                    )}
                                                    
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleExpand(sprint.id)}
                                                        className="w-full text-slate-400 hover:text-slate-600 rounded-xl text-xs font-bold"
                                                    >
                                                        {isExpanded ? (
                                                            <><ChevronUp className="w-3 h-3 mr-1" /> Masquer tâches</>
                                                        ) : (
                                                            <><ChevronDown className="w-3 h-3 mr-1" /> Voir {sprintTasks.length} tâches</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable Task List */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                                        {sprintTasks.length === 0 ? (
                                                            <div className="py-8 text-center flex flex-col items-center justify-center">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                                                                    <CheckSquare className="w-6 h-6 text-slate-300" />
                                                                </div>
                                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aucune tâche dans ce sprint</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {sprintTasks.map(task => {
                                                                    const p = PRIORITY_CONFIG[task.priority];
                                                                    const t = TYPE_CONFIG[task.type];
                                                                    const statusCol = STATUS_COLUMNS.find(c => c.id === task.status);
                                                                    return (
                                                                        <div key={task.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all group">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex gap-3 items-start">
                                                                                    <div className="shrink-0 mt-0.5">{t.icon}</div>
                                                                                    <span className="text-[13px] text-slate-700 font-bold leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", statusCol?.headerBg, statusCol?.color)}>
                                                                                        {statusCol?.label}
                                                                                    </div>
                                                                                    {Number(task.storyPoints ?? 0) > 0 && (
                                                                                        <div className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">
                                                                                            {task.storyPoints} pts
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {task.assigneeAvatar ? (
                                                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[9px] font-black border-2 border-white shadow-sm" title={task.assigneeName}>
                                                                                        {task.assigneeAvatar}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white border-dashed" />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
