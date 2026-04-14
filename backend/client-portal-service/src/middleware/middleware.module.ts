import { Module } from '@nestjs/common';
import { AuthMiddleware } from './auth.middleware';
import { LoggingMiddleware } from './logging.middleware';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({
  providers: [AuthMiddleware, LoggingMiddleware, RateLimitMiddleware],
  exports: [AuthMiddleware, LoggingMiddleware, RateLimitMiddleware],
})
export class MiddlewareModule {}
