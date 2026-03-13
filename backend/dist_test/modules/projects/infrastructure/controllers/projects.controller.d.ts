import { ProjectsService } from '../../projects.service';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { UpdateMembersDto } from '../../application/dto/update-members.dto';
import { ProjectStatus } from '../../domain/project-status.enum';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto): Promise<import("../../domain/project.entity").Project>;
    update(id: string, dto: UpdateProjectDto): Promise<import("../../domain/project.entity").Project>;
    updateMembers(id: string, dto: UpdateMembersDto): Promise<import("../../domain/project.entity").Project>;
    updateStatus(id: string, status: ProjectStatus): Promise<import("../../domain/project.entity").Project>;
    dashboardForManager(req: any): Promise<import("../../domain/project-repository.interface").ProjectDashboard[]>;
}
