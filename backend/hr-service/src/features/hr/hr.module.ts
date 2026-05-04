import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { DatabaseModule } from "../../databases/database.module";
import { LeaveController } from "./controller/leave.controller";
import { LeaveRequest } from "./model/leave-request.model";
import { LeaveService } from "./service/leave.service";
import { LeaveLoggerMiddleware } from "../../middleware/leave-logger.middleware";
import { TimeTrackingController } from "./controller/time-tracking.controller";
import { TimeTrackingService } from "./service/time-tracking.service";
import { TimeTrackingSession } from "./model/time-tracking.model";

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([LeaveRequest, TimeTrackingSession]),
  ],
  controllers: [LeaveController, TimeTrackingController],
  providers: [
    LeaveService,
    TimeTrackingService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST') || '127.0.0.1',
          port: configService.get('REDIS_PORT') || 6379,
          connectTimeout: 5000,
          maxRetriesPerRequest: 0,
        });
      },
    },
  ],
  exports: [LeaveService, 'REDIS_CLIENT'],
})
export class HrModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LeaveLoggerMiddleware)
      .forRoutes({ path: "hr/leaves", method: RequestMethod.ALL });
  }
}

