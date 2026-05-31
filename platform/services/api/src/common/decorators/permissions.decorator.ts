import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restricts a route to principals holding ALL of the given fine-grained
 * permissions (e.g. `document:read`, `document:write`). Implements the
 * attribute/permission portion of the platform's ABAC model.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
