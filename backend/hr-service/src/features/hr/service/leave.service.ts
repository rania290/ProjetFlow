import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";
import { LeaveStatus } from "../constants/leave.constants";
import { CreateLeaveDto } from "../dto/create-leave.dto";
import { LeaveResponseDto } from "../dto/leave-response.dto";
import { ReviewLeaveDto } from "../dto/review-leave.dto";
import { LeaveRequest } from "../model/leave-request.model";
import { calculateWorkingDays, sendLeaveRequestNotification, sendReviewNotification } from "../../../utils/leave.utils";

import Redis from "ioredis";
import { Inject } from "@nestjs/common";

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepository: Repository<LeaveRequest>,
    private readonly events: EventEmitter2,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) { }

  async createLeaveRequest(dto: CreateLeaveDto): Promise<LeaveResponseDto> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) throw new BadRequestException("endDate must be >= startDate");

    const durationDays = calculateWorkingDays(start, end);
    if (durationDays <= 0) throw new BadRequestException("Leave duration must be at least 1 working day (check if dates fall on weekends)");

    const overlap = await this.leaveRepository.findOne({
      where: {
        employeeId: dto.employeeId,
        status: In([LeaveStatus.PENDING, LeaveStatus.APPROVED]),
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
    });
    if (overlap) throw new BadRequestException("Overlapping leave request already exists for these dates");

    try {
      const entity = this.leaveRepository.create({
        employeeId: dto.employeeId,
        employeeName: dto.employeeName,
        type: dto.type,
        startDate: start,
        endDate: end,
        durationDays,
        motif: dto.motif ?? "",
        status: LeaveStatus.PENDING,
        managerId: dto.managerId || null,
        currentValidatorId: dto.managerId || null,
        validationStep: 1,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        calendarSynced: false,
      });

      const created = (await this.leaveRepository.save(entity)) as LeaveRequest;

      // Multi-channel notification: Legacy Console + Redis Real-time
      try {
        sendLeaveRequestNotification(created);

        if (created.managerId) {
          await this.publishNotification(created.managerId, {
            type: 'LEAVE_REQUEST',
            title: 'Nouvelle demande de congé',
            message: `${created.employeeName} a soumis une demande de ${created.durationDays} jours.`,
            metadata: { leaveId: created.id }
          });
        }
      } catch (e: any) {
        console.warn('[HR Service] Error sending notification', e.message);
      }
      return LeaveResponseDto.fromEntity(created);
    } catch (e: any) {
      console.error('[HR Service] Error saving leave request to DB:', e);
      throw new BadRequestException(`Database Error: ${e.message}`);
    }
  }

  async reviewLeaveRequest(id: string, dto: ReviewLeaveDto): Promise<LeaveResponseDto> {
    console.log(`[HR Service] Reviewing leave ${id}`, dto);

    try {
      const leave = await this.leaveRepository.findOne({ where: { id } });
      if (!leave) throw new NotFoundException("Leave request not found");

      // Hierarchical Check: Verify reviewer is the authorized validator
      if (leave.currentValidatorId && leave.currentValidatorId !== dto.reviewedBy) {
        throw new BadRequestException("Vous n'êtes pas le validateur autorisé pour cette demande.");
      }

      if (leave.status !== LeaveStatus.PENDING) throw new BadRequestException("Seules les demandes EN ATTENTE peuvent être traitées.");

      if (dto.status !== LeaveStatus.APPROVED && dto.status !== LeaveStatus.REJECTED) {
        throw new BadRequestException("Le statut doit être APPROVED ou REJECTED.");
      }
      if (dto.status === LeaveStatus.REJECTED && !dto.rejectionReason) {
        throw new BadRequestException("Une raison est requise pour un refus.");
      }

      console.log(`[HR Service] Updating leave ${id} in DB...`);
      try {
        await this.leaveRepository.update(id, {
          status: dto.status,
          reviewedBy: dto.reviewedBy,
          reviewedAt: new Date(),
          rejectionReason: dto.status === LeaveStatus.REJECTED ? dto.rejectionReason ?? null : null,
        });
      } catch (dbErr: any) {
        console.error(`[HR Service] DB UPDATE ERROR for ${id}:`, dbErr);
        throw new BadRequestException(`Échec de la mise à jour : ${dbErr.message}`);
      }

      const updated = await this.leaveRepository.findOne({ where: { id } });

      if (dto.status === LeaveStatus.APPROVED) {
        try {
          console.log(`[HR Service] Syncing leave ${id} to calendar...`);
          await this.syncToProjectCalendar(updated!);
        } catch (calendarErr: any) {
          console.error(`[HR Service] Sync to calendar failed for ${id}:`, calendarErr.message);
        }
      }

      try {
        sendReviewNotification(updated!);

        // Real-time Decision Notification to Employee
        await this.publishNotification(updated!.employeeId, {
          type: 'LEAVE_DECISION',
          title: `Demande de congé ${updated!.status === LeaveStatus.APPROVED ? 'Acceptée' : 'Refusée'}`,
          message: `Votre demande du ${updated!.startDate.toLocaleDateString()} a été traitée.`,
          metadata: { leaveId: updated!.id, status: updated!.status }
        });
      } catch (notifErr: any) {
        console.error(`[HR Service] Notification failed for ${id}:`, notifErr.message);
      }

      return LeaveResponseDto.fromEntity(updated!);
    } catch (e: any) {
      console.error(`[HR Service] FATAL ERROR in reviewLeaveRequest for ${id}:`, e);
      if (e instanceof BadRequestException || e instanceof NotFoundException) throw e;
      throw new BadRequestException(`Erreur lors du traitement : ${e.message}`);
    }
  }

  private async publishNotification(userId: string, data: any) {
    try {
      const payload = JSON.stringify({ userId, ...data, timestamp: new Date() });
      await this.redis.publish('notifications', payload);
      console.log(`[HR Service] Redis notification published for user ${userId}`);
    } catch (err: any) {
      console.error('[HR Service] Redis Publish Error:', err.message);
    }
  }

  async getLeaves(): Promise<LeaveResponseDto[]> {
    const items = await this.leaveRepository.find({
      order: { createdAt: 'DESC' }
    });
    return items.map(LeaveResponseDto.fromEntity);
  }

  async getLeavesByEmployee(employeeId: string): Promise<LeaveResponseDto[]> {
    const items = await this.leaveRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' }
    });
    return items.map(LeaveResponseDto.fromEntity);
  }

  async getPendingLeaves(validatorId?: string): Promise<LeaveResponseDto[]> {
    const where: any = { status: LeaveStatus.PENDING };
    if (validatorId) {
      where.currentValidatorId = validatorId;
    }

    const items = await this.leaveRepository.find({
      where,
      order: { createdAt: 'DESC' }
    });
    return items.map(LeaveResponseDto.fromEntity);
  }

  async getLeaveById(id: string): Promise<LeaveResponseDto> {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) throw new NotFoundException("Leave request not found");
    return LeaveResponseDto.fromEntity(leave);
  }

  async syncToProjectCalendar(leave: LeaveRequest): Promise<void> {
    leave.calendarSynced = true;
    this.events.emit("leave.approved", {
      employeeId: leave.employeeId,
      startDate: leave.startDate,
      endDate: leave.endDate,
    });
  }
}

