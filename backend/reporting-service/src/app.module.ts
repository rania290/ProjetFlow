import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingModule } from './features/reporting/reporting.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '../.env', '../../.env'],
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'reporting_db',
            entities: [__dirname + '/features/reporting/model/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            synchronize: true,
        }),
        ReportingModule,
    ],
})
export class AppModule { }
