import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, CheckSquare, Clock, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { BurndownChart } from '@/components/charts/BurndownChart';
import type { Sprint, Task, ProjectMember, ProjectStatus } from '@/types/project.types';

const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
  PLANNED: { label: 'PLANIFIÉ', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  IN_PROGRESS: { label: 'EN COURS', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  DELIVERED: { label: 'LIVRÉ', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  SUSPENDED: { label: 'SUSPENDU', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

interface ProjectDashboardViewProps {
    project: {
        id: string;
        name: string;
        progress: number;
        startDate: string;
        endDate: string;
        status: ProjectStatus;
        members?: ProjectMember[];
    };
    sprints: Sprint[];
    projectTasks: Task[];
}

export const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({ 
    project, sprints, projectTasks 
}) => {
    const [selectedSprintId, setSelectedSprintId] = useState<string>('');
    const [showAnalysis, setShowAnalysis] = useState(true);

    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    const sprintToDisplay = selectedSprintId
        ? sprints.find(s => s.id === selectedSprintId)
        : activeSprint || sprints[sprints.length - 1];

    const doneTasksCount = projectTasks.filter(t => t.status === 'DONE').length;
    const totalTasksCount = projectTasks.length;
    
    // Time remaining calculation
    const end = new Date(project.endDate).getTime();
    const now = Date.now();
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 3600 * 24)));
    const completionPercent = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

    const kpis = [
        {
            label: 'Santé globale',
            value: `${project.progress}%`,
            sub: 'Avancement projet',
            icon: <Activity className="w-5 h-5 text-emerald-600" />,
            trend: 'Sain',
            iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
            badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
            glow: 'shadow-emerald-500/20'
        },
        {
            label: 'Tâches livrées',
            value: `${doneTasksCount}/${totalTasksCount}`,
            sub: 'Exécution globale',
            icon: <CheckSquare className="w-5 h-5 text-white shadow-sm" />,
            trend: `${completionPercent}%`,
            iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
            badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/50',
            glow: 'shadow-indigo-500/20'
        },
        {
            label: 'Temps restant',
            value: `${daysLeft} jours`,
            sub: 'Jusqu’à échéance',
            icon: <Clock className="w-5 h-5 text-indigo-600" />,
            trend: daysLeft > 7 ? 'On track' : 'À surveiller',
            iconBg: 'bg-gradient-to-br from-violet-400 to-fuchsia-600',
            badgeBg: 'bg-violet-50 text-violet-700 border border-violet-200/50',
            glow: 'shadow-violet-500/20'
        }
    ] as const;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Indicateurs clés</h2>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5">Vue analytique synthétique du projet</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white/80 backdrop-blur text-slate-600 border-slate-200 px-3 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider rounded-lg">
                        {project.name}
                    </Badge>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm ${STATUS_CONFIG[project.status]?.color || 'bg-white text-slate-600'}`}>
                        {STATUS_CONFIG[project.status]?.label || project.status}
                    </span>
                </div>
            </div>
            {/* Essential KPI Cards - Focused only on progress/time/tasks */}
            <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="show" 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {kpis.map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className="relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                            <div className="absolute top-0 right-0 p-24 bg-gradient-to-bl from-slate-50 to-transparent opacity-50 pointer-events-none" />
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-md ${stat.glow} transform group-hover:scale-105 transition-transform duration-300`}>
                                        {stat.icon}
                                    </div>
                                    <Badge className={`rounded-lg py-0.5 px-2.5 text-[9px] font-bold shadow-sm ${stat.badgeBg}`}>
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</h3>
                                    <p className="text-[11px] text-slate-500 font-medium italic">{stat.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Performance Analysis - CORE DATA */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 shadow-md bg-white overflow-hidden">
                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-slate-50">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Performance <span className="text-indigo-600">& vélocité</span>
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            {sprints.length > 0 && (
                                <Select 
                                    value={selectedSprintId || (activeSprint?.id || sprints[sprints.length-1]?.id || '')} 
                                    onValueChange={(v) => v && setSelectedSprintId(v)}
                                >
                                    <SelectTrigger className="w-[190px] rounded-xl border-slate-200 bg-white text-xs font-semibold focus:ring-0">
                                        <SelectValue placeholder="Sprint">
                                            {(() => {
                                                const id = selectedSprintId || (activeSprint?.id || sprints[sprints.length - 1]?.id || '');
                                                const sprint = sprints.find((s) => s.id === id);
                                                return sprint?.name ?? 'Sprint';
                                            })()}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                        {sprints.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="text-xs font-medium rounded-lg">
                                                {s.name} {s.status === 'ACTIVE' ? '(Actif)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <div className="pt-4 h-[380px]">
                            {sprintToDisplay ? (
                                <BurndownChart 
                                    sprint={sprintToDisplay} 
                                    tasks={projectTasks.filter(t => t.sprintId === sprintToDisplay.id)} 
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                                    <Target className="w-12 h-12 text-slate-200 mb-4" />
                                    <p className="text-xs font-semibold tracking-wide text-slate-400">Aucune donnée pour ce cycle</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Presence - CORE DATA */}
                <Card className="rounded-2xl border border-slate-200/80 shadow-md bg-white overflow-hidden flex flex-col">
                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-slate-50">
                        <CardTitle className="text-lg font-black text-slate-900">
                            Équipe <span className="text-indigo-600">active</span>
                        </CardTitle>
                        <Badge className="bg-slate-900 text-white shadow-sm rounded-lg text-[10px] font-black px-2.5 py-0.5">{project.members?.length || 0}</Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-4 flex-1 bg-slate-50/30">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {project.members?.map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 relative flex items-center justify-center text-xs font-black text-slate-700 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                                <span className="absolute inset-0 flex items-center justify-center">{member.fullName.charAt(0).toUpperCase()}</span>
                                                {member.avatar && (
                                                    <img 
                                                        src={member.avatar} 
                                                        alt={member.fullName} 
                                                        className="w-full h-full object-cover relative z-10 bg-white" 
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                                    />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center z-20">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1">{member.fullName}</p>
                                            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded inline-block">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Activity className="w-3 h-3 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            
        </div>
    );
};





