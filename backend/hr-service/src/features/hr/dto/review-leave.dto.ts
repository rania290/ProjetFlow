import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { LeaveStatus } from "../constants/leave.constants";

export class ReviewLeaveDto {
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;

  @IsNotEmpty()
  reviewedBy!: string;

  @IsOptional()
  @ValidateIf((o: ReviewLeaveDto) => o.status === LeaveStatus.REJECTED)
  @IsNotEmpty()
  rejectionReason?: string;
}

