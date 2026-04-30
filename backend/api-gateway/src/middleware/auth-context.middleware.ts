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
          const userId = decoded.sub || decoded.id;
          const originalRole = (decoded.role || '').toUpperCase();
          
          // Map global roles to internal service roles to prevent 403 Forbidden
          let roles = [originalRole];
          if (originalRole === 'ADMIN' || originalRole === 'ROOT') {
            roles = [...roles, 'EMPLOYEE', 'HR_ADMIN', 'MANAGER', 'SUPERADMIN'];
          }
          const rolesString = Array.from(new Set(roles)).join(',');

          req.headers['x-user-id'] = userId;
          req.headers['x-user-role'] = originalRole;
          req.headers['x-user-roles'] = rolesString;
        }
      } catch (error) {
        console.warn('[AuthContext] Failed to decode token:', error.message);
      }
    }

    next();
  }
}
