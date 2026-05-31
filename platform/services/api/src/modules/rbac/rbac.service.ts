import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { ROLE_PERMISSIONS, SystemRole } from '../../common/constants/roles';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
  ) {}

  /** Idempotently seeds the built-in system roles for a tenant. */
  async ensureSystemRoles(tenantId: string): Promise<Role[]> {
    const roles: Role[] = [];
    for (const name of Object.values(SystemRole)) {
      let role = await this.repo.findOne({ where: { tenantId, name } });
      if (!role) {
        role = this.repo.create({
          tenantId,
          name,
          isSystem: true,
          description: `System role: ${name}`,
          permissions: ROLE_PERMISSIONS[name] || [],
        });
        role = await this.repo.save(role);
      }
      roles.push(role);
    }
    return roles;
  }

  async list(tenantId: string): Promise<Role[]> {
    return this.repo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async create(tenantId: string, name: string, permissions: string[], description?: string) {
    const role = this.repo.create({ tenantId, name, permissions, description, isSystem: false });
    return this.repo.save(role);
  }

  async update(tenantId: string, id: string, permissions: string[], description?: string) {
    const role = await this.repo.findOne({ where: { id, tenantId } });
    if (!role) throw new NotFoundException('Role not found');
    role.permissions = permissions;
    if (description !== undefined) role.description = description;
    return this.repo.save(role);
  }

  async remove(tenantId: string, id: string) {
    const role = await this.repo.findOne({ where: { id, tenantId } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new NotFoundException('Cannot delete a system role');
    await this.repo.remove(role);
  }

  /** Resolves the union of permissions for a set of role names. */
  async resolvePermissions(tenantId: string, roleNames: string[]): Promise<string[]> {
    if (!roleNames?.length) return [];
    const roles = await this.repo.find({ where: { tenantId } });
    const set = new Set<string>();
    for (const r of roles) {
      if (roleNames.includes(r.name)) {
        for (const p of r.permissions) set.add(p);
      }
    }
    return [...set];
  }
}
