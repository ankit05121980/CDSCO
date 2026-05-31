import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  EntityStatus,
  Jurisdiction,
  OrganizationType,
  RiskClass,
} from '../../../common/enums';

/**
 * Regulated entity registry — manufacturers, importers, exporters,
 * wholesalers/retailers, CROs, ethics committees, blood centres, BA/BE
 * centres, consultants, marketers. Acts as a source-of-truth registry.
 */
@Entity('organizations')
export class Organization extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Index()
  @Column()
  type: OrganizationType;

  @Index({ unique: true })
  @Column()
  registrationNo: string;

  @Column({ nullable: true })
  gstin?: string;

  @Column({ nullable: true })
  pan?: string;

  @Column({ nullable: true })
  cin?: string; // company identification number (MCA)

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Index()
  @Column({ nullable: true })
  stateCode?: string;

  @Column({ nullable: true })
  stateName?: string;

  @Column({ nullable: true })
  pincode?: string;

  // Geo-tagging of premises
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  contactPerson?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ default: EntityStatus.ACTIVE })
  status: EntityStatus;

  @Column({ default: Jurisdiction.STATE })
  jurisdiction: Jurisdiction;

  @Column({ nullable: true })
  riskClass?: RiskClass;

  /** Product categories handled (simple-json array). */
  @Column({ type: 'simple-json', nullable: true })
  productCategories?: string[];

  @Column({ nullable: true })
  establishedYear?: number;

  @Column({ default: 0 })
  productCount: number;

  /** Linked user account id (the entity's primary login), if any. */
  @Column({ nullable: true })
  ownerUserId?: string;
}
