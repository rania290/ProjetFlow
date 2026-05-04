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
exports.TimeTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_tracking_model_1 = require("../model/time-tracking.model");
let TimeTrackingService = class TimeTrackingService {
    timeRepository;
    constructor(timeRepository) {
        this.timeRepository = timeRepository;
    }
    async startSession(dto) {
        const active = await this.timeRepository.findOne({
            where: { employeeId: dto.employeeId, endTime: (0, typeorm_2.IsNull)() }
        });
        if (active)
            throw new common_1.BadRequestException("Vous avez déjà une session de pointage active.");
        const now = new Date();
        let isAnomaly = false;
        let anomalyReason = null;
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours > 9 || (hours === 9 && minutes > 30)) {
            isAnomaly = true;
            anomalyReason = "Arrivée tardive (après 09h30)";
        }
        const session = this.timeRepository.create({
            employeeId: dto.employeeId,
            employeeName: dto.employeeName,
            projectId: dto.projectId,
            projectName: dto.projectName,
            date: now.toISOString().split('T')[0],
            startTime: now,
            activity: dto.activity || "Travail standard",
            status: time_tracking_model_1.TrackingStatus.IN_PROGRESS,
            isAnomaly,
            anomalyReason
        });
        return this.timeRepository.save(session);
    }
    async pauseSession(sessionId) {
        const session = await this.timeRepository.findOne({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException("Session non trouvée");
        if (session.status !== time_tracking_model_1.TrackingStatus.IN_PROGRESS)
            throw new common_1.BadRequestException("Seule une session en cours peut être mise en pause.");
        session.status = time_tracking_model_1.TrackingStatus.PAUSED;
        session.pauseStartTime = new Date();
        return this.timeRepository.save(session);
    }
    async resumeSession(sessionId) {
        const session = await this.timeRepository.findOne({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException("Session non trouvée");
        if (session.status !== time_tracking_model_1.TrackingStatus.PAUSED)
            throw new common_1.BadRequestException("Cette session n'est pas en pause.");
        const now = new Date();
        if (session.pauseStartTime) {
            const diffMs = now.getTime() - session.pauseStartTime.getTime();
            session.totalPauseMinutes += Math.round(diffMs / 60000);
            session.pauseStartTime = null;
        }
        session.status = time_tracking_model_1.TrackingStatus.IN_PROGRESS;
        return this.timeRepository.save(session);
    }
    async stopSession(sessionId) {
        const session = await this.timeRepository.findOne({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException("Session non trouvée");
        if (session.status === time_tracking_model_1.TrackingStatus.COMPLETED)
            throw new common_1.BadRequestException("Cette session est déjà terminée");
        const now = new Date();
        if (session.status === time_tracking_model_1.TrackingStatus.PAUSED && session.pauseStartTime) {
            const diffMs = now.getTime() - session.pauseStartTime.getTime();
            session.totalPauseMinutes += Math.round(diffMs / 60000);
            session.pauseStartTime = null;
        }
        session.endTime = now;
        session.status = time_tracking_model_1.TrackingStatus.COMPLETED;
        const diffMs = now.getTime() - session.startTime.getTime();
        const totalMinutes = Math.round(diffMs / 60000);
        session.durationMinutes = Math.max(0, totalMinutes - session.totalPauseMinutes);
        return this.timeRepository.save(session);
    }
    async getActiveSession(employeeId) {
        return this.timeRepository.findOne({
            where: { employeeId, endTime: (0, typeorm_2.IsNull)() }
        });
    }
    async getPersonalHistory(employeeId) {
        return this.timeRepository.find({
            where: { employeeId },
            order: { startTime: 'DESC' },
            take: 100
        });
    }
    async getActiveTeam() {
        return this.timeRepository.find({
            where: { endTime: (0, typeorm_2.IsNull)() },
            order: { startTime: 'DESC' }
        });
    }
    async getTeamHistory() {
        return this.timeRepository.find({
            order: { startTime: 'DESC' },
            take: 500
        });
    }
    async manualCorrection(dto) {
        const session = await this.timeRepository.findOne({ where: { id: dto.sessionId } });
        if (!session)
            throw new common_1.NotFoundException("Session non trouvée");
        if (dto.startTime)
            session.startTime = new Date(dto.startTime);
        if (dto.endTime)
            session.endTime = new Date(dto.endTime);
        if (dto.totalPauseMinutes !== undefined)
            session.totalPauseMinutes = dto.totalPauseMinutes;
        if (dto.isAnomaly !== undefined)
            session.isAnomaly = dto.isAnomaly;
        if (session.endTime) {
            const diffMs = session.endTime.getTime() - session.startTime.getTime();
            const totalMinutes = Math.round(diffMs / 60000);
            session.durationMinutes = Math.max(0, totalMinutes - session.totalPauseMinutes);
            session.status = time_tracking_model_1.TrackingStatus.COMPLETED;
        }
        return this.timeRepository.save(session);
    }
    async deleteSession(id) {
        await this.timeRepository.delete(id);
    }
};
exports.TimeTrackingService = TimeTrackingService;
exports.TimeTrackingService = TimeTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_tracking_model_1.TimeTrackingSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TimeTrackingService);
//# sourceMappingURL=time-tracking.service.js.map