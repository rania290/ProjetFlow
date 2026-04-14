import React from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, 
    Zap, 
    Play, 
    Archive, 
    Calendar, 
    CheckSquare, 
    Search, 
    Activity,
    TrendingUp,
    Clock,
    AlertCircle,
    Circle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    STORY: { label: 'Story', icon: <div className="w-4 h-4 bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold rounded">S</div> },
    TASK: { label: 'Tâche', icon: <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> },
    BUG: { label: 'Bug', icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" /> },
    IMPROVEMENT: { label: 'Amélioration', icon: <TrendingUp className="w-3.5 h-3.5 text-violet-400 rotate-45" /> },
};

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
    const activeSprints = (sprints || []).filter((s) => s.status === 'ACTIVE');
    const activeSprintIds = new Set(activeSprints.map((s) => s.id));
    const activeTasks = (projectTasks || []).filter((t) => t.sprintId && activeSprintIds.has(t.sprintId));
    const activePoints = activeTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);

    const getWeekNumber = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Gestion des Sprints</h2>
                            <p className="text-[13px] font-medium text-slate-500">Planifiez et exécutez vos cycles de développement</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-lg text-[11px] font-bold uppercase tracking-widest px-3">
                            {activeSprints.length > 0 ? `${activeSprints.length} Actif(s)` : 'Aucun actif'}
                        </Badge>
                        <p className="text-[11px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">
                            {activeTasks.length} tâches · {activePoints} pts
                        </p>
                    </div>
                    <Button
                        onClick={onCreateSprint}
                        className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 border-none transform hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Nouveau Sprint
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {(!sprints || sprints.length === 0) ? (
                    <Card className="bg-white rounded-3xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center shadow-sm border-dashed">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
                            <Zap className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun sprint n'a encore été créé</h3>
                        <p className="text-sm text-slate-400 max-w-[320px] leading-relaxed">
                            Les sprints vous aident à organiser votre travail en blocs de temps définis. Commencez par créer votre premier sprint !
                        </p>
                    </Card>
                ) : (
                    sprints.map(sprint => {
                        const sprintTasks = (projectTasks || []).filter(t => t.sprintId === sprint.id);
                        const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                        const donePoints = sprintTasks.filter(t => t.status === 'DONE').reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                        const capacity = sprint.capacity || 0;
                        const capacityPercentage = capacity > 0 ? Math.min(100, (totalPoints / capacity) * 100) : 0;
                        const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
                        const start = new Date(sprint.startDate);
                        const end = new Date(sprint.endDate);
                        const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
                        const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
                        const weekStart = getWeekNumber(start);
                        const weekEnd = getWeekNumber(end);

                        return (
                            <motion.div 
                                key={sprint.id} 
                                initial={{ opacity: 0, y: 30 }} 
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                className="group"
                            >
                                <Card className={cn(
                                    "bg-white rounded-2xl border shadow-lg shadow-slate-200/10 overflow-hidden hover:shadow-xl transition-all duration-500 relative",
                                    sprint.status === 'ACTIVE' ? 'border-indigo-200/60 ring-2 ring-indigo-500/10' : 'border-slate-200/60'
                                )}>
                                    {sprint.status === 'ACTIVE' && (
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-100 to-transparent opacity-60 rounded-bl-full pointer-events-none" />
                                    )}
                                    <div className={cn(
                                        "px-5 py-4 border-b border-slate-100 transition-colors relative z-10",
                                        sprint.status === 'ACTIVE' ? 'bg-gradient-to-r from-indigo-500/5 to-transparent' : ''
                                    )}>
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-2 mb-1.5">
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{sprint.name}</h3>
                                                    <Badge className={cn(
                                                        "text-[10px] font-black px-3 py-1 rounded-xl border border-transparent shadow-[inset_0_1px_rgba(255,255,255,0.2)]",
                                                        sprint.status === 'ACTIVE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-emerald-500/30' : 
                                                        sprint.status === 'PLANNED' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-200'
                                                    )}>
                                                        {sprint.status === 'ACTIVE' && <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2 inline-block" />}
                                                        {sprint.status === 'ACTIVE' ? 'ACTIF' : sprint.status === 'PLANNED' ? 'PLANIFIÉ' : 'TERMINÉ'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl line-clamp-2">{sprint.goal}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                                        {start.toLocaleDateString('fr-FR')} → {end.toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        {durationDays} jours · Semaine {weekStart}{weekStart !== weekEnd ? `-${weekEnd}` : ''}
                                                    </div>
                                                    {sprint.status === 'ACTIVE' && daysLeft > 0 && (
                                                        <div className={cn(
                                                            "flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-xl border shadow-sm transition-all",
                                                            daysLeft <= 3 ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                        )}>
                                                            <Activity className="w-4 h-4" />
                                                            {daysLeft} jours restants
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {sprint.status === 'PLANNED' && (
                                                    <Button
                                                        onClick={() => onActivateSprint(sprint.id)}
                                                        className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 border-none transform active:scale-95 transition-all"
                                                    >
                                                        <Play className="w-4 h-4 fill-current" /> Démarrer
                                                    </Button>
                                                )}
                                                {sprint.status === 'ACTIVE' && (
                                                    <Button
                                                        onClick={() => onCloseSprint(sprint.id)}
                                                        className="h-9 px-3.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all border-none flex items-center gap-1.5 transform active:scale-95"
                                                    >
                                                        <CheckSquare className="w-4 h-4" /> Clôturer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            {/* Charge vs Capacité */}
                                            {sprint.status !== 'COMPLETED' && capacity > 0 && (
                                                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/50 flex flex-col gap-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Charge vs Capacité
                                                        </span>
                                                        <div className="text-right">
                                                            <span className={cn(
                                                                "text-lg font-black block leading-none",
                                                                totalPoints > capacity ? 'text-red-600' : 'text-slate-900'
                                                            )}>
                                                                {totalPoints} <span className="text-[10px] text-slate-400 font-bold">/ {capacity} pts</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-1000",
                                                                totalPoints > capacity ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                            )}
                                                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Progression du Terminé */}
                                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/50 flex flex-col gap-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Avancement
                                                    </span>
                                                    <div className="text-right">
                                                        <span className={cn(
                                                            "text-lg font-black block leading-none",
                                                            completionRate > 0 ? 'text-slate-900' : 'text-slate-400'
                                                        )}>
                                                            {donePoints} <span className="text-[10px] text-slate-400 font-bold">/ {totalPoints} pts</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                                                            style={{ width: `${completionRate}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-600 min-w-[36px] text-right">{completionRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task List Preview */}
                                    <div className="divide-y divide-slate-50 bg-white">
                                        {sprintTasks.length === 0 ? (
                                            <div className="py-4 text-center flex flex-col items-center justify-center">
                                                <svg width="48" height="38" viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 opacity-50">
                                                    <rect x="9" y="7" width="54" height="42" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
                                                    <rect x="18" y="17" width="6" height="6" rx="1.5" stroke="#94A3B8" />
                                                    <path d="M19.5 20.2L21.2 21.8L24 18.9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                                                    <rect x="28" y="18" width="24" height="2.5" rx="1.25" fill="#CBD5E1" />
                                                    <rect x="18" y="29" width="6" height="6" rx="1.5" stroke="#94A3B8" />
                                                    <rect x="28" y="30" width="18" height="2.5" rx="1.25" fill="#CBD5E1" />
                                                </svg>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucune tâche dans ce sprint</p>
                                            </div>
                                        ) : (
                                            sprintTasks.map(task => {
                                                const p = PRIORITY_CONFIG[task.priority];
                                                const t = TYPE_CONFIG[task.type];
                                                const statusCol = STATUS_COLUMNS.find(c => c.id === task.status);
                                                return (
                                                    <div key={task.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50/70 transition-all group border-none">
                                                        <span className="shrink-0 group-hover:scale-110 transition-transform">{t.icon}</span>
                                                            <span className="flex-1 text-[13px] text-slate-700 font-semibold truncate group-hover:text-primary-600 cursor-pointer">{task.title}</span>
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            {Number(task.storyPoints ?? 0) > 0 && (
                                                                <Badge variant="outline" className="bg-white border-slate-100 text-[10px] font-bold text-primary-600 h-6 px-2 shadow-sm">
                                                                    {task.storyPoints}p
                                                                </Badge>
                                                            )}
                                                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg border border-slate-100 bg-white shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                                                <div className={cn("w-1.5 h-1.5 rounded-full", statusCol?.dot)} />
                                                                <span className={cn(statusCol?.color, "uppercase tracking-widest")}>{statusCol?.label}</span>
                                                            </div>
                                                            <Badge variant="outline" className={cn(
                                                                "text-[9px] font-semibold h-6 px-2 rounded-lg border-none shadow-none uppercase flex items-center gap-1.5",
                                                                p.bg,
                                                                p.color
                                                            )}>
                                                                {p.icon} {p.label}
                                                            </Badge>
                                                            {task.assigneeAvatar && (
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[11px] font-black border-2 border-white shadow-sm" title={task.assigneeName}>
                                                                    {task.assigneeAvatar}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    
                                    {sprint.status === 'COMPLETED' && (
                                        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center group-hover:bg-black transition-colors">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sprint archivé le {new Date(sprint.endDate).toLocaleDateString('fr-FR')}</span>
                                            <Button
                                                variant="ghost"
                                                onClick={() => onViewReport(sprint.id)}
                                                className="text-[11px] font-black text-white hover:text-primary-400 flex items-center gap-2 h-auto py-1 shadow-none"
                                            >
                                                Voir le rapport complet
                                            </Button>
                                        </div>
                                    )}
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
