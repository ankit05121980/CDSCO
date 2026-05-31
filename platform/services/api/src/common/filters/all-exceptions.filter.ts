import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catch-all exception filter producing a stable error envelope and never
 * leaking stack traces to clients in production.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown = 'Internal server error';
    let error = 'InternalServerError';
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'object' && res !== null ? (res as Record<string, unknown>).message ?? res : res;
      error = exception.name;
    }

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          requestId: (request as Request & { requestId?: string }).requestId,
          path: request.url,
          error: String(exception instanceof Error ? exception.stack : exception),
        }),
      );
    }

    response.status(status).json({
      success: false,
      error,
      message,
      statusCode: status,
      path: request.url,
      requestId: (request as Request & { requestId?: string }).requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
