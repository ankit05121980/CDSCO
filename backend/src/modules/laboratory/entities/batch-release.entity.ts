import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Batch Release Certificate (BRC) for biologicals, incl. SLP scrutiny. */
@Entity('batch_release_certs')
export class BatchReleaseCertificate extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  batchNo?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  labName?: string;

  @Index()
  @Column({ default: 'RELEASED' })
  status: string; // RELEASED, REJECTED, UNDER_SCRUTINY

  @Column({ default: false })
  slpScrutinised: boolean;

  @Column({ nullable: true })
  releasedDate?: Date;

  @Column({ nullable: true })
  potency?: string;
}
