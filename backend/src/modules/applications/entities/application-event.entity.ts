import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Immutable workflow history entry for an application. */
@Entity('application_events')
export class ApplicationEvent extends BaseEntity {
  @Index()
  @Column()
  applicationId: string;

  @Column({ nullable: true })
  fromStatus?: string;

  @Column({ nullable: true })
  toStatus?: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  actorId?: string;

  @Column({ nullable: true })
  actorName?: string;

  @Column({ nullable: true })
  actorRole?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}
