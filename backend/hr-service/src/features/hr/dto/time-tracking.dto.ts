import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber } from "class-validator";

export class StartTrackingDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  employeeName!: string;

  @IsString()
  @IsOptional()
  activity?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  projectName?: string;
}

export class StopTrackingDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class PauseTrackingDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class ResumeTrackingDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

export class ManualCorrectionDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  totalPauseMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isAnomaly?: boolean;
}
