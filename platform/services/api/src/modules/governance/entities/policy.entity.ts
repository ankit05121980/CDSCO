import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('policies')
@Index(['tenantId', 'category'])
export class Policy extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ default: '1.0' })
  policyVersion: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewDate?: Date;
}
