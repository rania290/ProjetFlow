import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { LeaveType } from "../constants/leave.constants";

export class CreateLeaveDto {
  @IsNotEmpty()
  employeeId!: string;

  @IsNotEmpty()
  employeeName!: string;

  @IsEnum(LeaveType)
  type!: LeaveType;

  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @IsOptional()
  @MaxLength(500)
  motif?: string;

  @IsOptional()
  managerId?: string;
}

