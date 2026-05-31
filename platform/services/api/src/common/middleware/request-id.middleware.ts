import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/** Assigns/propagates a correlation id (`x-request-id`) for tracing. */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = (req.headers['x-request-id'] as string) || randomUUID();
    (req as Request & { requestId?: string }).requestId = incoming;
    res.setHeader('x-request-id', incoming);
    next();
  }
}
