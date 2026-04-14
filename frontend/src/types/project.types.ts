// ==============================
// PROJECT TYPES
// ==============================

export type ProjectType = 'WEB_APPLICATION' | 'MOBILE_APP' | 'API_INTEGRATION' | 'ECOMMERCE_PLATFORM' | 'CRM_SYSTEM' | 'DASHBOARD';

export type ProjectViewMode = 'BOARD' | 'LIST' | 'CALENDAR' | 'GANTT';

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'DELIVERED' | 'SUSPENDED';

export interface ProjectMember {
    id: string;
    fullName: string;
    role: string;
    avatar: string;
    tjm: number; // Tarif journalier moyen
}

export interface Project {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    viewMode: ProjectViewMode;
    status: ProjectStatus;
    managerId: string;
    managerName: string;
    clientName?: string;
    members: ProjectMember[];
    budget: number;
    startDate: string;
    endDate: string;
    progress: number; // 0–100
    tags: string[];
    createdAt: string;
}

// ==============================
// TASK TYPES
// ==============================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_TEST' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskType = 'STORY' | 'BUG' | 'TASK' | 'IMPROVEMENT';

export interface Task {
    id: string;
    projectId: string;
    sprintId?: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    storyPoints?: number;
    estimatedHours?: number;
    acceptanceCriteria?: string;
    tags: string[];
    createdAt: string;
    completedAt?: string;
    dueDate?: string;
    comments: TaskComment[];
    subTasks?: Task[];
    parentTaskId?: string;
}

export interface TaskComment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    createdAt: string;
}

// ==============================
// SPRINT TYPES
// ==============================

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
    id: string;
    projectId: string;
    name: string;
    goal: string;
    status: SprintStatus;
    startDate: string;
    endDate: string;
    tasks: Task[];
    velocity?: number;
    capacity?: number;
}

// ==============================
// KANBAN COLUMN
// ==============================

export interface KanbanColumn {
    id: TaskStatus;
    label: string;
    color: string;
    tasks: Task[];
}

// ==============================
// DASHBOARD STATS
// ==============================

export interface ProjectStats {
    totalBudget: number;
    consumedBudget: number;
    totalTasks: number;
    completedTasks: number;
    teamSize: number;
}

export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    teamMembers: number;
    upcomingDeadlines: number;
}

// ==============================
// TICKET TYPES
// ==============================

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketMessage {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    isClient: boolean;
}

export interface Ticket {
    id: string;
    projectId: string;
    projectName?: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    requesterName: string;
    requesterEmail: string;
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
}
