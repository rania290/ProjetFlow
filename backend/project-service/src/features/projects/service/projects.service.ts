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
  ) { }

  async create(createProjectDto: CreateProjectDto, userId?: string, role?: string): Promise<Project> {
    const data: Partial<Project> = { ...createProjectDto } as any;
    delete (data as any).members;
    delete (data as any).tags;

    const project = this.projectRepository.create(data);
    const savedProject = await this.projectRepository.save(project);

    // If userId is provided, automatically assign the creator to the project
    if (userId) {
        console.log(`[ProjectsService] Automatically assigning creator ${userId} to project ${savedProject.id}`);
        try {
            await this.roleAssignmentsService.assign({
                userId,
                projectId: savedProject.id,
                project: { name: savedProject.name },
                role: (role === 'ADMIN' || role === 'ROOT' || role === 'SUPER_ADMIN') ? 'ADMIN' : 'PROJECT_MANAGER',
                notes: 'Project creator (Automatic Assignment)',
            });
        } catch (assignErr: any) {
            console.warn(`[ProjectsService] Automatic assignment failed for user ${userId}: ${assignErr.message}`);
        }
    }

    return savedProject;
  }

  async findAll(userId?: string, role?: string): Promise<Project[]> {
    const normalizedRole = (role || '').trim().toUpperCase();
    console.log(`[ProjectsService] findAll called | userId: "${userId}" | role: "${role}" (normalized: "${normalizedRole}")`);

    // Admin, Super Admin and Root can see all projects
    const isGlobalAdmin = !userId || 
                         normalizedRole === 'SUPER_ADMIN' || 
                         normalizedRole === 'ADMIN' || 
                         normalizedRole === 'ROOT' ||
                         normalizedRole === 'SUPERADMIN' ||
                         normalizedRole === 'ADMINISTRATOR';

    if (isGlobalAdmin) {
      console.log(`[ProjectsService] GRANTING GLOBAL ACCESS to role: [${normalizedRole}]`);
      const allProjects = await this.projectRepository.find();
      console.log(`[ProjectsService] Total projects in DB: ${allProjects.length}`);
      if (allProjects.length === 0) {
          console.warn('[ProjectsService] WARNING: No projects exist in the project_db table!');
      }
      
      const allRoleAssignments = await this.roleAssignmentsService.getAll();
      const projectsWithMembers = allProjects.map(p => {
          const projectMembers = allRoleAssignments.filter(a => a.project.id === p.id && a.isActive);
          return {
              ...p,
              members: projectMembers.map(m => ({
                  id: m.user.id,
                  fullName: m.user.fullName,
                  role: m.role,
                  tjm: 0,
                  avatar: m.user.fullName ? m.user.fullName.charAt(0).toUpperCase() : 'U'
              }))
          };
      });
      console.log(`[ProjectsService] Returning ${projectsWithMembers.length} for global admin.`);
      return projectsWithMembers;
    }

    console.log(`[ProjectsService] RESTRICTED ACCESS for user: ${userId}`);

    // Regular users — fetch only their assigned project IDs from DB
    const assignments = await this.roleAssignmentsService.getUserProjects(userId);
    const assignedProjectIds = assignments.projects.map(p => p.projectId);
    console.log(`[ProjectsService] User has ${assignedProjectIds.length} assignments.`);

    let projects: Project[] = [];
    if (assignedProjectIds.length > 0) {
      projects = await this.projectRepository.find({
        where: { id: In(assignedProjectIds) }
      });
    }
    const allAssignments = await this.roleAssignmentsService.getAll();
    const projectsWithMembers = projects.map(p => {
        const projectMembers = allAssignments.filter(a => a.project.id === p.id && a.isActive);
        return {
            ...p,
            members: projectMembers.map(m => ({
                id: m.user.id,
                fullName: m.user.fullName,
                role: m.role,
                tjm: 0,
                avatar: m.user.fullName ? m.user.fullName.charAt(0).toUpperCase() : 'U'
            }))
        };
    });

    console.log(`[ProjectsService] Returning ${projectsWithMembers.length} assigned projects (with members populated).`);
    return projectsWithMembers;
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
    const updateData = { ...updateProjectDto } as any;
    delete updateData.members;
    delete updateData.tags;
    
    if (Object.keys(updateData).length > 0) {
        await this.projectRepository.update(id, updateData);
    }
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    await this.projectRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // 1. Clean up role assignments (manual cleanup because no DB-level FK with cascade)
    await this.roleAssignmentsService.removeByProject(id);
    
    // 2. Delete project (DB-level CASCADE will handle tasks)
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    console.log(`[ProjectsService] Deleted project ${id} and all associated data.`);
  }

  async deleteAll(): Promise<void> {
    const projects = await this.projectRepository.find();
    for (const p of projects) {
        await this.remove(p.id);
    }
    console.log(`[ProjectsService] All projects and associated data cleared.`);
  }
}
