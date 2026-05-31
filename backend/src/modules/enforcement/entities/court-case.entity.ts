import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Prosecution / court case + Action Taken Report tracking. */
@Entity('court_cases')
export class CourtCase extends BaseEntity {
  @Index({ unique: true })
  @Column()
  caseNo: string;

  @Column({ nullable: true })
  court?: string;

  @Column({ nullable: true })
  parties?: string;

  @Column({ default: 'DRUGS_COSMETICS_ACT' })
  type: string;

  @Index()
  @Column({ default: 'FILED' })
  status: string; // FILED, HEARING, JUDGEMENT, DISPOSED, CONVICTED, ACQUITTED

  @Column({ nullable: true })
  filedDate?: Date;

  @Column({ nullable: true })
  nextHearing?: Date;

  @Column({ nullable: true })
  relatedEnforcementId?: string;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ type: 'text', nullable: true })
  actionTakenReport?: string;
}
