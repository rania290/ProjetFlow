import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../model/projects.model';
import { CreateProjectDto, UpdateProjectDto } from '../dto/projects.dto';
import { ProjectStatus } from '../constants/projects.constants';
import { RoleAssignmentsService } from '../../role-assignments/service/role-assignments.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly roleAssignmentsService: RoleAssignmentsService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(userId?: string, role?: string): Promise<Project[]> {
    // Admin and Super Admin can see all projects
    if (!userId || role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return this.projectRepository.find();
    }

    // Regular users — fetch only their assigned project IDs from DB
    const assignments = await this.roleAssignmentsService.getUserProjects(userId);
    const assignedProjectIds = assignments.projects.map(p => p.projectId);

    if (assignedProjectIds.length === 0) {
      return []; // User has no assignments — return empty
    }

    return this.projectRepository.find({
      where: { id: In(assignedProjectIds) }
    });
  }

  async getDashboardForMe(userId: string, role: string): Promise<any[]> {
    const projects = await this.findAll(userId, role);
    return projects.map(p => ({
        projectId: p.id,
        name: p.name,
        status: p.status,
        budget: p.budget || 0,
        totalPlannedCost: 0,
        totalActualCost: 0,
        membersCount: 0,
    }));
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    await this.projectRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}
