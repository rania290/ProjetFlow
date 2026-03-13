import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('role-assignments')
@Controller('role-assignments')
export class RoleAssignmentsController {
  // In-memory storage for mock assignments
  private assignments: any[] = [
    {
      id: '1',
      user: { id: '1', fullName: 'Admin User', email: 'admin@example.com' },
      project: { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      user: { id: '2', fullName: 'Dev User', email: 'dev@example.com' },
      project: { id: '1', name: 'Projet Alpha', description: 'Application web principale' },
      role: 'DEVELOPER',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // This is a placeholder implementation to avoid 404 errors in the frontend.
  // The real business logic should be moved into a dedicated service and
  // backed by a database.

  @Get('all')
  @ApiOperation({ summary: 'Get all role assignments' })
  getAll() {
    return this.assignments;
  }

  @Get('user/:id/projects')
  @ApiOperation({ summary: 'Get assignments for a user by project' })
  getUserProjects(@Param('id') userId: string) {
    // Mock data for the user
    return {
      userId,
      userFullName: 'Test User',
      userEmail: 'test@example.com',
      projects: [
        {
          id: '1',
          name: 'Project Alpha',
          role: 'ADMIN',
          isActive: true,
          assignedAt: new Date().toISOString(),
        },
      ],
      totalProjects: 1,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions (stub)' })
  getAllPermissions() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by id (stub)' })
  getPermission(@Param('id') id: string) {
    return { id, message: 'Permission stub' };
  }

  @Get('project/:id/members')
  @ApiOperation({ summary: 'Get members of a project (stub)' })
  getProjectMembers(@Param('id') projectId: string) {
    return [];
  }

  @Get('me/projects')
  @ApiOperation({ summary: 'Get projects assigned to current user' })
  getMyProjects(@Req() req: any) {
    // Mock data for now
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

  @Post('assign')
  @ApiOperation({ summary: 'Assign a role to a user (stub)' })
  assign(@Body() payload: any) {
    const newAssignment = {
      id: Date.now().toString(),
      user: payload.userId ? { id: payload.userId, fullName: 'User ' + payload.userId, email: 'user' + payload.userId + '@example.com' } : payload.user,
      project: payload.projectId ? { id: payload.projectId, name: 'Project ' + payload.projectId, description: 'Description' } : payload.project,
      role: payload.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: payload.notes,
    };
    this.assignments.push(newAssignment);
    return { message: 'assignment created', assignment: newAssignment };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role assignment (stub)' })
  update(@Param('id') id: string, @Body() body: any) {
    return { message: 'update stubbed', id, body };
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign roles (stub)' })
  bulkAssign(@Body() payload: any) {
    const createdAssignments: any[] = [];
    for (const assignment of payload.assignments) {
      const newAssignment = {
        id: Date.now().toString() + Math.random().toString(),
        user: assignment.userId ? { id: assignment.userId, fullName: 'User ' + assignment.userId, email: 'user' + assignment.userId + '@example.com' } : assignment.user,
        project: assignment.projectId ? { id: assignment.projectId, name: 'Project ' + assignment.projectId, description: 'Description' } : assignment.project,
        role: assignment.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        notes: assignment.notes || payload.notes,
      };
      this.assignments.push(newAssignment);
      createdAssignments.push(newAssignment);
    }
    return { message: 'bulk assignment created', assignments: createdAssignments };
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove a role assignment (stub)' })
  remove(@Body('userId') userId: string, @Body('projectId') projectId: string) {
    this.assignments = this.assignments.filter(a => !(a.user.id === userId && a.project.id === projectId));
    return { message: 'removal successful', userId, projectId };
  }
}
