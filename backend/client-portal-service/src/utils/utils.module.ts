import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { PdfService } from './services/pdf.service';
import { FileService } from './services/file.service';
import { NotificationService } from './services/notification.service';
import { DateService } from './services/date.service';
import { ValidationService } from './services/validation.service';

@Module({
  providers: [
    EmailService,
    PdfService,
    FileService,
    NotificationService,
    DateService,
    ValidationService,
  ],
  exports: [
    EmailService,
    PdfService,
    FileService,
    NotificationService,
    DateService,
    ValidationService,
  ],
})
export class UtilsModule { }
