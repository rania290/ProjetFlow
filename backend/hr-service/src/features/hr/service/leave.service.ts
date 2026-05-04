import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Repository, LessThanOrEqual, MoreThanOrEqual, In, Not } from "typeorm";
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

    console.log(`[HR Service] Start createLeaveRequest for employee ${dto.employeeId}`);
    // Overlap check disabled as per user request

    // Check for other users overlapping (Warning)
    const otherOverlaps = await this.leaveRepository.find({
      where: {
        employeeId: Not(dto.employeeId),
        status: LeaveStatus.FULLY_APPROVED,
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
    });

    if (otherOverlaps.length > 0) {
      const names = otherOverlaps.map(o => o.employeeName).join(', ');
      console.log(`[HR Service] Warning: Other users have approved leaves: ${names}`);
      // We don't block here by default unless specified, but we can throw a specific exception or include it in response
      // For this task, let's allow it but maybe the user wants to see it. 
      // I'll add a check in the frontend instead to show a warning before submitting.
    }

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
        status: LeaveStatus.PENDING,
        managerId: dto.managerId || (dto.managerIds && dto.managerIds.length > 0 ? dto.managerIds[0] : null),
        managerIds: dto.managerIds || (dto.managerId ? [dto.managerId] : []),
        currentValidatorId: dto.managerId || (dto.managerIds && dto.managerIds.length > 0 ? dto.managerIds[0] : null),
        validationStep: 1,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        calendarSynced: false,
      });

      console.log(`[HR Service] Saving to DB...`);
      const created = (await this.leaveRepository.save(entity)) as LeaveRequest;
      console.log(`[HR Service] Saved to DB with ID: ${created.id}`);

      // Multi-channel notification: Legacy Console + Redis Real-time
      try {
        console.log(`[HR Service] Sending notifications...`);
        sendLeaveRequestNotification(created);

        // 1. Notify ALL Managers (Chef de projet)
        const managersToNotify = created.managerIds && created.managerIds.length > 0 
          ? created.managerIds 
          : created.managerId ? [created.managerId] : [];

        for (const mId of managersToNotify) {
          await this.publishNotification(mId, {
            type: 'LEAVE_REQUEST',
            title: 'Nouvelle demande (Action requise)',
            message: `${created.employeeName} a soumis une demande de ${created.durationDays} jours.`,
            metadata: { leaveId: created.id, role: 'MANAGER' }
          });
        }

        // 2. Notify all Admins (Broadcast)
        await this.publishNotification('ADMIN_GROUP', {
          type: 'LEAVE_REQUEST_ADMIN',
          title: 'Nouvelle demande soumise',
          message: `${created.employeeName} a soumis une demande (Validation Chef en cours).`,
          metadata: { leaveId: created.id, role: 'ADMIN' }
        });

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

      if (dto.status !== LeaveStatus.FULLY_APPROVED && dto.status !== LeaveStatus.CHEF_APPROVED && dto.status !== LeaveStatus.REJECTED && (dto.status as any) !== 'APPROVED') {
        throw new BadRequestException("Statut de validation invalide.");
      }
      if (dto.status === LeaveStatus.REJECTED && !dto.rejectionReason) {
        throw new BadRequestException("Une raison est requise pour un refus.");
      }

      console.log(`[HR Service] Updating leave ${id} in DB...`);
      try {
        let newStatus = dto.status;
        let newStep = leave.validationStep;
        let newValidatorId = leave.currentValidatorId;

        if (dto.status === LeaveStatus.FULLY_APPROVED || dto.status === 'APPROVED' as any) {
           if (leave.validationStep === 1) {
             // Step 1: Chef Approved -> Wait for HR
             newStatus = LeaveStatus.CHEF_APPROVED;
             newStep = 2;
             newValidatorId = null; // Broadcast to HR/Admin
           } else {
             // Step 2: HR Final Approval
             newStatus = LeaveStatus.FULLY_APPROVED;
           }
        } else if (dto.status === LeaveStatus.REJECTED) {
           newStatus = LeaveStatus.REJECTED;
        }

        await this.leaveRepository.update(id, {
          status: newStatus,
          reviewedBy: dto.reviewedBy,
          reviewedAt: new Date(),
          validationStep: newStep,
          currentValidatorId: newValidatorId,
          rejectionReason: newStatus === LeaveStatus.REJECTED ? dto.rejectionReason ?? null : null,
        });
      } catch (dbErr: any) {
        console.error(`[HR Service] DB UPDATE ERROR for ${id}:`, dbErr);
        throw new BadRequestException(`Échec de la mise à jour : ${dbErr.message}`);
      }

      const updated = await this.leaveRepository.findOne({ where: { id } });

      if (updated?.status === LeaveStatus.FULLY_APPROVED) {
        try {
          console.log(`[HR Service] Syncing leave ${id} to calendar...`);
          await this.syncToProjectCalendar(updated!);
        } catch (calendarErr: any) {
          console.error(`[HR Service] Sync to calendar failed for ${id}:`, calendarErr.message);
        }
      }

      try {
        sendReviewNotification(updated!);

        // Real-time Decision Notification
        const notifTitle = updated!.status === LeaveStatus.FULLY_APPROVED 
          ? 'Demande de congé Acceptée' 
          : updated!.status === LeaveStatus.CHEF_APPROVED 
            ? 'Demande validée par le Chef (Attente RH)'
            : 'Demande de congé Refusée';

        await this.publishNotification(updated!.employeeId, {
          type: 'LEAVE_DECISION',
          title: notifTitle,
          message: `Votre demande du ${updated!.startDate.toLocaleDateString()} a été mise à jour.`,
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
    let items: LeaveRequest[] = [];
    
    // If no validatorId is provided (Admin case), show EVERYTHING that needs validation
    if (!validatorId || validatorId === 'undefined' || validatorId === '') {
      items = await this.leaveRepository.find({
        where: [
          { status: LeaveStatus.PENDING },
          { status: LeaveStatus.CHEF_APPROVED }
        ],
        order: { createdAt: 'DESC' }
      });
    } else {
      // For Managers/Chefs: Show only PENDING requests they need to validate
      // They see it if they are the current validator OR if they are in managerIds list for Level 1
      items = await this.leaveRepository.createQueryBuilder('leave')
        .where('leave.status = :status', { status: LeaveStatus.PENDING })
        .andWhere('(leave.currentValidatorId = :vId OR leave.manager_ids LIKE :vLike)', { 
          vId: validatorId,
          vLike: `%${validatorId}%`
        })
        .orderBy('leave.created_at', 'DESC')
        .getMany();
    }

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

  async checkOverlappingEmployees(start: Date, end: Date, excludeEmployeeId: string): Promise<string[]> {
    const overlaps = await this.leaveRepository.find({
      where: {
        employeeId: Not(excludeEmployeeId),
        status: LeaveStatus.FULLY_APPROVED,
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
      select: ["employeeName"]
    });

    // Return unique names
    return Array.from(new Set(overlaps.map(o => o.employeeName)));
  }
}

