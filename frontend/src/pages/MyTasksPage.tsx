import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2,
    Circle,
    Clock,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
    Search,
    ArrowUpRight,
    AlertTriangle,
    Play,
    FlaskConical,
    Tag,
    CalendarDays,
    FolderKanban,
} from 'lucide-react';
import { useStore } from '../store/projectStore';
import type { Task, TaskStatus } from '../types/project.types';
import { TaskTimerButton } from '../components/tasks/TaskTimerButton';

// Configs moved inside component to use t() — see STATUS_CONFIG / PRIORITY_CONFIG / TYPE_CONFIG below

const STATUS_ICONS: Record<string, React.ElementType> = {
    TODO: Circle,
    IN_PROGRESS: Play,
    IN_TEST: FlaskConical,
    DONE: CheckCircle2,
};

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; dot: string }> = {
    TODO: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-300' },
    IN_PROGRESS: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    IN_TEST: { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-500' },
    DONE: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

const PRIORITY_STYLES: Record<string, { color: string; bg: string }> = {
    LOW: { color: 'text-slate-500', bg: 'bg-slate-100' },
    MEDIUM: { color: 'text-amber-700', bg: 'bg-amber-100' },
    HIGH: { color: 'text-orange-700', bg: 'bg-orange-100' },
    CRITICAL: { color: 'text-red-700', bg: 'bg-red-100' },
};

const useTaskConfigs = () => {
    const { t } = useTranslation();

    const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string; dot: string }> = {
        TODO: { label: t('projects.task_status.TODO'), icon: STATUS_ICONS.TODO, ...STATUS_STYLES.TODO },
        IN_PROGRESS: { label: t('projects.task_status.IN_PROGRESS'), icon: STATUS_ICONS.IN_PROGRESS, ...STATUS_STYLES.IN_PROGRESS },
        IN_TEST: { label: t('projects.task_status.IN_TEST'), icon: STATUS_ICONS.IN_TEST, ...STATUS_STYLES.IN_TEST },
        DONE: { label: t('projects.task_status.DONE'), icon: STATUS_ICONS.DONE, ...STATUS_STYLES.DONE },
    };

    const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
        LOW: { label: t('projects.task_priority.LOW'), ...PRIORITY_STYLES.LOW },
        MEDIUM: { label: t('projects.task_priority.MEDIUM'), ...PRIORITY_STYLES.MEDIUM },
        HIGH: { label: t('projects.task_priority.HIGH'), ...PRIORITY_STYLES.HIGH },
        CRITICAL: { label: t('projects.task_priority.CRITICAL'), ...PRIORITY_STYLES.CRITICAL },
    };

    const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
        STORY: { label: t('projects.task_type.STORY'), color: 'text-indigo-600' },
        BUG: { label: t('projects.task_type.BUG'), color: 'text-red-600' },
        TASK: { label: t('projects.task_type.TASK'), color: 'text-blue-600' },
        IMPROVEMENT: { label: t('projects.task_type.IMPROVEMENT'), color: 'text-teal-600' },
    };

    return { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG, t };
};

export const MyTasksPage: React.FC = () => {
    const { state, dispatch } = useStore();
    const navigate = useNavigate();
    const { t, STATUS_CONFIG } = useTaskConfigs();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

    // All tasks from all projects in store
    const allTasks = useMemo(() => state.tasks, [state.tasks]);

    // Project name lookup
    const projectMap = useMemo(() => {
        const map: Record<string, string> = {};
        state.projects.forEach(p => { map[p.id] = p.name; });
        return map;
    }, [state.projects]);

    const filteredTasks = useMemo(() => {
        return allTasks.filter(t => {
            const q = search.toLowerCase();
            const matchSearch = t.title.toLowerCase().includes(q) || (t.assigneeName || '').toLowerCase().includes(q);
            const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [allTasks, search, statusFilter]);

    const columns = useMemo((): { status: TaskStatus; tasks: Task[] }[] =>
        (['TODO', 'IN_PROGRESS', 'IN_TEST', 'DONE'] as TaskStatus[]).map(s => ({
            status: s,
            tasks: filteredTasks.filter(t => t.status === s),
        })),
        [filteredTasks]
    );

    const handleToggleDone = (task: Task) => {
        const next: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        dispatch({ type: 'UPDATE_TASK_STATUS', id: task.id, status: next });
    };

    const goToProject = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_PROJECT', id: projectId });
        navigate(`/projects/${projectId}`);
    };

    const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;
    const todayCount = allTasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        const today = new Date();
        return d.toDateString() === today.toDateString() && t.status !== 'DONE';
    }).length;

    const isEmpty = allTasks.length === 0;

    return (
        <div className="min-h-full bg-[#f8fafc]">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('team_custom.tasks')}</h1>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">
                                {allTasks.length} {allTasks.length !== 1 ? t('team_custom.tasks') : t('projects.task_status.TODO').toLowerCase()} {t('common.ongoing_projects').toLowerCase().replace('projects','').replace('projets','')} {state.projects.length}
                            </p>
                        </div>

                        {/* View toggle + search */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={t('common.search')}
                                    className="pl-9 pr-3 py-1.5 w-52 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <ListIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick stats + Status filters */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {overdueCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-bold text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                {overdueCount} {t('team_custom.overdue')}
                            </div>
                        )}
                        {todayCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
                                <CalendarDays className="w-3 h-3" />
                                {todayCount} {t('common.today').toLowerCase()}
                            </div>
                        )}
                        <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
                        {(['ALL', 'TODO', 'IN_PROGRESS', 'IN_TEST', 'DONE'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${statusFilter === s ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                {s === 'ALL' ? t('team_custom.all_roles').replace('rôles', 'tâches').replace('roles', 'tasks') : STATUS_CONFIG[s].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {isEmpty ? (
                    <EmptyState onGoProjects={() => navigate('/projects')} />
                ) : viewMode === 'list' ? (
                    <ListView tasks={filteredTasks} projectMap={projectMap} onToggle={handleToggleDone} onGoProject={goToProject} />
                ) : (
                    <BoardView columns={columns} projectMap={projectMap} onToggle={handleToggleDone} onGoProject={goToProject} />
                )}
            </div>
        </div>
    );
};

/* ==================== LIST VIEW ==================== */
const ListView: React.FC<{
    tasks: Task[];
    projectMap: Record<string, string>;
    onToggle: (t: Task) => void;
    onGoProject: (id: string, e: React.MouseEvent) => void;
}> = ({ tasks, projectMap, onToggle, onGoProject }) => {
    const { t, STATUS_CONFIG } = useTaskConfigs();

    // Group by status
    const groups: { status: TaskStatus; label: string; tasks: Task[] }[] = (
        [
            { status: 'IN_PROGRESS', label: t('projects.task_status.IN_PROGRESS'), tasks: tasks.filter(t => t.status === 'IN_PROGRESS') },
            { status: 'TODO', label: t('projects.task_status.TODO'), tasks: tasks.filter(t => t.status === 'TODO') },
            { status: 'IN_TEST', label: t('projects.task_status.IN_TEST'), tasks: tasks.filter(t => t.status === 'IN_TEST') },
            { status: 'DONE', label: t('projects.task_status.DONE'), tasks: tasks.filter(t => t.status === 'DONE') },
        ] as { status: TaskStatus; label: string; tasks: Task[] }[]
    ).filter(g => g.tasks.length > 0);

    if (tasks.length === 0) return <NoResults />;

    return (
        <div className="space-y-6">
            {groups.map(({ status, label, tasks: groupTasks }) => {
                const conf = STATUS_CONFIG[status];
                const Icon = conf.icon;
                return (
                    <div key={status} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Group header */}
                        <div className={`flex items-center gap-3 px-5 py-3 border-b border-slate-100 ${conf.bg}`}>
                            <div className={`w-2 h-2 rounded-full ${conf.dot}`} />
                            <Icon className={`w-4 h-4 ${conf.color}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${conf.color}`}>{label}</span>
                            <span className="ml-1 text-xs font-bold text-slate-400">({groupTasks.length})</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {groupTasks.map(task => (
                                    <TaskRow key={task.id} task={task} projectName={projectMap[task.projectId]} onToggle={onToggle} onGoProject={onGoProject} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const TaskRow: React.FC<{
    task: Task;
    projectName: string;
    onToggle: (t: Task) => void;
    onGoProject: (id: string, e: React.MouseEvent) => void;
}> = ({ task, projectName, onToggle, onGoProject }) => {
    const { PRIORITY_CONFIG, TYPE_CONFIG } = useTaskConfigs();
    const isDone = task.status === 'DONE';
    const prConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const typeConf = TYPE_CONFIG[task.type] || TYPE_CONFIG.TASK;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

    return (
        <motion.div
            layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
        >
            {/* Checkbox */}
            <button
                onClick={() => onToggle(task)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400 text-transparent hover:text-indigo-400'
                    }`}
            >
                <CheckCircle2 className="w-3.5 h-3.5" />
            </button>

            {/* Type dot */}
            <span className={`text-[10px] font-bold flex-shrink-0 ${typeConf.color}`}>{typeConf.label}</span>

            {/* Title */}
            <span className={`flex-1 text-sm font-semibold truncate ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {task.title}
            </span>

            {/* Priority */}
            <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${prConf.bg} ${prConf.color}`}>
                {prConf.label}
            </span>

            {/* Project link */}
            {projectName && (
                <button
                    onClick={e => onGoProject(task.projectId, e)}
                    className="hidden md:flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg transition-colors flex-shrink-0"
                >
                    <FolderKanban className="w-3 h-3" />
                    <span className="max-w-[110px] truncate">{projectName}</span>
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            )}

            {/* Due date */}
            {task.dueDate && (
                <div className={`hidden sm:flex items-center gap-1 text-[11px] font-bold flex-shrink-0 ${isOverdue ? 'text-red-600' : 'text-slate-400'
                    }`}>
                    <CalendarDays className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
            )}

            {/* Assignee */}
            <div className="flex items-center gap-2">
                <div onClick={e => e.stopPropagation()}>
                    <TaskTimerButton task={{ id: task.id, title: task.title, projectId: task.projectId }} />
                </div>
                {task.assigneeName && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-black text-indigo-700 flex-shrink-0" title={task.assigneeName}>
                        {task.assigneeName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ==================== BOARD VIEW ==================== */
const BoardView: React.FC<{
    columns: { status: TaskStatus; tasks: Task[] }[];
    projectMap: Record<string, string>;
    onToggle: (t: Task) => void;
    onGoProject: (id: string, e: React.MouseEvent) => void;
}> = ({ columns, projectMap, onToggle, onGoProject }) => {
    const { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } = useTaskConfigs();

    return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {columns.map(({ status, tasks }) => {
            const conf = STATUS_CONFIG[status];
            const Icon = conf.icon;
            return (
                <div key={status} className="w-72 flex-shrink-0 rounded-2xl bg-slate-100/60 border border-slate-200 overflow-hidden">
                    {/* Column header */}
                    <div className={`flex items-center gap-2 p-4 ${conf.bg}`}>
                        <div className={`w-2 h-2 rounded-full ${conf.dot}`} />
                        <Icon className={`w-4 h-4 ${conf.color}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${conf.color}`}>{conf.label}</span>
                        <span className="ml-auto text-xs font-bold text-slate-400">{tasks.length}</span>
                    </div>

                    {/* Cards */}
                    <div className="p-3 space-y-3">
                        <AnimatePresence>
                            {tasks.map(task => {
                                const prConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                                const typeConf = TYPE_CONFIG[task.type] || TYPE_CONFIG.TASK;
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                                return (
                                    <motion.div
                                        layout key={task.id}
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-start gap-2 mb-3">
                                            <button
                                                onClick={() => onToggle(task)}
                                                className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 transition-all ${task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'
                                                    }`}
                                            />
                                            <p className={`text-sm font-semibold leading-snug flex-1 ${task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {task.title}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${prConf.bg} ${prConf.color}`}>{prConf.label}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 ${typeConf.color}`}>{typeConf.label}</span>
                                            {task.tags?.slice(0, 1).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1">
                                                    <Tag className="w-2.5 h-2.5" />{tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            {projectMap[task.projectId] ? (
                                                <button
                                                    onClick={e => onGoProject(task.projectId, e)}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 max-w-[130px] truncate"
                                                >
                                                    <FolderKanban className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{projectMap[task.projectId]}</span>
                                                </button>
                                            ) : <div />}

                                            <div className="flex items-center gap-2">
                                                {task.dueDate && (
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                                <div onClick={e => e.stopPropagation()}>
                                                    <TaskTimerButton task={{ id: task.id, title: task.title, projectId: task.projectId }} />
                                                </div>
                                                {task.assigneeName && (
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-black text-indigo-700" title={task.assigneeName}>
                                                        {task.assigneeName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {tasks.length === 0 && (
                            <div className="py-6 text-center text-xs font-bold text-slate-300 border-2 border-dashed border-slate-200 rounded-xl">
                                {STATUS_CONFIG.TODO.label === 'À faire' ? 'Aucune tâche' : 'No tasks'}
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
    );
};

const NoResults = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
            <Search className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-500">{t('team_custom.no_results')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('team_custom.search_hint')}</p>
        </div>
    );
};

const EmptyState: React.FC<{ onGoProjects: () => void }> = ({ onGoProjects }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-base font-black text-slate-700 mb-1">{t('dashboard_custom.no_active_projects')}</h3>
            <p className="text-sm text-slate-400 mb-5 text-center max-w-xs">
                {t('team_custom.create_project_hint')}
            </p>
            <button
                onClick={onGoProjects}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
                <FolderKanban className="w-4 h-4" />
                {t('common.projects')}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};
