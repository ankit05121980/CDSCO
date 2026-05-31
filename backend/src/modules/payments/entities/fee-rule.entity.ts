import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Configurable fee rule used to auto-calculate application fees. */
@Entity('fee_rules')
export class FeeRule extends BaseEntity {
  @Index()
  @Column()
  applicationType: string;

  @Column({ nullable: true })
  productCategory?: string;

  @Column({ nullable: true })
  riskClass?: string;

  @Column({ nullable: true })
  jurisdiction?: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ nullable: true })
  description?: string;
}
