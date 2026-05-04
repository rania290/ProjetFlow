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
exports.TimeTrackingSession = exports.TrackingStatus = void 0;
const typeorm_1 = require("typeorm");
var TrackingStatus;
(function (TrackingStatus) {
    TrackingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TrackingStatus["PAUSED"] = "PAUSED";
    TrackingStatus["COMPLETED"] = "COMPLETED";
})(TrackingStatus || (exports.TrackingStatus = TrackingStatus = {}));
let TimeTrackingSession = class TimeTrackingSession {
    id;
    employeeId;
    employeeName;
    projectId;
    projectName;
    date;
    startTime;
    endTime;
    status;
    pauseStartTime;
    totalPauseMinutes;
    durationMinutes;
    activity;
    isAnomaly;
    anomalyReason;
    createdAt;
    updatedAt;
};
exports.TimeTrackingSession = TimeTrackingSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "employee_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "employee_name" }),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "employeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "project_id", type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], TimeTrackingSession.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "project_name", type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], TimeTrackingSession.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "start_time", type: "timestamp" }),
    __metadata("design:type", Date)
], TimeTrackingSession.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "end_time", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], TimeTrackingSession.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: TrackingStatus.IN_PROGRESS }),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pause_start_time", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], TimeTrackingSession.prototype, "pauseStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_pause_minutes", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], TimeTrackingSession.prototype, "totalPauseMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duration_minutes", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], TimeTrackingSession.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], TimeTrackingSession.prototype, "activity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_anomaly", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], TimeTrackingSession.prototype, "isAnomaly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "anomaly_reason", type: "text", nullable: true }),
    __metadata("design:type", Object)
], TimeTrackingSession.prototype, "anomalyReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], TimeTrackingSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], TimeTrackingSession.prototype, "updatedAt", void 0);
exports.TimeTrackingSession = TimeTrackingSession = __decorate([
    (0, typeorm_1.Entity)("time_tracking_sessions"),
    (0, typeorm_1.Index)(["employeeId", "date"])
], TimeTrackingSession);
//# sourceMappingURL=time-tracking.model.js.map