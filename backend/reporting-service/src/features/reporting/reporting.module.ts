import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './controller/reporting.controller';
import { AnalyticsController } from './controller/analytics.controller';
import { ReportingService } from './service/reporting.service';
import { AnalyticsService } from './service/analytics.service';
import { PdfService } from '../../utils/pdf.service';
import { InvoiceEntity } from './model/invoice.entity';
import { ClientEntity } from './model/client.entity';
import { ProjectEntity } from './model/project.entity';
import { TicketEntity } from './model/ticket.entity'; // Corrected path based on comment

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InvoiceEntity,
            ClientEntity,
            ProjectEntity,
            TicketEntity,
        ]),
    ],
    controllers: [ReportingController, AnalyticsController],
    providers: [ReportingService, AnalyticsService, PdfService],
    exports: [ReportingService],
})
export class ReportingModule { }
