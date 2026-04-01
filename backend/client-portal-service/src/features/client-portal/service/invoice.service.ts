import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../model/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { EmailService } from '../../../utils/services/email.service';
import { PdfService } from '../../../utils/services/pdf.service';
import { FileService } from '../../../utils/services/file.service';
import { CLIENT_PORTAL_CONSTANTS } from '../constants/client-portal.constants';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
    private readonly fileService: FileService,
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto, user: any) {
    // Calculer les totaux
    const subtotal = createInvoiceDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (createInvoiceDto.taxRate / 100);
    const total = subtotal + taxAmount;

    // Créer la facture
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      subtotal,
      taxAmount,
      total,
      status: CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.DRAFT,
      createdAt: new Date(),
      type: createInvoiceDto.type,
      invoiceNumber: createInvoiceDto.invoiceNumber,
      projectId: createInvoiceDto.projectId,
      items: createInvoiceDto.items,
      taxRate: createInvoiceDto.taxRate,
      notes: createInvoiceDto.notes,
      terms: createInvoiceDto.terms,
      billingAddress: createInvoiceDto.billingAddress,
      dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
      currency: createInvoiceDto.currency,
      paymentTerms: undefined, // Éviter le conflit de type
      metadata: createInvoiceDto.metadata,
    } as any);

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Envoyer l'email de facture
    try {
      await this.emailService.sendInvoiceEmail(savedInvoice, (savedInvoice as any).billingAddress?.company || 'client@example.com');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la facture:', error);
    }

    return savedInvoice;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    clientId?: string;
    projectId?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page = 1, limit = 10, clientId, projectId, status, type, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client');

    // Filtrer par client
    if (clientId) {
      queryBuilder.andWhere('client.id = :clientId', { clientId });
    }

    // Filtrer par projet
    if (projectId) {
      queryBuilder.andWhere('invoice.projectId = :projectId', { projectId });
    }

    // Filtrer par statut
    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    // Filtrer par type
    if (type) {
      queryBuilder.andWhere('invoice.type = :type', { type });
    }

    // Filtrer par plage de dates
    if (dateFrom) {
      queryBuilder.andWhere('invoice.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('invoice.createdAt <= :dateTo', { dateTo });
    }

    // Compter le total
    const total = await queryBuilder.getCount();

    // Paginer
    const invoices = await queryBuilder
      .orderBy('invoice.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: any) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!invoice) {
      throw new NotFoundException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.INVOICE_NOT_FOUND);
    }

    this.checkInvoiceAccess(invoice, user);

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: any) {
    const invoice = await this.findOne(id, user);

    // Recalculer les totaux si les items sont modifiés
    if (updateInvoiceDto.items) {
      const subtotal = updateInvoiceDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * (updateInvoiceDto.taxRate || invoice.taxRate) / 100;
      const total = subtotal + taxAmount;

      // Mettre à jour l'objet avec les nouveaux totaux
      Object.assign(updateInvoiceDto, { subtotal, taxAmount, total });
    }

    // Créer un objet compatible pour le merge
    const updateData: any = { ...updateInvoiceDto };
    if (updateInvoiceDto.paymentTerms && typeof updateInvoiceDto.paymentTerms === 'string') {
      // Ignorer paymentTerms string si paymentTermsObject existe
      const { paymentTerms, ...rest } = updateData;
      updateData.paymentTerms = undefined;
    }

    const updatedInvoice = this.invoiceRepository.merge(invoice, updateData);
    return this.invoiceRepository.save(updatedInvoice);
  }

  async remove(id: string, user: any) {
    const invoice = await this.findOne(id, user);

    // Vérifier si la facture peut être supprimée
    if (invoice.status === CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.PAID) {
      throw new ForbiddenException('Impossible de supprimer une facture payée');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async sendInvoice(id: string, user: any) {
    const invoice = await this.findOne(id, user);

    if (invoice.status !== CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.DRAFT) {
      throw new BadRequestException('Seules les factures en brouillon peuvent être envoyées');
    }

    // Générer le PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
    const pdfFilename = `facture-${invoice.invoiceNumber}.pdf`;
    const pdfUrl = await this.fileService.saveFile(
      { buffer: pdfBuffer, originalname: pdfFilename } as any,
      'invoices'
    );

    // Mettre à jour la facture
    const updatedInvoice = this.invoiceRepository.merge(invoice, {
      status: CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.SENT,
      sentAt: new Date(),
      attachments: [
        ...(invoice.attachments || []),
        {
          name: pdfFilename,
          url: pdfUrl,
          type: 'application/pdf',
          uploadedAt: new Date(),
        },
      ],
    });

    await this.invoiceRepository.save(updatedInvoice);

    // Envoyer l'email
    await this.emailService.sendInvoiceEmail(updatedInvoice, invoice.client?.email || 'client@example.com');

    return { message: 'Facture envoyée avec succès' };
  }

  async downloadPdf(id: string, user: any, res: any) {
    const invoice = await this.findOne(id, user);

    // Générer le PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  }

  async recordPayment(id: string, payment: any, user: any) {
    const invoice = await this.findOne(id, user);

    const newPaidAmount = (invoice.paidAmount || 0) + payment.amount;
    const newStatus = newPaidAmount >= invoice.total
      ? CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.PAID
      : invoice.status;

    const updatedInvoice = this.invoiceRepository.merge(invoice, {
      paidAmount: newPaidAmount,
      status: newStatus,
      paymentMethod: payment.method,
      paymentReference: payment.reference,
      paidAt: newPaidAmount >= invoice.total ? new Date() : invoice.paidAt,
    });

    return this.invoiceRepository.save(updatedInvoice);
  }

  async getPayments(id: string, user: any) {
    const invoice = await this.findOne(id, user);

    // Pour l'instant, retourner les informations de paiement de base
    // Dans une implémentation complète, on aurait une table de paiements séparée
    return {
      paidAmount: invoice.paidAmount || 0,
      paymentMethod: invoice.paymentMethod,
      paymentReference: invoice.paymentReference,
      paidAt: invoice.paidAt,
    };
  }

  async createRecurring(createInvoiceDto: CreateInvoiceDto, user: any) {
    const savedInvoice = await this.create(createInvoiceDto, user);

    // Ajouter les métadonnées pour la réccurrence
    const updatedInvoice = this.invoiceRepository.merge(savedInvoice as any, {
      type: CLIENT_PORTAL_CONSTANTS.INVOICE_TYPE.RECURRING,
      metadata: {
        ...(createInvoiceDto as any).metadata,
        recurringPeriod: (createInvoiceDto as any).metadata?.recurringPeriod || 'monthly',
        nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        autoSend: (createInvoiceDto as any).metadata?.autoSend || true,
      },
    } as any);

    return this.invoiceRepository.save(updatedInvoice);
  }

  async getOverdue(params: {
    page?: number;
    limit?: number;
    clientId?: string;
  }) {
    const { page = 1, limit = 10, clientId } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .where('invoice.status = :status', { status: CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.OVERDUE });

    if (clientId) {
      queryBuilder.andWhere('client.id = :clientId', { clientId });
    }

    // Compter le total
    const total = await queryBuilder.getCount();

    // Paginer
    const invoices = await queryBuilder
      .orderBy('invoice.dueDate', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistics(params: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
  }) {
    const { dateFrom, dateTo, clientId } = params;

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client');

    if (dateFrom) {
      queryBuilder.andWhere('invoice.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('invoice.createdAt <= :dateTo', { dateTo });
    }

    if (clientId) {
      queryBuilder.andWhere('client.id = :clientId', { clientId });
    }

    const invoices = await queryBuilder.getMany();

    const stats = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
      overdueAmount: invoices
        .filter(inv => inv.status === CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.OVERDUE)
        .reduce((sum, inv) => sum + inv.total, 0),
      paidInvoices: invoices.filter(inv => inv.status === CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.PAID).length,
      overdueInvoices: invoices.filter(inv => inv.status === CLIENT_PORTAL_CONSTANTS.INVOICE_STATUS.OVERDUE).length,
    };

    return stats;
  }

  private checkInvoiceAccess(invoice: InvoiceEntity, user: any) {
    // Les admins et project managers peuvent voir toutes les factures
    if (['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return;
    }

    // Les autres utilisateurs ne peuvent voir que leurs factures
    // (implémenter la logique selon vos besoins)
    throw new ForbiddenException(CLIENT_PORTAL_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}
