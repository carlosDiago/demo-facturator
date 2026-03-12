import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./common/zod-exception.filter";
import { getAppConfig } from "./config/app.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = getAppConfig();

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalFilters(new ZodExceptionFilter());

  await app.listen(config.port);
}

void bootstrap();
