import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from '../service/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { JwtAuthGuard } from '../../../middleware/guards/jwt-auth.guard';
import { RolesGuard } from '../../../middleware/guards/roles.guard';
import { Roles } from '../../../middleware/decorators/roles.decorator';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectService.create(createProjectDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste des projets récupérée avec succès.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    return this.projectService.findAll({ page, limit, clientId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par son ID' })
  @ApiResponse({ status: 200, description: 'Projet récupéré avec succès.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectService.update(id, updateProjectDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiResponse({ status: 200, description: 'Projet supprimé avec succès.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectService.remove(id, req.user);
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'Récupérer les tickets d\'un projet' })
  @ApiResponse({ status: 200, description: 'Tickets du projet récupérés avec succès.' })
  findTickets(@Param('id') id: string, @Request() req) {
    return this.projectService.findTickets(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un projet' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
    return this.projectService.updateStatus(id, body.status, req.user);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Ajouter un document à un projet' })
  @ApiResponse({ status: 201, description: 'Document ajouté avec succès.' })
  addDocument(@Param('id') id: string, @Body() document: any, @Request() req) {
    return this.projectService.addDocument(id, document, req.user);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Récupérer la timeline d\'un projet' })
  @ApiResponse({ status: 200, description: 'Timeline récupérée avec succès.' })
  getTimeline(@Param('id') id: string, @Request() req) {
    return this.projectService.getTimeline(id, req.user);
  }
}
