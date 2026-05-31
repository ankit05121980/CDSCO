import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { Permission, SystemRole } from '../constants/roles';

function ctx(user: unknown) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as never;
}

describe('PermissionsGuard', () => {
  let reflector: Reflector;
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('allows when no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctx({ permissions: [] }))).toBe(true);
  });

  it('allows when all required permissions are held', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DOCUMENT_WRITE]);
    expect(guard.canActivate(ctx({ permissions: [Permission.DOCUMENT_WRITE] }))).toBe(true);
  });

  it('allows wildcard permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.DOCUMENT_DELETE]);
    expect(guard.canActivate(ctx({ permissions: [Permission.ALL] }))).toBe(true);
  });

  it('allows SUPER_ADMIN to bypass', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.AUDIT_READ]);
    expect(guard.canActivate(ctx({ roles: [SystemRole.SUPER_ADMIN], permissions: [] }))).toBe(true);
  });

  it('denies when a required permission is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.USER_WRITE]);
    expect(() => guard.canActivate(ctx({ permissions: [Permission.DOCUMENT_READ] }))).toThrow(
      ForbiddenException,
    );
  });
});
