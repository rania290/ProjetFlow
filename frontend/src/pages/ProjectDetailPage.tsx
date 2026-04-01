import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, Play, Archive, MoreHorizontal, GripVertical,
    Layers, CheckSquare, Clock, User2, List,
    Zap, CalendarDays, X, AlertCircle, Activity, PieChart, TrendingUp, Users,
    MessageCircle
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useStore } from '../store/projectStore';
import type { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '../types/project.types';
import { BurndownChart } from '../components/charts/BurndownChart';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectToolbar } from '../components/projects/ProjectToolbar';
import { ProjectTableBoard } from '../components/projects/ProjectTableBoard';
import { ProjectCalendarView } from '../components/projects/ProjectCalendarView';
import { BoardDiscussionPanel } from '../components/projects/BoardDiscussionPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// ===== CONSTANTS =====
const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string; headerBg: string; dot: string }[] = [
    { id: 'TODO', label: 'À faire', color: 'text-slate-500', headerBg: 'bg-slate-50', dot: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: 'En cours', color: 'text-blue-600', headerBg: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'IN_TEST', label: 'En test', color: 'text-violet-600', headerBg: 'bg-violet-50', dot: 'bg-violet-500' },
    { id: 'DONE', label: 'Terminé', color: 'text-emerald-600', headerBg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    CRITICAL: { label: 'Critique', dot: 'bg-red-500', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3 h-3" /> },
    HIGH: { label: 'Haute', dot: 'bg-orange-500', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <TrendingUp className="w-3 h-3" /> },
    MEDIUM: { label: 'Moyenne', dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <MoreHorizontal className="w-3 h-3" /> },
    LOW: { label: 'Basse', dot: 'bg-blue-400', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <ArrowLeft className="w-3 h-3 -rotate-45" /> },
};

const TYPE_CONFIG: Record<TaskType, { label: string; color: string; icon: React.ReactNode }> = {
    STORY: { label: 'Story', color: 'text-primary-600', icon: <span className="font-bold text-primary-600">S</span> },
    TASK: { label: 'Tâche', color: 'text-slate-600', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    BUG: { label: 'Bug', color: 'text-red-600', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    IMPROVEMENT: { label: 'Amélioration', color: 'text-violet-600', icon: <Zap className="w-3.5 h-3.5" /> },
};

const FIBONACCI_POINTS = [0, 1, 2, 3, 5, 8, 13, 21];
// === ADD MEMBER MODAL ===
const AddMemberModal: React.FC<{ onClose: () => void; onAdd: (member: any) => void; }> = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ fullName: '', role: 'Développeur', tjm: '' });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Ajouter un membre</h2>
                        <p className="text-xs text-slate-500">Assigner une nouvelle personne au projet</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nom Complet *</label>
                        <input
                            autoFocus
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            placeholder="Ex: Thomas Muller"
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Rôle sur le projet</label>
                        <input
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            placeholder="Ex: Lead Developer"
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">TJM (DT/Jour)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={form.tjm}
                                onChange={e => setForm({ ...form, tjm: e.target.value })}
                                placeholder="800 DT"
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        Annuler
                    </button>
                    <button
                        onClick={() => onAdd({
                            id: 'u' + Date.now(),
                            fullName: form.fullName.trim(),
                            avatar: form.fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                            role: form.role.trim() || 'Membre',
                            tjm: Number(form.tjm) || 0
                        })}
                        disabled={!form.fullName.trim()}
                        className="flex-1 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-500/20"
                    >
                        Ajouter
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ===== KANBAN BOARD =====
const KanbanBoard: React.FC<{
    tasks: Task[];
    onStatusChange: (id: string, status: TaskStatus) => void;
    onAddTask: (status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
}> = ({ tasks, onStatusChange, onAddTask, onEditTask }) => {
    const { dispatch } = useStore();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = () => { };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = (tasks || []).find(t => t.id === activeId);
        if (!activeTask) return;

        const overColumn = STATUS_COLUMNS.find(c => c.id === overId);
        if (overColumn) {
            if (activeTask.status !== overColumn.id) {
                onStatusChange(activeId, overColumn.id);
            }
            return;
        }

        const overTask = (tasks || []).find(t => t.id === overId);
        if (overTask) {
            if (activeTask.status !== overTask.status) {
                onStatusChange(activeId, overTask.status);
            } else {
                const columnTasks = (tasks || []).filter(t => t.status === activeTask.status);
                const oldIndex = columnTasks.findIndex(t => t.id === activeId);
                const newIndex = columnTasks.findIndex(t => t.id === overId);

                if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
                    const reordered = arrayMove(columnTasks, oldIndex, newIndex);
                    dispatch({ type: 'REORDER_BACKLOG', projectTasks: reordered });
                }
            }
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 p-6 h-full overflow-x-auto min-h-0" style={{ minHeight: '500px' }}>
                {(tasks && STATUS_COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id);
                    return (
                        <DroppableColumn key={col.id} col={col} colTasks={colTasks} onAddTask={onAddTask} onEditTask={onEditTask} />
                    );
                })) || null}
            </div>
        </DndContext>
    );
};

// Internal Droppable Column component for dnd-kit
const DroppableColumn: React.FC<{
    col: typeof STATUS_COLUMNS[0];
    colTasks: Task[];
    onAddTask: (status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
}> = ({ col, colTasks, onAddTask, onEditTask }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: col.id,
        data: { type: 'Column', col }
    });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col min-h-[500px]">
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-2xl mb-3 ${col.headerBg} border border-slate-100`}>
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded-lg">{colTasks.length}</span>
                </div>
                <button onClick={() => onAddTask(col.id)} className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-primary-600 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className={`flex-1 rounded-2xl transition-all duration-200 space-y-2.5 p-1 ${isOver ? 'bg-primary-50/50 ring-2 ring-primary-300 ring-dashed' : ''}`}>
                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
                    ))}
                </SortableContext>

                {colTasks.length === 0 && !isOver && (
                    <div className="h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center">
                        <p className="text-[10px] font-medium text-slate-300 italic">Déposer ici</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== TASK CARD =====
const TaskCard: React.FC<{ task: Task; onEdit: () => void }> = ({ task, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
    };

    const priority = PRIORITY_CONFIG[task.priority];
    const type = TYPE_CONFIG[task.type];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 ring-2 ring-primary-500 scale-95' : ''}`}
        >
            <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs">{type.icon}</span>
                    <h4 className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">{task.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
                        {priority.icon} {priority.label.substring(0, 1)}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-all text-slate-300">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.storyPoints !== undefined && (
                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                            {task.storyPoints}
                        </span>
                    )}
                    {task.acceptanceCriteria && (
                        <List className="w-3 h-3 text-slate-300" />
                    )}
                    {task.comments?.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                            <Activity className="w-3 h-3" /> {task.comments.length}
                        </div>
                    )}
                </div>
                {task.assigneeAvatar && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" title={task.assigneeName}>
                        {task.assigneeAvatar}
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== BACKLOG VIEW =====
const MultiBacklogView: React.FC<{
    sprints: Sprint[];
    allTasks: Task[];
    onAddTask: () => void;
    onMoveToSprint: (taskId: string, sprintId: string) => void;
    onEditTask: (task: Task) => void;
}> = ({ sprints, allTasks, onAddTask, onMoveToSprint, onEditTask }) => {
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
    const { dispatch } = useStore();

    const backlogTasks = (allTasks || []).filter(t => !t.sprintId);
    const filtered = filterPriority === 'ALL' ? backlogTasks : backlogTasks.filter(t => t.priority === filterPriority);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = filtered.findIndex(t => t.id === active.id);
            const newIndex = filtered.findIndex(t => t.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(filtered, oldIndex, newIndex);
                dispatch({ type: 'REORDER_BACKLOG', projectTasks: reordered });
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Sprints summary */}
            {(sprints || []).map(s => {
                const sprintTasks = (allTasks || []).filter(t => t.sprintId === s.id);
                const doneTasks = sprintTasks.filter(t => t.status === 'DONE').length;
                return (
                    <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 ${s.status === 'ACTIVE' ? 'bg-primary-50' : ''}`}>
                            <div className="flex items-center gap-2 flex-1">
                                {s.status === 'ACTIVE' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                                <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                    {s.status === 'ACTIVE' ? 'Actif' : s.status === 'PLANNED' ? 'Planifié' : 'Terminé'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(s.startDate).toLocaleDateString('fr-FR')} → {new Date(s.endDate).toLocaleDateString('fr-FR')}</span>
                                <span className="font-semibold text-slate-700">{doneTasks}/{sprintTasks.length} tâches</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {sprintTasks.length === 0 ? (
                                <div className="px-4 py-6 text-center text-xs text-slate-400">Aucune tâche dans ce sprint</div>
                            ) : (
                                sprintTasks.map(task => (
                                    <BacklogTaskRow key={task.id} task={task} sprints={sprints} onMoveToSprint={onMoveToSprint} onEdit={() => onEditTask(task)} />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Backlog */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex-1">Backlog produit</h3>
                    <div className="flex gap-1">
                        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
                            <button key={p} onClick={() => setFilterPriority(p)}
                                className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-all ${filterPriority === p ? 'bg-primary-100 text-primary-700' : 'text-slate-400 hover:bg-slate-50'}`}>
                                {p === 'ALL' ? 'Tous' : p}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{filtered.length} éléments</span>
                    <button onClick={onAddTask}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-colors">
                        <Plus className="w-3 h-3" /> Ajouter
                    </button>
                </div>
                <div className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <CheckSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">Le backlog est vide. Commencez par créer des stories !</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                {filtered.map(task => (
                                    <BacklogTaskRow key={task.id} task={task} sprints={sprints} onMoveToSprint={onMoveToSprint} onEdit={() => onEditTask(task)} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
};

const BacklogTaskRow: React.FC<{
    task: Task;
    sprints: Sprint[];
    onMoveToSprint: (taskId: string, sprintId: string) => void;
    onEdit: () => void;
}> = ({ task, sprints, onMoveToSprint, onEdit }) => {
    const [showMoveMenu, setShowMoveMenu] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    };

    const priority = PRIORITY_CONFIG[task.priority];
    const type = TYPE_CONFIG[task.type];
    const activeSprints = (sprints || []).filter(s => s.status !== 'COMPLETED');

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors group cursor-grab active:cursor-grabbing ${isDragging ? 'bg-white shadow-xl rounded-xl ring-2 ring-primary-200' : ''}`}
        >
            <div className="p-1 -m-1">
                <GripVertical className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400" />
            </div>
            <span className="text-sm">{type.icon}</span>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
                <span className="text-sm text-slate-700 font-medium truncate block">{task.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                    {task.storyPoints !== undefined && (
                        <span className="text-[10px] text-primary-600 font-bold">{task.storyPoints} pts</span>
                    )}
                    {task.acceptanceCriteria && (
                        <span className="flex items-center gap-0.5 text-[9px] text-slate-400 font-medium">
                            <List className="w-2.5 h-2.5" /> Critères
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
                    {priority.icon} {priority.label}
                </span>
                {task.assigneeAvatar && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[8px] font-bold" title={task.assigneeName}>
                        {task.assigneeAvatar}
                    </div>
                )}
                {!task.sprintId && activeSprints.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMoveMenu(v => !v)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 font-semibold hover:bg-primary-100 transition-all border border-primary-100"
                        >
                            → Sprint
                        </button>
                        <AnimatePresence>
                            {showMoveMenu && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
                                    {activeSprints.map(s => (
                                        <button key={s.id} onClick={() => { onMoveToSprint(task.id, s.id); setShowMoveMenu(false); }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-primary-50 text-slate-600 hover:text-primary-700 transition-colors flex items-center gap-2">
                                            {s.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                            {s.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== SPRINTS VIEW =====
const SprintsView: React.FC<{
    sprints: Sprint[];
    projectTasks: Task[];
    onCreateSprint: () => void;
    onActivateSprint: (id: string) => void;
    onCloseSprint: (id: string) => void;
}> = ({ sprints, projectTasks, onCreateSprint, onActivateSprint, onCloseSprint }) => {
    return (
        <div className="p-6 space-y-6">

            <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800">Gestion des sprints</h2>
                <button onClick={onCreateSprint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                    <Plus className="w-3.5 h-3.5" />  sprint
                </button>
            </div>

            {(!sprints || sprints.length === 0) ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Aucun sprint créé. Commencez votre premier sprint !</p>
                </div>
            ) : (
                sprints.map(sprint => {
                    const sprintTasks = (projectTasks || []).filter(t => t.sprintId === sprint.id);
                    const byStatus = {
                        TODO: sprintTasks.filter(t => t.status === 'TODO').length,
                        IN_PROGRESS: sprintTasks.filter(t => t.status === 'IN_PROGRESS').length,
                        IN_TEST: sprintTasks.filter(t => t.status === 'IN_TEST').length,
                        DONE: sprintTasks.filter(t => t.status === 'DONE').length,
                    };
                    const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                    const donePoints = sprintTasks.filter(t => t.status === 'DONE').reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
                    const capacity = sprint.capacity || 0;
                    const capacityPercentage = capacity > 0 ? Math.min(100, (totalPoints / capacity) * 100) : 0;

                    const daysLeft = Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));

                    return (
                        <motion.div key={sprint.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className={`px-5 py-4 border-b border-slate-100 ${sprint.status === 'ACTIVE' ? 'bg-gradient-to-r from-primary-50 to-white' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-slate-900">{sprint.name}</h3>
                                            {sprint.status === 'ACTIVE' && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> ACTIF
                                                </span>
                                            )}
                                            {sprint.status === 'PLANNED' && (
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">PLANIFIÉ</span>
                                            )}
                                            {sprint.status === 'COMPLETED' && (
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">TERMINÉ</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">{sprint.goal}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(sprint.startDate).toLocaleDateString('fr-FR')} → {new Date(sprint.endDate).toLocaleDateString('fr-FR')}</span>
                                            {sprint.status === 'ACTIVE' && daysLeft > 0 && (
                                                <span className={`font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {daysLeft}j restants
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {sprint.status === 'PLANNED' && (
                                            <button onClick={() => onActivateSprint(sprint.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm">
                                                <Play className="w-3 h-3" /> Démarrer
                                            </button>
                                        )}
                                        {sprint.status === 'ACTIVE' && (
                                            <button onClick={() => onCloseSprint(sprint.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors">
                                                <Archive className="w-3 h-3" /> Clôturer
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {sprint.status !== 'COMPLETED' && capacity > 0 && (
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase tracking-wider">Charge vs Capacité</span>
                                            <span className={totalPoints > capacity ? 'text-red-500' : 'text-primary-600'}>
                                                {totalPoints} / {capacity} pts ({Math.round(capacityPercentage)}%)
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all ${totalPoints > capacity ? 'bg-red-500' : 'bg-primary-500'}`}
                                                style={{ width: `${capacityPercentage}%` }} />
                                        </div>
                                    </div>
                                )}

                                {sprintTasks.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                                            <span className="font-semibold text-slate-600">{donePoints}/{totalPoints} pts</span>
                                            {Object.entries(byStatus).map(([k, v]) => (
                                                <span key={k}>{STATUS_COLUMNS.find(c => c.id === k)?.label}: <strong className="text-slate-600">{v}</strong></span>
                                            ))}
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all"
                                                style={{ width: `${totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="divide-y divide-slate-50">
                                {sprintTasks.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-400">Aucune tâche dans ce sprint</div>
                                ) : (
                                    sprintTasks.map(task => {
                                        const p = PRIORITY_CONFIG[task.priority];
                                        const t = TYPE_CONFIG[task.type];
                                        const statusCol = STATUS_COLUMNS.find(c => c.id === task.status);
                                        return (
                                            <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                                                <span className="text-sm">{t.icon}</span>
                                                <span className="flex-1 text-xs text-slate-700 font-medium truncate">{task.title}</span>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {task.storyPoints && <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 rounded">{task.storyPoints}p</span>}
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${statusCol?.headerBg} ${statusCol?.color}`}>{statusCol?.label}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${p.bg} ${p.color} ${p.border}`}>{p.icon}</span>
                                                    {task.assigneeAvatar && (
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[8px] font-bold">
                                                            {task.assigneeAvatar}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

// ===== TASK DETAILS SHEET (Replaces EditTaskModal) =====
const TaskDetailsSheet: React.FC<{
    task: Task;
    sprints: Sprint[];
    onClose: () => void;
    onUpdate: (task: Task) => void;
    onDelete: (id: string) => void;
}> = ({ task, sprints, onClose, onUpdate, onDelete }) => {
    const [form, setForm] = useState({ ...task, tagsString: (task.tags || []).join(', ') });

    const handleUpdate = () => {
        if (!form.title.trim()) return;
        const updatedTask: Task = {
            ...form,
            tags: form.tagsString.split(',').map(t => t.trim()).filter(Boolean),
        };
        onUpdate(updatedTask);
    };

    return (
        <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="sm:max-w-md md:max-w-xl overflow-y-auto bg-white border-l border-slate-200 shadow-2xl p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 shrink-0">
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-bold text-slate-900 border-none outline-none">Détails de la tâche</SheetTitle>
                            <SheetDescription className="text-xs text-slate-500">Mettez à jour les informations, l'assignation et le statut.</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="p-6 flex-1 space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Titre <span className="text-red-500">*</span></label>
                        <input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-slate-800 transition-all bg-white" placeholder="Nom de la tâche" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Détaillez le travail à effectuer..."
                            rows={4} className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-slate-800 resize-none transition-all bg-white" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Critères d'acceptation</label>
                        <textarea value={form.acceptanceCriteria || ''} onChange={e => setForm({ ...form, acceptanceCriteria: e.target.value })}
                            placeholder="Critère 1&#10;Critère 2..."
                            rows={3} className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-slate-800 resize-none transition-all bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as TaskType })}
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white transition-all text-slate-800">
                                <option value="STORY">Story</option>
                                <option value="TASK">Tâche</option>
                                <option value="BUG">Bug</option>
                                <option value="IMPROVEMENT">Amélioration</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Priorité</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white transition-all text-slate-800">
                                <option value="CRITICAL">Critique</option>
                                <option value="HIGH">Haute</option>
                                <option value="MEDIUM">Moyenne</option>
                                <option value="LOW">Basse</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Sprint</label>
                            <select value={form.sprintId || ''} onChange={e => setForm({ ...form, sprintId: e.target.value || undefined })}
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white transition-all text-slate-800">
                                <option value="">Backlog</option>
                                {(sprints || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Story Points</label>
                            <select value={form.storyPoints || 0} onChange={e => setForm({ ...form, storyPoints: Number(e.target.value) })}
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white transition-all text-slate-800">
                                {FIBONACCI_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 mt-auto">
                    <button onClick={() => onDelete(task.id)}
                        className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all font-semibold text-sm flex items-center justify-center shrink-0">
                        <Archive className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                        Annuler
                    </button>
                    <button onClick={handleUpdate} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all">
                        Enregistrer
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

// ===== SPRINT REPORT / CLOSE MODAL =====
const SprintReportModal: React.FC<{
    sprint: Sprint;
    tasks: Task[];
    onClose: () => void;
    onConfirmClose?: (id: string) => void;
}> = ({ sprint, tasks, onClose, onConfirmClose }) => {
    const isClosing = sprint.status === 'ACTIVE';
    const doneTasks = (tasks || []).filter(t => t.status === 'DONE');
    const incompleteTasks = (tasks || []).filter(t => t.status !== 'DONE');
    const totalPoints = (tasks || []).reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
    const donePoints = doneTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);
    const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            // Instead of alert, we just close or show success
        }, 1500);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50" />
                
                <div className="relative text-center">
                    <div className={`w-16 h-16 ${isClosing ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                        {isClosing ? <Zap className="w-8 h-8" /> : <CheckSquare className="w-8 h-8" />}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {isClosing ? 'Clôturer le sprint ?' : 'Bilan du Sprint'}
                    </h2>
                    <p className="text-sm text-slate-500 mb-8">
                        {isClosing ? `Prêt à terminer "${sprint.name}" ?` : `Excellent travail sur "${sprint.name}"`}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tâches Complétées</p>
                            <p className="text-xl font-black text-slate-800">{doneTasks.length} / {tasks.length}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Vélocité Réelle</p>
                            <p className="text-xl font-black text-blue-600">{donePoints} pts</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl col-span-2 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux de réussite</p>
                                <p className="text-sm font-bold text-slate-700">{completionRate}%</p>
                            </div>
                            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${completionRate === 100 ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-1000`} style={{ width: `${completionRate}%` }} />
                            </div>
                        </div>
                    </div>

                    {isClosing && incompleteTasks.length > 0 && (
                        <div className="mb-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <h4 className="text-xs font-bold text-orange-700">Tâches non terminées ({incompleteTasks.length})</h4>
                            </div>
                            <p className="text-[11px] text-orange-600 leading-relaxed">
                                Les tâches qui ne sont pas "Terminé" seront automatiquement renvoyées dans le <strong>Backlog</strong> lors de la clôture.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {isClosing ? (
                            <>
                                <button onClick={() => onConfirmClose?.(sprint.id)}
                                    className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]">
                                    <Archive className="w-4 h-4" /> Confirmer la clôture
                                </button>
                                <button onClick={onClose} className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl transition-colors text-sm">
                                    Annuler
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleExport} disabled={isExporting}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center gap-2">
                                    {isExporting ? <Activity className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                                    {isExporting ? 'Génération du PDF...' : 'Exporter le rapport détaillé'}
                                </button>
                                <button onClick={onClose} className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl transition-colors text-sm">
                                    Fermer le bilan
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CreateTaskModal: React.FC<{
    projectId: string;
    sprintId?: string;
    defaultStatus?: TaskStatus;
    sprints: Sprint[];
    onClose: () => void;
    onCreated: (task: Task) => void;
}> = ({ projectId, sprintId, defaultStatus, sprints, onClose, onCreated }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        assigneeId: '',
        assigneeName: '',
        sprintId: sprintId ?? '',
        dueDate: '', // Laisser vide pour que l'utilisateur choisisse
        tags: '',
        acceptanceCriteria: '',
        storyPoints: '',
    });

    const handleCreate = () => {
        if (!form.title.trim()) return;
        const task: Task = {
            id: `t${Date.now()}`,
            projectId,
            sprintId: form.sprintId || undefined,
            title: form.title,
            description: form.description,
            acceptanceCriteria: form.acceptanceCriteria || undefined,
            type: form.type as any,
            status: defaultStatus || 'TODO',
            priority: form.priority as any,
            assigneeId: form.assigneeId || undefined,
            assigneeName: form.assigneeName || undefined,
            storyPoints: form.storyPoints ? Number(form.storyPoints) : 0,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            createdAt: new Date().toISOString(),
            dueDate: form.dueDate || undefined,
            comments: [],
        };
        onCreated(task);
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Nouvelle tâche</h2>
                        <p className="text-[11px] text-slate-400">Ajouter au backlog ou à un sprint</p>
                    </div>
                    <button onClick={onClose} className="ml-auto p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Titre *</label>
                        <input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Description courte de la tâche..."
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-slate-800" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Détails de la story..."
                            rows={2} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 resize-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Critères d'acceptation</label>
                        <textarea value={form.acceptanceCriteria} onChange={e => setForm({ ...form, acceptanceCriteria: e.target.value })}
                            placeholder="Un utilisateur peut...&#10;Le système doit..."
                            rows={2} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as TaskType })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 bg-white">
                                <option value="STORY">Story</option>
                                <option value="TASK">Tâche</option>
                                <option value="BUG">Bug</option>
                                <option value="IMPROVEMENT">Amélioration</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priorité</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 bg-white">
                                <option value="CRITICAL">Critique</option>
                                <option value="HIGH">Haute</option>
                                <option value="MEDIUM">Moyenne</option>
                                <option value="LOW">Basse</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sprint</label>
                            <select value={form.sprintId} onChange={e => setForm({ ...form, sprintId: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 bg-white">
                                <option value="">Backlog (aucun sprint)</option>
                                {(sprints || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Story Points (Fibonacci)</label>
                            <select value={form.storyPoints} onChange={e => setForm({ ...form, storyPoints: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 bg-white">
                                {FIBONACCI_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date échéance</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tags (virgule)</label>
                            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                                placeholder="API, Backend, UX..."
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Annuler
                    </button>
                    <button onClick={handleCreate} disabled={!form.title.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-md shadow-primary-500/20">
                        Créer la tâche
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ===== CREATE SPRINT MODAL =====
const CreateSprintModal: React.FC<{
    projectId: string;
    onClose: () => void;
    onCreated: (sprint: Sprint) => void;
}> = ({ projectId, onClose, onCreated }) => {
    const [form, setForm] = useState({ 
        name: '', 
        goal: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        capacity: '20' 
    });

    const handleCreate = () => {
        if (!form.name.trim()) return;
        const sprint: Sprint = {
            id: `s${Date.now()}`, projectId,
            name: form.name, goal: form.goal,
            status: 'PLANNED',
            startDate: form.startDate,
            endDate: form.endDate,
            capacity: Number(form.capacity) || 0,
            tasks: [],
        };
        onCreated(sprint);
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center"><Zap className="w-4 h-4 text-primary-600" /></div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Nouveau sprint</h2>
                        <p className="text-[11px] text-slate-400">Définir l'objectif et les dates</p>
                    </div>
                    <button onClick={onClose} className="ml-auto p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom du sprint *</label>
                        <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="ex: Sprint 3 – Paiement" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Objectif du sprint</label>
                        <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
                            placeholder="Quel est l'objectif principal de ce sprint ?"
                            rows={2} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 resize-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Début</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Capacité (pts)</label>
                            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fin prévisionnelle</label>
                        <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800" />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
                    <button onClick={handleCreate} disabled={!form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-md shadow-primary-500/20">Créer le sprint</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ===== PROJECT DASHBOARD VIEW =====
const ProjectDashboardView: React.FC<{ project: any; sprints: Sprint[]; projectTasks: Task[] }> = ({ project, sprints, projectTasks }) => {
    const [selectedSprintForChart, setSelectedSprintForChart] = useState<string>('');
    const [showAnalysis, setShowAnalysis] = useState(false);

    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    const sprintToDisplay = selectedSprintForChart
        ? sprints.find(s => s.id === selectedSprintForChart)
        : activeSprint || sprints[sprints.length - 1];

    const totalBudget = project.budget || 0;
    const totalTjm = (project.members || []).reduce((acc: number, m: any) => acc + (m.tjm || 0), 0);
    const startDate = new Date(project.startDate).getTime();
    const endDate = new Date(project.endDate).getTime();
    const durationDays = Math.max(1, (endDate - startDate) / (1000 * 3600 * 24));

    // Simplistic cost estimation based on team TJM and duration
    const estimatedCost = totalTjm * durationDays;
    const overBudget = estimatedCost > totalBudget;

    return (
        <div className="p-6 space-y-6">
            {/* Burndown Chart Section */}
            {sprints.length > 0 && sprintToDisplay ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="">
                                    <h3 className="text-sm font-bold text-slate-800">Performance & Vélocité</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {sprintToDisplay.name} {sprintToDisplay.status === 'ACTIVE' ? '— Sprint en cours' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-4 bg-white/80 px-4 py-2 rounded-xl border border-slate-100">
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Objectif</p>
                                        <p className="text-xs font-black text-slate-700">{sprintToDisplay.capacity} pts</p>
                                    </div>
                                    <div className="w-px h-6 bg-slate-100"></div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Actuel</p>
                                        <p className="text-xs font-black text-blue-600">{projectTasks.filter(t => t.sprintId === sprintToDisplay.id).reduce((acc, t) => acc + (t.storyPoints || 0), 0)} pts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAnalysis(!showAnalysis)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[11px] font-bold ${showAnalysis
                                        ? 'bg-slate-100 border-slate-200 text-slate-600'
                                        : 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100'
                                        }`}
                                >
                                    {showAnalysis ? 'Masquer l\'analyse' : 'Analyse détaillée'}
                                    <motion.div animate={{ rotate: showAnalysis ? 180 : 0 }}>
                                        <MoreHorizontal className="w-3.5 h-3.5 rotate-90" />
                                    </motion.div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {showAnalysis && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div className="p-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sélecteur de sprint</span>
                                            {sprints.length > 1 && (
                                                <select
                                                    value={selectedSprintForChart || (activeSprint?.id || '')}
                                                    onChange={(e) => setSelectedSprintForChart(e.target.value)}
                                                    className="text-[10px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-600 outline-none focus:ring-1 focus:ring-primary-500/30"
                                                >
                                                    {sprints.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name} {s.status === 'ACTIVE' ? '(Actif)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-[10px] text-slate-500 font-medium">Réel</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 ring-2 ring-slate-100 ring-offset-2" />
                                                <span className="text-[10px] text-slate-500 font-medium tracking-tighter italic">Idéal</span>
                                            </div>
                                        </div>
                                    </div>
                                    <BurndownChart
                                        sprint={sprintToDisplay}
                                        tasks={projectTasks.filter(t => t.sprintId === sprintToDisplay.id)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Budget Global</p>
                            <h3 className="text-2xl font-black text-slate-800">{totalBudget.toLocaleString('fr-FR')} DT</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Coût Estimé (TJM)</p>
                            <h3 className={`text-2xl font-black ${overBudget ? 'text-red-500' : 'text-slate-800'}`}>
                                {estimatedCost.toLocaleString('fr-FR')} DT
                            </h3>
                        </div>
                    </div>
                    {overBudget && <p className="text-xs text-red-500 font-medium mt-2">Dépassement de budget probable</p>}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Taille Équipe</p>
                            <h3 className="text-2xl font-black text-slate-800">{project.members?.length || 0} membres</h3>
                        </div>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">Détail des ressources et TJM</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-5 py-3">Membre de l'équipe</th>
                                <th className="px-5 py-3">Rôle projet</th>
                                <th className="px-5 py-3 text-right">TJM (DT)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!project.members || project.members.length === 0) ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-xs">
                                        Aucun membre assigné au projet
                                    </td>
                                </tr>
                            ) : (
                                (project.members || []).map((m: any) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-800 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                                {m.avatar}
                                            </div>
                                            {m.fullName}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">{m.role}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-slate-700">{m.tjm?.toLocaleString('fr-FR') || 0} DT</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// ===== MAIN PAGE =====
export const ProjectDetailPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { state, dispatch } = useStore();
    const navigate = useNavigate();

    // Aura IA contextual state
    const [showAura, setShowAura] = useState(false);
    const [auraMessages, setAuraMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
        { role: 'ai', content: "Bonjour ! Je suis Aura. Laissez-moi analyser ce projet..." }
    ]);
    const [auraInput, setAuraInput] = useState('');

    const project = state.projects.find(p => p.id === projectId);
    const sprints = state.sprints.filter(s => s.projectId === projectId);
    const projectTasks = state.tasks.filter(t => t.projectId === projectId);
    const activeSprint = sprints.find(s => s.status === 'ACTIVE');

    const [tab, setTab] = useState<'table' | 'board' | 'calendar' | 'backlog' | 'sprints' | 'dashboard'>('table');
    const [search, setSearch] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'DATE' | 'STATUS' | 'NAME'>('DATE');
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus | undefined>(undefined);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showDiscussion, setShowDiscussion] = useState(false);
    const [showCreateSprint, setShowCreateSprint] = useState(false);
    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprint?.id ?? sprints[0]?.id ?? '');
    const [createTaskSprintId, setCreateTaskSprintId] = useState<string | undefined>(undefined);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [reportSprint, setReportSprint] = useState<Sprint | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Listen for custom events to open create sprint modal from dashboard
    React.useEffect(() => {
        const handleOpenCreateSprintModal = () => {
            setShowCreateSprint(true);
        };

        window.addEventListener('openCreateSprintModal', handleOpenCreateSprintModal);

        return () => {
            window.removeEventListener('openCreateSprintModal', handleOpenCreateSprintModal);
        };
    }, []);

    if (!project) {
        return (
            <AppLayout title="Projet introuvable">
                <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">Ce projet n'existe pas.</p>
                    <button onClick={() => navigate('/projects')}
                        className="text-primary-600 font-semibold hover:underline">
                        ← Retour aux projets
                    </button>
                </div>
            </AppLayout>
        );
    }

    const currentSprintForBoard = sprints.find(s => s.id === selectedSprintId) ?? activeSprint ?? sprints[0];
    const boardTasks = currentSprintForBoard
        ? projectTasks.filter(t => t.sprintId === currentSprintForBoard.id)
        : projectTasks;

    return (
        <AppLayout
            title={project.name}
            subtitle={`Vue ${project.viewMode || 'BOARD'} · ${project.type} · ${project.clientName ?? 'Interne'} · ${project.members?.length || 0} membre(s)`}
        >
            <div className="flex flex-col h-full">

                {/* ===== PROJECT HEADER ===== */}
                <div className="px-6 pt-4 pb-0 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => navigate('/projects')}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        {/* Progress */}
                        <div className="flex-1 max-w-xs">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Progression globale</span>
                                <span className="font-semibold text-slate-600">{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Members */}
                        <div className="flex -space-x-1.5 ml-auto">
                            {(project.members || []).map(m => (
                                <div key={m.id} title={m.fullName}
                                    className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                                    {m.avatar}
                                </div>
                            ))}
                            <button onClick={() => setShowAddMember(true)} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-10" title="Ajouter des membres">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="w-px h-5 bg-slate-200 mx-3 opacity-60"></div>

                        <button
                            onClick={() => setShowDiscussion(true)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent shadow-sm flex items-center gap-1.5"
                            title="Board Discussion"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold">Discussion</span>
                        </button>

                        <div className="w-px h-5 bg-slate-200 mx-3 opacity-60"></div>

                        <button
                            onClick={() => { setCreateTaskSprintId(activeSprint?.id); setShowCreateTask(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" /> Nouvelle tâche
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-0 border-b-0 bg-white">
                        {([
                            { id: 'table', label: `Tableau principal`, icon: <List className="w-3.5 h-3.5" /> },
                            { id: 'board', label: `Vue Kanban`, icon: <Layers className="w-3.5 h-3.5" /> },
                            { id: 'calendar', label: `Calendrier`, icon: <CalendarDays className="w-3.5 h-3.5" /> },
                            { id: 'backlog', label: 'Backlog', icon: <CheckSquare className="w-3.5 h-3.5" /> },
                            { id: 'sprints', label: 'Sprints', icon: <Zap className="w-3.5 h-3.5" /> },
                            { id: 'dashboard', label: 'Indicateurs clés (KPI)', icon: <Activity className="w-3.5 h-3.5" /> },
                        ] as { id: 'table' | 'board' | 'calendar' | 'backlog' | 'sprints' | 'dashboard'; label: string; icon: React.ReactNode }[]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${tab === t.id
                                    ? 'border-primary-500 text-primary-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                {t.icon}{t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="flex-1 overflow-auto bg-slate-50">

                    {/* SPRINT SELECTOR */}
                    {(tab === 'table' || tab === 'board' || tab === 'calendar') && sprints.length > 0 && (
                        <div className="flex items-center gap-2 px-6 py-3 bg-white/50 border-b border-slate-100">
                            {sprints.map(s => (
                                <button key={s.id} onClick={() => setSelectedSprintId(s.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${selectedSprintId === s.id
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
                                    {s.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                    {s.name}
                                    <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${s.status === 'ACTIVE' ? 'bg-white/30' : s.status === 'COMPLETED' ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                                        {s.status === 'ACTIVE' ? 'Actif' : s.status === 'PLANNED' ? 'Planifié' : 'Terminé'}
                                    </span>
                                </button>
                            ))}
                            <button onClick={() => setShowCreateSprint(true)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-all bg-white">
                                <Plus className="w-3 h-3" /> Sprint
                            </button>
                        </div>
                    )}

                    {/* TOOLBAR */}
                    {(tab === 'table' || tab === 'board' || tab === 'calendar') && (
                        <ProjectToolbar
                            search={search} onSearchChange={setSearch}
                            filterAssignee={filterAssignee} onFilterAssigneeChange={setFilterAssignee}
                            filterStatus={filterStatus} onFilterStatusChange={setFilterStatus}
                            filterPriority={filterPriority} onFilterPriorityChange={setFilterPriority}
                            sortBy={sortBy} onSortByChange={setSortBy}
                            assignees={project.members || []}
                        />
                    )}

                    {/* MAIN RENDERING */}
                    {(() => {
                        const filteredTasks = boardTasks.filter(t => {
                            const s1 = search ? t.title.toLowerCase().includes(search.toLowerCase()) : true;
                            const s2 = filterAssignee ? t.assigneeId === filterAssignee : true;
                            const s3 = filterStatus !== 'ALL' ? t.status === filterStatus : true;
                            const s4 = filterPriority !== 'ALL' ? t.priority === filterPriority : true;
                            return s1 && s2 && s3 && s4;
                        }).sort((a, b) => {
                            if (sortBy === 'NAME') return a.title.localeCompare(b.title);
                            if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        });

                        return (
                            <>
                                {/* MAIN TABLE BOARD */}
                                {tab === 'table' && (
                                    <ProjectTableBoard
                                        tasks={filteredTasks}
                                        assignees={project.members || []}
                                        onStatusChange={(taskId, status) => dispatch({ type: 'UPDATE_TASK_STATUS', id: taskId, status })}
                                        onAssigneeChange={(taskId, assigneeId) => {
                                            const t = state.tasks.find(x => x.id === taskId);
                                            if (t) {
                                                const m = (project.members || []).find(x => x.id === assigneeId);
                                                dispatch({ type: 'UPDATE_TASK', task: { ...t, assigneeId, assigneeName: m?.fullName, assigneeAvatar: m?.avatar } });
                                            }
                                        }}
                                        onPriorityChange={(taskId, priority) => {
                                            const t = state.tasks.find(x => x.id === taskId);
                                            if (t) dispatch({ type: 'UPDATE_TASK', task: { ...t, priority } });
                                        }}
                                        onUpdateTaskTitle={(taskId, title) => {
                                            const t = state.tasks.find(x => x.id === taskId);
                                            if (t) dispatch({ type: 'UPDATE_TASK', task: { ...t, title } });
                                        }}
                                        onAddTask={(status) => {
                                            setCreateTaskSprintId(selectedSprintId || activeSprint?.id);
                                            setCreateTaskStatus(status);
                                            setShowCreateTask(true);
                                        }}
                                        onQuickAddTask={(title, status) => {
                                            const task: Task = {
                                                id: `t${Date.now()}`,
                                                projectId: project.id,
                                                sprintId: selectedSprintId || activeSprint?.id || undefined,
                                                title,
                                                description: '',
                                                type: 'STORY',
                                                status,
                                                priority: 'MEDIUM',
                                                tags: [],
                                                createdAt: new Date().toISOString(),
                                                comments: [],
                                                storyPoints: 0
                                            };
                                            dispatch({ type: 'ADD_TASK', task });
                                            if (task.sprintId) dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId: task.id, sprintId: task.sprintId });
                                        }}
                                        onOpenTaskDetails={(task) => setEditingTask(task)}
                                    />
                                )}

                                {/* KANBAN / SCRUM BOARD */}
                                {tab === 'board' && (
                                    <KanbanBoard
                                        tasks={filteredTasks}
                                        onStatusChange={(taskId, status) => dispatch({ type: 'UPDATE_TASK_STATUS', id: taskId, status })}
                                        onAddTask={() => { setCreateTaskSprintId(activeSprint?.id); setShowCreateTask(true); }}
                                        onEditTask={(task) => setEditingTask(task)}
                                    />
                                )}

                                {/* CALENDAR VIEW */}
                                {tab === 'calendar' && (
                                    <ProjectCalendarView
                                        tasks={filteredTasks}
                                        onOpenTaskDetails={(task) => setEditingTask(task)}
                                    />
                                )}
                            </>
                        );
                    })()}


                    {/* BACKLOG */}
                    {tab === 'backlog' && (
                        <MultiBacklogView
                            sprints={sprints}
                            allTasks={projectTasks}
                            onAddTask={() => { setCreateTaskSprintId(undefined); setShowCreateTask(true); }}
                            onMoveToSprint={(taskId, sprintId) => dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId, sprintId })}
                            onEditTask={(task) => setEditingTask(task)}
                        />
                    )}

                    {/* SPRINTS */}
                    {tab === 'sprints' && (
                        <SprintsView
                            sprints={sprints}
                            projectTasks={projectTasks}
                            onCreateSprint={() => setShowCreateSprint(true)}
                            onActivateSprint={(id) => dispatch({ type: 'UPDATE_SPRINT_STATUS', id, status: 'ACTIVE' })}
                            onCloseSprint={(id) => {
                                // Instead of direct dispatch, we let the modal handle it
                                const s = sprints.find(x => x.id === id);
                                if (s) setReportSprint(s);
                            }}
                        />
                    )}

                    {/* DASHBOARD */}
                    {tab === 'dashboard' && (
                        <ProjectDashboardView project={project} sprints={sprints} projectTasks={projectTasks} />
                    )}
                </div>
            </div>

            {/* AURA IA FLOATING PANEL */}
            <AnimatePresence>
                {showAura && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="fixed bottom-24 right-8 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-40 flex flex-col backdrop-blur-md"
                        style={{ height: '400px' }}
                    >
                        {/* Aura Header */}
                        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-sm font-bold text-white tracking-wide">Aura IA</span>
                            </div>
                            <button onClick={() => setShowAura(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            <div className="flex justify-center mb-4">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full">Analyse de {project.name}</span>
                            </div>
                            {auraMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${msg.role === 'ai'
                                        ? 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                                        : 'bg-primary-600 text-white rounded-tr-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-800/80 border-t border-slate-700/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={auraInput}
                                    onChange={(e) => setAuraInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && auraInput.trim()) {
                                            const question = auraInput.trim();
                                            setAuraMessages(prev => [...prev, { role: 'user', content: question }]);
                                            setAuraInput('');
                                            // Mock response
                                            setTimeout(() => {
                                                const insights = [
                                                    "Le sprint avance bien, mais 2 tâches critiques sont bloquées en test.",
                                                    "Alice a une surcharge de travail prévue pour jeudi.",
                                                    "L'objectif global du projet est atteint à 65%."
                                                ];
                                                setAuraMessages(prev => [...prev, { role: 'ai', content: insights[Math.floor(Math.random() * insights.length)] }]);
                                            }, 1000);
                                        }
                                    }}
                                    placeholder="Demandez à Aura..."
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-3 pr-10 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                                />
                                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-500 hover:bg-blue-400 rounded-lg flex items-center justify-center text-white transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Aura Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setShowAura(!showAura);
                    if (!showAura && auraMessages.length === 1) {
                        setTimeout(() => {
                            const todoCount = currentSprintForBoard ? projectTasks.filter(t => t.sprintId === currentSprintForBoard.id && t.status === 'TODO').length : 0;
                            const doneCount = currentSprintForBoard ? projectTasks.filter(t => t.sprintId === currentSprintForBoard.id && t.status === 'DONE').length : 0;
                            setAuraMessages(prev => [...prev, { role: 'ai', content: `L'analyse rapide montre que vous avez ${doneCount} tâches terminées et ${todoCount} à faire dans ce sprint. Souhaitez-vous identifier des points de blocage potentiels ?` }]);
                        }, 1500);
                    }
                }}
                className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${showAura
                    ? 'bg-slate-800 text-white border-2 border-slate-700'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-2 border-white/20 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    }`}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${showAura ? '' : 'animate-pulse'}`}>
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
            </motion.button>

            {/* MODALS */}
            <AnimatePresence>
                {showCreateTask && (
                    <CreateTaskModal
                        projectId={project.id}
                        sprintId={createTaskSprintId}
                        defaultStatus={createTaskStatus}
                        sprints={sprints}
                        onClose={() => { setShowCreateTask(false); setCreateTaskStatus(undefined); }}
                        onCreated={(task) => {
                            dispatch({ type: 'ADD_TASK', task });
                            if (task.sprintId) {
                                dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId: task.id, sprintId: task.sprintId });
                            }
                        }}
                    />
                )}
                {showCreateSprint && (
                    <CreateSprintModal
                        projectId={project.id}
                        onClose={() => setShowCreateSprint(false)}
                        onCreated={(sprint) => {
                            dispatch({ type: 'ADD_SPRINT', sprint });
                            setSelectedSprintId(sprint.id);
                        }}
                    />
                )}
                {showAddMember && (
                    <AddMemberModal
                        onClose={() => setShowAddMember(false)}
                        onAdd={(member: any) => {
                            dispatch({ type: 'ADD_PROJECT_MEMBER', projectId: project.id, member });
                            setShowAddMember(false);
                        }}
                    />
                )}
                {editingTask && (
                    <TaskDetailsSheet
                        task={editingTask}
                        sprints={sprints}
                        onClose={() => setEditingTask(null)}
                        onUpdate={(task) => {
                            dispatch({ type: 'UPDATE_TASK', task });
                            setEditingTask(null);
                        }}
                        onDelete={(id) => {
                            setConfirmDialog({
                                isOpen: true,
                                title: 'Confirmation de suppression',
                                message: `Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.`,
                                onConfirm: () => {
                                    dispatch({ type: 'DELETE_TASK', id });
                                    setEditingTask(null);
                                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                }
                            });
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText="Supprimer"
                cancelText="Annuler"
                type="danger"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />

            <BoardDiscussionPanel
                isOpen={showDiscussion}
                onClose={() => setShowDiscussion(false)}
                projectName={project.name}
                members={project.members}
            />

            {reportSprint && (
                <SprintReportModal
                    sprint={reportSprint}
                    tasks={projectTasks.filter(t => t.sprintId === reportSprint.id)}
                    onClose={() => setReportSprint(null)}
                    onConfirmClose={(id) => {
                        dispatch({ type: 'UPDATE_SPRINT_STATUS', id, status: 'COMPLETED' });
                        setReportSprint(null);
                        setShowSuccessToast('Sprint clôturé avec succès. Les tâches non terminées ont été renvoyées au backlog.');
                        setTimeout(() => setShowSuccessToast(null), 5000);
                    }}
                />
            )}


            {/* Success Toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold">{showSuccessToast}</p>
                        <button onClick={() => setShowSuccessToast(null)} className="ml-4 p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};





