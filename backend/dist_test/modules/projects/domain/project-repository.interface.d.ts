import { Project } from './project.entity';
import { ProjectStatus } from './project-status.enum';
export interface ProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    update(project: Project): Promise<Project>;
    findByManager(managerId: string): Promise<Project[]>;
}
export declare const PROJECT_REPOSITORY = "PROJECT_REPOSITORY";
export interface ProjectDashboard {
    projectId: string;
    name: string;
    status: ProjectStatus;
    budget: number;
    totalPlannedCost: number;
    totalActualCost: number;
    membersCount: number;
}
