import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project, Task, Sprint, DashboardStats, ProjectStatus, TaskStatus, Ticket, TicketStatus, TicketMessage } from '../types/project.types';

// ==============================
// MOCK DATA
// ==============================

const MOCK_TASKS: Task[] = [];
const MOCK_SPRINTS: Sprint[] = [];
const MOCK_TICKETS: Ticket[] = [];

const INITIAL_MOCK_PROJECTS: Project[] = [];

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
    | { type: 'ADD_TICKET'; ticket: Ticket }
    | { type: 'UPDATE_TICKET'; ticket: Ticket }
    | { type: 'UPDATE_TICKET_STATUS'; id: string; status: TicketStatus }
    | { type: 'ADD_TICKET_MESSAGE'; ticketId: string; message: TicketMessage }
    | { type: 'TOGGLE_SIDEBAR' };

// Safety recalculated progress
const recalculateProgress = (projects: Project[] = [], tasks: Task[] = []): Project[] => {
    return (projects || []).map(project => {
        const projectTasks = (tasks || []).filter(t => t.projectId === project.id);
        if (projectTasks.length === 0) return { ...project, progress: 0 };
        const doneTasks = projectTasks.filter(t => t.status === 'DONE');
        return { ...project, progress: Math.round((doneTasks.length / projectTasks.length) * 100) };
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
            const nextTasks = safeTasks.map(t => t.id === action.id ? { ...t, status: action.status } : t);
            return {
                ...state,
                tasks: nextTasks,
                projects: recalculateProgress(safeProjects, nextTasks),
                sprints: safeSprints.map(s => ({
                    ...s, tasks: (s.tasks || []).map(t => t.id === action.id ? { ...t, status: action.status } : t)
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
        case 'SET_PROJECTS':
            return { ...state, projects: recalculateProgress(action.projects, safeTasks) };
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
                    messages: [...t.messages, action.message],
                    updatedAt: new Date().toISOString()
                } : t)
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
        projects: INITIAL_MOCK_PROJECTS,
        tasks: MOCK_TASKS,
        sprints: MOCK_SPRINTS,
        tickets: MOCK_TICKETS,
        selectedProjectId: null,
        selectedSprintId: null,
        sidebarOpen: true,
        workspaceName: 'Mon Espace de Travail',
    });

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
        activeProjects: safeProjects.filter(p => p.status === 'IN_PROGRESS').length,
        totalTasks: safeTasks.length,
        completedTasks: safeTasks.filter(t => t.status === 'DONE').length,
        teamMembers: 1,
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
