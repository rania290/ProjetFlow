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
          const EMPLOYEE_EQUIVALENT_ROLES = [
            'DEVELOPER', 'DESIGNER', 'TESTER', 'PROJECT_MANAGER',
            'TEAM_MEMBER', 'MANAGER', 'EMPLOYEE',
          ];
          const ADMIN_ROLES = ['ADMIN', 'ROOT', 'SUPER_ADMIN', 'SUPERADMIN'];

          let roles = [originalRole];
          if (ADMIN_ROLES.includes(originalRole)) {
            // Admins get all roles
            roles = [...ADMIN_ROLES, 'EMPLOYEE', 'HR_ADMIN', 'MANAGER', ...EMPLOYEE_EQUIVALENT_ROLES];
          } else if (EMPLOYEE_EQUIVALENT_ROLES.includes(originalRole)) {
            // Regular employees/team members always get EMPLOYEE role for HR service
            roles = [...roles, 'EMPLOYEE'];
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
