import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SystemRole } from '../constants/roles';
import { AuthenticatedUser } from '../interfaces/authenticated-user';

/**
 * Role-based access control guard. `SUPER_ADMIN` bypasses all role checks.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
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
    const allowed = required.some((role) => user.roles?.includes(role));
    if (!allowed) {
      throw new ForbiddenException(
        `Requires one of roles: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
