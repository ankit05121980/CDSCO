import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type RiskStatus = 'open' | 'mitigating' | 'accepted' | 'closed';

@Entity('risks')
@Index(['tenantId', 'status'])
export class Risk extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 3 })
  likelihood: number;

  @Column({ type: 'integer', default: 3 })
  impact: number;

  /** Derived inherent score (likelihood * impact); maintained by service. */
  @Column({ type: 'integer', default: 9 })
  score: number;

  @Column({ default: 'open' })
  status: RiskStatus;

  @Column({ nullable: true })
  ownerId?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  mitigationPlan?: string;
}
