import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Global interceptor that writes an immutable audit record for every mutating
 * request (who, what, when, where, outcome, latency).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    if (!MUTATING.has(req.method)) {
      return next.handle();
    }
    const started = Date.now();
    const user: AuthenticatedUser | undefined = req.user;
    const finalize = (statusCode: number) => {
      void this.audit.record({
        tenantId: user?.tenantId,
        actorId: user?.userId,
        action: `${req.method} ${req.route?.path || req.url}`,
        resource: (req.baseUrl || req.url || '').split('/')[2],
        statusCode,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        latencyMs: Date.now() - started,
        metadata: { requestId: req.requestId },
      });
    };
    return next.handle().pipe(
      tap({
        next: () => finalize(context.switchToHttp().getResponse().statusCode),
        error: (err) => finalize(err?.status || 500),
      }),
    );
  }
}
