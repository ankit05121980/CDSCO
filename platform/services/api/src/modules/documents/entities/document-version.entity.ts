import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Immutable historical version of a document. */
@Entity('document_versions')
@Index(['documentId', 'version'], { unique: true })
export class DocumentVersion extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Index()
  @Column()
  documentId: string;

  @Column({ type: 'integer' })
  version: number;

  @Column({ nullable: true })
  storageKey?: string;

  @Column({ type: 'integer', default: 0 })
  sizeBytes: number;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  changeSummary?: string;
}
