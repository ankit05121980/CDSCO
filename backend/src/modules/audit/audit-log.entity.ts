import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Index()
  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  userEmail?: string;

  @Column({ nullable: true })
  userRole?: string;

  @Index()
  @Column()
  action: string; // e.g. "POST /api/applications"

  @Column({ nullable: true })
  method?: string;

  @Column({ nullable: true })
  path?: string;

  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true, type: 'text' })
  userAgent?: string;

  @Column({ nullable: true })
  statusCode?: number;

  @Column({ nullable: true })
  durationMs?: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}
