import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { ProductCategory, RiskClass } from '../../common/enums';

/**
 * Product registry across all regulated categories (drugs, biologicals,
 * medical devices, IVDs, cosmetics, veterinary, AYUSH, blood products).
 */
@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Index()
  @Column({ nullable: true })
  brandName?: string;

  @Index()
  @Column()
  category: ProductCategory;

  @Column({ nullable: true })
  genericName?: string;

  @Column({ nullable: true })
  dosageForm?: string;

  @Column({ nullable: true })
  strength?: string;

  @Column({ type: 'text', nullable: true })
  composition?: string;

  @Index({ unique: true })
  @Column()
  registrationNo: string;

  @Column({ nullable: true })
  riskClass?: RiskClass;

  @Column({ nullable: true })
  schedule?: string; // Schedule H, H1, X, etc.

  @Column({ nullable: true })
  therapeuticArea?: string;

  @Column({ nullable: true })
  hsnCode?: string;

  @Column({ nullable: true })
  packSize?: string;

  @Index()
  @Column({ nullable: true })
  manufacturerId?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: false })
  isImported: boolean;

  @Column({ nullable: true })
  approvalDate?: Date;
}
