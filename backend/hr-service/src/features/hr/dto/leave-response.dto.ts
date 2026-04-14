import { LeaveStatus, LeaveType } from "../constants/leave.constants";
import type { LeaveRequest } from "../model/leave-request.model";

export class LeaveResponseDto {
  id!: string;
  employeeId!: string;
  employeeName!: string;
  type!: LeaveType;
  startDate!: Date;
  endDate!: Date;
  durationDays!: number;
  motif!: string;
  status!: LeaveStatus;
  reviewedBy!: string | null;
  reviewedAt!: Date | null;
  rejectionReason!: string | null;
  calendarSynced!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: LeaveRequest): LeaveResponseDto {
    const dto = new LeaveResponseDto();
    dto.id = entity.id;
    dto.employeeId = entity.employeeId;
    dto.employeeName = entity.employeeName;
    dto.type = entity.type;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.durationDays = entity.durationDays;
    dto.motif = entity.motif;
    dto.status = entity.status;
    dto.reviewedBy = entity.reviewedBy ?? null;
    dto.reviewedAt = entity.reviewedAt ?? null;
    dto.rejectionReason = entity.rejectionReason ?? null;
    dto.calendarSynced = entity.calendarSynced;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

