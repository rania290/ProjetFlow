import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UtilsModule } from '../../utils/utils.module';
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

@Module({
  imports: [
    UtilsModule,
    JwtModule,
    TypeOrmModule.forFeature([
      ClientEntity,
      ProjectEntity,
      TicketEntity,
      InvoiceEntity,
    ]),
  ],
  controllers: [
    ClientController,
    ProjectController,
    TicketController,
    InvoiceController,
  ],
  providers: [
    ClientService,
    ProjectService,
    TicketService,
    InvoiceService,
  ],
  exports: [
    ClientService,
    ProjectService,
    TicketService,
    InvoiceService,
  ],
})
export class ClientPortalModule {}
