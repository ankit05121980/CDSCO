import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Stores the output of an AI invocation, linked to its request. */
@Entity('ai_responses')
export class AiResponse extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Index()
  @Column()
  requestId: string;

  @Column({ type: 'text' })
  output: string;

  @Column({ type: 'simple-json', nullable: true })
  citations?: Array<Record<string, unknown>>;

  @Column({ type: 'integer', default: 0 })
  promptTokens: number;

  @Column({ type: 'integer', default: 0 })
  completionTokens: number;

  @Column({ type: 'integer', default: 0 })
  latencyMs: number;
}
