import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('meetings')
@Index(['tenantId', 'startsAt'])
export class Meeting extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'datetime', nullable: true })
  startsAt?: Date;

  @Column({ type: 'integer', default: 30 })
  durationMinutes: number;

  @Column({ type: 'simple-json', default: '[]' })
  attendeeIds: string[];

  @Column({ type: 'text', nullable: true })
  transcript?: string;

  @Column()
  organizerId: string;
}
