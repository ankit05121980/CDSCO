import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Enforcement case — quality monitoring, sampling, NSQ/spurious detection,
 * investigations and inter-state coordination.
 */
@Entity('enforcement_cases')
export class EnforcementCase extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column()
  type: string; // SAMPLING, NSQ, SPURIOUS, INVESTIGATION, QUALITY_MONITORING

  @Column({ nullable: true })
  productName?: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  batchNo?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ nullable: true })
  classification?: string; // NSQ, SPURIOUS, ADULTERATED, MISBRANDED, STANDARD

  @Column({ default: 'MEDIUM' })
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Index()
  @Column({ default: 'OPEN' })
  status: string; // OPEN, UNDER_INVESTIGATION, PROSECUTION, CLOSED

  @Column({ nullable: true })
  detectedDate?: Date;

  @Column({ default: false })
  interState: boolean;

  @Column({ type: 'text', nullable: true })
  actionTaken?: string;

  @Column({ nullable: true })
  sampleId?: string;

  @Column({ nullable: true })
  labReportRef?: string;
}
