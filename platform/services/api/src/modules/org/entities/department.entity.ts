import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('departments')
@Index(['tenantId', 'name'])
export class Department extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column({ nullable: true })
  headUserId?: string;
}
