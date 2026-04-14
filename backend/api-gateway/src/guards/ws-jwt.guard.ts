import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private configService: ConfigService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authHeader = client.handshake?.auth?.token || client.handshake?.headers?.authorization;

      if (!authHeader) {
        this.logger.error('No authorization token provided');
        throw new WsException('Unauthorized');
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const secret = this.configService.get<string>('JWT_SECRET') || 'super-secret-key';

      const decoded = jwt.verify(token, secret) as any;
      this.logger.log(`WebSocket Authentication successful for user ${decoded.sub}`);

      // Attach user to client
      client.user = decoded;

      return true;
    } catch (err) {
      this.logger.error(`WebSocket Authentication failed: ${err.message}`);
      throw new WsException('Unauthorized');
    }
  }
}
