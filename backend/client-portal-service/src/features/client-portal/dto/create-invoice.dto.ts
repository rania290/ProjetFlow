import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsArray, ValidateNested, IsDateString, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class BillingAddressDto {
  @IsString()
  @MaxLength(255)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  postalCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  vatNumber: string;
}

export class PaymentTermsDto {
  @IsOptional()
  @IsNumber()
  dueDays?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  lateFee?: number;

  @IsOptional()
  @IsNumber()
  discountDays?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  discountPercentage?: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsEnum(['STANDARD', 'RECURRING', 'CREDIT_NOTE', 'DEPOSIT'])
  type: string;

  @IsString()
  invoiceNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectId?: string;

  @IsArray()
  items: InvoiceItemDto[];

  @IsNumber()
  @IsDecimal()
  taxRate: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  terms?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @IsOptional()
  metadata?: any;
}

export class InvoiceItemDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @IsDecimal()
  quantity: number;

  @IsNumber()
  @IsDecimal()
  unitPrice: number;

  @IsNumber()
  @IsDecimal()
  total: number;
}
