import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsArray, ValidateNested, IsDateString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentTermsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  terms?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(['STANDARD', 'RECURRING', 'CREDIT_NOTE', 'DEPOSIT'])
  type?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectId?: string;

  @IsOptional()
  @IsArray()
  items?: any[];

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  total?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;

  @IsOptional()
  billingAddress?: any;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentTermsDto)
  paymentTermsObject?: PaymentTermsDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentReference?: string;

  @IsOptional()
  metadata?: any;
}

export class InvoiceItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  total?: number;
}
