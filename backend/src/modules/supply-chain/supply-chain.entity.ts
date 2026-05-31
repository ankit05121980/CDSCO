import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/** Batch in the supply chain (QR-traceable from source to consumption). */
@Entity('supply_chain_batches')
export class SupplyChainBatch extends BaseEntity {
  @Index({ unique: true })
  @Column()
  batchNo: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  manufactureDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column({ default: 0 })
  quantity: number;

  @Column({ nullable: true })
  qrPayload?: string;

  @Index()
  @Column({ default: 'IN_TRANSIT' })
  status: string; // MANUFACTURED, IN_TRANSIT, AT_DISTRIBUTOR, AT_RETAILER, DISPENSED, RECALLED

  @Column({ nullable: true })
  currentHolder?: string;

  @Column({ default: 'AMBIENT' })
  storageCondition: string; // AMBIENT, COLD_CHAIN, FROZEN
}

/** A movement event of a batch between supply-chain entities. */
@Entity('supply_chain_movements')
export class SupplyChainMovement extends BaseEntity {
  @Index()
  @Column()
  batchId: string;

  @Index()
  @Column()
  batchNo: string;

  @Column({ nullable: true })
  fromEntity?: string;

  @Column({ nullable: true })
  fromType?: string;

  @Column({ nullable: true })
  toEntity?: string;

  @Column({ nullable: true })
  toType?: string;

  @Column({ default: 0 })
  quantity: number;

  @Column({ nullable: true })
  movementDate?: Date;

  @Column({ nullable: true })
  invoiceNo?: string;

  @Column({ nullable: true })
  location?: string;
}

/** Supply & distribution invoice. */
@Entity('invoices')
export class Invoice extends BaseEntity {
  @Index({ unique: true })
  @Column()
  invoiceNo: string;

  @Column({ nullable: true })
  sellerName?: string;

  @Column({ nullable: true })
  buyerName?: string;

  @Column({ nullable: true })
  invoiceDate?: Date;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ default: 0 })
  itemCount: number;

  @Column({ type: 'simple-json', nullable: true })
  batchRefs?: string[];

  @Column({ nullable: true })
  stateCode?: string;
}
