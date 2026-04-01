import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configuration globale
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Configuration CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Configuration Swagger
    const config = new DocumentBuilder()
        .setTitle('Reporting Service API')
        .setDescription('API pour le service de reporting de ProjetFlow')
        .setVersion('1.0')
        .addTag('reporting')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Démarrage
    const port = process.env.REPORTING_PORT || 3005;
    await app.listen(port);
    console.log(`🚀 Reporting Service running on port ${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap();
