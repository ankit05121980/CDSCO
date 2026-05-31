import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Persisted vector-store record. In production the embedding lives in ChromaDB;
 * this table is the source-of-truth metadata + a portable fallback vector store
 * (the embedding is stored as a JSON float array so the platform runs with zero
 * external dependencies during development and testing).
 */
@Entity('vector_chunks')
@Index(['tenantId', 'sourceType', 'sourceId'])
export class VectorChunk extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  sourceType: string;

  @Column()
  sourceId: string;

  @Column({ type: 'integer' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-json' })
  embedding: number[];

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown>;
}
