import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsArray, ValidateNested, IsDateString, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(['WEB_APPLICATION', 'MOBILE_APP', 'DESKTOP_APP', 'API', 'OTHER'])
  type: string;

  @IsOptional()
  @IsEnum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  budget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  managerName?: string;

  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requirements?: string;

  @IsOptional()
  @IsArray()
  technologies?: string[];

  @IsOptional()
  @IsArray()
  team?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliverables?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  milestones?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(['WEB_APPLICATION', 'MOBILE_APP', 'DESKTOP_APP', 'API', 'OTHER'])
  type?: string;

  @IsOptional()
  @IsEnum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  budget?: number;

  @IsOptional()
  @IsNumber()
  @IsDecimal()
  progress?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  managerName?: string;

  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requirements?: string;

  @IsOptional()
  @IsArray()
  technologies?: string[];

  @IsOptional()
  @IsArray()
  team?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliverables?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  milestones?: string;
}
