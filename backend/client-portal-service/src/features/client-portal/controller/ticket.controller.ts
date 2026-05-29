import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketService } from '../service/ticket.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/create-ticket.dto';
import { TicketCommentDto } from '../dto/create-ticket.dto';
import { JwtAuthGuard } from '../../../middleware/guards/jwt-auth.guard';
import { RolesGuard } from '../../../middleware/guards/roles.guard';
import { Roles } from '../../../middleware/decorators/roles.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'TEAM_MEMBER', 'CLIENT', 'RH', 'DEVELOPER', 'DESIGNER', 'TESTER')
  @ApiOperation({ summary: 'Créer un nouveau ticket' })
  @ApiResponse({ status: 201, description: 'Ticket créé avec succès.' })
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketService.create(createTicketDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les tickets' })
  @ApiResponse({ status: 200, description: 'Liste des tickets récupérée avec succès.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') clientId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Request() req?: any,
  ) {
    return this.ticketService.findAll({ 
      page, 
      limit, 
      clientId, 
      projectId, 
      status, 
      priority, 
      assignedTo 
    }, req?.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un ticket par son ID' })
  @ApiResponse({ status: 200, description: 'Ticket récupéré avec succès.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ticketService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket mis à jour avec succès.' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Request() req) {
    return this.ticketService.update(id, updateTicketDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Supprimer un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket supprimé avec succès.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketService.remove(id, req.user);
  }

  @Post(':id/comments')
  @Roles('ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'TEAM_MEMBER', 'CLIENT', 'RH', 'DEVELOPER', 'DESIGNER', 'TESTER')
  @ApiOperation({ summary: 'Ajouter un commentaire à un ticket' })
  @ApiResponse({ status: 201, description: 'Commentaire ajouté avec succès.' })
  addComment(@Param('id') id: string, @Body() commentDto: TicketCommentDto, @Request() req) {
    return this.ticketService.addComment(id, commentDto, req.user);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Récupérer les commentaires d\'un ticket' })
  @ApiResponse({ status: 200, description: 'Commentaires récupérés avec succès.' })
  getComments(@Param('id') id: string, @Request() req) {
    return this.ticketService.getComments(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un ticket' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès.' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
    return this.ticketService.updateStatus(id, body.status, req.user);
  }

  @Post(':id/assign')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Assigner un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket assigné avec succès.' })
  assign(@Param('id') id: string, @Body() body: { assignedTo: string }, @Request() req) {
    return this.ticketService.assign(id, body.assignedTo, req.user);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Récupérer la timeline d\'un ticket' })
  @ApiResponse({ status: 200, description: 'Timeline récupérée avec succès.' })
  getTimeline(@Param('id') id: string, @Request() req) {
    return this.ticketService.getTimeline(id, req.user);
  }

  @Post(':id/satisfaction')
  @ApiOperation({ summary: 'Ajouter une évaluation de satisfaction' })
  @ApiResponse({ status: 200, description: 'Évaluation ajoutée avec succès.' })
  addSatisfaction(@Param('id') id: string, @Body() body: { satisfaction: number; comment?: string }, @Request() req) {
    return this.ticketService.addSatisfaction(id, body.satisfaction, body.comment, req.user);
  }
}
