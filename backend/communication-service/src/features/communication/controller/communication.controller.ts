import { Body, Controller, Get, Param, Post, Logger, InternalServerErrorException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunicationService } from '../service/communication.service';
import { CreateChatMessageDto } from '../dto/chat.dto';
import { CreateActivityLogDto } from '../dto/activity.dto';

@ApiTags('communication')
@Controller('communication')
export class CommunicationController {
  private readonly logger = new Logger(CommunicationController.name);

  constructor(private readonly communicationService: CommunicationService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message' })
  async sendMessage(@Body() dto: CreateChatMessageDto) {
    try {
      return await this.communicationService.saveMessage(dto);
    } catch (error) {
      this.logger.error(`Error in sendMessage: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('chat/:projectId')
  @ApiOperation({ summary: 'Get latest messages for a project' })
  async getMessages(@Param('projectId') projectId: string) {
    try {
      this.logger.log(`Fetching messages for project: ${projectId}`);
      const messages = await this.communicationService.getProjectMessages(projectId);
      this.logger.log(`Successfully fetched ${messages.length} messages`);
      return messages;
    } catch (error) {
      this.logger.error(`Error in getMessages for project ${projectId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Database error: ${error.message}`);
    }
  }

  @Post('activity')
  @ApiOperation({ summary: 'Log a project activity' })
  logActivity(@Body() dto: CreateActivityLogDto) {
    return this.communicationService.logActivity(dto);
  }

  @Get('activity/:projectId')
  @ApiOperation({ summary: 'Get activity history for a project' })
  getActivity(@Param('projectId') projectId: string) {
    return this.communicationService.getProjectActivity(projectId);
  }
}
