import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsArray, ValidateNested, IsDateString, MaxLength, IsEmail, IsBoolean, Min, Max, MinLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsEnum(['BUG', 'FEATURE_REQUEST', 'SUPPORT', 'QUESTION', 'IMPROVEMENT'])
  type: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  assignedTo?: string;

  @IsOptional()
  @IsEmail()
  assignedByEmail?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  internalNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientReference?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class AttachmentDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsNumber()
  size: number;

  @IsString()
  type: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  assignedTo?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolution?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfaction?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  satisfactionComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  internalNotes?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class TicketCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
