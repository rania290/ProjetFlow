import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import type { Task, TaskStatus } from '../../types/project.types';

interface ProjectCalendarViewProps {
    tasks: Task[];
    onOpenTaskDetails: (task: Task) => void;
}

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    TODO: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    IN_TEST: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    DONE: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ tasks, onOpenTaskDetails }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToday = () => setCurrentDate(new Date());

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

            grid.push(
                <div key={day} className={`min-h-[140px] bg-white border border-slate-100 p-2 transition-colors hover:bg-slate-50 flex flex-col group`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                            isToday ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600'
                        }`}>
                            {day}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-primary-600 transition-opacity">
                            <Plus className="w-3.5 h-3.5"/>
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
                        {dayTasks.map(task => {
                            const colors = STATUS_COLORS[task.status];
                            return (
                                <div 
                                    key={task.id} 
                                    onClick={() => onOpenTaskDetails(task)}
                                    className={`px-2 py-1.5 text-[10px] font-semibold border rounded-md cursor-pointer transition-transform hover:-translate-y-0.5 shadow-sm truncate flex items-center justify-between ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                    <span className="truncate mr-1">{task.title}</span>
                                    {task.assigneeAvatar && (
                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[8px] flex-shrink-0 shadow-sm border border-black/5" title={task.assigneeName}>
                                            {task.assigneeAvatar}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Fill the rest of the grid to maintain 7 columns
        const totalCells = startDayIndex + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            grid.push(<div key={`end-empty-${i}`} className="bg-slate-50 border border-slate-100"></div>);
        }

        return grid;
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={goToday} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors mr-2 shadow-sm">
                            Aujourd'hui
                        </button>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-0.5 shadow-sm">
                            <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition-all focus:outline-none">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="w-px h-4 bg-slate-200 mx-1"></span>
                            <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition-all focus:outline-none">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {DAYS_OF_WEEK.map((day, idx) => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 bg-slate-200 gap-px border-b border-slate-100">
                    {renderCalendarGrid()}
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
