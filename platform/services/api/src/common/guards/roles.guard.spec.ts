import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { SystemRole } from '../constants/roles';

function ctx(user: unknown) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as never;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctx({ roles: [] }))).toBe(true);
  });

  it('allows when the user has a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([SystemRole.TENANT_ADMIN]);
    expect(guard.canActivate(ctx({ roles: [SystemRole.TENANT_ADMIN] }))).toBe(true);
  });

  it('allows SUPER_ADMIN to bypass any requirement', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([SystemRole.COMPLIANCE_OFFICER]);
    expect(guard.canActivate(ctx({ roles: [SystemRole.SUPER_ADMIN] }))).toBe(true);
  });

  it('denies when the user lacks the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([SystemRole.TENANT_ADMIN]);
    expect(() => guard.canActivate(ctx({ roles: [SystemRole.VIEWER] }))).toThrow(ForbiddenException);
  });

  it('denies when there is no principal', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([SystemRole.TENANT_ADMIN]);
    expect(() => guard.canActivate(ctx(undefined))).toThrow(ForbiddenException);
  });
});
