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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const time_tracking_service_1 = require("../service/time-tracking.service");
const time_tracking_dto_1 = require("../dto/time-tracking.dto");
const jwt_auth_guard_1 = require("../../../utils/auth/jwt-auth.guard");
const roles_guard_1 = require("../../../utils/auth/roles.guard");
const roles_decorator_1 = require("../../../utils/auth/roles.decorator");
const leave_constants_1 = require("../constants/leave.constants");
let TimeTrackingController = class TimeTrackingController {
    timeService;
    constructor(timeService) {
        this.timeService = timeService;
    }
    async start(dto) {
        return this.timeService.startSession(dto);
    }
    async pause(dto) {
        return this.timeService.pauseSession(dto.sessionId);
    }
    async resume(dto) {
        return this.timeService.resumeSession(dto.sessionId);
    }
    async stop(dto) {
        return this.timeService.stopSession(dto.sessionId);
    }
    async getActive(employeeId) {
        return this.timeService.getActiveSession(employeeId);
    }
    async getHistory(employeeId) {
        return this.timeService.getPersonalHistory(employeeId);
    }
    async getTeam() {
        return this.timeService.getTeamHistory();
    }
    async getTeamActive() {
        return this.timeService.getActiveTeam();
    }
    async correctSession(dto) {
        return this.timeService.manualCorrection(dto);
    }
    async delete(id) {
        await this.timeService.deleteSession(id);
        return { success: true };
    }
    async exportCsv(res) {
        const history = await this.timeService.getTeamHistory();
        let csv = "ID,Employe,Date,Heure Arrivee,Heure Depart,Projet,Temps Pause (min),Temps Travail (min),Anomalie\n";
        history.forEach(h => {
            const start = h.startTime ? new Date(h.startTime).toLocaleTimeString() : '';
            const end = h.endTime ? new Date(h.endTime).toLocaleTimeString() : '';
            csv += `${h.id},"${h.employeeName}",${h.date},${start},${end},"${h.projectName || ''}",${h.totalPauseMinutes},${h.durationMinutes},${h.isAnomaly ? 'OUI' : 'NON'}\n`;
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('pointages.csv');
        return res.send(csv);
    }
};
exports.TimeTrackingController = TimeTrackingController;
__decorate([
    (0, common_1.Post)("/start"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_tracking_dto_1.StartTrackingDto]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "start", null);
__decorate([
    (0, common_1.Post)("/pause"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_tracking_dto_1.PauseTrackingDto]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)("/resume"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_tracking_dto_1.ResumeTrackingDto]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)("/stop"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_tracking_dto_1.StopTrackingDto]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "stop", null);
__decorate([
    (0, common_1.Get)("/active/:employeeId"),
    __param(0, (0, common_1.Param)("employeeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)("/history/:employeeId"),
    __param(0, (0, common_1.Param)("employeeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)("/team"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN, leave_constants_1.LeaveRole.ADMIN, leave_constants_1.LeaveRole.SUPERADMIN, leave_constants_1.LeaveRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Get)("/team/active"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN, leave_constants_1.LeaveRole.ADMIN, leave_constants_1.LeaveRole.SUPERADMIN, leave_constants_1.LeaveRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "getTeamActive", null);
__decorate([
    (0, common_1.Post)("/manual-correction"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.HR_ADMIN, leave_constants_1.LeaveRole.ADMIN, leave_constants_1.LeaveRole.SUPERADMIN, leave_constants_1.LeaveRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_tracking_dto_1.ManualCorrectionDto]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "correctSession", null);
__decorate([
    (0, common_1.Delete)("/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)("/export/csv"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN, leave_constants_1.LeaveRole.ADMIN, leave_constants_1.LeaveRole.SUPERADMIN, leave_constants_1.LeaveRole.SUPER_ADMIN),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeTrackingController.prototype, "exportCsv", null);
exports.TimeTrackingController = TimeTrackingController = __decorate([
    (0, swagger_1.ApiTags)("Time Tracking"),
    (0, common_1.Controller)("hr/time-tracking"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [time_tracking_service_1.TimeTrackingService])
], TimeTrackingController);
//# sourceMappingURL=time-tracking.controller.js.map