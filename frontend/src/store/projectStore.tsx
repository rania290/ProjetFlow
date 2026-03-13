import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project, Task, Sprint, DashboardStats, ProjectStatus, TaskStatus, Ticket, TicketStatus, TicketMessage } from '../types/project.types';

// ==============================
// MOCK DATA
// ==============================

const MOCK_TASKS: Task[] = [];
const MOCK_SPRINTS: Sprint[] = [];
const MOCK_TICKETS: Ticket[] = [
    {
        id: 'TKT-001',
        projectId: 'P1',
        title: 'Erreur 500 sur le module de paiement',
        description: 'Lors de la validation du panier, une erreur 500 apparait systématiquement depuis la mise à jour.',
        status: 'OPEN',
        priority: 'URGENT',
        requesterName: 'Sophie Client',
        requesterEmail: 'sophie@retail-corp.fr',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        messages: [
            { id: 'm1', authorId: 'client1', authorName: 'Sophie Client', content: 'Bonjour, nos clients ne peuvent plus payer.', createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), isClient: true }
        ]
    },
    {
        id: 'TKT-002',
        projectId: 'P1',
        title: 'Demande d\'ajout d\'un champ TVA',
        description: 'Serait-il possible de rajouter un champ TVA dans le formulaire d\'inscription B2B ?',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        requesterName: 'Marc Directeur',
        requesterEmail: 'marc@retail-corp.fr',
        assigneeName: 'Karim M.',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        messages: [
            { id: 'm2', authorId: 'client2', authorName: 'Marc Directeur', content: 'Nous avons besoin de ce champ pour la compta.', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), isClient: true },
            { id: 'm3', authorId: 'u1', authorName: 'Karim M.', content: 'Bonjour Marc, c\'est noté. Nous développons cela dans le sprint actuel.', createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), isClient: false }
        ]
    }
];

// ==============================
// STORE STATE & ACTIONS
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
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'ADD_PROJECT'; project: Project }
    | { type: 'UPDATE_PROJECT_STATUS'; id: string; status: ProjectStatus }
    | { type: 'ADD_TASK'; task: Task }
    | { type: 'UPDATE_TASK_STATUS'; id: string; status: TaskStatus }
    | { type: 'MOVE_TASK_TO_SPRINT'; taskId: string; sprintId: string }
    | { type: 'ADD_SPRINT'; sprint: Sprint }
    | { type: 'UPDATE_SPRINT_STATUS'; id: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' }
    | { type: 'UPDATE_WORKSPACE'; name: string }
    | { type: 'REORDER_BACKLOG'; projectTasks: Task[] }
    | { type: 'ADD_TICKET'; ticket: Ticket }
    | { type: 'UPDATE_TICKET_STATUS'; id: string; status: TicketStatus }
    | { type: 'ADD_TICKET_MESSAGE'; ticketId: string; message: TicketMessage }
    | { type: 'ADD_TICKET_MESSAGE'; ticketId: string; message: TicketMessage }
    | { type: 'ADD_PROJECT_MEMBER'; projectId: string; member: any }
    | { type: 'SET_PROJECTS'; projects: Project[] };

function reducer(state: StoreState, action: Action): StoreState {
    switch (action.type) {
        case 'SELECT_PROJECT':
            return { ...state, selectedProjectId: action.id, selectedSprintId: null };
        case 'SELECT_SPRINT':
            return { ...state, selectedSprintId: action.id };
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarOpen: !state.sidebarOpen };
        case 'ADD_PROJECT':
            return { ...state, projects: [...state.projects, action.project] };
        case 'UPDATE_PROJECT_STATUS':
            return { ...state, projects: state.projects.map(p => p.id === action.id ? { ...p, status: action.status } : p) };
        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, action.task] };
        case 'UPDATE_TASK_STATUS':
            return {
                ...state,
                tasks: state.tasks.map(t => t.id === action.id ? { ...t, status: action.status } : t),
                sprints: state.sprints.map(s => ({
                    ...s, tasks: s.tasks.map(t => t.id === action.id ? { ...t, status: action.status } : t)
                }))
            };
        case 'MOVE_TASK_TO_SPRINT':
            return {
                ...state,
                tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, sprintId: action.sprintId } : t),
                sprints: state.sprints.map(s => {
                    if (s.id === action.sprintId) {
                        const task = state.tasks.find(t => t.id === action.taskId);
                        if (task && !s.tasks.find(t => t.id === action.taskId)) {
                            return { ...s, tasks: [...s.tasks, { ...task, sprintId: action.sprintId }] };
                        }
                    }
                    return s;
                })
            };
        case 'ADD_SPRINT':
            return { ...state, sprints: [...state.sprints, action.sprint] };
        case 'UPDATE_SPRINT_STATUS':
            return { ...state, sprints: state.sprints.map(s => s.id === action.id ? { ...s, status: action.status } : s) };
        case 'UPDATE_WORKSPACE':
            return { ...state, workspaceName: action.name };
        case 'REORDER_BACKLOG':
            // action.projectTasks contains the reordered subset of tasks.
            // We need to update the main tasks array by replacing the tasks that have matching IDs.
            const updatedTaskIds = new Set(action.projectTasks.map(t => t.id));
            return {
                ...state,
                tasks: [
                    ...state.tasks.filter(t => !updatedTaskIds.has(t.id)),
                    ...action.projectTasks
                ]
            };
        case 'ADD_TICKET':
            return { ...state, tickets: [action.ticket, ...state.tickets] };
        case 'UPDATE_TICKET_STATUS':
            return { ...state, tickets: state.tickets.map(t => t.id === action.id ? { ...t, status: action.status, updatedAt: new Date().toISOString() } : t) };
        case 'ADD_TICKET_MESSAGE':
            return {
                ...state,
                tickets: state.tickets.map(t => t.id === action.ticketId ? {
                    ...t,
                    messages: [...t.messages, action.message],
                    updatedAt: new Date().toISOString()
                } : t)
            };
        case 'ADD_PROJECT_MEMBER':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.projectId ? {
                    ...p,
                    members: [...p.members, action.member]
                } : p)
            };
        case 'SET_PROJECTS':
            return { ...state, projects: action.projects };
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
        projects: [],
        tasks: MOCK_TASKS,
        sprints: MOCK_SPRINTS,
        tickets: MOCK_TICKETS,
        selectedProjectId: null,
        selectedSprintId: null,
        sidebarOpen: true,
        workspaceName: 'Mon Espace de Travail',
    });

    // Fetch projects on mount - Désactivé pour éviter les erreurs 401
    React.useEffect(() => {
        const loadProjects = async () => {
            try {
                // Utilisation des données mock pour éviter les erreurs API
                const mockProjects: Project[] = [
                    {
                        id: 'P1',
                        name: 'VAERDIA Website',
                        description: 'Refonte complète du site web',
                        status: 'IN_PROGRESS' as ProjectStatus,
                        type: 'WEB_APPLICATION', // Type réel du projet
                        viewMode: 'BOARD', // Mode d'affichage (peut être changé dynamiquement)
                        managerId: 'u1',
                        managerName: 'Alice Chen',
                        startDate: '2024-01-15',
                        endDate: '2024-12-15',
                        budget: 25000,
                        clientName: 'Client Principal',
                        members: [
                            { id: 'u1', fullName: 'Alice Chen', role: 'Développeur Senior', avatar: 'AC', tjm: 450 },
                            { id: 'u2', fullName: 'Bob Martin', role: 'UI/UX Designer', avatar: 'BM', tjm: 380 }
                        ],
                        tags: ['Web', 'React', 'TypeScript'],
                        progress: 65,
                        createdAt: new Date().toISOString()
                    }
                ];
                dispatch({ type: 'SET_PROJECTS', projects: mockProjects });
            } catch (error) {
                console.error('Failed to load projects:', error);
            }
        };
        loadProjects();
    }, []);

    const selectedProject = state.selectedProjectId
        ? state.projects.find(p => p.id === state.selectedProjectId) ?? null
        : null;

    const selectedSprint = state.selectedSprintId
        ? state.sprints.find(s => s.id === state.selectedSprintId) ?? null
        : null;

    const projectSprints = state.selectedProjectId
        ? state.sprints.filter(s => s.projectId === state.selectedProjectId)
        : [];

    const projectTasks = state.selectedProjectId
        ? state.tasks.filter(t => t.projectId === state.selectedProjectId)
        : [];

    const backlogTasks = state.selectedProjectId
        ? state.tasks.filter(t => t.projectId === state.selectedProjectId && !t.sprintId)
        : [];

    const dashboardStats: DashboardStats = {
        totalProjects: state.projects.length,
        activeProjects: state.projects.filter(p => p.status === 'IN_PROGRESS').length,
        totalTasks: state.tasks.length,
        completedTasks: state.tasks.filter(t => t.status === 'DONE').length,
        teamMembers: 1,
        upcomingDeadlines: state.tasks.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 3600 * 1000)).length,
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
