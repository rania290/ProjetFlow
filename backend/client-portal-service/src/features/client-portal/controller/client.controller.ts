import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientService } from '../service/client.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Créer un nouveau client' })
  @ApiResponse({ status: 201, description: 'Client créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
  create(@Body() createClientDto: CreateClientDto, @Request() req) {
    return this.clientService.create(createClientDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les clients' })
  @ApiResponse({ status: 200, description: 'Liste des clients récupérée avec succès.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.clientService.findAll({ page, limit, search, isActive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un client par son ID' })
  @ApiResponse({ status: 200, description: 'Client récupéré avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un client' })
  @ApiResponse({ status: 200, description: 'Client mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé.' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req) {
    return this.clientService.update(id, updateClientDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un client' })
  @ApiResponse({ status: 200, description: 'Client supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Client non trouvé.' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.clientService.remove(id, req.user);
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Récupérer les projets d\'un client' })
  @ApiResponse({ status: 200, description: 'Projets du client récupérés avec succès.' })
  findProjects(@Param('id') id: string, @Request() req) {
    return this.clientService.findProjects(id, req.user);
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'Récupérer les tickets d\'un client' })
  @ApiResponse({ status: 200, description: 'Tickets du client récupérés avec succès.' })
  findTickets(
    @Param('id') id: string,
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.clientService.findTickets(id, { page, limit, status, priority }, req.user);
  }

  @Get(':id/invoices')
  @ApiOperation({ summary: 'Récupérer les factures d\'un client' })
  @ApiResponse({ status: 200, description: 'Factures du client récupérées avec succès.' })
  findInvoices(
    @Param('id') id: string,
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.clientService.findInvoices(id, { page, limit, status, type }, req.user);
  }

  @Post(':id/send-welcome-email')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Envoyer un email de bienvenue au client' })
  @ApiResponse({ status: 200, description: 'Email envoyé avec succès.' })
  sendWelcomeEmail(@Param('id') id: string, @Request() req) {
    return this.clientService.sendWelcomeEmail(id, req.user);
  }

  @Patch(':id/preferences')
  @ApiOperation({ summary: 'Mettre à jour les préférences du client' })
  @ApiResponse({ status: 200, description: 'Préférences mises à jour avec succès.' })
  updatePreferences(@Param('id') id: string, @Body() preferences: any, @Request() req) {
    return this.clientService.updatePreferences(id, preferences, req.user);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un client' })
  @ApiResponse({ status: 200, description: 'Statistiques du client récupérées avec succès.' })
  getStatistics(@Param('id') id: string, @Request() req) {
    return this.clientService.getStatistics(id, req.user);
  }
}
