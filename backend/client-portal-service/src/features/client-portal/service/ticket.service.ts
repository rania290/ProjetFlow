import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketEntity } from '../model/ticket.entity';
import { ClientEntity } from '../model/client.entity';
import { CreateTicketDto, TicketCommentDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/create-ticket.dto';
import { EmailService } from '../../../utils/services/email.service';
import { NotificationService } from '../../../utils/services/notification.service';
import { CLIENT_PORTAL_CONSTANTS } from '../constants/client-portal.constants';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: any) {
    const userEmail = user.email || user.preferred_username || user.sub;
    
    let client: ClientEntity | null = null;
    if (userEmail) {
      client = await this.clientRepository.findOne({ where: { email: userEmail } });
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      client: client || undefined,
      status: CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.OPEN,
      assignedTo: createTicketDto.assignedTo,
      assignedByEmail: createTicketDto.assignedByEmail,
      timeline: [{
        action: 'created',
        description: 'Ticket créé',
        user: userEmail || 'Système',
        timestamp: new Date(),
      }],
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Envoyer une notification au client
    try {
      await this.emailService.sendTicketNotification(savedTicket, 'créé');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de ticket:', error);
    }

    // Notifier l'équipe interne
    await this.notificationService.notifyTeam('NEW_TICKET', {
      ticketId: savedTicket.id,
      title: savedTicket.title,
      clientId: savedTicket.client?.id,
      createdBy: userEmail,
    });

    return savedTicket;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    clientId?: string;
    projectId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    const { page = 1, limit = 10, clientId, projectId, status, priority, assignedTo } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.client', 'client')
      .leftJoinAndSelect('ticket.project', 'project');

    // Filtrer par client
    if (clientId) {
      queryBuilder.andWhere('client.id = :clientId', { clientId });
    }

    // Filtrer par projet
    if (projectId) {
      queryBuilder.andWhere('project.id = :projectId', { projectId });
    }

    // Filtrer par statut
    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    // Filtrer par priorité
    if (priority) {
      queryBuilder.andWhere('ticket.priority = :priority', { priority });
    }

    // Filtrer par assignation
    if (assignedTo) {
      queryBuilder.andWhere('ticket.assignedTo = :assignedTo', { assignedTo });
    }

    // Compter le total
    const total = await queryBuilder.getCount();

    // Paginer
    const tickets = await queryBuilder
      .orderBy('ticket.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: any) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['client', 'project'],
    });

    if (!ticket) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.TICKET_NOT_FOUND);
    }

    this.checkTicketAccess(ticket, user);

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, user: any) {
    const ticket = await this.findOne(id, user);

    const updatedTicket = this.ticketRepository.merge(ticket, updateTicketDto);

    // Ajouter à la timeline
    updatedTicket.timeline.push({
      action: 'updated',
      description: 'Ticket mis à jour',
      user: user.email,
      timestamp: new Date(),
    });

    return this.ticketRepository.save(updatedTicket);
  }

  async remove(id: string, user: any) {
    const ticket = await this.findOne(id, user);

    // Vérifier si le ticket peut être supprimé
    if (ticket.status === CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.OPEN || 
        ticket.status === CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.IN_PROGRESS) {
      throw new ForbiddenException('Impossible de supprimer un ticket ouvert ou en cours');
    }

    await this.ticketRepository.remove(ticket);

    // Notifier l'équipe
    await this.notificationService.notifyTeam('TICKET_DELETED', {
      ticketId: ticket.id,
      title: ticket.title,
      deletedBy: user.email,
    });
  }

  async addComment(id: string, commentDto: TicketCommentDto, user: any) {
    this.logger.log(`Adding comment to ticket ${id} by ${user.email}`);
    const ticket = await this.findOne(id, user);
    const userEmail = user.email || user.preferred_username || user.sub;

    if (!ticket.timeline) {
      ticket.timeline = [];
    }

    const newComment = {
      action: commentDto.isInternal ? 'internal_comment' : 'comment',
      description: commentDto.comment || (commentDto.attachments?.length ? 'Pièce jointe ajoutée' : ''),
      user: userEmail,
      timestamp: new Date(),
      attachments: commentDto.attachments || [],
    };

    ticket.timeline.push(newComment);

    try {
      const updatedTicket = await this.ticketRepository.save(ticket);
      this.logger.log(`Comment added successfully to ticket ${id}`);
      
      // Notifier le client si ce n'est pas un commentaire interne
      if (!commentDto.isInternal) {
        try {
          await this.emailService.sendTicketNotification(updatedTicket, 'commentaire ajouté');
        } catch (error) {
          this.logger.error('Erreur lors de l\'envoi de l\'email de commentaire:', error);
        }
      }

      return updatedTicket;
    } catch (error) {
      this.logger.error(`Failed to save ticket ${id} with new comment:`, error);
      throw error;
    }
  }

  async getComments(id: string, user: any) {
    const ticket = await this.findOne(id, user);

    return ticket.timeline?.filter(entry => 
      entry.action === 'comment' || entry.action === 'internal_comment'
    ) || [];
  }

  async updateStatus(id: string, status: string, user: any) {
    const ticket = await this.findOne(id, user);

    if (!CLIENT_PORTAL_CONSTANTS.TICKET_STATUS[status]) {
      throw new Error(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.INVALID_STATUS);
    }

    const updatedTicket = this.ticketRepository.merge(ticket, { status });

    // Ajouter à la timeline
    updatedTicket.timeline.push({
      action: 'status_changed',
      description: `Statut changé vers ${status}`,
      user: user.email,
      timestamp: new Date(),
    });

    // Si résolu, ajouter la date de résolution
    if (status === CLIENT_PORTAL_CONSTANTS.TICKET_STATUS.RESOLVED) {
      updatedTicket.resolvedAt = new Date();
    }

    return this.ticketRepository.save(updatedTicket);
  }

  async assign(id: string, assignedTo: string, user: any) {
    const ticket = await this.findOne(id, user);

    const updatedTicket = this.ticketRepository.merge(ticket, { 
      assignedTo,
      assignedByEmail: user.email 
    });

    // Ajouter à la timeline
    updatedTicket.timeline.push({
      action: 'assigned',
      description: `Assigné à ${assignedTo}`,
      user: user.email,
      timestamp: new Date(),
    });

    return this.ticketRepository.save(updatedTicket);
  }

  async getTimeline(id: string, user: any) {
    const ticket = await this.findOne(id, user);

    return ticket.timeline || [];
  }

  async addSatisfaction(id: string, satisfaction: number, user: any, comment?: string) {
    const ticket = await this.findOne(id, user);

    const updatedTicket = this.ticketRepository.merge(ticket, {
      satisfaction,
      satisfactionComment: comment,
    });

    return this.ticketRepository.save(updatedTicket);
  }

  private checkTicketAccess(ticket: TicketEntity, user: any) {
    // Les admins et project managers peuvent voir tous les tickets
    if (['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return;
    }

    // Les autres utilisateurs ne peuvent voir que leurs tickets assignés
    if (ticket.assignedTo !== user.email && !['TEAM_MEMBER'].includes(user.role)) {
      throw new ForbiddenException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    }
  }
}
