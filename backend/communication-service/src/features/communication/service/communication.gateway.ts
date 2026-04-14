import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CreateChatMessageDto } from '../dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173'],
    credentials: true,
  },
  maxHttpBufferSize: 1e7, // 10MB limit to allow sending large Base64 image attachments
  namespace: 'chat',
  transports: ['websocket', 'polling'],
})
export class CommunicationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CommunicationGateway.name);

  @WebSocketServer() server: Server;
  private projectUsers = new Map<string, Set<string>>(); // projectId -> Set of userIds

  constructor(private readonly communicationService: CommunicationService) {}

  afterInit(server: Server) {
    this.logger.log('Communication Gateway Initialized');
  }

  handleConnection(client: Socket) {
    const projectId = client.handshake.query.projectId as string;
    const userId = client.handshake.query.userId as string;
    
    if (projectId && userId) {
      client.join(`project_${projectId}`);
      
      if (!this.projectUsers.has(projectId)) {
        this.projectUsers.set(projectId, new Set());
      }
      this.projectUsers.get(projectId)?.add(userId);
      
      this.logger.log(`User ${userId} joined project ${projectId}`);
      
      // Notify others about new presence
      const activeUsers = this.projectUsers.get(projectId);
      if (activeUsers) {
        this.server.to(`project_${projectId}`).emit('presenceUpdate', Array.from(activeUsers));
      }
    }
  }

  handleDisconnect(client: Socket) {
    const projectId = client.handshake.query.projectId as string;
    const userId = client.handshake.query.userId as string;

    if (projectId && userId) {
      const users = this.projectUsers.get(projectId);
      if (users) {
        users.delete(userId);
        this.server.to(`project_${projectId}`).emit('presenceUpdate', Array.from(users));
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { projectId: string; userId: string; userName: string; isTyping: boolean }) {
    this.logger.log(`Typing event: User ${payload.userName} (${payload.userId}) isTyping=${payload.isTyping} in project ${payload.projectId}`);
    client.to(`project_${payload.projectId}`).emit('userTyping', payload);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateChatMessageDto) {
    this.logger.log(`Received message: ${JSON.stringify(payload)}`);
    
    // 1. Save message to DB
    const savedMessage = await this.communicationService.saveMessage(payload);

    // 2. Broadcast to project room
    this.server.to(`project_${payload.projectId}`).emit('newMessage', savedMessage);

    return savedMessage;
  }

  @SubscribeMessage('likeMessage')
  async handleLike(client: Socket, payload: { messageId: string, userId: string }) {
    const updatedMessage = await this.communicationService.toggleLike(payload.messageId, payload.userId);
    this.server.to(`project_${updatedMessage.projectId}`).emit('messageUpdated', updatedMessage);
    return updatedMessage;
  }

  @SubscribeMessage('pinMessage')
  async handlePin(client: Socket, payload: { messageId: string }) {
    const updatedMessage = await this.communicationService.togglePin(payload.messageId);
    this.server.to(`project_${updatedMessage.projectId}`).emit('messageUpdated', updatedMessage);
    return updatedMessage;
  }

  @SubscribeMessage('editMessage')
  async handleEdit(client: Socket, payload: { messageId: string, text: string }) {
    const updatedMessage = await this.communicationService.editMessage(payload.messageId, payload.text);
    if (updatedMessage) {
      this.server.to(`project_${updatedMessage.projectId}`).emit('messageUpdated', updatedMessage);
    }
    return updatedMessage;
  }

  @SubscribeMessage('deleteMessage')
  async handleDelete(client: Socket, payload: { messageId: string }) {
    const updatedMessage = await this.communicationService.deleteMessage(payload.messageId);
    if (updatedMessage) {
      this.server.to(`project_${updatedMessage.projectId}`).emit('messageUpdated', updatedMessage);
    }
    return updatedMessage;
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, projectId: string) {
    client.join(`project_${projectId}`);
    this.logger.log(`Client ${client.id} joined project room: ${projectId}`);
    return { status: 'joined', projectId };
  }
}
