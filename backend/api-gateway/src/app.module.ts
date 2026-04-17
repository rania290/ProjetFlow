import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthContextMiddleware } from './middleware/auth-context.middleware';

@Module({
  imports: [
    // Register JwtModule to provide JwtService for AuthContextMiddleware
    JwtModule.register({}),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Logger & Auth Context
    consumer.apply(LoggerMiddleware, AuthContextMiddleware).forRoutes('*');

    // 2. Gateway Proxy Middleware
    // We do NOT use global body-parsing here to prevent stream hangs.
    // Each downstream microservice handles its own body parsing.
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://127.0.0.1:3000', // Default
          changeOrigin: true,
          router: (req: any) => {
            const url = req.originalUrl || req.url || '';
            if (url.includes('/api/auth') || url.includes('/api/users')) return 'http://127.0.0.1:3001';
            if (url.includes('/api/projects') || url.includes('/api/tasks') || url.includes('/api/sprints') || 
                url.includes('/api/role-assignments') || url.includes('/api/permissions')) return 'http://127.0.0.1:3002';
            if (url.includes('/api/client-portal')) return 'http://127.0.0.1:3003';
            if (url.includes('/api/hr')) return 'http://127.0.0.1:3004';
            if (url.includes('/api/reporting')) return 'http://127.0.0.1:3005';
            if (url.includes('/api/communication')) return 'http://127.0.0.1:3006';
            return 'http://127.0.0.1:3000';
          },
          pathRewrite: (path, req: any) => {
            const url = req.originalUrl || path || '';
            
            // 1. Auth & Users
            if (url.includes('/api/auth')) return url.replace('/api/auth', '/auth');
            if (url.includes('/api/users')) return url.replace('/api/users', '/users');
            
            // 2. Projects & Tasks
            if (url.includes('/api/projects')) return url.replace('/api/projects', '/projects');
            if (url.includes('/api/tasks')) return url.replace('/api/tasks', '/tasks');
            if (url.includes('/api/sprints')) return url.replace('/api/sprints', '/sprints');
            if (url.includes('/api/role-assignments')) return url.replace('/api/role-assignments', '/role-assignments');
            if (url.includes('/api/permissions')) return url.replace('/api/permissions', '/permissions');
            
            // 3. Client Portal
            if (url.includes('/api/client-portal')) return url.replace('/api/client-portal', '');
            
            // 4. Reporting
            if (url.includes('/api/reporting')) return url.replace('/api/reporting', '/reports');
            
            // 5. HR: Map /api/hr/* -> /api/v1/hr/*
            if (url.includes('/api/hr')) {
               return url.replace('/api/hr', '/api/v1/hr').replace('//', '/');
            }
            
            // 6. Communication
            if (url.includes('/api/communication')) return url.replace('/api/communication', '/communication');
            
            return url;
          },
          on: {
            proxyReq: (proxyReq, req: any) => {
              const targetPath = proxyReq.path;
              console.log(`[Gateway Router] ${req.method} ${req.originalUrl || req.url} -> ${targetPath}`);
            },
            error: (err, req, res: any) => {
              console.error('[Gateway Router Error]:', err.message);
              if (res.status) {
                res.status(502).json({
                  message: 'Gateway Error: service unavailable',
                  error: err.message,
                });
              }
            },
          },
        }),
      )
      .exclude('api/health', 'api/system/*path')
      .forRoutes('/api/*path');
  }
}
