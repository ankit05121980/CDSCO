import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type TenantPlan = 'free' | 'business' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'archived';

/**
 * A tenant (organization). The platform uses a shared-schema, row-level
 * multi-tenancy model: every business row carries a `tenantId` and all queries
 * are scoped by the authenticated principal's tenant.
 */
@Entity('tenants')
export class Tenant extends BaseEntity {
  @Index({ unique: true })
  @Column()
  slug: string;

  @Column()
  name: string;

  @Column({ default: 'enterprise' })
  plan: TenantPlan;

  @Column({ default: 'active' })
  status: TenantStatus;

  @Column({ type: 'simple-json', nullable: true })
  settings?: Record<string, unknown>;
}
