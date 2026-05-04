import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { TimeTrackingSession, TrackingStatus } from "../model/time-tracking.model";
import { StartTrackingDto, ManualCorrectionDto } from "../dto/time-tracking.dto";

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeTrackingSession)
    private readonly timeRepository: Repository<TimeTrackingSession>,
  ) {}

  async startSession(dto: StartTrackingDto): Promise<TimeTrackingSession> {
    const active = await this.timeRepository.findOne({
      where: { employeeId: dto.employeeId, endTime: IsNull() }
    });

    if (active) throw new BadRequestException("Vous avez déjà une session de pointage active.");

    const now = new Date();
    
    // Anomaly detection: arrival after 09:30 AM
    let isAnomaly = false;
    let anomalyReason: string | null = null;
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
      status: TrackingStatus.IN_PROGRESS,
      isAnomaly,
      anomalyReason
    });

    return this.timeRepository.save(session);
  }

  async pauseSession(sessionId: string): Promise<TimeTrackingSession> {
    const session = await this.timeRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session non trouvée");
    if (session.status !== TrackingStatus.IN_PROGRESS) throw new BadRequestException("Seule une session en cours peut être mise en pause.");

    session.status = TrackingStatus.PAUSED;
    session.pauseStartTime = new Date();
    return this.timeRepository.save(session);
  }

  async resumeSession(sessionId: string): Promise<TimeTrackingSession> {
    const session = await this.timeRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session non trouvée");
    if (session.status !== TrackingStatus.PAUSED) throw new BadRequestException("Cette session n'est pas en pause.");

    const now = new Date();
    if (session.pauseStartTime) {
      const diffMs = now.getTime() - session.pauseStartTime.getTime();
      session.totalPauseMinutes += Math.round(diffMs / 60000);
      session.pauseStartTime = null;
    }
    
    session.status = TrackingStatus.IN_PROGRESS;
    return this.timeRepository.save(session);
  }

  async stopSession(sessionId: string): Promise<TimeTrackingSession> {
    const session = await this.timeRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session non trouvée");
    if (session.status === TrackingStatus.COMPLETED) throw new BadRequestException("Cette session est déjà terminée");

    const now = new Date();
    
    // If stopping while paused, add the final pause duration
    if (session.status === TrackingStatus.PAUSED && session.pauseStartTime) {
        const diffMs = now.getTime() - session.pauseStartTime.getTime();
        session.totalPauseMinutes += Math.round(diffMs / 60000);
        session.pauseStartTime = null;
    }

    session.endTime = now;
    session.status = TrackingStatus.COMPLETED;
    
    const diffMs = now.getTime() - session.startTime.getTime();
    const totalMinutes = Math.round(diffMs / 60000);
    session.durationMinutes = Math.max(0, totalMinutes - session.totalPauseMinutes);

    return this.timeRepository.save(session);
  }

  async getActiveSession(employeeId: string): Promise<TimeTrackingSession | null> {
    return this.timeRepository.findOne({
      where: { employeeId, endTime: IsNull() }
    });
  }

  async getPersonalHistory(employeeId: string): Promise<TimeTrackingSession[]> {
    return this.timeRepository.find({
      where: { employeeId },
      order: { startTime: 'DESC' },
      take: 100
    });
  }

  async getActiveTeam(): Promise<TimeTrackingSession[]> {
    return this.timeRepository.find({
      where: { endTime: IsNull() },
      order: { startTime: 'DESC' }
    });
  }

  async getTeamHistory(): Promise<TimeTrackingSession[]> {
    return this.timeRepository.find({
      order: { startTime: 'DESC' },
      take: 500
    });
  }

  async manualCorrection(dto: ManualCorrectionDto): Promise<TimeTrackingSession> {
    const session = await this.timeRepository.findOne({ where: { id: dto.sessionId } });
    if (!session) throw new NotFoundException("Session non trouvée");

    if (dto.startTime) session.startTime = new Date(dto.startTime);
    if (dto.endTime) session.endTime = new Date(dto.endTime);
    if (dto.totalPauseMinutes !== undefined) session.totalPauseMinutes = dto.totalPauseMinutes;
    if (dto.isAnomaly !== undefined) session.isAnomaly = dto.isAnomaly;

    if (session.endTime) {
        const diffMs = session.endTime.getTime() - session.startTime.getTime();
        const totalMinutes = Math.round(diffMs / 60000);
        session.durationMinutes = Math.max(0, totalMinutes - session.totalPauseMinutes);
        session.status = TrackingStatus.COMPLETED;
    }

    return this.timeRepository.save(session);
  }

  async deleteSession(id: string): Promise<void> {
    await this.timeRepository.delete(id);
  }
}
