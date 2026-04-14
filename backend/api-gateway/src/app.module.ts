import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { UsersProxyController } from './controllers/users-proxy.controller';
import { ProjectsProxyController } from './controllers/projects-proxy.controller';
import { RoleAssignmentsProxyController } from './controllers/role-assignments-proxy.controller';
import { PermissionsProxyController } from './controllers/permissions-proxy.controller';
import { ClientPortalProxyController } from './controllers/client-portal-proxy.controller';
import { ReportingProxyController } from './controllers/reporting-proxy.controller';
import { HrProxyController } from './controllers/hr-proxy.controller';
import { CommunicationProxyController } from './controllers/communication-proxy.controller';
import { SystemController } from './controllers/system.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { NotificationGateway } from './notification/notification.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    AuthProxyController,
    UsersProxyController,
    ProjectsProxyController,
    RoleAssignmentsProxyController,
    PermissionsProxyController,
    ClientPortalProxyController,
    ReportingProxyController,
    HrProxyController,
    CommunicationProxyController,
    SystemController,
  ],
  providers: [JwtAuthGuard, WsJwtGuard, NotificationGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

