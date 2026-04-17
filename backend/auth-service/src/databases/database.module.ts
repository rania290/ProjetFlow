import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'auth_db',
      entities: [__dirname + '/../features/**/*.model{.ts,.js}'],
      synchronize: true, // Force sync in dev
      logging: false, // Désactivé à la demande de l'utilisateur
      retryAttempts: 5,
      retryDelay: 3000,
    }),
  ],
})
export class DatabaseModule {}

