import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CustomLogger } from './utils/logger.service';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
    bodyParser: false,
  });

  // Enable Socket.io WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:3000', // Swagger/Gateway itself
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'X-Requested-With', 
      'x-user-id', 
      'x-user-role',
      'Origin',
      'Access-Control-Allow-Origin'
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('VAERDIA API')
    .setDescription('The VAERDIA ProjectFlow API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('projects')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token (without "Bearer " prefix)',
        in: 'header',
      },
      'access_token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
  console.log(
    `🚀 API Gateway running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();

