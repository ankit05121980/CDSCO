import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'bar' | 'line' | 'pie' | 'table';
  title: string;
  query: Record<string, unknown>;
  layout?: { x: number; y: number; w: number; h: number };
}

/** Saved dashboard composed of widgets for the dashboard builder. */
@Entity('dashboards')
@Index(['tenantId', 'name'])
export class Dashboard extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-json', default: '[]' })
  widgets: DashboardWidget[];

  @Column()
  ownerId: string;

  @Column({ default: false })
  isShared: boolean;
}
