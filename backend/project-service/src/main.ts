import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PROJECT_PORT ?? 3002);
  console.log(
    `🚀 Project service running on: http://localhost:${process.env.PROJECT_PORT ?? 3002}`,
  );
}

bootstrap();

