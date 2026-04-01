import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsArray, IsDateString, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
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
  managerName?: string;

  @IsOptional()
  @IsString()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsArray()
  technologies?: string[];

  @IsOptional()
  @IsArray()
  team?: string[];

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsString()
  milestones?: string;
}
