import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/** Common surrogate key + audit timestamps + optimistic-lock version. */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @VersionColumn({ default: 1 })
  version: number;
}

/** Base for all tenant-scoped (row-level multi-tenant) entities. */
export abstract class TenantScopedEntity extends BaseEntity {
  /** Hard tenant isolation key enforced by services and query scopes. */
  // Declared as a column by subclasses via @Column to keep indexes explicit.
}
