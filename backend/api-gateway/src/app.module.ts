import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthProxyController } from './auth-proxy.controller';
import { UsersProxyController } from './users-proxy.controller';
import { ProjectsProxyController } from './projects-proxy.controller';
import { RoleAssignmentsProxyController } from './role-assignments-proxy.controller';
import { PermissionsProxyController } from './permissions-proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, AuthProxyController, UsersProxyController, ProjectsProxyController, RoleAssignmentsProxyController, PermissionsProxyController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

