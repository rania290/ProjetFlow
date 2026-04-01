import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../model/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { EmailService } from '../../../utils/services/email.service';
import { NotificationService } from '../../../utils/services/notification.service';
import { CLIENT_PORTAL_CONSTANTS } from '../constants/client-portal.constants';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createClientDto: CreateClientDto, user: any) {
    // Vérifier si l'email existe déjà
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Créer le client
    const client = this.clientRepository.create({
      ...createClientDto,
      preferences: createClientDto.preferences || undefined,
    });

    const savedClient = await this.clientRepository.save(client);

    // Envoyer un email de bienvenue
    try {
      await this.emailService.sendWelcomeEmail(savedClient);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    }

    // Notifier l'équipe interne
    await this.notificationService.notifyTeam('NEW_CLIENT', {
      clientName: savedClient.companyName,
      clientId: savedClient.id,
      createdBy: user.email,
    });

    return savedClient;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, isActive } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.projects', 'projects')
      .leftJoinAndSelect('client.tickets', 'tickets')
      .leftJoinAndSelect('client.invoices', 'invoices');

    // Filtrer par statut actif
    if (isActive !== undefined) {
      queryBuilder.where('client.isActive = :isActive', { isActive });
    }

    // Recherche par nom ou email
    if (search) {
      queryBuilder.andWhere(
        '(client.companyName ILIKE :search OR client.email ILIKE :search OR client.contactPerson ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Compter le total
    const total = await queryBuilder.getCount();

    // Paginer
    const clients = await queryBuilder
      .orderBy('client.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: any) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects', 'tickets', 'invoices'],
    });

    if (!client) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    // Vérifier les permissions
    this.checkClientAccess(client, user);

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, user: any) {
    const client = await this.findOne(id, user);

    // Mettre à jour les préférences si fournies
    if (updateClientDto.preferences) {
      updateClientDto.preferences = {
        ...client.preferences,
        ...updateClientDto.preferences,
        emailNotifications: updateClientDto.preferences?.emailNotifications ?? client.preferences?.emailNotifications,
        smsNotifications: updateClientDto.preferences?.smsNotifications ?? client.preferences?.smsNotifications,
        pushNotifications: updateClientDto.preferences?.pushNotifications ?? client.preferences?.pushNotifications,
      };
    }

    const updatedClient = this.clientRepository.merge(client, updateClientDto);
    return this.clientRepository.save(updatedClient);
  }

  async remove(id: string, user: any) {
    const client = await this.findOne(id, user);

    // Vérifier si le client a des projets actifs
    const activeProjects = client.projects?.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
    if (activeProjects && activeProjects.length > 0) {
      throw new ForbiddenException('Impossible de supprimer un client avec des projets actifs');
    }

    await this.clientRepository.remove(client);

    // Notifier l'équipe
    await this.notificationService.notifyTeam('CLIENT_DELETED', {
      clientName: client.companyName,
      clientId: client.id,
      deletedBy: user.email,
    });
  }

  async findProjects(id: string, user: any) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!client) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    this.checkClientAccess(client, user);

    return client.projects;
  }

  async findTickets(id: string, params: any, user: any) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });

    if (!client) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    this.checkClientAccess(client, user);

    let tickets = client.tickets;

    // Filtrer par statut
    if (params.status) {
      tickets = tickets.filter(ticket => ticket.status === params.status);
    }

    // Filtrer par priorité
    if (params.priority) {
      tickets = tickets.filter(ticket => ticket.priority === params.priority);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    return {
      tickets: tickets.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: tickets.length,
        totalPages: Math.ceil(tickets.length / limit),
      },
    };
  }

  async findInvoices(id: string, params: any, user: any) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['invoices'],
    });

    if (!client) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    this.checkClientAccess(client, user);

    let invoices = client.invoices;

    // Filtrer par statut
    if (params.status) {
      invoices = invoices.filter(invoice => invoice.status === params.status);
    }

    // Filtrer par type
    if (params.type) {
      invoices = invoices.filter(invoice => invoice.type === params.type);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    return {
      invoices: invoices.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: invoices.length,
        totalPages: Math.ceil(invoices.length / limit),
      },
    };
  }

  async sendWelcomeEmail(id: string, user: any) {
    const client = await this.findOne(id, user);

    await this.emailService.sendWelcomeEmail(client);

    return { message: 'Email de bienvenue envoyé avec succès' };
  }

  async updatePreferences(id: string, preferences: any, user: any) {
    const client = await this.findOne(id, user);

    const updatedClient = this.clientRepository.merge(client, {
      preferences: {
        ...client.preferences,
        ...preferences,
      },
    });

    return this.clientRepository.save(updatedClient);
  }

  async getStatistics(id: string, user: any) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['projects', 'tickets', 'invoices'],
    });

    if (!client) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    this.checkClientAccess(client, user);

    const stats = {
      totalProjects: client.projects?.length || 0,
      activeProjects: client.projects?.filter(p => p.status === 'IN_PROGRESS').length || 0,
      completedProjects: client.projects?.filter(p => p.status === 'COMPLETED').length || 0,
      totalTickets: client.tickets?.length || 0,
      openTickets: client.tickets?.filter(t => t.status === 'OPEN').length || 0,
      resolvedTickets: client.tickets?.filter(t => t.status === 'RESOLVED').length || 0,
      totalInvoices: client.invoices?.length || 0,
      paidInvoices: client.invoices?.filter(i => i.status === 'PAID').length || 0,
      overdueInvoices: client.invoices?.filter(i => i.status === 'OVERDUE').length || 0,
      totalRevenue: client.invoices?.reduce((sum, i) => sum + (i.paidAmount || 0), 0) || 0,
    };

    return stats;
  }

  private checkClientAccess(client: ClientEntity, user: any) {
    // Les admins et project managers peuvent voir tous les clients
    if (['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return;
    }

    // Les autres utilisateurs ne peuvent voir que leurs clients
    // (implémenter la logique selon vos besoins)
    throw new ForbiddenException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}
