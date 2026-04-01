import React, { useState } from 'react';
import { 
    ChevronDown, ChevronRight, GripVertical, Plus, MoreHorizontal, 
    MessageSquare, AlertCircle, TrendingUp, ArrowLeft, X
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, ProjectMember } from '../../types/project.types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectTableBoardProps {
    tasks: Task[];
    assignees: ProjectMember[];
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    onPriorityChange: (taskId: string, priority: TaskPriority) => void;
    onAssigneeChange: (taskId: string, assigneeId: string | undefined) => void;
    onUpdateTaskTitle: (taskId: string, title: string) => void;
    onAddTask: (status: TaskStatus) => void;
    onQuickAddTask: (title: string, status: TaskStatus) => void;
    onOpenTaskDetails: (task: Task) => void;
}

const GROUPS: { id: TaskStatus; label: string; color: string; bg: string; text: string }[] = [
    { id: 'TODO', label: 'À faire', color: 'bg-slate-500', bg: 'bg-slate-50', text: 'text-slate-700' },
    { id: 'IN_PROGRESS', label: 'En cours', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    { id: 'IN_TEST', label: 'En test', color: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
    { id: 'DONE', label: 'Terminé', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
    CRITICAL: { label: 'Critique', variant: 'destructive' },
    HIGH: { label: 'Haute', variant: 'default' },
    MEDIUM: { label: 'Moyenne', variant: 'secondary' },
    LOW: { label: 'Basse', variant: 'outline' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
    TODO: { label: 'À faire', variant: 'outline' },
    IN_PROGRESS: { label: 'En cours', variant: 'default' },
    IN_TEST: { label: 'En test', variant: 'secondary' },
    DONE: { label: 'Fait', variant: 'default' },
};

export const ProjectTableBoard: React.FC<ProjectTableBoardProps> = ({
    tasks, assignees, onStatusChange, onAssigneeChange, onPriorityChange, onUpdateTaskTitle, onAddTask, onQuickAddTask, onOpenTaskDetails
}) => {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<TaskStatus>>(new Set());

    const toggleGroup = (status: TaskStatus) => {
        const newSet = new Set(collapsedGroups);
        if (newSet.has(status)) newSet.delete(status);
        else newSet.add(status);
        setCollapsedGroups(newSet);
    };

    return (
        <div className="flex-1 overflow-auto bg-white p-6">
            <div className="min-w-[1000px] rounded-xl border border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-[40%]">Tâche</TableHead>
                            <TableHead>Personne</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Priorité</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {GROUPS.map(group => {
                            const groupTasks = tasks.filter(t => t.status === group.id && !t.parentTaskId);
                            const isCollapsed = collapsedGroups.has(group.id);

                            if (groupTasks.length === 0 && group.id !== 'TODO' && group.id !== 'IN_PROGRESS') return null;

                            return (
                                <React.Fragment key={group.id}>
                                    {/* Group Header Row */}
                                    <TableRow className="hover:bg-slate-50/50 bg-slate-50/30">
                                        <TableCell colSpan={6} className="py-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleGroup(group.id)}
                                                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                                                >
                                                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${group.color}`}></span>
                                                    <h3 className="font-bold text-slate-700 text-sm">{group.label}</h3>
                                                    <Badge variant="secondary" className="ml-2 bg-white">{groupTasks.length}</Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Task Rows */}
                                    {!isCollapsed && groupTasks.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            assignees={assignees}
                                            onStatusChange={onStatusChange}
                                            onAssigneeChange={onAssigneeChange}
                                            onPriorityChange={onPriorityChange}
                                            onUpdateTaskTitle={onUpdateTaskTitle}
                                            onOpenDetails={() => onOpenTaskDetails(task)}
                                        />
                                    ))}

                                    {/* Add Task Quick Row */}
                                    {!isCollapsed && (
                                        <TableRow className="hover:bg-slate-50">
                                            <TableCell className="w-10"></TableCell>
                                            <TableCell colSpan={5} className="p-0">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-slate-500 hover:text-primary-600 rounded-none h-12"
                                                    onClick={() => onAddTask(group.id)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Ajouter une tâche
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

const TaskRow: React.FC<{
    task: Task;
    assignees: ProjectMember[];
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    onAssigneeChange: (taskId: string, assigneeId: string | undefined) => void;
    onPriorityChange: (taskId: string, priority: TaskPriority) => void;
    onUpdateTaskTitle: (taskId: string, title: string) => void;
    onOpenDetails: () => void;
}> = ({ task, assignees, onStatusChange, onAssigneeChange, onPriorityChange, onUpdateTaskTitle, onOpenDetails }) => {
    const [title, setTitle] = useState(task.title);

    return (
        <TableRow className="group bg-white">
            <TableCell className="w-10 px-2 py-3 border-r border-slate-100">
                <div className="flex justify-center opacity-0 group-hover:opacity-100 cursor-grab text-slate-400 hover:text-slate-600 transition-opacity">
                    <GripVertical className="w-4 h-4" />
                </div>
            </TableCell>

            <TableCell className="border-r border-slate-100 py-2 group/title">
                <div className="flex items-center gap-2 w-full">
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => { if (title !== task.title) onUpdateTaskTitle(task.id, title) }}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-md transition-all outline-none"
                    />
                    <div className="opacity-0 group-hover/title:opacity-100 flex gap-2 shrink-0">
                        {task.comments?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                <MessageSquare className="w-3 h-3" /> {task.comments.length}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>

            <TableCell className="border-r border-slate-100 py-2">
                <Select
                    value={task.assigneeId || 'unassigned'}
                    onValueChange={(val) => onAssigneeChange(task.id, val === 'unassigned' ? undefined : val)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent focus:ring-0 bg-transparent hover:bg-slate-100 transition-colors shadow-none text-xs">
                        {task.assigneeId ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                    <AvatarFallback className="bg-primary-100 text-primary-700 text-[10px]">{task.assigneeAvatar}</AvatarFallback>
                                </Avatar>
                                <span className="truncate">{task.assigneeName}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                    <Plus className="w-3 h-3" />
                                </div>
                                <span>Assigner</span>
                            </div>
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned" className="text-slate-500 italic text-xs">Non assigné</SelectItem>
                        {assignees.map(a => (
                            <SelectItem key={a.id} value={a.id} className="text-xs">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                        <AvatarFallback className="text-[10px]">{a.avatar}</AvatarFallback>
                                    </Avatar>
                                    {a.fullName}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            <TableCell className="border-r border-slate-100 py-2">
                <Select
                    value={task.status}
                    onValueChange={(val) => onStatusChange(task.id, val as TaskStatus)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent focus:ring-0 bg-transparent hover:bg-slate-100 transition-colors shadow-none text-xs">
                        <Badge variant={STATUS_CONFIG[task.status].variant} className="rounded-full font-semibold">
                            {STATUS_CONFIG[task.status].label}
                        </Badge>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k} className="text-xs">
                                {v.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            <TableCell className="border-r border-slate-100 py-2">
                <Select
                    value={task.priority}
                    onValueChange={(val) => onPriorityChange(task.id, val as TaskPriority)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent focus:ring-0 bg-transparent hover:bg-slate-100 transition-colors shadow-none text-xs">
                        <Badge variant={PRIORITY_CONFIG[task.priority].variant} className="rounded-full font-semibold">
                            {PRIORITY_CONFIG[task.priority].label}
                        </Badge>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k} className="text-xs">
                                {v.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            <TableCell className="text-right py-2">
                <Button variant="ghost" size="sm" onClick={onOpenDetails} className="text-slate-500 hover:text-primary-600">
                    Ouvrir
                </Button>
            </TableCell>
        </TableRow>
    );
};
