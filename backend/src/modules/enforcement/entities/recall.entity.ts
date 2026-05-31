import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Product recall record with supplied vs recalled quantity tracking. */
@Entity('recalls')
export class Recall extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  batchNo?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ default: 'CLASS_II' })
  classification: string; // CLASS_I, CLASS_II, CLASS_III

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ default: 0 })
  quantitySupplied: number;

  @Column({ default: 0 })
  quantityRecalled: number;

  @Index()
  @Column({ default: 'INITIATED' })
  status: string; // INITIATED, IN_PROGRESS, COMPLETED

  @Column({ nullable: true })
  initiatedDate?: Date;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ default: false })
  voluntary: boolean;
}
