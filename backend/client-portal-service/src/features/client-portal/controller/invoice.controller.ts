import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete, Patch, Put, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from '../service/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { JwtAuthGuard } from '../../../middleware/guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Créer une nouvelle facture' })
  @ApiResponse({ status: 201, description: 'Facture créée avec succès.' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoiceService.create(createInvoiceDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les factures' })
  @ApiResponse({ status: 200, description: 'Liste des factures récupérée avec succès.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') clientId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.invoiceService.findAll({ 
      page, 
      limit, 
      clientId, 
      projectId, 
      status, 
      type, 
      dateFrom, 
      dateTo 
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une facture par son ID' })
  @ApiResponse({ status: 200, description: 'Facture récupérée avec succès.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.invoiceService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Mettre à jour une facture' })
  @ApiResponse({ status: 200, description: 'Facture mise à jour avec succès.' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
    return this.invoiceService.update(id, updateInvoiceDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une facture' })
  @ApiResponse({ status: 200, description: 'Facture supprimée avec succès.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.invoiceService.remove(id, req.user);
  }

  @Post(':id/send')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Envoyer une facture par email' })
  @ApiResponse({ status: 200, description: 'Facture envoyée avec succès.' })
  send(@Param('id') id: string, @Request() req) {
    return this.invoiceService.sendInvoice(id, req.user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Télécharger une facture en PDF' })
  @ApiResponse({ status: 200, description: 'Facture téléchargée avec succès.' })
  async download(@Param('id') id: string, @Request() req, @Res() res) {
    return this.invoiceService.downloadPdf(id, req.user, res);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  @ApiResponse({ status: 200, description: 'Paiement enregistré avec succès.' })
  recordPayment(@Param('id') id: string, @Body() payment: any, @Request() req) {
    return this.invoiceService.recordPayment(id, payment, req.user);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Récupérer les paiements d\'une facture' })
  @ApiResponse({ status: 200, description: 'Paiements récupérés avec succès.' })
  getPayments(@Param('id') id: string, @Request() req) {
    return this.invoiceService.getPayments(id, req.user);
  }

  @Post('recurring')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Créer une facture récurrente' })
  @ApiResponse({ status: 201, description: 'Facture récurrente créée avec succès.' })
  createRecurring(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoiceService.createRecurring(createInvoiceDto, req.user);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Récupérer les factures en retard' })
  @ApiResponse({ status: 200, description: 'Factures en retard récupérées avec succès.' })
  getOverdue(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoiceService.getOverdue({ page, limit, clientId });
  }

  @Get('statistics')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Récupérer les statistiques des factures' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  getStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoiceService.getStatistics({ dateFrom, dateTo, clientId });
  }
}
