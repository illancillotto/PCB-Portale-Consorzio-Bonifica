import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './modules/core/errors/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  const port = Number(process.env.PCB_API_PORT ?? 3001);
  const host = process.env.PCB_API_HOST ?? '0.0.0.0';

  await app.listen(port, host);
  logger.log(`PCB backend listening on http://${host}:${port}/api/v1`);
}

bootstrap();
