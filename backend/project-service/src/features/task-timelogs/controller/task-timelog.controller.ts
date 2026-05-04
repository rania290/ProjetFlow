import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskTimelogService } from '../service/task-timelog.service';
import { StartTimelogDto, StopTimelogDto } from '../dto/task-timelog.dto';

@ApiTags('task-timelogs')
@Controller('task-timelogs')
export class TaskTimelogController {
  constructor(private readonly service: TaskTimelogService) {
    console.log('TaskTimelogController initialized');
  }

  @Post('/start')
  @ApiOperation({ summary: 'Start a timer on a task' })
  start(@Body() dto: StartTimelogDto) {
    console.log('Starting timelog for task:', dto.taskId);
    return this.service.start(dto);
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the active timer' })
  stop(@Body() dto: StopTimelogDto) {
    return this.service.stop(dto);
  }

  @Get('active/:userId')
  @ApiOperation({ summary: 'Get active timelog for a user' })
  getActive(@Param('userId') userId: string) {
    return this.service.getActive(userId);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all timelogs for a task' })
  getByTask(@Param('taskId') taskId: string) {
    return this.service.getByTask(taskId);
  }

  @Get('task/:taskId/summary')
  @ApiOperation({ summary: 'Get aggregated time summary for a task' })
  getSummary(@Param('taskId') taskId: string) {
    return this.service.getSummaryByTask(taskId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all timelogs for a user' })
  getByUser(@Param('userId') userId: string) {
    return this.service.getByUser(userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all timelogs for a project (admin)' })
  getByProject(@Param('projectId') projectId: string) {
    return this.service.getByProject(projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timelog' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
