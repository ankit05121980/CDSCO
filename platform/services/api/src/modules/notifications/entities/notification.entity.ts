import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'webhook';

/** A user-facing notification (in-app inbox; email/SMS simulated by adapters). */
@Entity('notifications')
@Index(['tenantId', 'recipientId', 'read'])
export class Notification extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  recipientId: string;

  @Column({ default: 'in_app' })
  channel: NotificationChannel;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'simple-json', nullable: true })
  data?: Record<string, unknown>;
}
