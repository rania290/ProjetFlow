import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TaskTimelog } from '../model/task-timelog.model';
import { StartTimelogDto, StopTimelogDto } from '../dto/task-timelog.dto';

@Injectable()
export class TaskTimelogService {
  constructor(
    @InjectRepository(TaskTimelog)
    private readonly repo: Repository<TaskTimelog>,
  ) {}

  /** Start a timer on a task. One active timer per user maximum. */
  async start(dto: StartTimelogDto): Promise<TaskTimelog> {
    // Enforce: only one active timer per user
    const existing = await this.repo.findOne({
      where: { userId: dto.userId, endTime: IsNull() },
    });
    if (existing) {
      throw new ConflictException(
        `Un timer est déjà actif sur la tâche "${existing.taskTitle}". Arrêtez-le d'abord.`,
      );
    }

    const timelog = this.repo.create({
      taskId: dto.taskId,
      taskTitle: dto.taskTitle,
      projectId: dto.projectId,
      userId: dto.userId,
      userName: dto.userName,
      startTime: new Date(),
      endTime: null,
      durationMinutes: 0,
      note: null,
    });

    return this.repo.save(timelog);
  }

  /** Stop the active timer and compute duration. */
  async stop(dto: StopTimelogDto): Promise<TaskTimelog> {
    const timelog = await this.repo.findOne({ where: { id: dto.timelogId } });
    if (!timelog) throw new NotFoundException('Timelog introuvable');
    if (timelog.endTime) throw new ConflictException('Ce timer est déjà arrêté');

    const endTime = new Date();
    const durationMs = endTime.getTime() - timelog.startTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    timelog.endTime = endTime;
    timelog.durationMinutes = durationMinutes;
    timelog.note = dto.note ?? null;

    return this.repo.save(timelog);
  }

  /** Get the currently active timelog for a user (null if none). */
  async getActive(userId: string): Promise<TaskTimelog | null> {
    return this.repo.findOne({ where: { userId, endTime: IsNull() } });
  }

  /** Get all timelogs for a specific task. */
  async getByTask(taskId: string): Promise<TaskTimelog[]> {
    return this.repo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Get all timelogs for a specific user. */
  async getByUser(userId: string): Promise<TaskTimelog[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Get all timelogs for a project (admin view). */
  async getByProject(projectId: string): Promise<TaskTimelog[]> {
    return this.repo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Get aggregated summary for a task: total minutes + sessions. */
  async getSummaryByTask(
    taskId: string,
  ): Promise<{ totalMinutes: number; sessions: TaskTimelog[] }> {
    const sessions = await this.getByTask(taskId);
    const completed = sessions.filter((s) => s.endTime !== null);
    const totalMinutes = completed.reduce(
      (acc, s) => acc + (s.durationMinutes || 0),
      0,
    );
    return { totalMinutes, sessions };
  }

  /** Delete a timelog (admin). */
  async delete(id: string): Promise<void> {
    const timelog = await this.repo.findOne({ where: { id } });
    if (!timelog) throw new NotFoundException('Timelog introuvable');
    await this.repo.remove(timelog);
  }
}
