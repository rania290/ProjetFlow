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

    // 2. Socket.io Proxy
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://127.0.0.1:3006',
          changeOrigin: true,
          ws: true, // Enable WebSockets
          on: {
            proxyReq: (proxyReq, req: any) => {
              console.log(`[Socket Proxy] ${req.method} ${req.url} -> http://127.0.0.1:3006`);
            },
            proxyRes: (proxyRes, req: any, res: any) => {
                // Remove downstream CORS headers to prevent conflicts
                delete proxyRes.headers['access-control-allow-origin'];
                delete proxyRes.headers['access-control-allow-credentials'];
                
                // Allow the specific origin from the request
                const origin = req.headers.origin;
                if (origin) {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                }
            },
            error: (err, req, res: any) => {
              console.error('[Socket Proxy ERROR]:', err.message);
            }
          }
        }),
      )
      .forRoutes('/socket.io/*path');

    // 3. Gateway API Proxy Middleware
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://127.0.0.1:3000', // Default
          changeOrigin: true,
          router: (req: any) => {
            const url = req.originalUrl || req.url || '';
            if (url.includes('/api/auth') || url.includes('/api/users')) return 'http://127.0.0.1:3001';
            if (url.includes('/api/task-timelogs') || url.includes('/api/storage') || 
                url.includes('/api/projects') || url.includes('/api/tasks') || url.includes('/api/sprints') || 
                url.includes('/api/role-assignments') || url.includes('/api/permissions')) return 'http://127.0.0.1:3002';
            if (url.includes('/api/client-portal')) return 'http://127.0.0.1:3003';
            if (url.includes('/api/hr')) return 'http://127.0.0.1:3004';
            if (url.includes('/api/reporting')) return 'http://127.0.0.1:3005';
            if (url.includes('/api/communication')) return 'http://127.0.0.1:3006';
            if (url.includes('/api/aura')) return 'http://127.0.0.1:3007';
            return 'http://127.0.0.1:3000';
          },
          pathRewrite: (path, req: any) => {
            const url = req.originalUrl || path || '';
            
            // 0. Task Timelogs (Specific route)
            if (url.includes('/api/task-timelogs')) return url.replace('/api/task-timelogs', '/task-timelogs');

            // 1. Auth & Users
            if (url.includes('/api/auth')) return url.replace('/api/auth', '/auth');
            if (url.includes('/api/users')) return url.replace('/api/users', '/users');
            
            // 2. Projects & Tasks
            if (url.includes('/api/projects')) return url.replace('/api/projects', '/projects');
            if (url.includes('/api/tasks')) return url.replace('/api/tasks', '/tasks');
            if (url.includes('/api/sprints')) return url.replace('/api/sprints', '/sprints');
            if (url.includes('/api/role-assignments')) return url.replace('/api/role-assignments', '/role-assignments');
            if (url.includes('/api/permissions')) return url.replace('/api/permissions', '/permissions');
            if (url.includes('/api/storage/files')) return url.replace('/api/storage/files', '/storage/files');
            if (url.includes('/api/storage')) return url.replace('/api/storage', '/storage');
            
            // 3. Client Portal
            if (url.includes('/api/client-portal')) return url.replace('/api/client-portal', '');
            
            // 4. Reporting
            if (url.includes('/api/reporting')) return url.replace('/api/reporting', '');
            
            // 5. HR: Map /api/hr/* -> /api/v1/hr/*
            if (url.includes('/api/hr') && !url.includes('/api/v1/hr')) {
               return url.replace('/api/hr', '/api/v1/hr').replace('//', '/');
            }
            
            // 6. Communication
            if (url.includes('/api/communication')) return url.replace('/api/communication', '/communication');
            
            // 7. Aura
            if (url.includes('/api/aura')) return url.replace('/api/aura', '/aura');
            
            return url;
          },
          on: {
            proxyReq: (proxyReq, req: any) => {
              const targetPath = proxyReq.path;
              const userId = req.headers['x-user-id'];
              const role = req.headers['x-user-role'];
              console.log(`[Gateway Proxy] ${req.method} ${req.originalUrl} -> ${targetPath} | User: ${userId}, Role: ${role}`);
              
              if (userId) proxyReq.setHeader('x-user-id', userId);
              if (role) proxyReq.setHeader('x-user-role', role);
              const roles = req.headers['x-user-roles'];
              if (roles) proxyReq.setHeader('x-user-roles', roles);
            },
            proxyRes: (proxyRes, req: any, res: any) => {
              console.log(`[Gateway Proxy Response] ${req.method} ${req.originalUrl} -> STATUS: ${proxyRes.statusCode}`);
              
              // CRITICAL: Overwrite any downstream CORS headers to prevent wildcard mismatch errors
              delete proxyRes.headers['access-control-allow-origin'];
              delete proxyRes.headers['access-control-allow-credentials'];
              
              const origin = req.headers.origin;
              if (origin) {
                  res.setHeader('Access-Control-Allow-Origin', origin);
                  res.setHeader('Access-Control-Allow-Credentials', 'true');
              }
            },
            error: (err, req, res: any) => {
              console.error('[Gateway Proxy ERROR]:', err.message);
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  message: 'Gateway Error: upstream service unavailable',
                  error: err.message,
                }));
              }
            },
          },
          proxyTimeout: 10000, // 10s timeout for proxying
          timeout: 15000,      // 15s timeout for connection
        }),
      )
      .exclude('api/health', 'api/system/*path')
      .forRoutes('/api/*path');
  }
}
