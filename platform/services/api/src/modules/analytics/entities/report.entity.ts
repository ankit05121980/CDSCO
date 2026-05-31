import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Saved report definition (query + visualization spec) for the report builder. */
@Entity('reports')
@Index(['tenantId', 'name'])
export class Report extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  dataset: string;

  @Column({ type: 'simple-json', nullable: true })
  definition?: Record<string, unknown>;

  @Column()
  ownerId: string;
}
