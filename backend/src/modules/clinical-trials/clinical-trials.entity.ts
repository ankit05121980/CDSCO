import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/** Clinical trial / GCT / BA-BE / PMS / academic / veterinary field trial. */
@Entity('clinical_trials')
export class ClinicalTrial extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  title: string;

  @Index()
  @Column({ default: 'CLINICAL_TRIAL' })
  type: string; // CLINICAL_TRIAL, GCT, BA_BE, PMS, ACADEMIC, FIELD_VET

  @Column({ nullable: true })
  phase?: string; // I, II, III, IV

  @Column({ nullable: true })
  sponsorName?: string;

  @Column({ nullable: true })
  croName?: string;

  @Column({ nullable: true })
  drugName?: string;

  @Column({ nullable: true })
  therapeuticArea?: string;

  @Index()
  @Column({ default: 'SUBMITTED' })
  status: string; // SUBMITTED, APPROVED, ONGOING, COMPLETED, SUSPENDED, REJECTED

  @Column({ nullable: true })
  ctriNo?: string;

  @Column({ nullable: true })
  ecApprovalNo?: string;

  @Column({ default: 0 })
  subjectsPlanned: number;

  @Column({ default: 0 })
  sitesCount: number;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ default: false })
  isGlobal: boolean;
}

@Entity('trial_sites')
export class TrialSite extends BaseEntity {
  @Index()
  @Column()
  trialId: string;

  @Column({ nullable: true })
  trialRef?: string;

  @Column()
  siteName: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ nullable: true })
  principalInvestigator?: string;

  @Column({ nullable: true })
  ethicsCommittee?: string;

  @Column({ default: 0 })
  subjectsEnrolled: number;

  @Column({ default: 'ACTIVE' })
  status: string;
}
