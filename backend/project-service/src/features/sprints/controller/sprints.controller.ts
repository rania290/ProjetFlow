import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SprintsService } from '../service/sprints.service';
import { CreateSprintDto, UpdateSprintDto } from '../dto/sprints.dto';

@ApiTags('sprints')
@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sprint' })
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintsService.create(createSprintDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sprints' })
  findAll(@Query('projectId') projectId?: string) {
    return this.sprintsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sprint by ID' })
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sprint' })
  update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
    return this.sprintsService.update(id, updateSprintDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sprint' })
  remove(@Param('id') id: string) {
    return this.sprintsService.remove(id);
  }
}
