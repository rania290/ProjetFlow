import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    Plus,
    GripVertical,
    CheckSquare,
    AlertCircle,
    TrendingUp,
    ArrowLeft,
    Calendar,
    List,
    MoreHorizontal,
    Search,
    Filter,
    Zap,
    ChevronRight,
    ArrowRight,
    Clock,
    Activity,
    Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/projectStore';
import type { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '@/types/project.types';

// ===== CONSTANTS =====
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    CRITICAL: { label: 'Critique', dot: 'bg-red-500', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3 h-3 text-red-500" /> },
    HIGH: { label: 'Haute', dot: 'bg-orange-500', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <TrendingUp className="w-3 h-3 text-orange-500" /> },
    MEDIUM: { label: 'Moyenne', dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <MoreHorizontal className="w-3 h-3 text-amber-500" /> },
    LOW: { label: 'Basse', dot: 'bg-blue-400', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <ArrowLeft className="w-3 h-3 text-blue-500 -rotate-45" /> },
};

const TYPE_CONFIG: Record<TaskType, { label: string; icon: React.ReactNode }> = {
    STORY: { label: 'Story', icon: <div className="w-4 h-4 bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold rounded">S</div> },
    TASK: { label: 'Tâche', icon: <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> },
    BUG: { label: 'Bug', icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" /> },
    IMPROVEMENT: { label: 'Amélioration', icon: <TrendingUp className="w-3.5 h-3.5 text-violet-400 rotate-45" /> },
};

interface BacklogViewProps {
    sprints: Sprint[];
    allTasks: Task[];
    onAddTask: () => void;
    onMoveToSprint: (taskId: string, sprintId: string) => void;
    onEditTask: (task: Task, isReadOnly?: boolean) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
    sprints,
    allTasks,
    onAddTask,
    onMoveToSprint,
    onEditTask
}) => {
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const { dispatch } = useStore();

    const backlogTasks = (allTasks || []).filter(t => !t.sprintId);

    const filtered = backlogTasks.filter(t => {
        const matchesPriority = filterPriority === 'ALL' ? true : t.priority === filterPriority;
        const matchesSearch = search ? t.title.toLowerCase().includes(search.toLowerCase()) : true;
        return matchesPriority && matchesSearch;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
        <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen">
            {/* Active Sprints Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Sprints en cours et prévus</h2>
                        <p className="text-[13px] font-medium text-slate-500">Planifiez vos prochaines itérations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {(sprints || []).map(s => {
                        const sprintTasks = (allTasks || []).filter(t => t.sprintId === s.id);
                        const doneTasks = sprintTasks.filter(t => t.status === 'DONE').length;
                        const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);

                        return (
                            <Card key={s.id} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden hover:shadow-2xl hover:border-indigo-200/60 transition-all duration-300">
                                <div className={cn(
                                    "flex flex-col lg:flex-row lg:items-center gap-6 px-8 py-5 border-b border-slate-100 transition-colors",
                                    s.status === 'ACTIVE' ? 'bg-gradient-to-r from-indigo-500/5 to-transparent' : 'bg-slate-50/30'
                                )}>
                                    <div className="flex items-start gap-4 flex-1 lg:flex-initial lg:w-1/3">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full mt-1.5 shadow-sm",
                                            s.status === 'ACTIVE' ? 'bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                                        )} />
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                {s.name}
                                                <Badge className={cn(
                                                    "text-[9px] h-5 px-2 font-black uppercase tracking-widest shadow-sm rounded-lg border border-transparent",
                                                    s.status === 'ACTIVE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-emerald-500/30' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                )}>
                                                    {s.status === 'ACTIVE' ? 'Actif' : s.status === 'PLANNED' ? 'Planifié' : 'Terminé'}
                                                </Badge>
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{s.goal}</p>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex items-center gap-12 flex-1 justify-center">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Période</p>
                                            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                {new Date(s.startDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} → {new Date(s.endDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="text-center border-l-2 border-slate-100 pl-12">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Progression</p>
                                            <span className="flex items-center gap-3">
                                                <span className="text-sm font-black text-slate-900">{doneTasks}<span className="text-slate-400 text-xs font-bold">/{sprintTasks.length}</span></span>
                                                <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${sprintTasks.length > 0 ? (doneTasks / sprintTasks.length) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 text-white font-black text-xs h-9 px-4 flex items-center rounded-xl shadow-lg shadow-slate-900/20">
                                            {totalPoints} pts
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-50 bg-white/50">
                                    {sprintTasks.length === 0 ? (
                                        <div className="px-6 py-8 flex flex-col items-center justify-center text-slate-300">
                                            <List className="w-6 h-6 mb-2 opacity-30" />
                                    <p className="text-[11px] font-semibold uppercase tracking-wide">Aucune tâche assignée</p>
                                        </div>
                                    ) : (
                                        sprintTasks.map(task => (
                                            <BacklogTaskRow key={task.id} task={task} sprints={sprints} onMoveToSprint={onMoveToSprint} onEdit={(isReadOnly) => onEditTask(task, isReadOnly)} inSprint />
                                        ))
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Product Backlog Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <List className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Backlog produit</h2>
                            <p className="text-[13px] font-medium text-slate-500">Gérez l'ensemble des tâches non planifiées</p>
                        </div>
                    </div>
                </div>

                <Card className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-4 px-5 py-4 bg-slate-50/60 border-b border-slate-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher une story ou un bug..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 h-11 bg-white border-none shadow-sm rounded-xl text-sm focus-visible:ring-primary-500/20"
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
                                <Button
                                    key={p}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilterPriority(p)}
                                    className={cn(
                                        "text-[10px] h-8 px-3 font-semibold uppercase tracking-wide rounded-xl transition-all border border-transparent shadow-none capitalize",
                                        filterPriority === p ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-white hover:border-slate-200'
                                    )}
                                >
                                    {p === 'ALL' ? 'Tous' : p}
                                </Button>
                            ))}
                        </div>

                        <Button
                            onClick={onAddTask}
                            className="h-11 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-sm flex items-center gap-2 border-none transform active:scale-95 transition-all w-full md:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Créer une Story
                        </Button>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {filtered.length === 0 ? (
                            <div className="px-6 py-20 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                    <CheckSquare className="w-8 h-8 text-slate-200" />
                                </div>
                                    <h4 className="text-sm font-bold text-slate-700">Le backlog est vide</h4>
                                    <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                                    Félicitations ! Vous avez tout traité ou vous n'avez pas encore défini de stories.
                                </p>
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
                                        <BacklogTaskRow key={task.id} task={task} sprints={sprints} onMoveToSprint={onMoveToSprint} onEdit={(isReadOnly) => onEditTask(task, isReadOnly)} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {filtered.length > 0 && (
                        <div className="px-5 py-4 bg-slate-50/40 flex justify-between items-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            <span>{filtered.length} éléments dans le backlog</span>
                            <span>Total points: {filtered.reduce((acc, t) => acc + (t.storyPoints || 0), 0)} pts</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const BacklogTaskRow: React.FC<{
    task: Task;
    sprints: Sprint[];
    onMoveToSprint: (taskId: string, sprintId: string) => void;
    onEdit: (isReadOnly?: boolean) => void;
    inSprint?: boolean;
}> = ({ task, sprints, onMoveToSprint, onEdit, inSprint }) => {
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
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.6 : 1,
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
            className={cn(
                "flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/80 transition-all group cursor-grab active:cursor-grabbing border-none",
                isDragging ? 'bg-white shadow-2xl rounded-2xl ring-2 ring-primary-300 ring-offset-4 ring-offset-slate-100 z-50' : '',
                inSprint ? 'opacity-80 hover:opacity-100' : ''
            )}
        >
            <div className="shrink-0 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-slate-400" />
            </div>

            <div className="shrink-0">
                {type.icon}
            </div>

            <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onEdit(true); }}>
                <div className="flex items-center gap-3">
                    <span className="text-[13px] text-slate-800 font-bold truncate group-hover:text-primary-700 transition-colors cursor-pointer">{task.title}</span>
                    {(task.storyPoints ?? 0) > 0 && (
                        <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded flex items-center">
                            {task.storyPoints} pts
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-slate-400">
                    {task.comments && task.comments.length > 0 && (
                        <div className="flex items-center gap-1 group-hover:text-primary-400 transition-colors">
                            <Activity className="w-3 h-3" /> {task.comments.length}
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-1 group-hover:text-red-400 transition-colors">
                            <Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <Badge variant="outline" className={cn(
                    "text-[9px] font-bold h-5 px-2 rounded-md border-none uppercase flex items-center gap-1.5 shadow-none",
                    priority.bg,
                    priority.color
                )}>
                    {priority.icon} {priority.label}
                </Badge>

                {task.assigneeAvatar && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-black border border-white shadow-sm ring-2 ring-slate-50" title={task.assigneeName}>
                        {task.assigneeAvatar}
                    </div>
                )}

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                    <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 px-2 text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg flex items-center gap-1 border-none cursor-pointer outline-none transition-colors"
                    >
                        Actions
                    </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-2xl border-slate-100">
                            <DropdownMenuItem className="text-[11px] font-bold text-slate-600 rounded-lg py-2 flex items-center gap-2 cursor-pointer" onClick={() => onEdit(true)}>
                                Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-bold text-primary-600 rounded-lg py-2 flex items-center gap-2 cursor-pointer" onClick={() => onEdit(false)}>
                                Modifier les détails
                            </DropdownMenuItem>
                            {!task.sprintId && activeSprints.length > 0 && (
                                <>
                                    <DropdownMenuSeparator className="bg-slate-50 mx-1 my-1" />
                                    <p className="text-[9px] font-black text-slate-300 px-3 pt-2 pb-1 uppercase tracking-widest">Assigner au Sprint</p>
                                    {activeSprints.map(s => (
                                        <DropdownMenuItem
                                            key={s.id}
                                            className="text-[11px] font-black text-primary-700 bg-primary-50/50 hover:bg-primary-50 rounded-lg py-2 mt-1 flex items-center gap-2 cursor-pointer"
                                            onClick={() => onMoveToSprint(task.id, s.id)}
                                        >
                                            {s.name}
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

// Internal components/utils
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
