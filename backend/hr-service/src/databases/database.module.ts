import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hr_db',
      autoLoadEntities: true,
      synchronize: true, // Force sync for dev
      logging: false,
      retryAttempts: 2,
      retryDelay: 1000,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

