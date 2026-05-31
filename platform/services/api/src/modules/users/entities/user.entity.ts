import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type UserStatus = 'active' | 'invited' | 'disabled';

/** A platform user. Credentials and MFA secrets are never serialized to API. */
@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class User extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  email: string;

  @Column()
  displayName: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'simple-json', default: '[]' })
  roles: string[];

  @Column({ default: 'active' })
  status: UserStatus;

  @Column({ nullable: true })
  department?: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true, select: false })
  mfaSecret?: string;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;
}
