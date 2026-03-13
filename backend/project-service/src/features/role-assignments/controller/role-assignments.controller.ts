import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleAssignmentsService } from '../service/role-assignments.service';

@ApiTags('role-assignments')
@Controller('role-assignments')
export class RoleAssignmentsController {
  constructor(private readonly roleAssignmentsService: RoleAssignmentsService) {}

  @Get('me/projects')
  @ApiOperation({ summary: 'Get user\'s projects with roles' })
  getMyProjects() {
    return this.roleAssignmentsService.getMyProjects();
  }
}