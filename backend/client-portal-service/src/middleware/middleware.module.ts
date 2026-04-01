import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './auth.middleware';
import { LoggingMiddleware } from './logging.middleware';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({
  imports: [JwtModule],
  providers: [AuthMiddleware, LoggingMiddleware, RateLimitMiddleware],
  exports: [AuthMiddleware, LoggingMiddleware, RateLimitMiddleware],
})
export class MiddlewareModule {}
