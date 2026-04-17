import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.decode(token) as any;
        if (decoded) {
          req.headers['x-user-id'] = decoded.sub || decoded.id;
          req.headers['x-user-role'] = decoded.role;
        }
      } catch (error) {
        console.warn('[AuthContext] Failed to decode token:', error.message);
      }
    }

    next();
  }
}
