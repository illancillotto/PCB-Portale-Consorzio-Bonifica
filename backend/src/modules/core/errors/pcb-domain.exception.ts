import { HttpException, HttpStatus } from '@nestjs/common';

export class PcbDomainException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        ...(details ? { details } : {}),
      },
      statusCode,
    );
  }

  static badRequest(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    return new PcbDomainException(HttpStatus.BAD_REQUEST, errorCode, message, details);
  }

  static notFound(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    return new PcbDomainException(HttpStatus.NOT_FOUND, errorCode, message, details);
  }

  static conflict(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    return new PcbDomainException(HttpStatus.CONFLICT, errorCode, message, details);
  }

  static serviceUnavailable(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    return new PcbDomainException(HttpStatus.SERVICE_UNAVAILABLE, errorCode, message, details);
  }
}
