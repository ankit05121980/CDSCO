import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';

@Entity('issues')
@Index(['tenantId', 'status'])
export class Issue extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'medium' })
  severity: IssueSeverity;

  @Column({ default: 'open' })
  status: IssueStatus;

  @Column({ nullable: true })
  assigneeId?: string;

  @Column({ nullable: true })
  relatedRiskId?: string;
}
