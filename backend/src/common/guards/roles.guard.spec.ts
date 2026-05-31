import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums';

function ctx(user: any) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => null,
    getClass: () => null,
  } as any;
}

describe('RolesGuard', () => {
  const make = (required?: Role[], isPublic = false) => {
    const reflector = {
      getAllAndOverride: (key: string) => (key === 'isPublic' ? isPublic : required),
    } as unknown as Reflector;
    return new RolesGuard(reflector);
  };

  it('allows public routes', () => {
    expect(make(undefined, true).canActivate(ctx(null))).toBe(true);
  });

  it('allows when no roles are required', () => {
    expect(make(undefined).canActivate(ctx({ roles: [Role.MANUFACTURER] }))).toBe(true);
  });

  it('allows a user holding a required role', () => {
    const g = make([Role.CDSCO_DCGI]);
    expect(g.canActivate(ctx({ roles: [Role.CDSCO_DCGI] }))).toBe(true);
  });

  it('always allows SUPER_ADMIN', () => {
    const g = make([Role.CDSCO_DCGI]);
    expect(g.canActivate(ctx({ roles: [Role.SUPER_ADMIN] }))).toBe(true);
  });

  it('forbids a user without the required role', () => {
    const g = make([Role.CDSCO_DCGI]);
    expect(() => g.canActivate(ctx({ roles: [Role.MANUFACTURER] }))).toThrow(ForbiddenException);
  });
});
