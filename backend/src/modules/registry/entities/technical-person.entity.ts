import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Technical Person registry.
 *
 * Business rule (RFP): a technical person can be associated with only ONE
 * manufacturer / laboratory / blood bank / wholesaler / retailer at a time.
 * Enforced via a unique registrationNo and single organizationId, with the
 * service rejecting attempts to attach an already-engaged person elsewhere.
 */
@Entity('technical_persons')
export class TechnicalPerson extends BaseEntity {
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  registrationNo: string;

  @Column({ nullable: true })
  qualification?: string;

  @Column({ nullable: true })
  designation?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  aadhaarMasked?: string;

  @Index()
  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  organizationName?: string;

  @Column({ nullable: true })
  organizationType?: string;

  @Column({ default: 'ENGAGED' })
  status: 'ENGAGED' | 'AVAILABLE' | 'BLACKLISTED';

  @Column({ nullable: true })
  experienceYears?: number;
}
