import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientController } from './controller/client.controller';
import { ProjectController } from './controller/project.controller';
import { TicketController } from './controller/ticket.controller';
import { InvoiceController } from './controller/invoice.controller';
import { ClientService } from './service/client.service';
import { ProjectService } from './service/project.service';
import { TicketService } from './service/ticket.service';
import { InvoiceService } from './service/invoice.service';
import { ClientEntity } from './model/client.entity';
import { ProjectEntity } from './model/project.entity';
import { TicketEntity } from './model/ticket.entity';
import { InvoiceEntity } from './model/invoice.entity';
import { DocumentEntity } from './model/document.entity';
import { DocumentsService } from './service/documents.service';
import { DocumentsController } from './controller/documents.controller';
import { UtilsModule } from '../../utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientEntity,
      ProjectEntity,
      TicketEntity,
      InvoiceEntity,
      DocumentEntity,
    ]),
    UtilsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    ClientController,
    ProjectController,
    TicketController,
    InvoiceController,
    DocumentsController,
  ],
  providers: [
    ClientService,
    ProjectService,
    TicketService,
    InvoiceService,
    DocumentsService,
  ],
  exports: [
    ClientService,
    ProjectService,
    TicketService,
    InvoiceService,
    DocumentsService,
  ],
})
export class ClientPortalModule { }
