import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const userRole = String(user.role || '').toUpperCase();
    const hasRole = requiredRoles.some((role) => userRole === String(role).toUpperCase());
    if (!hasRole) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    return true;
  }
}
