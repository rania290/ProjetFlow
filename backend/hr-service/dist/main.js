"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("/api/v1");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("HR Leave Service")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("/api/v1/docs", app, document);
    const port = (process.env.PORT && Number(process.env.PORT) !== 3000) ? Number(process.env.PORT) : 3004;
    await app.listen(port);
    console.log(`🚀 HR Service is READY on port ${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`);
}
bootstrap().catch(err => console.error("HR Bootstrap Error:", err));
//# sourceMappingURL=main.js.map