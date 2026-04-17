import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './utils/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';

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

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuration CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, process.env.FRONTEND_URL || 'http://localhost:3000');
      }
    },
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Client Portal API')
    .setDescription('API pour le portail client de ProjetFlow')
    .setVersion('1.0')
    .addTag('client-portal')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Démarrage
  const port = process.env.PORT || process.env.CLIENT_PORTAL_PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Client Portal Service running on port ${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap();
