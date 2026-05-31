import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'ACTION';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index()
  @Column({ nullable: true })
  userId?: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'INFO' })
  type: NotificationType;

  @Column({ nullable: true })
  category?: string; // APPLICATION, ALERT, PAYMENT, INSPECTION, ...

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  relatedId?: string;

  @Column({ default: 'IN_APP' })
  channel: string; // IN_APP, EMAIL, SMS

  @Column({ default: false })
  read: boolean;
}
