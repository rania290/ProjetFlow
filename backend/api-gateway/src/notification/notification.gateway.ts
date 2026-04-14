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
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/notifications',
    transports: ['websocket', 'polling'],
})
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(NotificationGateway.name);
    private redisSubscriber: Redis;

    @WebSocketServer() server: Server;

    constructor(private configService: ConfigService) { }

    afterInit(server: Server) {
        this.logger.log('Notification Gateway Initialized');
        this.setupRedisSubscriber();
    }

    private setupRedisSubscriber() {
        const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;

        try {
            this.redisSubscriber = new Redis({
                host: redisHost,
                port: redisPort,
                lazyConnect: true,
                retryStrategy: (times) => {
                    if (times === 1) {
                        this.logger.log(
                            `Redis connection attempt 1 failed. Notifications will be disabled until Redis is available at ${redisHost}:${redisPort}.`
                        );
                    }
                    if (times >= 3) {
                        // Stop retrying after 3 attempts to avoid log spam, 
                        // but stay in a 'silent' failed state.
                        return null;
                    }
                    return times * 2000;
                },
                maxRetriesPerRequest: null,
            });
            // Suppress unhandled 'error' events from ioredis when Redis is unavailable
            this.redisSubscriber.on('error', () => { /* silenced — retryStrategy handles logging */ });

            this.redisSubscriber.connect().then(() => {
                this.redisSubscriber.subscribe('notifications', (err, count) => {
                    if (err) {
                        this.logger.error('Failed to subscribe to Redis notifications channel', err);
                        return;
                    }
                    this.logger.log(`Subscribed to ${count} Redis channel(s).`);
                });

                this.redisSubscriber.on('message', (channel, message) => {
                    if (channel === 'notifications') {
                        this.handleRedisMessage(message);
                    }
                });
            }).catch(() => { /* Redis unavailable — retryStrategy handles logging */ });
        } catch (err) {
            this.logger.error('Redis subscription error:', err);
        }
    }

    private handleRedisMessage(message: string) {
        try {
            const data = JSON.parse(message);
            this.logger.log(`Received Redis notification: ${JSON.stringify(data)}`);

            // If userId is provided, send to specific user room, else broadcast
            if (data.userId) {
                this.server.to(`user_${data.userId}`).emit('notification', data);
            } else {
                this.server.emit('notification', data);
            }
        } catch (err) {
            this.logger.error('Error parsing Redis message:', err);
        }
    }

    @UseGuards(WsJwtGuard)
    handleConnection(client: Socket) {
        // Access user attached by the guard
        const user = (client as any).user;
        if (user && user.sub) {
            client.join(`user_${user.sub}`);
            this.logger.log(`Client connected: ${client.id} (User: ${user.sub})`);
        } else {
            this.logger.log(`Client connected: ${client.id} (Anonymous)`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket, data: any) {
        return { event: 'pong', data: 'hello from server' };
    }
}
