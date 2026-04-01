import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleAssignmentsService } from '../service/role-assignments.service';

@ApiTags('role-assignments')
@Controller('role-assignments')
export class RoleAssignmentsController {
  constructor(private readonly roleAssignmentsService: RoleAssignmentsService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all role assignments' })
  getAll() {
    return this.roleAssignmentsService.getAll();
  }

  @Get('me/projects')
  @ApiOperation({ summary: 'Get projects assigned to current user' })
  getMyProjects() {
    return this.roleAssignmentsService.getMyProjects();
  }

  @Get('user/:id/projects')
  @ApiOperation({ summary: 'Get projects assigned to a specific user' })
  getUserProjects(@Param('id') userId: string) {
    return this.roleAssignmentsService.getUserProjects(userId);
  }

  @Get('project/:id/members')
  @ApiOperation({ summary: 'Get members of a project' })
  getProjectMembers(@Param('id') projectId: string) {
    return this.roleAssignmentsService.getProjectMembers(projectId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign a role to a user' })
  assign(@Body() payload: any) {
    return this.roleAssignmentsService.assign(payload);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign roles' })
  bulkAssign(@Body() payload: any) {
    return this.roleAssignmentsService.bulkAssign(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role assignment' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.roleAssignmentsService.update(id, body);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove a role assignment' })
  remove(@Body('userId') userId: string, @Body('projectId') projectId: string) {
    const success = this.roleAssignmentsService.remove(userId, projectId);
    return { success, message: success ? 'Removed' : 'Not found' };
  }
}