import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { EntityStatus, LabType } from '../../../common/enums';

/**
 * Testing Laboratory registry — Central (CDL/CDTL/RDTL/IPC/NIB), State and
 * Private labs. Onboardable without code changes (RFP requirement).
 */
@Entity('laboratories')
export class Laboratory extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Index()
  @Column()
  type: LabType;

  @Index({ unique: true })
  @Column()
  registrationNo: string;

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ nullable: true })
  stateName?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  nablAccreditationNo?: string;

  @Column({ default: false })
  nablAccredited: boolean;

  /** Testing scope categories (simple-json). */
  @Column({ type: 'simple-json', nullable: true })
  testingScope?: string[];

  @Column({ nullable: true })
  contactPerson?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: EntityStatus.ACTIVE })
  status: EntityStatus;

  @Column({ default: 0 })
  capacityPerMonth: number;
}
