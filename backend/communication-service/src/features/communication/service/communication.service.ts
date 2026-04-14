import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../model/chat-message.model';
import { ActivityLog } from '../model/activity-log.model';
import { CreateChatMessageDto } from '../dto/chat.dto';
import { CreateActivityLogDto } from '../dto/activity.dto';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
  ) {}

  // --- CHAT ACTIONS ---

  async saveMessage(dto: CreateChatMessageDto): Promise<ChatMessage> {
    const mentions = this.extractMentions(dto.content);
    const message = this.chatRepository.create({
      ...dto,
      mentions,
    });
    return this.chatRepository.save(message);
  }

  async toggleLike(messageId: string, userId: string): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');

    if (!message.likes) message.likes = [];
    
    if (message.likes.includes(userId)) {
      message.likes = message.likes.filter(id => id !== userId);
    } else {
      message.likes.push(userId);
    }

    return this.chatRepository.save(message);
  }

  async togglePin(messageId: string): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');

    message.isPinned = !message.isPinned;
    return this.chatRepository.save(message);
  }

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');
    message.content = content;
    message.isEdited = true;
    return this.chatRepository.save(message);
  }

  async deleteMessage(messageId: string): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');
    message.isDeleted = true;
    message.content = '<p><em class="text-slate-400">Ce message a été supprimé.</em></p>';
    return this.chatRepository.save(message);
  }

  async getProjectMessages(projectId: string): Promise<ChatMessage[]> {
    if (!projectId) return [];
    
    try {
      return await this.chatRepository.find({
        where: { projectId: projectId },
        order: { createdAt: 'ASC' } as any,
        take: 100,
      });
    } catch (error) {
      this.logger.error(`Database failure in getProjectMessages for project ${projectId}: ${error.message}`);
      throw error;
    }
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  }

  // --- ACTIVITY ACTIONS ---

  async logActivity(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityRepository.create(dto);
    return this.activityRepository.save(log);
  }

  async getProjectActivity(projectId: string): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
