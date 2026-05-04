import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Target, CheckSquare, AlertCircle, TrendingUp } from 'lucide-react';
import type { Task, TaskStatus, TaskType } from '../../types/project.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCalendarViewProps {
    tasks: Task[];
    onOpenTaskDetails: (task: Task, isReadOnly?: boolean) => void;
    onAddTask?: (date: Date) => void;
}

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    TODO: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    IN_TEST: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    DONE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const TYPE_ICONS: Record<TaskType, { icon: React.ReactNode, color: string }> = {
    STORY: { icon: <Target className="w-3 h-3" />, color: 'text-primary-600' },
    TASK: { icon: <CheckSquare className="w-3 h-3" />, color: 'text-slate-600' },
    BUG: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-red-500' },
    IMPROVEMENT: { icon: <TrendingUp className="w-3 h-3" />, color: 'text-violet-500' },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ tasks, onOpenTaskDetails, onAddTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [direction, setDirection] = useState(0);

    const nextMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setDirection(1); };
    const prevMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setDirection(-1); };
    const goToday = () => { setCurrentDate(new Date()); setDirection(0); };

    const { daysInMonth, startDayIndex } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 0 = Sunday, 1 = Monday. We want 0 = Monday
        let startDayIndex = new Date(year, month, 1).getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6; // Sunday becomes 6

        return { daysInMonth, startDayIndex };
    }, [currentDate]);

    // Group tasks by date string YYYY-MM-DD
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateStr = task.dueDate.split('T')[0]; // simple YYYY-MM-DD
                if (!map[dateStr]) map[dateStr] = [];
                map[dateStr].push(task);
            }
        });
        return map;
    }, [tasks]);

    const { monthTaskCount, doneMonthTaskCount } = useMemo(() => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const monthTasks = tasks.filter((task) => {
            if (!task.dueDate) return false;
            const d = new Date(task.dueDate);
            return d.getFullYear() === y && d.getMonth() === m;
        });
        return {
            monthTaskCount: monthTasks.length,
            doneMonthTaskCount: monthTasks.filter((t) => t.status === 'DONE').length
        };
    }, [tasks, currentDate]);

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const grid: React.ReactNode[] = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < startDayIndex; i++) {
            grid.push(<div key={`empty-${i}`} className="bg-slate-50 border border-slate-100"></div>);
        }

        const todayStr = new Date().toISOString().split('T')[0];

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const weekdayIndex = (startDayIndex + day - 1) % 7;
            const isWeekend = weekdayIndex >= 5;
            const visibleTasks = dayTasks.slice(0, 3);
            const remainingTasks = dayTasks.length - visibleTasks.length;

            grid.push(
                <div key={day} className={`min-h-[140px] bg-white p-2 transition-all hover:bg-slate-50/80 flex flex-col group border-r border-b border-slate-100 ${isWeekend ? 'bg-slate-50/40' : ''}`}>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-700'
                            }`}>
                            {day}
                        </span>
                        <button
                            title="Ajouter une tâche pour cette date"
                            onClick={() => onAddTask && onAddTask(new Date(year, month, day))}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-md transition-all active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto px-1 custom-scrollbar">
                        {visibleTasks.map(task => {
                            const colors = STATUS_COLORS[task.status];
                            const typeConfig = TYPE_ICONS[task.type || 'TASK'];
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onOpenTaskDetails(task, true)}
                                    className={`px-2 py-1.5 text-[10px] font-semibold border rounded-lg cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 w-[98%] bg-white ${colors.border} group/task shadow-sm`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className={`p-0.5 rounded-sm bg-slate-100 ${typeConfig?.color}`}>
                                            {typeConfig?.icon || <CheckSquare className="w-3 h-3" />}
                                        </div>
                                        <span className="truncate text-slate-700">{task.title}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                                            {task.status.replace('_', ' ')}
                                        </div>
                                        {task.assigneeAvatar ? (
                                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black flex-shrink-0 border border-white shadow-sm text-slate-600" title={task.assigneeName}>
                                                {task.assigneeAvatar}
                                            </div>
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-slate-100 border border-white flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {remainingTasks > 0 && (
                            <Popover>
                                <PopoverTrigger className="w-full text-left px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-md transition-colors">
                                    +{remainingTasks} autre{remainingTasks > 1 ? 's' : ''}
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0 rounded-2xl overflow-hidden shadow-2xl border-slate-100" align="start">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{day} {monthNames[month]}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium">{dayTasks.length} tâches pour ce jour</p>
                                    </div>
                                    <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
                                        {dayTasks.map(task => {
                                            const colors = STATUS_COLORS[task.status];
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => onOpenTaskDetails(task, true)}
                                                    className={`px-3 py-2 text-xs font-semibold border-b last:border-0 border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex items-center justify-between`}
                                                >
                                                    <span className="truncate flex-1 pr-2 text-slate-700">{task.title}</span>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            );
        }

        // Fill the rest of the grid
        const totalCells = startDayIndex + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            grid.push(<div key={`end-empty-${i}`} className="bg-slate-50/50 border-r border-b border-slate-100"></div>);
        }

        return grid;
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="flex-1 overflow-auto bg-slate-50/50 p-6 flex flex-col h-full">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col flex-1 min-h-0">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                            {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-bold ml-1">{currentDate.getFullYear()}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 mr-2">
                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-100">
                                {monthTaskCount} tâche{monthTaskCount !== 1 ? 's' : ''}
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100/50">
                                {doneMonthTaskCount} terminée{doneMonthTaskCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <button onClick={goToday} className="px-4 py-2 text-xs font-black text-indigo-600 bg-indigo-50 border border-transparent rounded-xl hover:bg-indigo-100 transition-colors mr-2">
                            Aujourd'hui
                        </button>
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden p-0.5 shadow-sm">
                            <button onClick={prevMonth} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all focus:outline-none">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="w-px h-5 bg-slate-100 mx-1"></span>
                            <button onClick={nextMonth} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all focus:outline-none">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 tracking-widest uppercase border-r last:border-r-0 border-slate-100">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 bg-white overflow-hidden relative">
                    <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.div
                            key={currentDate.toISOString()}
                            custom={direction}
                            initial={{ x: direction * 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction * -50, opacity: 0 }}
                            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                            className="grid grid-cols-7 h-full absolute inset-0"
                        >
                            {renderCalendarGrid()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Affichage mensuel</span>
                    <span>Max 3 tâches visibles par jour</span>
                </div>

            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>
        </div>
    );
};
