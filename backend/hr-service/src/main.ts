import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors();
  app.setGlobalPrefix("/api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("HR Leave Service")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/v1/docs", app, document);

  const port = (process.env.PORT && Number(process.env.PORT) !== 3000) ? Number(process.env.PORT) : 3004;
  await app.listen(port);
  console.log(`🚀 HR Service is READY on port ${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`);
}

bootstrap().catch(err => console.error("HR Bootstrap Error:", err));

