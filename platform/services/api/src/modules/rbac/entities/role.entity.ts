import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * A role groups a set of fine-grained permissions. System roles are seeded per
 * tenant; tenant admins may create additional custom roles.
 */
@Entity('roles')
@Index(['tenantId', 'name'], { unique: true })
export class Role extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ type: 'simple-json', default: '[]' })
  permissions: string[];
}
