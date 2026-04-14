"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveResponseDto = void 0;
class LeaveResponseDto {
    id;
    employeeId;
    employeeName;
    type;
    startDate;
    endDate;
    durationDays;
    motif;
    status;
    reviewedBy;
    reviewedAt;
    rejectionReason;
    calendarSynced;
    createdAt;
    updatedAt;
    static fromEntity(entity) {
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
exports.LeaveResponseDto = LeaveResponseDto;
//# sourceMappingURL=leave-response.dto.js.map