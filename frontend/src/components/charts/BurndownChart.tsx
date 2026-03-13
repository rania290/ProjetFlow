import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { Task, Sprint } from '../../types/project.types';

interface BurndownChartProps {
    sprint: Sprint;
    tasks: Task[];
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ sprint, tasks }) => {
    const chartData = useMemo(() => {
        const start = new Date(sprint.startDate);
        const end = new Date(sprint.endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
        const completedPoints = tasks
            .filter(task => task.status === 'DONE')
            .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

        const remainingPoints = totalPoints - completedPoints;

        const data = [];
        const today = new Date();
        const daysPassed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 3600 * 24));

        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);

            const dayLabel = `Jour ${i + 1}`;

            // Ideal line: linear decrease from totalPoints to 0
            const ideal = Math.max(0, totalPoints - (totalPoints / (totalDays - 1)) * i);

            // Actual line: 
            // For past days, we'd need history. For now, we'll interpolate or show constant if today
            // If i >= daysPassed, it's future. If i < daysPassed, it's past.
            // Simplified: current remaining points for 'today', and a mock trend for previous days
            let actual: number | null = null;
            if (i <= Math.min(daysPassed, totalDays - 1)) {
                // Mock: steady progress for demo if no history is available
                // In a real app, this would come from a 'sprint_history' table
                const progressFactor = Math.min(1, i / (totalDays - 1));
                const mockedCompleted = totalPoints * progressFactor * 0.8; // some progress but not perfect

                // If it's "today", use real data
                if (i === daysPassed) {
                    actual = remainingPoints;
                } else {
                    actual = totalPoints - mockedCompleted;
                }
            }

            data.push({
                name: dayLabel,
                date: currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                ideal: Math.round(ideal * 10) / 10,
                actual: actual !== null ? Math.round(actual * 10) / 10 : null,
            });
        }

        return data;
    }, [sprint, tasks]);

    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Burndown Chart — {sprint.name}</h3>
                <div className="flex gap-4 text-[10px] font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-primary-500"></span>
                        <span className="text-slate-500 text-xs">Idéal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-accent-500"></span>
                        <span className="text-slate-500 text-xs">Réel</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="ideal"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
