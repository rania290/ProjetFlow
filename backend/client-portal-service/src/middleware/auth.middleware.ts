import { Injectable, NestMiddleware, Request, Response } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface NextFunction {
  (err?: any): void;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    
    if (!token) {
      return next();
    }

    try {
      const payload = this.jwtService.verify(token);
      req['user'] = payload;
    } catch (error) {
      console.error('Token invalide:', error);
      return next();
    }

    next();
  }

  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      return null;
    }

    return token;
  }
}
