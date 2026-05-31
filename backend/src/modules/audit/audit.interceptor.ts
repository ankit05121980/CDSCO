import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, tap } from 'rxjs';
import { AuditLog } from './audit-log.entity';

/**
 * Global interceptor that records every mutating request (and authenticated
 * sensitive reads) to the audit trail with user, timestamp, IP and outcome.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const method: string = req.method;
    const start = Date.now();

    const shouldAudit = method !== 'GET' && method !== 'OPTIONS';

    return next.handle().pipe(
      tap({
        next: () => {
          if (shouldAudit) this.write(req, res, start);
        },
        error: () => {
          if (shouldAudit) this.write(req, res, start, true);
        },
      }),
    );
  }

  private write(req: any, res: any, start: number, errored = false) {
    try {
      const user = req.user || {};
      const ip =
        req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
      const log = this.repo.create({
        userId: user.id,
        userEmail: user.email,
        userRole: (user.roles || [])[0],
        action: `${req.method} ${req.path}`,
        method: req.method,
        path: req.path,
        ip: Array.isArray(ip) ? ip[0] : ip,
        userAgent: req.headers['user-agent'],
        statusCode: errored ? 500 : res.statusCode,
        durationMs: Date.now() - start,
        metadata: this.safeBody(req.body),
      });
      // fire and forget
      this.repo.save(log).catch(() => undefined);
    } catch {
      /* never block the request on audit failure */
    }
  }

  private safeBody(body: any): Record<string, any> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const redacted = { ...body };
    for (const k of ['password', 'otp', 'token', 'pin']) {
      if (k in redacted) redacted[k] = '***';
    }
    const str = JSON.stringify(redacted);
    if (str.length > 4000) return { _truncated: true };
    return redacted;
  }
}
