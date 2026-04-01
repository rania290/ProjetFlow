import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../model/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { EmailService } from '../../../utils/services/email.service';
import { NotificationService } from '../../../utils/services/notification.service';
import { CLIENT_PORTAL_CONSTANTS } from '../constants/client-portal.constants';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: any) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      status: CLIENT_PORTAL_CONSTANTS.PROJECT_STATUS.PLANNED,
      progress: 0,
      clientAccessCode: this.generateAccessCode(),
      createdAt: new Date(),
    });

    const savedProject = await this.projectRepository.save(project);

    // Envoyer une notification au client
    try {
      await this.emailService.sendProjectNotification(savedProject, 'created');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de projet:', error);
    }

    // Notifier l'équipe interne
    await this.notificationService.notifyTeam('NEW_PROJECT', {
      projectName: savedProject.name,
      projectId: savedProject.id,
      createdBy: user.email,
    });

    return savedProject;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    clientId?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, clientId, status } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.tickets', 'tickets');

    // Filtrer par client
    if (clientId) {
      queryBuilder.where('client.id = :clientId', { clientId });
    }

    // Filtrer par statut
    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    // Compter le total
    const total = await queryBuilder.getCount();

    // Paginer
    const projects = await queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: any) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client', 'tickets'],
    });

    if (!project) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.PROJECT_NOT_FOUND);
    }

    this.checkProjectAccess(project, user);

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: any) {
    const project = await this.findOne(id, user);

    const updatedProject = this.projectRepository.merge(project, updateProjectDto);
    return this.projectRepository.save(updatedProject);
  }

  async remove(id: string, user: any) {
    const project = await this.findOne(id, user);

    // Vérifier si le projet a des tickets ouverts
    const openTickets = project.tickets?.filter(t => 
      t.status === CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.OPEN || 
      t.status === CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.IN_PROGRESS
    );

    if (openTickets && openTickets.length > 0) {
      throw new ForbiddenException('Impossible de supprimer un projet avec des tickets ouverts');
    }

    await this.projectRepository.remove(project);

    // Notifier l'équipe
    await this.notificationService.notifyTeam('PROJECT_DELETED', {
      projectName: project.name,
      projectId: project.id,
      deletedBy: user.email,
    });
  }

  async findTickets(id: string, user: any) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });

    if (!project) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.PROJECT_NOT_FOUND);
    }

    this.checkProjectAccess(project, user);

    return project.tickets || [];
  }

  async updateStatus(id: string, status: string, user: any) {
    const project = await this.findOne(id, user);

    if (!CLIENT_PORTAL_CONSTANTS.PROJECT_STATUS[status]) {
      throw new Error(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.INVALID_STATUS);
    }

    const updatedProject = this.projectRepository.merge(project, { status });
    return this.projectRepository.save(updatedProject);
  }

  async addDocument(id: string, document: any, user: any) {
    const project = await this.findOne(id, user);

    const updatedProject = this.projectRepository.merge(project, {
      documents: [
        ...(project.documents || []),
        {
          ...document,
          uploadedAt: new Date(),
          uploadedBy: user.email,
        },
      ],
    });

    return this.projectRepository.save(updatedProject);
  }

  async getTimeline(id: string, user: any) {
    const project = await this.findOne(id, user);

    // Créer une timeline basique à partir des dates importantes
    const timeline = [
      {
        action: 'created',
        description: `Projet "${project.name}" créé`,
        user: project.managerEmail || 'System',
        timestamp: project.createdAt,
      },
    ];

    if (project.startDate) {
      timeline.push({
        action: 'started',
        description: `Projet démarré`,
        user: project.managerEmail || 'System',
        timestamp: project.startDate,
      });
    }

    if (project.status === CLIENT_PORTAL_CONSTANTS.PROJECT_STATUS.COMPLETED) {
      timeline.push({
        action: 'completed',
        description: `Projet terminé`,
        user: project.managerEmail || 'System',
        timestamp: project.updatedAt,
      });
    }

    return timeline;
  }

  private generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private checkProjectAccess(project: ProjectEntity, user: any) {
    // Les admins et project managers peuvent voir tous les projets
    if (['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return;
    }

    // Les autres utilisateurs ne peuvent voir que leurs projets assignés
    // (implémenter la logique selon vos besoins)
    throw new ForbiddenException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}
