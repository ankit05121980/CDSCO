import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'approval' | 'automation' | 'ai';
  assigneeRole?: string;
  config?: Record<string, unknown>;
  next?: string[];
}

/** Declarative workflow definition used by the low-code workflow designer. */
@Entity('workflows')
@Index(['tenantId', 'name'])
export class Workflow extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ type: 'simple-json', default: '[]' })
  steps: WorkflowStep[];

  @Column({ type: 'simple-json', nullable: true })
  trigger?: Record<string, unknown>;
}
