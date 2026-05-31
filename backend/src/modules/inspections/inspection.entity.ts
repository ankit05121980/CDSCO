import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Jurisdiction } from '../../common/enums';

/**
 * Site inspection — manufacturing, joint (Centre+State), BA/BE, CRO, blood
 * centre, retail, WC, medical device, etc. Captures geo-tag and form data
 * (Form-35 / MD-11 / COS-11). Supports joint consolidated reporting.
 */
@Entity('inspections')
export class Inspection extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column()
  type: string; // MANUFACTURING, JOINT, BA_BE, CRO, BLOOD_CENTRE, RETAIL, WC, MEDICAL_DEVICE

  @Column({ nullable: true })
  entityId?: string;

  @Column({ nullable: true })
  entityName?: string;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ default: Jurisdiction.STATE })
  jurisdiction: Jurisdiction;

  @Column({ default: false })
  isJoint: boolean;

  @Column({ nullable: true })
  formType?: string; // FORM_35, MD_11, COS_11

  @Column({ nullable: true })
  scheduledDate?: Date;

  @Column({ nullable: true })
  conductedDate?: Date;

  /** Masked inspector assignment — names hidden until override. */
  @Column({ type: 'simple-json', nullable: true })
  inspectors?: { id?: string; name: string; role?: string; masked?: boolean }[];

  @Column({ default: false })
  masked: boolean;

  @Index()
  @Column({ default: 'SCHEDULED' })
  status: string; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

  @Column({ nullable: true })
  outcome?: string; // COMPLIANT, NON_COMPLIANT, CRITICAL

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ default: 0 })
  observationsCount: number;

  @Column({ nullable: true })
  applicationId?: string;

  @Column({ type: 'simple-json', nullable: true })
  consolidatedReport?: Record<string, any>;
}
