import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS is handled by the API Gateway to prevent header conflicts
  // app.enableCors();

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
