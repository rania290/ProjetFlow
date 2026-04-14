import React from 'react';
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
import {
    Plus,
    MoreHorizontal,
    CheckSquare,
    AlertCircle,
    TrendingUp,
    ArrowLeft,
    Activity,
    List,
    Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/projectStore';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types/project.types';

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
    MEDIUM: { label: 'Moyenne', dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <MoreHorizontal className="w-3 h-3 text-amber-500" /> },
    LOW: { label: 'Basse', dot: 'bg-blue-400', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <ArrowLeft className="w-3 h-3 -rotate-45 text-blue-500" /> },
};

const TYPE_CONFIG: Record<TaskType, { label: string; color: string; icon: React.ReactNode }> = {
    STORY: { label: 'Story', color: 'text-primary-600', icon: <div className="w-4 h-4 bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold rounded">S</div> },
    TASK: { label: 'Tâche', color: 'text-slate-600', icon: <CheckSquare className="w-3.5 h-3.5 text-slate-500" /> },
    BUG: { label: 'Bug', color: 'text-red-600', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> },
    IMPROVEMENT: { label: 'Amélioration', color: 'text-violet-600', icon: <TrendingUp className="w-3.5 h-3.5 text-violet-500 transition-transform rotate-45" /> },
};

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (id: string, status: TaskStatus) => void;
    onAddTask: (status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onStatusChange, onAddTask, onEditTask }) => {
    const { dispatch } = useStore();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        const overColumn = STATUS_COLUMNS.find(c => c.id === overId);
        if (overColumn) {
            if (activeTask.status !== overColumn.id) {
                onStatusChange(activeId, overColumn.id);
            }
            return;
        }

        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            if (activeTask.status !== overTask.status) {
                onStatusChange(activeId, overTask.status);
            } else {
                const columnTasks = tasks.filter(t => t.status === activeTask.status);
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 p-6 h-full overflow-x-auto min-h-0 bg-slate-50/30 custom-scrollbar" style={{ minHeight: 'calc(100vh - 250px)' }}>
                {STATUS_COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id);
                    return (
                        <DroppableColumn
                            key={col.id}
                            col={col}
                            colTasks={colTasks}
                            onAddTask={onAddTask}
                            onEditTask={onEditTask}
                        />
                    );
                })}
            </div>
        </DndContext>
    );
};

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
        <div ref={setNodeRef} className="flex-shrink-0 w-[300px] flex flex-col min-h-[500px]">
            <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl mb-4 border shadow-sm transition-all duration-300",
                col.headerBg,
                "border-slate-100"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className={cn("w-2 h-2 rounded-full", col.dot, "shadow-[0_0_8px_rgba(0,0,0,0.1)]")} />
                    <h3 className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", col.color)}>{col.label}</h3>
                    <Badge variant="outline" className="h-5 px-1.5 min-w-[20px] justify-center bg-white border-slate-200 text-slate-400 font-bold text-[9px] rounded-lg">
                        {colTasks.length}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onAddTask(col.id)}
                    className="h-7 w-7 rounded-lg hover:bg-white text-slate-400 hover:text-primary-600 transition-all border-none bg-transparent"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className={cn(
                "flex-1 rounded-2xl transition-all duration-300 space-y-3 p-1 overflow-y-auto custom-scrollbar",
                isOver ? 'bg-primary-50/40 ring-2 ring-primary-300 ring-dashed shadow-inner' : ''
            )}>
                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
                    ))}
                </SortableContext>

                {colTasks.length === 0 && !isOver && (
                    <div className="h-32 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 opacity-50 transition-opacity hover:opacity-100 group">
                        <Plus className="w-5 h-5 text-slate-300 group-hover:text-primary-400 transition-colors" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ajouter une tâche</p>
                    </div>
                )}
            </div>
        </div>
    );
};

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
        zIndex: isDragging ? 100 : 'auto',
    };

    const priority = PRIORITY_CONFIG[task.priority];
    const type = TYPE_CONFIG[task.type];

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className={cn(
                "group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all cursor-grab active:cursor-grabbing select-none hover:-translate-y-1 active:scale-[0.98]",
                isDragging ? 'opacity-40 ring-2 ring-primary-500 shadow-2xl scale-[1.02]' : ''
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{type.icon}</span>
                    <h4 className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-2 pr-1">{task.title}</h4>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-all"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[9px] font-bold border-none h-5 px-1.5 rounded-md flex items-center gap-1",
                        priority.bg,
                        priority.color
                    )}
                >
                    {priority.icon} {priority.label.substring(0, 1).toUpperCase()}
                </Badge>
                {task.tags && task.tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[9px] h-5 px-1.5 rounded-md bg-slate-50 text-slate-500 border-slate-100 font-medium">
                        {tag}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-3">
                    {task.storyPoints !== undefined && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {task.storyPoints}
                        </div>
                    )}
                    {task.comments && task.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold group-hover:text-primary-500 transition-colors">
                            <Activity className="w-3 h-3" /> {task.comments.length}
                        </div>
                    )}
                    {task.acceptanceCriteria && (
                        <div className="flex items-center gap-1 text-slate-300 group-hover:text-blue-500 transition-colors">
                            <List className="w-3 h-3" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {task.dueDate && (
                        <div className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </div>
                    )}
                    {task.assigneeAvatar && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white shadow-sm flex items-center justify-center text-white text-[9px] font-black" title={task.assigneeName}>
                            {task.assigneeAvatar}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

// Utility function for cn
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
