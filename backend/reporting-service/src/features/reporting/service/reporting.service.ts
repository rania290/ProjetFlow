import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../model/invoice.entity';
import { TicketEntity } from '../model/ticket.entity';
import { ProjectEntity } from '../model/project.entity';
import { ClientEntity } from '../model/client.entity';
import { PdfService } from '../../../utils/pdf.service';
import { REPORTING_CONSTANTS } from '../constants/reporting.constants';

@Injectable()
export class ReportingService {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepository: Repository<InvoiceEntity>,
        @InjectRepository(TicketEntity)
        private readonly ticketRepository: Repository<TicketEntity>,
        @InjectRepository(ProjectEntity)
        private readonly projectRepository: Repository<ProjectEntity>,
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>,
        private readonly pdfService: PdfService,
    ) { }

    async getInvoiceStatistics(params: {
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

        const byProject: Record<string, number> = {};
        invoices.forEach(inv => {
            if (inv.projectId) {
                byProject[inv.projectId] = (byProject[inv.projectId] || 0) + Number(inv.total);
            }
        });

        const stats = {
            totalInvoices: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
            paidAmount: invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0),
            overdueAmount: invoices
                .filter(inv => inv.status === REPORTING_CONSTANTS.INVOICE_STATUS.OVERDUE)
                .reduce((sum, inv) => sum + Number(inv.total), 0),
            paidInvoices: invoices.filter(inv => inv.status === REPORTING_CONSTANTS.INVOICE_STATUS.PAID).length,
            overdueInvoices: invoices.filter(inv => inv.status === REPORTING_CONSTANTS.INVOICE_STATUS.OVERDUE).length,
            byProject,
        };

        return stats;
    }

    async getTicketStatistics(params: {
        dateFrom?: string;
        dateTo?: string;
        clientId?: string;
    }) {
        const { dateFrom, dateTo, clientId } = params;

        const queryBuilder = this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.client', 'client');

        if (dateFrom) {
            queryBuilder.andWhere('ticket.createdAt >= :dateFrom', { dateFrom });
        }

        if (dateTo) {
            queryBuilder.andWhere('ticket.createdAt <= :dateTo', { dateTo });
        }

        if (clientId) {
            queryBuilder.andWhere('client.id = :clientId', { clientId });
        }

        const tickets = await queryBuilder.getMany();

        const stats = {
            totalTickets: tickets.length,
            openTickets: tickets.filter(t => t.status === REPORTING_CONSTANTS.TICKET_STATUS.OPEN).length,
            inProgressTickets: tickets.filter(t => t.status === REPORTING_CONSTANTS.TICKET_STATUS.IN_PROGRESS).length,
            resolvedTickets: tickets.filter(t => t.status === REPORTING_CONSTANTS.TICKET_STATUS.RESOLVED).length,
            closedTickets: tickets.filter(t => t.status === REPORTING_CONSTANTS.TICKET_STATUS.CLOSED).length,
        };

        return stats;
    }

    async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId },
            relations: ['client'],
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        return this.pdfService.generateInvoicePdf(invoice);
    }

    async generateTicketPdf(ticketId: string): Promise<Buffer> {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ['client', 'project'],
        });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return this.pdfService.generateTicketPdf(ticket);
    }
}
