import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './modules/core/errors/api-exception.filter';

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
}

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
  app.use((request: RequestLike, response: ResponseLike, next: () => void) => {
    const headerValue = request.headers['x-request-id'];
    const requestId =
      typeof headerValue === 'string'
        ? headerValue
        : Array.isArray(headerValue) && headerValue[0]
          ? headerValue[0]
          : randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  });

  const port = Number(process.env.PCB_API_PORT ?? 5010);
  const host = process.env.PCB_API_HOST ?? '0.0.0.0';

  await app.listen(port, host);
  logger.log(`PCB backend listening on http://${host}:${port}/api/v1`);
}

bootstrap();
