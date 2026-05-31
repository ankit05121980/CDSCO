import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { PaymentMode, PaymentStatus } from '../../../common/enums';

/** Fee payment record (Bharat Kosh / State Treasury — simulated gateway). */
@Entity('payments')
export class Payment extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column({ nullable: true })
  applicationId?: string;

  @Column({ nullable: true })
  applicationRef?: string;

  @Column({ nullable: true })
  payerId?: string;

  @Column({ nullable: true })
  payerName?: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: PaymentMode.UPI })
  mode: PaymentMode;

  @Column({ default: 'BHARAT_KOSH' })
  gateway: string; // BHARAT_KOSH, STATE_TREASURY

  @Index()
  @Column({ default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  txnRef?: string;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  breakup?: { head: string; amount: number }[];

  @Column({ nullable: true })
  refundRef?: string;

  @Column({ nullable: true })
  refundedAt?: Date;
}
