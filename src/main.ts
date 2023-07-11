import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { LoggingService } from "./logging/logging.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useLogger(app.get(LoggingService));
  SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle("Social Network API")
    .setDescription("Social Network REST API")
    .setVersion("1.0")
    .build()));
  await app.listen(3000);
}

bootstrap();
