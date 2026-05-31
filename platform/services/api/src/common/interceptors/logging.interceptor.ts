import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Structured request/response logging with latency measurement. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(
            JSON.stringify({
              requestId: req.requestId,
              method,
              url,
              userId: req.user?.userId,
              tenantId: req.user?.tenantId,
              latencyMs: ms,
            }),
          );
        },
      }),
    );
  }
}
