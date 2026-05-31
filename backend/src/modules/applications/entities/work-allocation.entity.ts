import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { AllocationMode } from '../../../common/enums';

/**
 * Records random/auto/manual allocation of work (applications, inspections,
 * sample testing) to officers — supports masked assignment and manual override.
 */
@Entity('work_allocations')
export class WorkAllocation extends BaseEntity {
  @Index()
  @Column()
  itemType: string; // APPLICATION, INSPECTION, SAMPLE

  @Index()
  @Column()
  itemId: string;

  @Column({ nullable: true })
  itemRef?: string;

  @Column()
  assignedToId: string;

  @Column()
  assignedToName: string;

  @Column({ nullable: true })
  assignedToRole?: string;

  @Column({ default: AllocationMode.AUTO })
  mode: AllocationMode;

  @Column({ default: false })
  masked: boolean;

  @Column({ nullable: true })
  allocatedById?: string;

  @Column({ default: 'ASSIGNED' })
  status: 'ASSIGNED' | 'COMPLETED' | 'REASSIGNED';
}
