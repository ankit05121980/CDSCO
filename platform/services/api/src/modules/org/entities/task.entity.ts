import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

@Entity('tasks')
@Index(['tenantId', 'projectId', 'status'])
export class Task extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column({ nullable: true })
  projectId?: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'todo' })
  status: TaskStatus;

  @Column({ default: 'medium' })
  priority: TaskPriority;

  @Column({ nullable: true })
  assigneeId?: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;
}
