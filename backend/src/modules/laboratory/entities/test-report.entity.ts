import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Laboratory test report for a sample. */
@Entity('test_reports')
export class TestReport extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column()
  sampleId: string;

  @Column({ nullable: true })
  sampleRef?: string;

  @Column({ nullable: true })
  productName?: string;

  @Column({ nullable: true })
  labId?: string;

  @Column({ nullable: true })
  labName?: string;

  @Column({ nullable: true })
  analystName?: string;

  @Index()
  @Column({ default: 'STANDARD_QUALITY' })
  result: string; // STANDARD_QUALITY, NOT_STANDARD_QUALITY, SPURIOUS

  @Column({ type: 'simple-json', nullable: true })
  parameters?: { name: string; specification: string; observed: string; pass: boolean }[];

  @Column({ type: 'text', nullable: true })
  conclusion?: string;

  @Column({ nullable: true })
  reportDate?: Date;

  @Column({ default: 'FINALISED' })
  status: string; // DRAFT, FINALISED, APPEALED
}
