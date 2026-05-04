import React, { useState } from 'react';
import {
    ChevronDown, ChevronRight, GripVertical, Plus,
    MessageSquare, AlertCircle, MoreHorizontal,
    Clock, CheckCircle2, Circle, HelpCircle, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ProjectTableBoardProps {
    tasks: Task[];
    assignees: ProjectMember[];
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    onPriorityChange: (taskId: string, priority: TaskPriority) => void;
    onAssigneeChange: (taskId: string, assigneeId: string | undefined) => void;
    onUpdateTaskTitle: (taskId: string, title: string) => void;
    onAddTask: (status: TaskStatus) => void;
    onQuickAddTask: (title: string, status: TaskStatus) => void;
    onOpenTaskDetails: (task: Task, isReadOnly?: boolean) => void;
    onDuplicateTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
}

const GROUPS: { id: TaskStatus; label: string; color: string; bg: string; text: string; icon: React.ReactNode }[] = [
    { id: 'TODO', label: 'À faire', color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-700', icon: <Circle className="w-4 h-4" /> },
    { id: 'IN_PROGRESS', label: 'En cours', color: 'bg-blue-500', bg: 'bg-blue-50/50', text: 'text-blue-700', icon: <Clock className="w-4 h-4" /> },
    { id: 'IN_TEST', label: 'En test', color: 'bg-violet-500', bg: 'bg-violet-50/50', text: 'text-violet-700', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'DONE', label: 'Terminé', color: 'bg-emerald-500', bg: 'bg-emerald-50/50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
    CRITICAL: { label: 'Critique', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
    HIGH: { label: 'Haute', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
    MEDIUM: { label: 'Moyenne', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    LOW: { label: 'Basse', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export const ProjectTableBoard: React.FC<ProjectTableBoardProps> = ({
    tasks, assignees, onStatusChange, onAssigneeChange, onPriorityChange, onUpdateTaskTitle, onAddTask, onOpenTaskDetails,
    onDuplicateTask, onDeleteTask
}) => {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<TaskStatus>>(new Set());

    const toggleGroup = (status: TaskStatus) => {
        const newSet = new Set(collapsedGroups);
        if (newSet.has(status)) newSet.delete(status);
        else newSet.add(status);
        setCollapsedGroups(newSet);
    };

    return (
        <div className="flex-1 overflow-auto bg-slate-50/50 p-8">
            <div className="min-w-[1100px] bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="w-[45%] text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Désignation de la tâche</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Assigné à</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Statut actuel</TableHead>
                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Niveau de Priorité</TableHead>
                            <TableHead className="w-24 text-right px-8 py-2"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="border-none">
                        {GROUPS.map(group => {
                            const groupTasks = tasks.filter(t => t.status === group.id && !t.parentTaskId);
                            const isCollapsed = collapsedGroups.has(group.id);

                            if (groupTasks.length === 0 && group.id !== 'TODO' && group.id !== 'IN_PROGRESS') return null;

                            return (
                                <React.Fragment key={group.id}>
                                    {/* Group Header */}
                                    <TableRow className="hover:bg-slate-50/50 bg-slate-50/20 border-none group">
                                        <TableCell colSpan={6} className="py-3 px-6 h-12">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleGroup(group.id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </button>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`p-1.5 rounded-lg ${group.bg} ${group.text}`}>
                                                        {group.icon}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">{group.label}</h3>
                                                    <Badge variant="outline" className="ml-2 bg-white text-[10px] font-black text-slate-400 border-slate-100 h-5 px-1.5 min-w-[20px] justify-center">
                                                        {groupTasks.length}
                                                    </Badge>
                                                    <div className="h-px flex-1 bg-slate-100/60 ml-4"></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Task List */}
                                    <AnimatePresence initial={false}>
                                        {!isCollapsed && groupTasks.map((task, idx) => (
                                            <React.Fragment key={task.id || `task-${idx}`}>
                                                <TaskRow
                                                    task={task}
                                                    assignees={assignees}
                                                    onStatusChange={onStatusChange}
                                                    onAssigneeChange={onAssigneeChange}
                                                    onPriorityChange={onPriorityChange}
                                                    onUpdateTaskTitle={onUpdateTaskTitle}
                                                    onOpenDetails={(isReadOnly) => onOpenTaskDetails(task, isReadOnly)}
                                                    isLast={idx === groupTasks.length - 1}
                                                    onDuplicate={() => onDuplicateTask(task.id)}
                                                    onDelete={() => onDeleteTask(task.id)}
                                                />
                                                {/* Render Sub-tasks */}
                                                {tasks.filter(t => t.parentTaskId === task.id).map((subTask, sIdx) => (
                                                    <TaskRow
                                                        key={subTask.id || `subtask-${task.id}-${sIdx}`}
                                                        task={subTask}
                                                        assignees={assignees}
                                                        onStatusChange={onStatusChange}
                                                        onAssigneeChange={onAssigneeChange}
                                                        onPriorityChange={onPriorityChange}
                                                        onUpdateTaskTitle={onUpdateTaskTitle}
                                                        onOpenDetails={(isReadOnly) => onOpenTaskDetails(subTask, isReadOnly)}
                                                        isLast={false}
                                                        isSubtask={true}
                                                        onDuplicate={() => onDuplicateTask(subTask.id)}
                                                        onDelete={() => onDeleteTask(subTask.id)}
                                                    />
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>

                                    {/* Add Row Button */}
                                    {!isCollapsed && (
                                        <TableRow className="hover:bg-slate-50/40 border-none transition-colors">
                                            <TableCell className="w-12 border-none"></TableCell>
                                            <TableCell colSpan={5} className="py-2.5 px-6 border-none">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-xs font-bold text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl h-10 transition-all border border-dashed border-transparent hover:border-primary-100"
                                                    onClick={() => onAddTask(group.id)}
                                                >
                                                    <Plus className="w-3.5 h-3.5 mr-2" /> Ajouter une nouvelle tâche dans {group.label}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Spacer between groups */}
                                    <TableRow className="h-2 border-none hover:bg-transparent">
                                        <TableCell colSpan={6} className="p-0 border-none"></TableCell>
                                    </TableRow>
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
    onOpenDetails: (isReadOnly?: boolean) => void;
    isLast: boolean;
    onDuplicate: () => void;
    onDelete: () => void;
    isSubtask?: boolean;
}> = ({ task, assignees, onStatusChange, onAssigneeChange, onPriorityChange, onUpdateTaskTitle, onOpenDetails, isLast, onDuplicate, onDelete, isSubtask }) => {
    const [title, setTitle] = useState(task.title);
    const [isFocused, setIsFocused] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group transition-all duration-300 border-none hover:bg-slate-50/30 ${isFocused ? 'bg-primary-50/20' : 'bg-white'} ${isSubtask ? 'bg-slate-50/10' : ''}`}
        >
            <TableCell className="w-12 text-center py-1.5 pl-6 border-none">
                {!isSubtask && (
                    <div className="flex justify-center opacity-0 group-hover:opacity-100 cursor-grab text-slate-300 hover:text-slate-500 transition-all">
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}
                {isSubtask && (
                    <div className="flex justify-center text-slate-300">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                )}
            </TableCell>

            {/* Title / Description */}
            <TableCell className={`py-1.5 px-6 border-none ${isSubtask ? 'pl-12' : ''}`}>
                <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 group/input relative">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false);
                                if (title !== task.title) onUpdateTaskTitle(task.id, title)
                            }}
                            className="w-full h-7 px-2 py-1 text-sm font-bold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-primary-500 rounded-lg transition-all outline-none placeholder:text-slate-300 tracking-tight"
                            placeholder="Titre de la tâche..."
                        />
                        {(task.storyPoints ?? 0) > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-black bg-slate-50 text-slate-400 border-slate-100">
                                    {task.storyPoints} pts
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>

            {/* Assignee */}
            <TableCell className="py-1.5 px-6 border-none">
                <Select
                    value={(task.assigneeId as string | undefined) || 'unassigned'}
                    onValueChange={(val) => onAssigneeChange(task.id, val === 'unassigned' ? undefined : val)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent hover:bg-slate-50 hover:border-slate-100 focus:ring-0 shadow-none text-xs font-semibold rounded-xl transition-all">
                        {task.assigneeId ? (
                            <div className="flex items-center gap-2.5">
                                <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 text-[9px] font-black">
                                        {task.assigneeAvatar || task.assigneeName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate max-w-[120px]">{task.assigneeName}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 text-slate-400 italic font-medium">
                                <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 group-hover:scale-90 transition-transform">
                                    <Plus className="w-3 h-3" />
                                </div>
                                <span>Assigner</span>
                            </div>
                        )}
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1.5">
                        <SelectItem value="unassigned" className="text-slate-500 italic text-[11px] rounded-lg">Non assigné</SelectItem>
                        {assignees.map(a => (
                            <SelectItem key={a.id} value={a.id} className="text-xs font-semibold rounded-lg py-2">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-[9px] font-black bg-slate-100">{a.avatar}</AvatarFallback>
                                    </Avatar>
                                    {a.fullName}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            {/* Status */}
            <TableCell className="py-1.5 px-6 border-none">
                <Select
                    value={task.status}
                    onValueChange={(val) => onStatusChange(task.id, val as TaskStatus)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent hover:bg-slate-50 hover:border-slate-100 focus:ring-0 shadow-none text-xs font-bold rounded-xl transition-all">
                        <Badge variant="outline" className={`rounded-lg py-1 px-3 border-transparent ${task.status === 'DONE' ? 'bg-emerald-50 text-emerald-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {task.status === 'DONE' ? 'Terminé' : task.status === 'IN_PROGRESS' ? 'En cours' : task.status === 'IN_TEST' ? 'En test' : 'À faire'}
                        </Badge>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1.5">
                        {[
                            { id: 'TODO', label: 'À faire', icon: <Circle className="w-3.5 h-3.5" /> },
                            { id: 'IN_PROGRESS', label: 'En cours', icon: <Clock className="w-3.5 h-3.5" /> },
                            { id: 'IN_TEST', label: 'En test', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                            { id: 'DONE', label: 'Terminé', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                        ].map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-xs font-bold rounded-lg py-2">
                                <div className="flex items-center gap-2.5">
                                    {s.icon} {s.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            {/* Priority */}
            <TableCell className="py-1.5 px-6 border-none">
                <Select
                    value={task.priority}
                    onValueChange={(val) => onPriorityChange(task.id, val as TaskPriority)}
                >
                    <SelectTrigger className="w-full h-8 border-transparent hover:bg-slate-50 hover:border-slate-100 focus:ring-0 shadow-none text-xs font-black rounded-xl transition-all uppercase tracking-tighter">
                        <div className={`flex items-center gap-2 ${PRIORITY_CONFIG[task.priority].color} bg-white shadow-sm border ${PRIORITY_CONFIG[task.priority].border} rounded-lg px-2 py-1`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'CRITICAL' ? 'bg-red-500 animate-pulse' : task.priority === 'HIGH' ? 'bg-orange-500' : task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                            {PRIORITY_CONFIG[task.priority].label}
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1.5">
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k} className="text-[11px] font-black uppercase tracking-tight rounded-lg py-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${k === 'CRITICAL' ? 'bg-red-500' : k === 'HIGH' ? 'bg-orange-500' : k === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                    {v.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right py-1.5 px-8 border-none">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">

                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-8 h-8 p-0 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 flex items-center justify-center outline-none bg-transparent cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-2 rounded-2xl border-slate-100 shadow-2xl" align="end">
                            <DropdownMenuItem
                                onClick={() => onOpenDetails(true)}
                                className="rounded-xl text-xs font-bold px-3 py-2 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onOpenDetails(false)}
                                className="rounded-xl text-xs font-bold px-3 py-2 text-primary-600 hover:bg-primary-50 transition-all cursor-pointer"
                            >
                                Modifier les détails
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem
                                onClick={onDuplicate}
                                className="rounded-xl text-xs font-bold px-3 py-2 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                Dupliquer la tâche
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteConfirm(true)}
                                className="rounded-xl text-xs font-bold px-3 py-2 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            >
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    title="Supprimer la tâche ?"
                    message="Cette action est irréversible. Voulez-vous continuer ?"
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    type="danger"
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={() => {
                        onDelete();
                        setShowDeleteConfirm(false);
                    }}
                />
            </TableCell>
        </motion.tr>
    );
};
