import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/**
 * Generic reference master-data registry (drug categories, dosage forms,
 * blood types, states, zones, etc.). Extensible without code changes.
 */
@Entity('master_data')
export class MasterData extends BaseEntity {
  @Index()
  @Column()
  type: string; // STATE, ZONE, PORT, DRUG_CATEGORY, DOSAGE_FORM, BLOOD_TYPE...

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'simple-json', nullable: true })
  meta?: Record<string, any>;

  @Column({ default: true })
  active: boolean;
}
