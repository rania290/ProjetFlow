import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('system')
@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemController {
  @Get('settings')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Récupérer les paramètres système' })
  @ApiResponse({ status: 200, description: 'Paramètres système récupérés avec succès' })
  getSystemSettings() {
    return {
      application: {
        name: 'ProjetFlow',
        version: '1.0.0',
        description: 'Plateforme de gestion de projet'
      },
      features: {
        clientPortal: true,
        reporting: true,
        notifications: true,
        fileUpload: true,
        realTimeUpdates: true
      },
      limits: {
        maxFileSize: 10485760, // 10MB
        maxProjectsPerUser: 50,
        maxTasksPerProject: 500,
        maxTeamMembersPerProject: 20
      },
      ui: {
        theme: 'light',
        language: 'fr',
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY'
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      }
    };
  }

  @Post('settings')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mettre à jour les paramètres système' })
  @ApiResponse({ status: 200, description: 'Paramètres système mis à jour avec succès' })
  updateSystemSettings(@Body() settings: any) {
    // Ici, vous implémenteriez la logique pour sauvegarder les settings
    // Pour l'instant, on retourne juste les settings reçus
    return {
      message: 'Paramètres système mis à jour avec succès',
      settings
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérifier la santé du système' })
  @ApiResponse({ status: 200, description: 'Système en bonne santé' })
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy',
        auth: 'healthy',
        clientPortal: 'healthy',
        projects: 'healthy',
        reporting: 'healthy'
      }
    };
  }
}
