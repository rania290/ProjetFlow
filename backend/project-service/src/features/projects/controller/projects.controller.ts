import { Body, Controller, Delete, Get, Param, Patch, Post, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from '../service/projects.service';
import { TasksService } from '../../tasks/service/tasks.service';
import { SprintsService } from '../../sprints/service/sprints.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/projects.dto';
import { ProjectStatus } from '../constants/projects.constants';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly sprintsService: SprintsService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string
  ) {
    return this.projectsService.create(createProjectDto, userId, role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.projectsService.findAll(userId, role);
  }

  @Get('dashboard/me')
  @ApiOperation({ summary: 'Get dashboard projects for current logged-in user' })
  getDashboardForMe(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.projectsService.getDashboardForMe(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update project status' })
  updateStatus(@Param('id') id: string, @Param('status') status: ProjectStatus) {
    return this.projectsService.updateStatus(id, status as ProjectStatus);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks for a project' })
  findAllTasks(@Param('id') id: string) {
    return this.tasksService.findAll(id);
  }

  @Get(':id/sprints')
  @ApiOperation({ summary: 'Get all sprints for a project' })
  findAllSprints(@Param('id') id: string) {
    return this.sprintsService.findAll(id);
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all projects and their associated data' })
  deleteAll() {
    return this.projectsService.deleteAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}

