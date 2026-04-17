"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequest = void 0;
const typeorm_1 = require("typeorm");
const leave_constants_1 = require("../constants/leave.constants");
let LeaveRequest = class LeaveRequest {
    id;
    employeeId;
    employeeName;
    type;
    startDate;
    endDate;
    durationDays;
    motif;
    status;
    managerId;
    currentValidatorId;
    validationStep;
    reviewedBy;
    reviewedAt;
    rejectionReason;
    calendarSynced;
    createdAt;
    updatedAt;
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "employee_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "employee_name" }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "employeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: leave_constants_1.LeaveType,
        name: "type"
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "start_date", type: "timestamp" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "end_date", type: "timestamp" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duration_days", type: "integer" }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "motif", type: "text", default: "" }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: leave_constants_1.LeaveStatus,
        default: leave_constants_1.LeaveStatus.PENDING,
        name: "status"
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { name: "manager_id", nullable: true }),
    __metadata("design:type", Object)
], LeaveRequest.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { name: "current_validator_id", nullable: true }),
    __metadata("design:type", Object)
], LeaveRequest.prototype, "currentValidatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "validation_step", type: "integer", default: 1 }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "validationStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reviewed_by", type: "text", nullable: true }),
    __metadata("design:type", Object)
], LeaveRequest.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reviewed_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], LeaveRequest.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rejection_reason", type: "text", nullable: true }),
    __metadata("design:type", Object)
], LeaveRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "calendar_synced", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], LeaveRequest.prototype, "calendarSynced", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at", type: "timestamp" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at", type: "timestamp" }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "updatedAt", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, typeorm_1.Entity)("leave_requests"),
    (0, typeorm_1.Index)(["employeeId", "status"])
], LeaveRequest);
//# sourceMappingURL=leave-request.model.js.map