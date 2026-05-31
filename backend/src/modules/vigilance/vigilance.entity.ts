import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/** Adverse event report — SAE, AEFI, ICSR, Pharmaco/Materio/Haemovigilance. */
@Entity('adverse_events')
export class AdverseEvent extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column({ default: 'SAE' })
  type: string; // SAE, AEFI, PV, MV, HV, ICSR

  @Column({ nullable: true })
  productName?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  seriousness?: string; // DEATH, HOSPITALISATION, DISABILITY, LIFE_THREATENING, OTHER

  @Column({ nullable: true })
  reporterType?: string; // PHYSICIAN, MANUFACTURER, CONSUMER, HOSPITAL

  @Column({ nullable: true })
  patientAgeGroup?: string;

  @Column({ nullable: true })
  patientGender?: string;

  @Column({ nullable: true })
  outcome?: string;

  @Index()
  @Column({ default: 'RECEIVED' })
  status: string; // RECEIVED, UNDER_ASSESSMENT, CAUSALITY_ASSESSED, CLOSED

  @Column({ nullable: true })
  causality?: string; // CERTAIN, PROBABLE, POSSIBLE, UNLIKELY, UNCLASSIFIED

  @Column({ default: 'MANUAL' })
  source: string; // E2B, ICSR, MANUAL

  @Column({ nullable: true })
  reportedDate?: Date;

  @Column({ nullable: true })
  stateCode?: string;
}

/** Periodic Safety Update Report. */
@Entity('psur')
export class Psur extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  periodFrom?: Date;

  @Column({ nullable: true })
  periodTo?: Date;

  @Index()
  @Column({ default: 'SUBMITTED' })
  status: string; // SUBMITTED, UNDER_REVIEW, ACCEPTED, QUERY

  @Column({ nullable: true })
  submittedDate?: Date;

  @Column({ default: 0 })
  casesReported: number;
}

/** Compensation claim arising from a serious adverse event in a trial. */
@Entity('compensation_claims')
export class CompensationClaim extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column({ nullable: true })
  relatedAeId?: string;

  @Column({ nullable: true })
  trialRef?: string;

  @Column({ nullable: true })
  claimantName?: string;

  @Column({ type: 'float', default: 0 })
  amountClaimed: number;

  @Column({ type: 'float', default: 0 })
  amountAwarded: number;

  @Index()
  @Column({ default: 'FILED' })
  status: string; // FILED, UNDER_REVIEW, AWARDED, REJECTED

  @Column({ nullable: true })
  filedDate?: Date;
}
