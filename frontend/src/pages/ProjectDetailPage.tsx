import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/auraStore';

import {

    ArrowLeft, Plus, Play, Archive, MoreHorizontal, GripVertical,

    Layers, CheckSquare, Clock, User2, List,

    Zap, CalendarDays, X, AlertCircle, Activity, PieChart, TrendingUp, Users,

    MessageCircle, FileText, Info, Tag, Target

} from 'lucide-react';

import { AppLayout } from '../components/layout/AppLayout';

import { useStore } from '../store/projectStore';
import { AuthContext } from '../store/authStore';
import { useContext } from 'react';

import type { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '../types/project.types';

import { BurndownChart } from '../components/charts/BurndownChart';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';

import { ProjectToolbar } from '../components/projects/ProjectToolbar';

import { ProjectTableBoard } from '../components/projects/ProjectTableBoard';

import { ProjectCalendarView } from '../components/projects/ProjectCalendarView';

import { BoardDiscussionPanel } from '../components/projects/BoardDiscussionPanel';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskEditModal } from '../components/tasks/TaskEditModal';
import { CreateSprintModal } from '../components/projects/CreateSprintModal';
import { AddMemberModal } from '../components/projects/AddMemberModal';
import { KanbanBoard } from '../components/projects/KanbanBoard';
import { BacklogView as MultiBacklogView } from '../components/projects/BacklogView';
import { SprintsView } from '../components/projects/SprintsView';
import { SprintReportModal } from '../components/projects/SprintReportModal';
import { ProjectDashboardView } from '../components/projects/ProjectDashboardView';
import { projectsService } from '../api/projects.service';


import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Separator } from '@/components/ui/separator';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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

const getStatusColumns = (t: any): { id: TaskStatus; label: string; color: string; headerBg: string; dot: string }[] => [
    { id: 'TODO', label: t('projects.task_status.TODO'), color: 'text-slate-500', headerBg: 'bg-slate-50', dot: 'bg-slate-400' },
    { id: 'IN_PROGRESS', label: t('projects.task_status.IN_PROGRESS'), color: 'text-blue-600', headerBg: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'IN_TEST', label: t('projects.task_status.IN_TEST'), color: 'text-violet-600', headerBg: 'bg-violet-50', dot: 'bg-violet-500' },
    { id: 'DONE', label: t('projects.task_status.DONE'), color: 'text-emerald-600', headerBg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const getPriorityConfig = (t: any): Record<TaskPriority, { label: string; dot: string; color: string; bg: string; border: string; icon: React.ReactNode }> => ({
    CRITICAL: { label: t('projects.task_priority.CRITICAL'), dot: 'bg-red-500', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> },
    HIGH: { label: t('projects.task_priority.HIGH'), dot: 'bg-orange-500', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <TrendingUp className="w-3.5 h-3.5 text-orange-500" /> },
    MEDIUM: { label: t('projects.task_priority.MEDIUM'), dot: 'bg-amber-400', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <MoreHorizontal className="w-3.5 h-3.5 text-amber-500" /> },
    LOW: { label: t('projects.task_priority.LOW'), dot: 'bg-blue-400', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Clock className="w-3.5 h-3.5 text-blue-500" /> },
});

const getTypeConfig = (t: any): Record<TaskType, { label: string; color: string; icon: React.ReactNode }> => ({
    STORY: { label: t('projects.task_type.STORY'), color: 'text-primary-600', icon: <div className="w-4 h-4 bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold rounded">S</div> },
    TASK: { label: t('projects.task_type.TASK'), color: 'text-slate-600', icon: <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> },
    BUG: { label: t('projects.task_type.BUG'), color: 'text-red-600', icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" /> },
    IMPROVEMENT: { label: t('projects.task_type.IMPROVEMENT'), color: 'text-violet-600', icon: <TrendingUp className="w-3.5 h-3.5 text-violet-400 rotate-45" /> },
});

const FIBONACCI_POINTS = [0, 1, 2, 3, 5, 8, 13, 21];

// Local Modals removed in favor of shared components


// Local component definitions removed in favor of shared components imported from src/components/




// ProjectDashboardView was removed and imported instead.






const getStatusConfig = (t: any): Record<string, { label: string, color: string }> => ({
    PLANNED: { label: t('projects.status_labels.PLANNED').toUpperCase(), color: 'bg-slate-100 text-slate-600 border-slate-200' },
    IN_PROGRESS: { label: t('projects.status_labels.IN_PROGRESS').toUpperCase(), color: 'bg-blue-50 text-blue-700 border-blue-200' },
    DELIVERED: { label: t('projects.status_labels.DELIVERED').toUpperCase(), color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    SUSPENDED: { label: t('projects.status_labels.SUSPENDED').toUpperCase(), color: 'bg-amber-50 text-amber-800 border-amber-200' },
});

// ===== MAIN PAGE =====

export const ProjectDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const STATUS_CONFIG = getStatusConfig(t);

    const { projectId } = useParams<{ projectId: string }>();

    const { state, dispatch } = useStore();
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();



    // Aura IA global state
    const { toggleOpen, isOpen: isAuraOpen } = useAuraStore();



    const project = state.projects.find(p => p.id === projectId);
    
    const userRole = (user?.role || '').toUpperCase();
    const isManagerOrAdmin =
        userRole === 'ADMIN' ||
        userRole === 'SUPER_ADMIN' ||
        userRole === 'PROJECT_MANAGER' ||
        userRole === 'MANAGER' ||
        (project && user?.id === project.managerId);


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
    const [createTaskDate, setCreateTaskDate] = useState<string | undefined>(undefined);

    const [showAddMember, setShowAddMember] = useState(false);

    const [showDiscussion, setShowDiscussion] = useState(false);

    const [showCreateSprint, setShowCreateSprint] = useState(false);

    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprint?.id ?? sprints[0]?.id ?? '');

    const [createTaskSprintId, setCreateTaskSprintId] = useState<string | undefined>(undefined);

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditingReadOnly, setIsEditingReadOnly] = useState(false);

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

    // Load tasks from API and enrich with project member info
    React.useEffect(() => {
        if (!projectId || !project) return;

        const loadTasks = async () => {
            try {
                const rawTasks = await projectsService.getAllTasks(projectId);

                // Enrich tasks: backend doesn't store assigneeName/assigneeAvatar,
                // so we join them from the project's members list here.
                const members = project.members || [];
                const enrichedTasks = rawTasks.map((t: any) => {
                    const member = t.assigneeId
                        ? members.find((m: any) => String(m.id) === String(t.assigneeId))
                        : undefined;
                    return {
                        ...t,
                        comments:       t.comments       ?? [],
                        subTasks:       t.subTasks       ?? [],
                        tags:           t.tags           ?? [],
                        assigneeName:   member?.fullName ?? t.assigneeName,
                        assigneeAvatar: member?.avatar   ?? t.assigneeAvatar,
                    };
                });

                dispatch({ type: 'SET_TASKS', tasks: enrichedTasks });
            } catch (error) {
                console.error("Failed to load project tasks:", error);
            }
        };
        loadTasks();
    }, [projectId, project?.members?.length, dispatch]); // re-run if members change




    if (!project) {
        return (
            <AppLayout title={t('projects.project_not_found')}>
                <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">{t('projects.project_not_exist')}</p>
                    <button onClick={() => navigate('/projects')}
                        className="text-primary-600 font-semibold hover:underline">
                        {t('common.back_to_projects')}
                    </button>
                </div>
            </AppLayout>
        );
    }



    const currentSprintForBoard = sprints.find(s => s.id === selectedSprintId) ?? activeSprint ?? sprints[0];

    // • 'table'  → toutes les tâches du projet (sans filtre sprint)
    // • 'board' / 'calendar' → tâches du sprint sélectionné,
    //   MAIS si aucun sprint n'existe ou si le sprint est vide,
    //   on affiche quand même toutes les tâches du projet.
    const sprintFilteredTasks = currentSprintForBoard
        ? projectTasks.filter(t => t.sprintId === currentSprintForBoard.id)
        : projectTasks;

    const boardTasks = (tab === 'table')
        ? projectTasks
        : (sprintFilteredTasks.length > 0 ? sprintFilteredTasks : projectTasks);



    return (

        <AppLayout
            title={project.name}
            subtitle={t('projects.view_mode', { 
                mode: project.viewMode || 'BOARD', 
                type: project.type, 
                client: project.clientName ?? 'Interne', 
                count: project.members?.length || 0 
            })}
        >

            <div className="absolute top-4 right-20 z-50">
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg ${STATUS_CONFIG[project.status]?.color || 'bg-white text-slate-600'}`}>
                    {STATUS_CONFIG[project.status]?.label || project.status}
                </span>
            </div>

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
                                <span>{t('common.global_progress')}</span>
                                <span className="font-semibold text-slate-600">{project.progress}%</span>
                            </div>

                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                                <div

                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"

                                    style={{ width: `${project.progress}%` }}

                                />

                            </div>

                        </div>



                        {/* Members with enhanced keys and styling */}
                        <div className="flex -space-x-2 ml-auto">
                            {(project.members || [])
                                .filter(m => m.role !== 'ADMIN')
                                .map((m, idx) => (
                                <div
                                    key={m.id || `member-${idx}`}
                                    title={m.fullName}
                                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 text-[10px] font-black shadow-sm transition-transform hover:scale-110 hover:z-20"
                                >
                                    {m.avatar || m.fullName.charAt(0)}
                                </div>
                            ))}
                            {isManagerOrAdmin && (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="w-8 h-8 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all z-10 shadow-sm"
                                    title={t('projects.add_members')}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>



                        <div className="w-px h-5 bg-slate-200 mx-3 opacity-60"></div>



                        <button
                            onClick={() => setShowDiscussion(true)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent shadow-sm flex items-center gap-1.5"
                            title={t('common.discussion')}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold">{t('common.discussion')}</span>
                        </button>



                        <div className="w-px h-5 bg-slate-200 mx-3 opacity-60"></div>

                    </div>



                    {/* TABS — scroll horizontal pour afficher Board/Kanban sur tous les écrans */}
                    <div className="overflow-x-auto border-b border-slate-100 -mx-6 px-6 scrollbar-thin">
                    <div className="flex gap-0 min-w-max bg-white">

                        {([
                            { id: 'table', label: t('projects.main_table'), icon: <List className="w-3.5 h-3.5" /> },
                            { id: 'board', label: t('projects.kanban_view', 'Board'), icon: <Layers className="w-3.5 h-3.5" /> },
                            { id: 'calendar', label: t('projects.calendar_view'), icon: <CalendarDays className="w-3.5 h-3.5" /> },
                            { id: 'backlog', label: t('projects.backlog'), icon: <CheckSquare className="w-3.5 h-3.5" /> },
                            { id: 'sprints', label: t('projects.sprints'), icon: <Zap className="w-3.5 h-3.5" /> },
                            { id: 'dashboard', label: t('projects.kpi_indicators'), icon: <Activity className="w-3.5 h-3.5" /> },
                        ] as { id: 'table' | 'board' | 'calendar' | 'backlog' | 'sprints' | 'dashboard'; label: string; icon: React.ReactNode }[]).map(tabItem => (

                            <button

                                key={tabItem.id}

                                onClick={() => setTab(tabItem.id)}

                                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${tab === tabItem.id

                                    ? 'border-primary-500 text-primary-700'

                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}

                            >

                                {tabItem.icon}{tabItem.label}

                            </button>

                        ))}

                    </div>
                    </div>

                </div>



                {/* ===== CONTENT ===== */}

                <div className="flex-1 overflow-auto bg-slate-50">



                    {/* SPRINT SELECTOR */}

                    {(tab === 'board' || tab === 'calendar') && sprints.length > 0 && (

                        <div className="flex items-center gap-2 px-6 py-3 bg-white/50 border-b border-slate-100">

                            {sprints.map(s => (

                                <button key={s.id} onClick={() => setSelectedSprintId(s.id)}

                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${selectedSprintId === s.id

                                        ? 'bg-primary-600 text-white border-primary-600'

                                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>

                                    {s.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}

                                    {s.name}

                                    <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${s.status === 'ACTIVE' ? 'bg-white/30' : s.status === 'COMPLETED' ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                                        {s.status === 'ACTIVE' ? t('common.active') : s.status === 'PLANNED' ? t('common.planned') : t('common.completed')}
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

                            onAddTask={() => { setCreateTaskSprintId(undefined); setShowCreateTask(true); }}

                            onAddSprint={() => setShowCreateSprint(true)}
                            onAddMember={isManagerOrAdmin ? () => setShowAddMember(true) : () => {}}

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

                                        onStatusChange={async (taskId, status) => {
                                            const t = state.tasks.find(x => String(x.id) === String(taskId));
                                            if (t) {
                                                dispatch({ type: 'UPDATE_TASK_STATUS', id: taskId, status });
                                                try {
                                                    await projectsService.updateTask(taskId, { status });
                                                } catch (e) {
                                                    console.error("Failed to sync task status:", e);
                                                }
                                            }
                                        }}

                                        onAssigneeChange={async (taskId, assigneeId) => {
                                            const t = state.tasks.find(x => String(x.id) === String(taskId));
                                            if (t) {
                                                const m = assigneeId ? (project.members || []).find(x => String(x.id) === String(assigneeId)) : undefined;
                                                const updatedTask = { 
                                                    ...t, 
                                                    assigneeId: assigneeId, 
                                                    assigneeName: m?.fullName || undefined, 
                                                    assigneeAvatar: m?.avatar || undefined 
                                                };
                                                dispatch({ type: 'UPDATE_TASK', task: updatedTask });
                                                try {
                                                    await projectsService.updateTask(taskId, { assigneeId });
                                                } catch (e) {
                                                    console.error("Failed to sync task assignee:", e);
                                                }
                                            }
                                        }}

                                        onPriorityChange={async (taskId, priority) => {
                                            const t = state.tasks.find(x => x.id === taskId);
                                            if (t) {
                                                dispatch({ type: 'UPDATE_TASK', task: { ...t, priority } });
                                                try {
                                                    await projectsService.updateTask(taskId, { priority });
                                                } catch (e) {
                                                    console.error("Failed to sync task priority:", e);
                                                }
                                            }
                                        }}

                                        onUpdateTaskTitle={async (taskId, title) => {
                                            const t = state.tasks.find(x => x.id === taskId);
                                            if (t) {
                                                dispatch({ type: 'UPDATE_TASK', task: { ...t, title } });
                                                try {
                                                    await projectsService.updateTask(taskId, { title });
                                                } catch (e) {
                                                    console.error("Failed to sync task title:", e);
                                                }
                                            }
                                        }}


                                        onAddTask={(status) => {

                                            setCreateTaskSprintId(selectedSprintId || activeSprint?.id);

                                            setCreateTaskStatus(status);

                                            setShowCreateTask(true);

                                        }}

                                        onQuickAddTask={async (title, status) => {
                                            const taskData = {
                                                projectId: project.id,
                                                sprintId: selectedSprintId || activeSprint?.id || undefined,
                                                title,
                                                description: '',
                                                type: 'STORY',
                                                status,
                                                priority: 'MEDIUM',
                                                tags: [],
                                                storyPoints: 0
                                            };
                                            try {
                                                const createdTask = await projectsService.createTask(taskData);
                                                dispatch({ type: 'ADD_TASK', task: createdTask });
                                                if (createdTask.sprintId) dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId: createdTask.id, sprintId: createdTask.sprintId });
                                            } catch (error) {
                                                console.error("Failed to quick add task:", error);
                                            }
                                        }}

                                        onOpenTaskDetails={(task, isReadOnly = false) => {
                                            setIsEditingReadOnly(isReadOnly);
                                            setEditingTask(task);
                                        }}

                                        onDuplicateTask={async (taskId) => {
                                            const task = state.tasks.find(t => t.id === taskId);
                                            if (task) {
                                                try {
                                                    const { id, createdAt, updatedAt, ...newTaskData } = task as any;
                                                    const duplicatedTask = await projectsService.createTask({
                                                        ...newTaskData,
                                                        title: `${task.title} ${t('projects.copy_suffix')}`
                                                    });
                                                    dispatch({ type: 'ADD_TASK', task: duplicatedTask });
                                                } catch (error) {
                                                    console.error("Failed to duplicate task:", error);
                                                }
                                            }
                                        }}

                                        onDeleteTask={async (taskId) => {
                                            try {
                                                await projectsService.deleteTask(taskId);
                                                dispatch({ type: 'DELETE_TASK', id: taskId });
                                            } catch (error) {
                                                console.error("Failed to delete task:", error);
                                            }
                                        }}

                                    />

                                )}



                                {/* KANBAN / SCRUM BOARD */}

                                {tab === 'board' && (

                                    <KanbanBoard

                                        tasks={filteredTasks}

                                        onStatusChange={async (taskId, status) => {
                                            try {
                                                await projectsService.updateTask(taskId, { status });
                                                dispatch({ type: 'UPDATE_TASK_STATUS', id: taskId, status });
                                            } catch (error) {
                                                console.error("Failed to update task status:", error);
                                            }
                                        }}

                                        onAddTask={() => { setCreateTaskSprintId(activeSprint?.id); setShowCreateTask(true); }}

                                        onEditTask={(task, isReadOnly = false) => {
                                            setIsEditingReadOnly(isReadOnly);
                                            setEditingTask(task);
                                        }}

                                    />

                                )}



                                {/* CALENDAR VIEW */}

                                {tab === 'calendar' && (

                                    <ProjectCalendarView

                                        tasks={filteredTasks}

                                        onOpenTaskDetails={(task, isReadOnly = false) => {
                                            setIsEditingReadOnly(isReadOnly);
                                            setEditingTask(task);
                                        }}

                                        onAddTask={(date) => {
                                            const tzOffset = date.getTimezoneOffset() * 60000;
                                            const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 10);
                                            setCreateTaskDate(localISOTime);
                                            setCreateTaskSprintId(selectedSprintId || activeSprint?.id);
                                            setShowCreateTask(true);
                                        }}

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

                            onMoveToSprint={async (taskId, sprintId) => {
                                try {
                                    await projectsService.updateTask(taskId, { sprintId });
                                    dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId, sprintId });
                                } catch (error) {
                                    console.error("Failed to move task to sprint:", error);
                                }
                            }}

                            onEditTask={(task, isReadOnly = false) => {
                                 setIsEditingReadOnly(isReadOnly);
                                 setEditingTask(task);
                             }}

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

                                const s = sprints.find(x => x.id === id);

                                if (s) setReportSprint(s);

                            }}

                            onViewReport={(id) => {

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



            {/* Aura Toggle Button - Global Trigger */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${
                    isAuraOpen
                        ? 'bg-slate-800 text-white border-2 border-slate-700'
                        : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-2 border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                }`}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAuraOpen ? '' : 'animate-pulse'}`}>
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
            </motion.button>



            {/* MODALS */}

            <AnimatePresence>

                <CreateTaskModal
                    key="create-task-modal"
                    isOpen={showCreateTask}
                    projectId={project.id}
                    sprintId={createTaskSprintId}
                    defaultStatus={createTaskStatus}
                    defaultDueDate={createTaskDate}
                    sprints={sprints}
                    onClose={() => { setShowCreateTask(false); setCreateTaskDate(undefined); setCreateTaskStatus(undefined); }}
                    onCreated={(task) => {
                        dispatch({ type: 'ADD_TASK', task });
                        if (task.sprintId) {
                            dispatch({ type: 'MOVE_TASK_TO_SPRINT', taskId: task.id, sprintId: task.sprintId });
                        }
                    }}
                />

                <CreateSprintModal
                    key="create-sprint-modal"
                    isOpen={showCreateSprint}
                    projectId={project.id}
                    onClose={() => setShowCreateSprint(false)}
                    onCreated={(sprint) => {
                        dispatch({ type: 'ADD_SPRINT', sprint });
                        setSelectedSprintId(sprint.id);
                    }}
                />

                <AddMemberModal
                    key="add-member-modal"
                    isOpen={showAddMember}
                    existingMemberIds={(project.members || []).map(m => m.id)}
                    onClose={() => setShowAddMember(false)}
                    onAdd={(member: any) => {
                        dispatch({ type: 'ADD_PROJECT_MEMBER', projectId: project.id, member });
                        setShowAddMember(false);
                    }}
                />

                <TaskEditModal
                    key="task-edit-modal"
                    isOpen={!!editingTask}
                    task={editingTask!}
                    isReadOnly={isEditingReadOnly}
                    sprints={sprints}
                    projectMembers={project.members || []}
                    onClose={() => setEditingTask(null)}
                    onUpdate={async (task) => {
                        try {
                            await projectsService.updateTask(task.id, task);
                            dispatch({ type: 'UPDATE_TASK', task });
                            setEditingTask(null);
                        } catch (error) {
                            console.error("Failed to update task:", error);
                        }
                    }}
                    onDuplicate={async (task) => {
                        try {
                            const { id, ...newTaskData } = task; // backend generates ID
                            const createdTask = await projectsService.createTask(newTaskData);
                            dispatch({ type: 'ADD_TASK', task: createdTask });
                        } catch (error) {
                            console.error("Failed to duplicate task:", error);
                        }
                    }}
                    onDelete={async (id) => {
                        try {
                            await projectsService.deleteTask(id);
                            dispatch({ type: 'DELETE_TASK', id });
                        } catch (error) {
                            console.error("Failed to delete task:", error);
                        }
                    }}
                />

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
                projectId={project.id}
                projectName={project.name}
                members={(project.members || []).map(m => ({ id: m.id, fullName: m.fullName, avatar: m.avatar }))}
            />



            <SprintReportModal
                isOpen={!!reportSprint}
                sprint={reportSprint!}
                tasks={projectTasks.filter(t => t.sprintId === reportSprint?.id)}
                onClose={() => setReportSprint(null)}
                onConfirmClose={(id) => {
                    dispatch({ type: 'UPDATE_SPRINT_STATUS', id, status: 'COMPLETED' });
                    setReportSprint(null);
                    setShowSuccessToast('Sprint clôturé avec succès. Les tâches non terminées ont été renvoyées au backlog.');
                    setTimeout(() => setShowSuccessToast(null), 5000);
                }}
            />





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


