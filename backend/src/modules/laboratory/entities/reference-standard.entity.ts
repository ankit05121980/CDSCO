import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/** Reference standard validated/issued by laboratories. */
@Entity('reference_standards')
export class ReferenceStandard extends BaseEntity {
  @Index({ unique: true })
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  labName?: string;

  @Column({ default: 'VALIDATED' })
  status: string; // VALIDATED, ISSUED, EXPIRED

  @Column({ nullable: true })
  validTo?: Date;

  @Column({ default: 0 })
  unitsIssued: number;
}
