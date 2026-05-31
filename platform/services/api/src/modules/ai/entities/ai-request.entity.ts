import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type AiTask =
  | 'summarize'
  | 'qa'
  | 'extract_entities'
  | 'extract_keywords'
  | 'risk_detection'
  | 'compliance_gap'
  | 'proposal'
  | 'chat'
  | 'agent';

/** Records each AI invocation for cost tracking, audit and evaluation. */
@Entity('ai_requests')
@Index(['tenantId', 'task'])
export class AiRequest extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  task: AiTask;

  @Column()
  provider: string;

  @Column()
  model: string;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'simple-json', nullable: true })
  parameters?: Record<string, unknown>;
}
