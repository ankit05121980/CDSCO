import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Lab sample received for testing. */
@Entity('samples')
export class Sample extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  batchNo?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  drawnByName?: string;

  @Column({ nullable: true })
  drawnDate?: Date;

  @Column({ nullable: true })
  labId?: string;

  @Column({ nullable: true })
  labName?: string;

  @Column({ default: 'SURVEY' })
  sampleType: string; // SURVEY, STATUTORY, COMPLAINT, REGULATORY

  @Index()
  @Column({ default: 'RECEIVED' })
  status: string; // RECEIVED, UNDER_TEST, COMPLETED

  @Column({ nullable: true })
  stateCode?: string;
}
