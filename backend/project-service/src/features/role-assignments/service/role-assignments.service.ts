import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleAssignmentsService {
  // Mock service for now
  getMyProjects() {
    return {
      userId: '1',
      userFullName: 'Admin User',
      userEmail: 'admin@example.com',
      projects: [
        {
          id: '1',
          name: 'Project Alpha',
          role: 'ADMIN',
          isActive: true,
          assignedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Project Beta',
          role: 'PROJECT_MANAGER',
          isActive: true,
          assignedAt: new Date().toISOString(),
        },
      ],
      totalProjects: 2,
    };
  }
}