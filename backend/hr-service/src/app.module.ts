import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HrModule } from "./features/hr/hr.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    HrModule,
  ],
})
export class AppModule {}

