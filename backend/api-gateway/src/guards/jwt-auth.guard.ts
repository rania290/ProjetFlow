import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.split(' ')[1];
        try {
            // In a real production environment, you would use a shared secret
            // or call the auth-service to verify the token.
            // For this demo, we'll use the secret from the config.
            const secret = this.configService.get<string>('JWT_SECRET') || 'super-secret-key';
            const decoded = jwt.verify(token, secret);
            request.user = decoded;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Token verification failed');
        }
    }
}
