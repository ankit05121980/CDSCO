import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('inspection_findings')
export class InspectionFinding extends BaseEntity {
  @Index()
  @Column()
  inspectionId: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ type: 'text' })
  observation: string;

  @Column({ default: 'MINOR' })
  severity: string; // CRITICAL, MAJOR, MINOR

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, RESOLVED
}
