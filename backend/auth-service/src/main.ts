import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.AUTH_PORT ?? 3001);
  console.log(
    `🚀 Auth service running on: http://localhost:${process.env.AUTH_PORT ?? 3001}`,
  );
}

bootstrap();

