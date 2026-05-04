import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartTimelogDto {
  @IsNotEmpty()
  @IsUUID()
  taskId: string;

  @IsNotEmpty()
  @IsString()
  taskTitle: string;

  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  userName: string;
}

export class StopTimelogDto {
  @IsNotEmpty()
  @IsUUID()
  timelogId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
