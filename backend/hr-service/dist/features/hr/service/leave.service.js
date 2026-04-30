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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const leave_constants_1 = require("../constants/leave.constants");
const leave_response_dto_1 = require("../dto/leave-response.dto");
const leave_request_model_1 = require("../model/leave-request.model");
const leave_utils_1 = require("../../../utils/leave.utils");
const ioredis_1 = require("ioredis");
const common_2 = require("@nestjs/common");
let LeaveService = class LeaveService {
    leaveRepository;
    events;
    redis;
    constructor(leaveRepository, events, redis) {
        this.leaveRepository = leaveRepository;
        this.events = events;
        this.redis = redis;
    }
    async createLeaveRequest(dto) {
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (end < start)
            throw new common_1.BadRequestException("endDate must be >= startDate");
        const durationDays = (0, leave_utils_1.calculateWorkingDays)(start, end);
        if (durationDays <= 0)
            throw new common_1.BadRequestException("Leave duration must be at least 1 working day (check if dates fall on weekends)");
        console.log(`[HR Service] Start createLeaveRequest for employee ${dto.employeeId}`);
        const overlap = await this.leaveRepository.findOne({
            where: {
                employeeId: dto.employeeId,
                status: (0, typeorm_2.In)([leave_constants_1.LeaveStatus.PENDING, leave_constants_1.LeaveStatus.APPROVED]),
                startDate: (0, typeorm_2.LessThanOrEqual)(end),
                endDate: (0, typeorm_2.MoreThanOrEqual)(start),
            },
        });
        console.log(`[HR Service] Overlap check completed. Overlap found: ${!!overlap}`);
        if (overlap)
            throw new common_1.BadRequestException("Overlapping leave request already exists for these dates");
        try {
            console.log(`[HR Service] Creating entity...`);
            const entity = this.leaveRepository.create({
                employeeId: dto.employeeId,
                employeeName: dto.employeeName,
                type: dto.type,
                startDate: start,
                endDate: end,
                durationDays,
                motif: dto.motif ?? "",
                status: leave_constants_1.LeaveStatus.PENDING,
                managerId: dto.managerId || null,
                currentValidatorId: dto.managerId || null,
                validationStep: 1,
                reviewedBy: null,
                reviewedAt: null,
                rejectionReason: null,
                calendarSynced: false,
            });
            console.log(`[HR Service] Saving to DB...`);
            const created = (await this.leaveRepository.save(entity));
            console.log(`[HR Service] Saved to DB with ID: ${created.id}`);
            try {
                console.log(`[HR Service] Sending notifications...`);
                (0, leave_utils_1.sendLeaveRequestNotification)(created);
                if (created.managerId) {
                    await this.publishNotification(created.managerId, {
                        type: 'LEAVE_REQUEST',
                        title: 'Nouvelle demande de congé',
                        message: `${created.employeeName} a soumis une demande de ${created.durationDays} jours.`,
                        metadata: { leaveId: created.id }
                    });
                }
            }
            catch (e) {
                console.warn('[HR Service] Error sending notification', e.message);
            }
            return leave_response_dto_1.LeaveResponseDto.fromEntity(created);
        }
        catch (e) {
            console.error('[HR Service] Error saving leave request to DB:', e);
            throw new common_1.BadRequestException(`Database Error: ${e.message}`);
        }
    }
    async reviewLeaveRequest(id, dto) {
        console.log(`[HR Service] Reviewing leave ${id}`, dto);
        try {
            const leave = await this.leaveRepository.findOne({ where: { id } });
            if (!leave)
                throw new common_1.NotFoundException("Leave request not found");
            if (leave.currentValidatorId && leave.currentValidatorId !== dto.reviewedBy) {
                throw new common_1.BadRequestException("Vous n'êtes pas le validateur autorisé pour cette demande.");
            }
            if (leave.status !== leave_constants_1.LeaveStatus.PENDING)
                throw new common_1.BadRequestException("Seules les demandes EN ATTENTE peuvent être traitées.");
            if (dto.status !== leave_constants_1.LeaveStatus.APPROVED && dto.status !== leave_constants_1.LeaveStatus.REJECTED) {
                throw new common_1.BadRequestException("Le statut doit être APPROVED ou REJECTED.");
            }
            if (dto.status === leave_constants_1.LeaveStatus.REJECTED && !dto.rejectionReason) {
                throw new common_1.BadRequestException("Une raison est requise pour un refus.");
            }
            console.log(`[HR Service] Updating leave ${id} in DB...`);
            try {
                await this.leaveRepository.update(id, {
                    status: dto.status,
                    reviewedBy: dto.reviewedBy,
                    reviewedAt: new Date(),
                    rejectionReason: dto.status === leave_constants_1.LeaveStatus.REJECTED ? dto.rejectionReason ?? null : null,
                });
            }
            catch (dbErr) {
                console.error(`[HR Service] DB UPDATE ERROR for ${id}:`, dbErr);
                throw new common_1.BadRequestException(`Échec de la mise à jour : ${dbErr.message}`);
            }
            const updated = await this.leaveRepository.findOne({ where: { id } });
            if (dto.status === leave_constants_1.LeaveStatus.APPROVED) {
                try {
                    console.log(`[HR Service] Syncing leave ${id} to calendar...`);
                    await this.syncToProjectCalendar(updated);
                }
                catch (calendarErr) {
                    console.error(`[HR Service] Sync to calendar failed for ${id}:`, calendarErr.message);
                }
            }
            try {
                (0, leave_utils_1.sendReviewNotification)(updated);
                await this.publishNotification(updated.employeeId, {
                    type: 'LEAVE_DECISION',
                    title: `Demande de congé ${updated.status === leave_constants_1.LeaveStatus.APPROVED ? 'Acceptée' : 'Refusée'}`,
                    message: `Votre demande du ${updated.startDate.toLocaleDateString()} a été traitée.`,
                    metadata: { leaveId: updated.id, status: updated.status }
                });
            }
            catch (notifErr) {
                console.error(`[HR Service] Notification failed for ${id}:`, notifErr.message);
            }
            return leave_response_dto_1.LeaveResponseDto.fromEntity(updated);
        }
        catch (e) {
            console.error(`[HR Service] FATAL ERROR in reviewLeaveRequest for ${id}:`, e);
            if (e instanceof common_1.BadRequestException || e instanceof common_1.NotFoundException)
                throw e;
            throw new common_1.BadRequestException(`Erreur lors du traitement : ${e.message}`);
        }
    }
    async publishNotification(userId, data) {
        try {
            const payload = JSON.stringify({ userId, ...data, timestamp: new Date() });
            await this.redis.publish('notifications', payload);
            console.log(`[HR Service] Redis notification published for user ${userId}`);
        }
        catch (err) {
            console.error('[HR Service] Redis Publish Error:', err.message);
        }
    }
    async getLeaves() {
        const items = await this.leaveRepository.find({
            order: { createdAt: 'DESC' }
        });
        return items.map(leave_response_dto_1.LeaveResponseDto.fromEntity);
    }
    async getLeavesByEmployee(employeeId) {
        const items = await this.leaveRepository.find({
            where: { employeeId },
            order: { createdAt: 'DESC' }
        });
        return items.map(leave_response_dto_1.LeaveResponseDto.fromEntity);
    }
    async getPendingLeaves(validatorId) {
        const where = { status: leave_constants_1.LeaveStatus.PENDING };
        if (validatorId) {
            where.currentValidatorId = validatorId;
        }
        const items = await this.leaveRepository.find({
            where,
            order: { createdAt: 'DESC' }
        });
        return items.map(leave_response_dto_1.LeaveResponseDto.fromEntity);
    }
    async getLeaveById(id) {
        const leave = await this.leaveRepository.findOne({ where: { id } });
        if (!leave)
            throw new common_1.NotFoundException("Leave request not found");
        return leave_response_dto_1.LeaveResponseDto.fromEntity(leave);
    }
    async syncToProjectCalendar(leave) {
        leave.calendarSynced = true;
        this.events.emit("leave.approved", {
            employeeId: leave.employeeId,
            startDate: leave.startDate,
            endDate: leave.endDate,
        });
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_model_1.LeaveRequest)),
    __param(2, (0, common_2.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        ioredis_1.default])
], LeaveService);
//# sourceMappingURL=leave.service.js.map