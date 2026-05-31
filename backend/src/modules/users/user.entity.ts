import { Column, Entity, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/base.entity';
import { Role } from '../../common/enums';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column()
  email: string;

  @Exclude()
  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: Role.PUBLIC_USER })
  primaryRole: Role;

  @Column({ type: 'simple-json' })
  roles: Role[];

  @Column({ default: 'ACTIVE' })
  status: UserStatus;

  /** Linked organization/entity (manufacturer, lab, etc.) if external user. */
  @Index()
  @Column({ nullable: true })
  organizationId?: string;

  /** State/UT code for state-scoped officers (e.g. MH, DL). */
  @Column({ nullable: true })
  stateCode?: string;

  /** CDSCO office / zone / port if internal officer. */
  @Column({ nullable: true })
  office?: string;

  @Column({ nullable: true })
  designation?: string;

  /** Masked Aadhaar (e.g. XXXX-XXXX-1234) — verification simulated. */
  @Column({ nullable: true })
  aadhaarMasked?: string;

  @Column({ default: false })
  aadhaarVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIp?: string;
}
