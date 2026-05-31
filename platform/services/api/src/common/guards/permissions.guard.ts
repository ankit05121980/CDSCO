import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { SystemRole } from '../constants/roles';
import { AuthenticatedUser } from '../interfaces/authenticated-user';

/**
 * Fine-grained permission guard (ABAC). Requires the principal to hold ALL of
 * the permissions declared via `@RequirePermissions()`. `SUPER_ADMIN` bypasses.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const user: AuthenticatedUser = context.switchToHttp().getRequest().user;
    if (!user) {
      throw new ForbiddenException('No authenticated principal');
    }
    if (user.roles?.includes(SystemRole.SUPER_ADMIN)) {
      return true;
    }
    const granted = new Set(user.permissions || []);
    const missing = required.filter(
      (p) => !granted.has(p) && !granted.has('*'),
    );
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing permissions: ${missing.join(', ')}`,
      );
    }
    return true;
  }
}
