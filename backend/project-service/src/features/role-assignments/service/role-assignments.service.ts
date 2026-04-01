import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleAssignmentsService {
  private assignments: any[] = [
    {
      id: '1',
      user: { id: 'user-1', fullName: 'Admin User', email: 'admin@example.com' },
      project: { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      user: { id: 'user-1', fullName: 'Admin User', email: 'admin@example.com' },
      project: { id: '2', name: 'Projet Bêta', description: 'Système interne' },
      role: 'PROJECT_MANAGER',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  getAll() {
    return this.assignments;
  }

  getMyProjects() {
    // Simulated current user is 'user-1'
    const userId = 'user-1';
    const userAssignments = this.assignments.filter(a => a.user.id === userId);
    
    return {
      userId: userId,
      userFullName: 'Admin User',
      userEmail: 'admin@example.com',
      projects: userAssignments.map(a => ({
        id: a.project.id,
        name: a.project.name,
        role: a.role,
        isActive: a.isActive,
        assignedAt: a.createdAt,
      })),
      totalProjects: userAssignments.length,
    };
  }

  getUserProjects(userId: string) {
    const userAssignments = this.assignments.filter(a => a.user.id === userId);
    return {
      userId,
      userFullName: userAssignments[0]?.user.fullName || 'User ' + userId,
      userEmail: userAssignments[0]?.user.email || 'user' + userId + '@example.com',
      projects: userAssignments.map(a => ({
        projectId: a.project.id,
        projectName: a.project.name,
        role: a.role,
        isActive: a.isActive,
        assignedAt: a.createdAt,
      })),
      totalProjects: userAssignments.length,
    };
  }

  getProjectMembers(projectId: string) {
    return this.assignments
      .filter(a => a.project.id === projectId)
      .map(a => ({
        id: a.id,
        userId: a.user.id,
        fullName: a.user.fullName,
        email: a.user.email,
        role: a.role,
        isActive: a.isActive,
        assignedAt: a.createdAt,
      }));
  }

  assign(payload: any) {
    const newAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      user: payload.user || { id: payload.userId, fullName: 'User ' + payload.userId, email: 'user' + payload.userId + '@example.com' },
      project: payload.project || { id: payload.projectId, name: 'Project ' + payload.projectId },
      role: payload.role || 'DEVELOPER',
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: payload.notes,
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  bulkAssign(payload: any) {
    const created: any[] = [];
    if (payload.assignments && Array.isArray(payload.assignments)) {
      for (const a of payload.assignments) {
        created.push(this.assign({ ...a, notes: a.notes || payload.notes }));
      }
    }
    return created;
  }

  update(id: string, data: any) {
    const idx = this.assignments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.assignments[idx] = { ...this.assignments[idx], ...data };
      return this.assignments[idx];
    }
    return null;
  }

  remove(userId: string, projectId: string) {
    const initialLen = this.assignments.length;
    this.assignments = this.assignments.filter(a => !(a.user.id === userId && a.project.id === projectId));
    return this.assignments.length < initialLen;
  }
}