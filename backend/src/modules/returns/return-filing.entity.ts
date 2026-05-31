import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/** Periodic return filing (production/sales/consumption/stock) — GST/ITR style. */
@Entity('returns_filings')
export class ReturnFiling extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  organizationName?: string;

  @Index()
  @Column({ default: 'PRODUCTION' })
  type: string; // PRODUCTION, SALES, CONSUMPTION, STOCK

  @Column()
  period: string; // e.g. Q1-2026, Apr-2026

  @Index()
  @Column({ default: 'FILED' })
  status: string; // DRAFT, FILED, ACCEPTED, LATE, QUERY

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  filedDate?: Date;

  @Column({ type: 'float', default: 0 })
  totalValue: number;

  @Column({ type: 'simple-json', nullable: true })
  dataPoints?: Record<string, any>;

  @Column({ nullable: true })
  stateCode?: string;
}
