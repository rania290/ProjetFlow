import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationController } from './controller/communication.controller';
import { CommunicationService } from './service/communication.service';
import { CommunicationGateway } from './service/communication.gateway';
import { ChatMessage } from './model/chat-message.model';
import { ActivityLog } from './model/activity-log.model';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ActivityLog])],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationGateway],
  exports: [CommunicationService],
})
export class CommunicationModule {}
