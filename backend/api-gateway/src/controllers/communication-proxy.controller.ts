import { Controller, Get, Post, Body, Param, Req, UseGuards, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('communication')
@UseGuards(JwtAuthGuard)
export class CommunicationProxyController {
  private readonly logger = new Logger(CommunicationProxyController.name);
  private readonly communicationServiceUrl: string;

  constructor(private configService: ConfigService) {
    // Priority: Env var > Fallback for local dev
    this.communicationServiceUrl = this.configService.get<string>('COMMUNICATION_SERVICE_URL') || 'http://localhost:3006';
    this.logger.log(`🚀 CommunicationProxyController initialized with URL: ${this.communicationServiceUrl}`);
  }

  @Post('chat')
  async sendMessage(@Body() body: any) {
    const response = await axios.post(`${this.communicationServiceUrl}/communication/chat`, body);
    return response.data;
  }

  @Get('chat/:projectId')
  async getMessages(@Param('projectId') projectId: string) {
    if (!this.communicationServiceUrl) {
      throw new InternalServerErrorException('Communication Service URL is not configured');
    }
    const targetUrl = `${this.communicationServiceUrl}/communication/chat/${projectId}`;
    try {
      this.logger.log(`Proxying GET request to: ${targetUrl}`);
      const response = await axios.get(targetUrl);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to proxy GET chat to ${targetUrl}: ${error.message}`);
      if (error.response) {
        throw new InternalServerErrorException(`Communication service error (${error.response.status}): ${error.response.data.message || error.message}`);
      }
      throw new InternalServerErrorException(`Gateway error fetching chat from ${targetUrl}: ${error.message}`);
    }
  }

  @Post('activity')
  async logActivity(@Body() body: any) {
    try {
      const response = await axios.post(`${this.communicationServiceUrl}/communication/activity`, body);
      return response.data;
    } catch (error: any) {
      throw new InternalServerErrorException(`Gateway error logging activity: ${error.message}`);
    }
  }

  @Get('activity/:projectId')
  async getActivity(@Param('projectId') projectId: string) {
    try {
      const response = await axios.get(`${this.communicationServiceUrl}/communication/activity/${projectId}`);
      return response.data;
    } catch (error: any) {
      throw new InternalServerErrorException(`Gateway error fetching activity: ${error.message}`);
    }
  }
}
