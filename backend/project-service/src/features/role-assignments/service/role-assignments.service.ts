import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleAssignment } from '../model/role-assignment.model';

@Injectable()
export class RoleAssignmentsService {
  private readonly logger = new Logger(RoleAssignmentsService.name);

  constructor(
    @InjectRepository(RoleAssignment)
    private readonly repo: Repository<RoleAssignment>,
  ) {}

  async getAll() {
    const rows = await this.repo.find();
    return rows.map(this.toDto);
  }

  async getMyProjects() {
    return { message: 'Use getUserProjects(userId) instead' };
  }

  async getUserProjects(userId: string) {
    const rows = await this.repo.find({ where: { userId, isActive: true } });
    return {
      userId,
      userFullName: rows[0]?.userFullName || '',
      userEmail: rows[0]?.userEmail || '',
      projects: rows.map(r => ({
        projectId: r.projectId,
        projectName: r.projectName,
        role: r.role,
        isActive: r.isActive,
        assignedAt: r.createdAt,
      })),
      totalProjects: rows.length,
    };
  }

  async getProjectMembers(projectId: string, role?: string) {
    const where: any = { projectId };
    if (role) where.role = role;
    const rows = await this.repo.find({ where });
    return {
      projectId,
      projectName: rows[0]?.projectName || '',
      members: rows.map(r => ({
        id: r.id,
        user: { id: r.userId, fullName: r.userFullName, email: r.userEmail },
        project: { id: r.projectId, name: r.projectName },
        role: r.role,
        isActive: r.isActive,
        notes: r.notes,
        createdAt: r.createdAt,
      })),
      totalCount: rows.length,
      roleCounts: this.countRoles(rows),
    };
  }

  async assign(payload: any) {
    // Check if already assigned — update instead of duplicate
    const existing = await this.repo.findOne({
      where: { userId: payload.userId, projectId: payload.projectId },
    });

    if (existing) {
      existing.role = payload.role || existing.role;
      existing.isActive = true;
      if (payload.notes !== undefined) existing.notes = payload.notes;
      const saved = await this.repo.save(existing);
      return this.toDto(saved);
    }

    const entity = this.repo.create({
      userId: payload.userId,
      userFullName: payload.user?.fullName || '',
      userEmail: payload.user?.email || '',
      projectId: payload.projectId,
      projectName: payload.project?.name || '',
      role: payload.role || 'TEAM_MEMBER',
      notes: payload.notes || null,
      assignedBy: payload.assignedBy || null,
      isActive: true,
    });

    const saved = await this.repo.save(entity);
    this.logger.log(`Assigned user ${payload.userId} to project ${payload.projectId} as ${payload.role}`);
    return this.toDto(saved);
  }

  async bulkAssign(payload: any) {
    const results: any[] = [];
    if (payload.assignments && Array.isArray(payload.assignments)) {
      for (const a of payload.assignments) {
        results.push(await this.assign({ ...a, notes: a.notes || payload.notes }));
      }
    }
    return results;
  }

  async update(id: string, data: any) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) return null;
    Object.assign(row, data);
    const saved = await this.repo.save(row);
    return this.toDto(saved);
  }

  async remove(userId: string, projectId: string) {
    const row = await this.repo.findOne({ where: { userId, projectId } });
    if (!row) return false;
    await this.repo.remove(row);
    return true;
  }

  private countRoles(rows: RoleAssignment[]) {
    const counts: Record<string, number> = { ADMIN: 0, PROJECT_MANAGER: 0, TEAM_MEMBER: 0, CLIENT: 0 };
    for (const r of rows) {
      if (counts[r.role] !== undefined) counts[r.role]++;
    }
    return counts;
  }

  private toDto(r: RoleAssignment) {
    return {
      id: r.id,
      user: { id: r.userId, fullName: r.userFullName, email: r.userEmail },
      project: { id: r.projectId, name: r.projectName },
      role: r.role,
      isActive: r.isActive,
      notes: r.notes,
      assignedBy: r.assignedBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}