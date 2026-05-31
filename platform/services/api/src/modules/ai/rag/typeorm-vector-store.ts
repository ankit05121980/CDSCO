import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VectorChunk } from '../entities/vector-chunk.entity';
import { cosineSimilarity } from '../nlp/text-analysis';
import {
  VectorMatch,
  VectorQuery,
  VectorRecord,
  VectorStore,
} from './vector-store.interface';

/**
 * Portable, dependency-free vector store backed by the relational database.
 *
 * Embeddings are persisted as JSON arrays and similarity is computed in-process
 * with cosine distance. This implements the {@link VectorStore} contract and is
 * the default store; a ChromaDB-backed implementation can be swapped in for
 * production-scale ANN search without changing any consumer.
 */
@Injectable()
export class TypeOrmVectorStore implements VectorStore {
  constructor(
    @InjectRepository(VectorChunk)
    private readonly repo: Repository<VectorChunk>,
  ) {}

  async upsert(records: VectorRecord[]): Promise<number> {
    if (records.length === 0) return 0;
    const entities = records.map((r) =>
      this.repo.create({
        tenantId: r.tenantId,
        sourceType: r.sourceType,
        sourceId: r.sourceId,
        chunkIndex: r.chunkIndex,
        content: r.content,
        embedding: r.embedding,
        metadata: r.metadata,
      }),
    );
    await this.repo.save(entities);
    return entities.length;
  }

  async query(query: VectorQuery): Promise<VectorMatch[]> {
    const where: Record<string, unknown> = { tenantId: query.tenantId };
    if (query.sourceType) where.sourceType = query.sourceType;
    if (query.sourceId) where.sourceId = query.sourceId;
    const candidates = await this.repo.find({ where });
    return candidates
      .map((c) => ({
        id: c.id,
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        metadata: c.metadata,
        score: cosineSimilarity(query.embedding, c.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.topK);
  }

  async deleteBySource(
    tenantId: string,
    sourceType: string,
    sourceId: string,
  ): Promise<number> {
    const res = await this.repo.delete({ tenantId, sourceType, sourceId });
    return res.affected ?? 0;
  }
}
