import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum InvoiceType {
  STANDARD = 'STANDARD',
  RECURRING = 'RECURRING',
  CREDIT = 'CREDIT'
}

export class CreateInvoiceDto {
  @IsString()
  clientId: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsString()
  currency: string;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsEnum(InvoiceType)
  type: InvoiceType;

  @IsDate()
  dueDate: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsObject()
  @IsOptional()
  billingAddress?: {
    company: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}
