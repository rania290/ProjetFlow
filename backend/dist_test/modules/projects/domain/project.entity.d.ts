import { ProjectStatus } from './project-status.enum';
export interface ProjectMember {
    userId: string;
    roleOnProject: string;
    dailyRate: number;
}
export declare class Project {
    id: string;
    name: string;
    type: 'SCRUM' | 'KANBAN';
    managerId: string;
    clientId: string | null;
    members: ProjectMember[];
    status: ProjectStatus;
    budget: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, name: string, type: 'SCRUM' | 'KANBAN', managerId: string, clientId: string | null, members: ProjectMember[], status: ProjectStatus, budget: number, startDate: Date, endDate: Date, createdAt: Date, updatedAt: Date);
}
