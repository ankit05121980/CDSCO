import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type DocumentStatus = 'draft' | 'published' | 'archived';

/**
 * Document metadata record. Binary content lives in S3-compatible object
 * storage (referenced by `storageKey`); only metadata + indexing state are in
 * the relational store.
 */
@Entity('documents')
@Index(['tenantId', 'status'])
export class Document extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'application/octet-stream' })
  mimeType: string;

  @Column({ type: 'integer', default: 0 })
  sizeBytes: number;

  @Column({ nullable: true })
  storageKey?: string;

  @Column({ default: 'draft' })
  status: DocumentStatus;

  @Column({ type: 'simple-json', default: '[]' })
  tags: string[];

  @Column({ type: 'integer', default: 1 })
  currentVersion: number;

  @Column({ default: false })
  indexed: boolean;

  @Column()
  ownerId: string;

  /** Extracted plain text used for indexing/RAG (kept for demo simplicity). */
  @Column({ type: 'text', nullable: true, select: false })
  extractedText?: string;
}
