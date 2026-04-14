import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

/**
 * Minimal JwtAuthGuard for service-to-service integration.
 * For now, it extracts identity from headers to keep the microservice self-contained.
 *
 * Accepted headers:
 * - Authorization: Bearer <userId>
 * - x-user-id: <userId>
 * - x-user-roles: EMPLOYEE,MANAGER,HR_ADMIN
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers["authorization"];
    const headerUserId: string | undefined = req.headers["x-user-id"];
    const headerRoles: string | undefined = req.headers["x-user-roles"];

    const bearerUserId =
      authHeader?.startsWith("Bearer ") ? authHeader.substring("Bearer ".length).trim() : undefined;

    const userId = headerUserId || bearerUserId;
    if (!userId) throw new UnauthorizedException("Missing Authorization");

    const roles = (headerRoles ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    req.user = { id: userId, roles };
    return true;
  }
}

