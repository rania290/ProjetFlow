import { ProjectDashboard, type ProjectRepository } from './domain/project-repository.interface';
import { CreateProjectDto } from './application/dto/create-project.dto';
import { UpdateProjectDto } from './application/dto/update-project.dto';
import { UpdateMembersDto } from './application/dto/update-members.dto';
import { Project } from './domain/project.entity';
import { ProjectStatus } from './domain/project-status.enum';
export declare class ProjectsService {
    private readonly projectRepository;
    constructor(projectRepository: ProjectRepository);
    create(dto: CreateProjectDto): Promise<Project>;
    update(id: string, dto: UpdateProjectDto): Promise<Project>;
    updateMembers(id: string, dto: UpdateMembersDto): Promise<Project>;
    updateStatus(id: string, status: ProjectStatus): Promise<Project>;
    getDashboardForManager(managerId: string): Promise<ProjectDashboard[]>;
    findById(id: string): Promise<Project | null>;
}
