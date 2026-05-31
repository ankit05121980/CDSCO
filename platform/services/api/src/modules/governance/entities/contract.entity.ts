import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type ContractStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'signed'
  | 'expired'
  | 'terminated';

@Entity('contracts')
@Index(['tenantId', 'status'])
export class Contract extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  counterparty?: string;

  @Column({ default: 'draft' })
  status: ContractStatus;

  @Column({ type: 'datetime', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'integer', nullable: true })
  value?: number;

  @Column({ nullable: true })
  documentId?: string;

  @Column({ type: 'simple-json', nullable: true })
  riskFlags?: string[];
}
