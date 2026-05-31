import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Append-only audit record. Written by the global AuditInterceptor for every
 * mutating request and by services for security-relevant events.
 */
@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'action'])
export class AuditLog extends BaseEntity {
  @Index()
  @Column({ nullable: true })
  tenantId?: string;

  @Column({ nullable: true })
  actorId?: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  resource?: string;

  @Column({ nullable: true })
  resourceId?: string;

  @Column({ type: 'integer', nullable: true })
  statusCode?: number;

  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ type: 'integer', nullable: true })
  latencyMs?: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown>;
}
