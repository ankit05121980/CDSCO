import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  ApplicationStatus,
  ApplicationType,
  Jurisdiction,
  ProductCategory,
  RiskClass,
} from '../../../common/enums';

/**
 * Central application object driven by the generic workflow engine. Covers the
 * full regulatory lifecycle: registration, market authorisation, licensing,
 * renewal, endorsement, post-approval change, suspension, surrender, appeal,
 * NOC, clinical trial, etc.
 */
@Entity('applications')
export class Application extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column()
  type: ApplicationType;

  @Column()
  title: string;

  @Index()
  @Column({ nullable: true })
  productCategory?: ProductCategory;

  @Column({ nullable: true })
  riskClass?: RiskClass;

  @Index()
  @Column({ default: Jurisdiction.CENTRE })
  jurisdiction: Jurisdiction;

  @Column({ nullable: true })
  stateCode?: string;

  // Applicant
  @Column({ nullable: true })
  applicantUserId?: string;

  @Column({ nullable: true })
  applicantName?: string;

  @Index()
  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  organizationName?: string;

  // Workflow
  @Index()
  @Column({ default: ApplicationStatus.DRAFT })
  status: ApplicationStatus;

  @Column({ default: 'Submission' })
  currentStage: string;

  @Index()
  @Column({ nullable: true })
  assignedToId?: string;

  @Column({ nullable: true })
  assignedToName?: string;

  @Column({ default: 'NORMAL' })
  priority: string;

  // Fees & payment
  @Column({ type: 'float', default: 0 })
  feeAmount: number;

  @Column({ default: false })
  feePaid: boolean;

  @Column({ nullable: true })
  paymentId?: string;

  // Timelines (TRS)
  @Column({ nullable: true })
  submittedAt?: Date;

  @Column({ default: 30 })
  slaDays: number;

  @Index()
  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  decisionDate?: Date;

  @Column({ type: 'text', nullable: true })
  decisionRemarks?: string;

  // Links
  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  relatedLicenseId?: string;

  @Column({ nullable: true })
  issuedLicenseId?: string;

  @Column({ type: 'simple-json', nullable: true })
  formData?: Record<string, any>;
}
