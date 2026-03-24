import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApiErrorResponseDto } from './api-error-response.dto';

interface HttpRequestLike {
  method: string;
  url: string;
  headers?: unknown;
}

interface HttpResponseLike {
  status(code: number): {
    json(payload: ApiErrorResponseDto): void;
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<HttpRequestLike>();
    const response = context.getResponse<HttpResponseLike>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = this.buildResponse(exception, request, statusCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode} ${payload.error.code}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${statusCode} ${payload.error.code}`);
    }

    response.status(statusCode).json(payload);
  }

  private buildResponse(
    exception: unknown,
    request: HttpRequestLike,
    statusCode: number,
  ): ApiErrorResponseDto {
    const timestamp = new Date().toISOString();
    const requestId = this.resolveRequestId(request);

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const normalized = this.normalizeHttpException(response, exception, statusCode);

      return {
        statusCode,
        error: {
          code: normalized.code,
          type: exception.name,
          message: normalized.message,
          details: normalized.details,
          path: request.url,
          timestamp,
          requestId,
        },
      };
    }

    return {
      statusCode,
      error: {
        code: 'internal_error',
        type: exception instanceof Error ? exception.name : 'Error',
        message: 'Unexpected application error',
        details: null,
        path: request.url,
        timestamp,
        requestId,
      },
    };
  }

  private normalizeHttpException(
    response: string | object,
    exception: HttpException,
    statusCode: number,
  ) {
    if (typeof response === 'string') {
      return {
        code: this.mapStatusToCode(statusCode),
        message: response,
        details: null,
      };
    }

    const normalizedResponse = response as Record<string, unknown>;
    const rawCode = normalizedResponse.errorCode;
    const rawMessage = normalizedResponse.message;

    return {
      code:
        typeof rawCode === 'string' && rawCode.trim().length > 0
          ? rawCode
          : this.mapStatusToCode(statusCode),
      message: this.resolveMessage(rawMessage, exception.message),
      details: this.resolveDetails(normalizedResponse, rawMessage),
    };
  }

  private resolveMessage(rawMessage: unknown, fallback: string) {
    if (Array.isArray(rawMessage)) {
      return rawMessage.join('; ');
    }

    return typeof rawMessage === 'string' && rawMessage.trim().length > 0
      ? rawMessage
      : fallback;
  }

  private resolveDetails(
    response: Record<string, unknown>,
    rawMessage: unknown,
  ) {
    const details = { ...response };
    delete details.message;
    delete details.error;
    delete details.statusCode;

    if (Object.keys(details).length > 0) {
      return details;
    }

    return Array.isArray(rawMessage) ? rawMessage : null;
  }

  private mapStatusToCode(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'bad_request';
      case HttpStatus.UNAUTHORIZED:
        return 'authentication_required';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'not_found';
      case HttpStatus.CONFLICT:
        return 'conflict';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'service_unavailable';
      default:
        return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'internal_error'
          : 'application_error';
    }
  }

  private resolveRequestId(request: HttpRequestLike) {
    const headerValue = this.readHeader(request.headers, 'x-request-id');

    if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
      return headerValue;
    }

    if (Array.isArray(headerValue) && headerValue[0]) {
      return headerValue[0];
    }

    return randomUUID();
  }

  private readHeader(headers: unknown, key: string) {
    if (!headers) {
      return undefined;
    }

    if (
      typeof headers === 'object' &&
      headers !== null &&
      'get' in headers &&
      typeof (headers as { get?: unknown }).get === 'function'
    ) {
      return (headers as { get(name: string): string | null }).get(key) ?? undefined;
    }

    if (typeof headers === 'object' && headers !== null && key in (headers as Record<string, unknown>)) {
      return (headers as Record<string, unknown>)[key] as string | string[] | undefined;
    }

    return undefined;
  }
}
