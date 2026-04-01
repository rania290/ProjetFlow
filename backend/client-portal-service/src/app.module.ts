import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPortalModule } from './features/client-portal/client-portal.module';
import { DatabaseModule } from './databases/database.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    DatabaseModule,
    MiddlewareModule,
    UtilsModule,
    ClientPortalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
