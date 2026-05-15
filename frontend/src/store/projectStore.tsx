import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Project, Task, Sprint, DashboardStats, ProjectStatus, TaskStatus, Ticket, TicketStatus, TicketMessage } from '../types/project.types';
import { projectsService } from '../api/projects.service';

// ==============================
// PERSISTENCE HELPERS
// ==============================

const LS_KEYS = {
    projects: 'vaerdia_projects_v1',
    tasks:    'vaerdia_tasks_v1',
    sprints:  'vaerdia_sprints_v1',
    tickets:  'vaerdia_tickets_v1',
};

function loadFromLS<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function saveToLS<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // quota exceeded – silently ignore
    }
}

// ==============================
// STORE ACTIONS
// ==============================

interface StoreState {
    projects: Project[];
    tasks: Task[];
    sprints: Sprint[];
    tickets: Ticket[];
    selectedProjectId: string | null;
    selectedSprintId: string | null;
    sidebarOpen: boolean;
    workspaceName: string;
}

type Action =
    | { type: 'SELECT_PROJECT'; id: string | null }
    | { type: 'SELECT_SPRINT'; id: string | null }
    | { type: 'ADD_TASK'; task: Task }
    | { type: 'UPDATE_TASK'; task: Task }
    | { type: 'DELETE_TASK'; id: string }
    | { type: 'UPDATE_TASK_STATUS'; id: string; status: TaskStatus }
    | { type: 'MOVE_TASK_TO_SPRINT'; taskId: string; sprintId: string }
    | { type: 'ADD_SPRINT'; sprint: Sprint }
    | { type: 'UPDATE_SPRINT_STATUS'; id: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' }
    | { type: 'ADD_PROJECT'; project: Project }
    | { type: 'UPDATE_PROJECT'; project: Project }
    | { type: 'DELETE_PROJECT'; id: string }
    | { type: 'ADD_PROJECT_MEMBER'; projectId: string; member: any }
    | { type: 'SET_PROJECTS'; projects: Project[] }
    | { type: 'SET_TASKS'; tasks: Task[] }
    | { type: 'SET_SPRINTS'; sprints: Sprint[] }

    | { type: 'ADD_TICKET'; ticket: Ticket }
    | { type: 'UPDATE_TICKET'; ticket: Ticket }
    | { type: 'UPDATE_TICKET_STATUS'; id: string; status: TicketStatus }
    | { type: 'ADD_TICKET_MESSAGE'; ticketId: string; message: TicketMessage }
    | { type: 'SET_TICKETS'; tickets: Ticket[] }
    | { type: 'WIPE_DATA' }
    | { type: 'TOGGLE_SIDEBAR' };


// Safety recalculated progress
const recalculateProgress = (projects: Project[] = [], tasks: Task[] = []): Project[] => {
    return (projects || []).map(project => {
        const projectTasks = (tasks || []).filter(t => t.projectId === project.id);
        if (projectTasks.length === 0) return { ...project, progress: 0 };
        
        let completedEffort = 0;
        projectTasks.forEach(t => {
             if (t.status === 'DONE') completedEffort += 1;
             else if (t.status === 'IN_TEST') completedEffort += 0.9;
             else if (t.status === 'IN_PROGRESS') completedEffort += 0.5;
        });
        return { ...project, progress: Math.round((completedEffort / projectTasks.length) * 100) };
    });
};

function reducer(state: StoreState, action: Action): StoreState {
    const safeTasks = state.tasks || [];
    const safeSprints = state.sprints || [];
    const safeProjects = state.projects || [];

    switch (action.type) {
        case 'SELECT_PROJECT':
            return { ...state, selectedProjectId: action.id, selectedSprintId: null };
        case 'SELECT_SPRINT':
            return { ...state, selectedSprintId: action.id };
        case 'ADD_TASK': {
            const nextTasks = [...safeTasks, action.task];
            return { ...state, tasks: nextTasks, projects: recalculateProgress(safeProjects, nextTasks) };
        }
        case 'UPDATE_TASK': {
            const nextTasks = safeTasks.map(t => t.id === action.task.id ? action.task : t);
            return {
                ...state,
                tasks: nextTasks,
                projects: recalculateProgress(safeProjects, nextTasks),
                sprints: safeSprints.map(s => ({
                    ...s,
                    tasks: (s.tasks || []).map(t => t.id === action.task.id ? action.task : t)
                }))
            };
        }
        case 'DELETE_TASK': {
            const nextTasks = safeTasks.filter(t => t.id !== action.id);
            return {
                ...state,
                tasks: nextTasks,
                projects: recalculateProgress(safeProjects, nextTasks),
                sprints: safeSprints.map(s => ({
                    ...s, tasks: (s.tasks || []).filter(t => t.id !== action.id)
                }))
            };
        }
        case 'UPDATE_TASK_STATUS': {
            const nextTasks = safeTasks.map(t => t.id === action.id ? { 
                ...t, 
                status: action.status,
                completedAt: action.status === 'DONE' ? new Date().toISOString() : t.completedAt
            } : t);
            return {
                ...state,
                tasks: nextTasks,
                projects: recalculateProgress(safeProjects, nextTasks),
                sprints: safeSprints.map(s => ({
                    ...s, tasks: (s.tasks || []).map(t => t.id === action.id ? { 
                        ...t, 
                        status: action.status,
                        completedAt: action.status === 'DONE' ? new Date().toISOString() : t.completedAt
                    } : t)
                }))
            };
        }
        case 'MOVE_TASK_TO_SPRINT':
            return {
                ...state,
                tasks: safeTasks.map(t => t.id === action.taskId ? { ...t, sprintId: action.sprintId } : t),
                sprints: safeSprints.map(s => {
                    if (s.id === action.sprintId) {
                        const taskToMove = safeTasks.find(t => t.id === action.taskId);
                        const sprintTasks = s.tasks || [];
                        if (taskToMove && !sprintTasks.find(t => t.id === action.taskId)) {
                            return { ...s, tasks: [...sprintTasks, { ...taskToMove, sprintId: action.sprintId }] };
                        }
                    }
                    return s;
                })
            };
        case 'ADD_SPRINT':
            return { ...state, sprints: [...safeSprints, action.sprint] };
        case 'UPDATE_SPRINT_STATUS':
            return {
                ...state,
                sprints: safeSprints.map(s => s.id === action.id ? { ...s, status: action.status } : s),
                tasks: action.status === 'COMPLETED'
                    ? safeTasks.map(t => (t.sprintId === action.id && t.status !== 'DONE') ? { ...t, sprintId: undefined } : t)
                    : safeTasks
            };
        case 'ADD_PROJECT_MEMBER':
            return {
                ...state,
                projects: safeProjects.map(p => p.id === action.projectId ? {
                    ...p, members: [...(p.members || []), action.member]
                } : p)
            };
        case 'ADD_PROJECT':
            return {
                ...state,
                projects: [...safeProjects, action.project]
            };
        case 'UPDATE_PROJECT':
            return {
                ...state,
                projects: safeProjects.map(p => p.id === action.project.id ? action.project : p)
            };
        case 'DELETE_PROJECT': {
            const nextProjects = safeProjects.filter(p => p.id !== action.id);
            return {
                ...state,
                projects: nextProjects,
                selectedProjectId: state.selectedProjectId === action.id ? null : state.selectedProjectId,
                tasks: (state.tasks || []).filter(t => t.projectId !== action.id)
            };
        }
        case 'SET_PROJECTS': {
            const localProjects = safeProjects;
            const mergedProjects = action.projects.map(apiProject => {
                const local = localProjects.find(p => p.id === apiProject.id);
                if (local) {
                    return {
                        ...apiProject,
                        viewMode: local.viewMode ?? apiProject.viewMode,
                        type: local.type ?? apiProject.type,
                        clientName: local.clientName ?? apiProject.clientName,
                        budget: local.budget ?? apiProject.budget,
                        members: local.members?.length ? local.members : (apiProject.members || []),
                        tags: local.tags?.length ? local.tags : (apiProject.tags || []),
                    };
                }
                return apiProject;
            });
            const apiIds = new Set(action.projects.map(p => p.id));
            const localOnlyProjects = localProjects.filter(p => !apiIds.has(p.id));
            const finalProjects = [...mergedProjects, ...localOnlyProjects];
            return { ...state, projects: recalculateProgress(finalProjects, safeTasks) };
        }

        case 'SET_TASKS': {
            // Smart merge: preserve locally-modified fields for existing tasks
            const localTasks = safeTasks;
            const mergedTasks = action.tasks.map(apiTask => {
                const local = localTasks.find(t => t.id === apiTask.id);
                if (local) {
                    return {
                        ...apiTask,
                        // Preserve local edits for these user-mutable fields
                        priority:    local.priority,
                        status:      local.status,
                        title:       local.title,
                        description: local.description ?? apiTask.description,
                        storyPoints: local.storyPoints ?? apiTask.storyPoints,
                        dueDate:     local.dueDate ?? apiTask.dueDate,
                        tags:        local.tags?.length ? local.tags : (apiTask.tags || []),
                        // Trust the API for relational fields (sprint & assignee)
                        // to prevent stale localStorage values from hiding tasks
                        sprintId:       apiTask.sprintId ?? local.sprintId,
                        assigneeId:     apiTask.assigneeId ?? local.assigneeId,
                        assigneeName:   apiTask.assigneeName ?? local.assigneeName,
                        assigneeAvatar: apiTask.assigneeAvatar ?? local.assigneeAvatar,
                    };
                }
                return apiTask;
            });
            // Keep tasks created locally that the API doesn't know about
            const apiIds = new Set(action.tasks.map(t => t.id));
            const localOnlyTasks = localTasks.filter(t => !apiIds.has(t.id));
            const finalTasks = [...mergedTasks, ...localOnlyTasks];
            return { ...state, tasks: finalTasks, projects: recalculateProgress(safeProjects, finalTasks) };
        }
        case 'SET_SPRINTS': {
            const localSprints = safeSprints;
            const mergedSprints = action.sprints.map(apiSprint => {
                const local = localSprints.find(s => s.id === apiSprint.id);
                if (local) {
                    return { ...apiSprint, ...local };
                }
                return apiSprint;
            });
            const apiIds = new Set(action.sprints.map(s => s.id));
            const localOnlySprints = localSprints.filter(s => !apiIds.has(s.id));
            return { ...state, sprints: [...mergedSprints, ...localOnlySprints] };
        }
        case 'SET_TICKETS':
            return { ...state, tickets: action.tickets };
        case 'ADD_TICKET':
            return { ...state, tickets: [action.ticket, ...(state.tickets || [])] };
        case 'UPDATE_TICKET':
            return { ...state, tickets: (state.tickets || []).map(t => t.id === action.ticket.id ? action.ticket : t) };
        case 'UPDATE_TICKET_STATUS':
            return { ...state, tickets: (state.tickets || []).map(t => t.id === action.id ? { ...t, status: action.status, updatedAt: new Date().toISOString() } : t) };
        case 'ADD_TICKET_MESSAGE':
            return {
                ...state,
                tickets: (state.tickets || []).map(t => t.id === action.ticketId ? {
                    ...t,
                    messages: [...(t.messages || []), action.message],
                    updatedAt: new Date().toISOString()
                } : t)
            };
        case 'WIPE_DATA':
            return {
                ...state,
                projects: [],
                tasks: [],
                sprints: [],
                selectedProjectId: null,
                selectedSprintId: null,
            };
        case 'TOGGLE_SIDEBAR':

            return { ...state, sidebarOpen: !state.sidebarOpen };
        default:
            return state;
    }
}

// ==============================
// CONTEXT
// ==============================

interface StoreContextType {
    state: StoreState;
    dispatch: React.Dispatch<Action>;
    selectedProject: Project | null;
    selectedSprint: Sprint | null;
    projectSprints: Sprint[];
    projectTasks: Task[];
    backlogTasks: Task[];
    dashboardStats: DashboardStats;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        projects: loadFromLS<Project[]>(LS_KEYS.projects, []),
        tasks:    loadFromLS<Task[]>(LS_KEYS.tasks, []),
        sprints:  loadFromLS<Sprint[]>(LS_KEYS.sprints, []),
        tickets:  loadFromLS<Ticket[]>(LS_KEYS.tickets, []),
        selectedProjectId: null,
        selectedSprintId: null,
        sidebarOpen: true,
        workspaceName: 'Mon Espace de Travail',
    });

    // Persist every state change to localStorage
    useEffect(() => {
        saveToLS(LS_KEYS.projects, state.projects);
        saveToLS(LS_KEYS.tasks,    state.tasks);
        saveToLS(LS_KEYS.sprints,  state.sprints);
        saveToLS(LS_KEYS.tickets,  state.tickets);
    }, [state.projects, state.tasks, state.sprints, state.tickets]);

    // INITIAL FETCH FROM API
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const projects = await projectsService.getAll();
                dispatch({ type: 'SET_PROJECTS', projects });
                const tasks = await projectsService.getAllTasks();
                dispatch({ type: 'SET_TASKS', tasks });
                const sprints = await projectsService.getAllSprints();
                dispatch({ type: 'SET_SPRINTS', sprints });
            } catch (err) {
                console.error("Failed to fetch from API:", err);
            }
        };
        fetchAll();
    }, []);

    // BACKGROUND SYNC TO BACKEND (Debounced)
    useEffect(() => {
        const syncTimer = setTimeout(async () => {
            try {
                // Sync projects
                for (const project of state.projects) {
                    try { await projectsService.update(project.id, project); } 
                    catch { try { await projectsService.create(project); } catch {} }
                }
                // Sync tasks
                for (const task of state.tasks) {
                    try { await projectsService.updateTask(task.id, task); } 
                    catch { try { await projectsService.createTask(task); } catch {} }
                }
            } catch (err) {
                console.warn("Background sync failed (probably offline):", err);
            }
        }, 3000); // Sync 3 seconds after last change

        return () => clearTimeout(syncTimer);
    }, [state.projects, state.tasks]);

    const safeProjects = state.projects || [];
    const safeTasks = state.tasks || [];
    const safeSprints = state.sprints || [];

    const selectedProject = state.selectedProjectId
        ? safeProjects.find(p => p.id === state.selectedProjectId) ?? null
        : null;

    const selectedSprint = state.selectedSprintId
        ? safeSprints.find(s => s.id === state.selectedSprintId) ?? null
        : null;

    const projectSprints = state.selectedProjectId
        ? safeSprints.filter(s => s.projectId === state.selectedProjectId)
        : [];

    const projectTasks = state.selectedProjectId
        ? safeTasks.filter(t => t.projectId === state.selectedProjectId)
        : [];

    const backlogTasks = state.selectedProjectId
        ? safeTasks.filter(t => t.projectId === state.selectedProjectId && !t.sprintId)
        : [];

    const dashboardStats: DashboardStats = {
        totalProjects: safeProjects.length,
        activeProjects: safeProjects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE').length,
        totalTasks: safeTasks.length,
        completedTasks: safeTasks.filter(t => t.status === 'DONE').length,
        teamMembers: new Set(safeProjects.flatMap(p => (p.members || []).map(m => m.id))).size || 0,
        upcomingDeadlines: safeTasks.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 3600 * 1000)).length,
    };

    return (
        <StoreContext.Provider value={{
            state, dispatch, selectedProject, selectedSprint,
            projectSprints, projectTasks, backlogTasks, dashboardStats,
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be inside StoreProvider');
    return ctx;
};
