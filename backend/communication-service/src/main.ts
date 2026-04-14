import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow WebSocket connections from frontend origins
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // Use IoAdapter for Socket.IO WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: false,  // strip unknown fields silently
  }));

  const config = new DocumentBuilder()
    .setTitle('Communication Service')
    .setDescription('The communication service API description')
    .setVersion('1.0')
    .addTag('communication')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Communication service is running on: http://localhost:${port}`);
}
bootstrap();
