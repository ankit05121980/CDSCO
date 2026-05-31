import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { RankedMatch, RankerService } from './ranker.service';
import { CitationService, Citation } from './citation.service';
import { VECTOR_STORE } from '../providers/provider.tokens';
import { VectorStore } from './vector-store.interface';

export interface IngestInput {
  tenantId: string;
  sourceType: string;
  sourceId: string;
  text: string;
  metadata?: Record<string, unknown>;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface RetrieveInput {
  tenantId: string;
  query: string;
  topK?: number;
  sourceType?: string;
  sourceId?: string;
}

export interface RetrieveResult {
  matches: RankedMatch[];
  citations: Citation[];
  contextBlock: string;
}

/**
 * End-to-end Retrieval-Augmented Generation pipeline:
 *  ingest:   text -> chunk -> embed -> upsert(vector store)
 *  retrieve: query -> embed -> ANN/cosine search -> hybrid re-rank -> citations
 */
@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly chunking: ChunkingService,
    private readonly embeddings: EmbeddingService,
    private readonly ranker: RankerService,
    private readonly citations: CitationService,
    @Inject(VECTOR_STORE) private readonly store: VectorStore,
  ) {}

  async ingest(input: IngestInput): Promise<{ chunks: number }> {
    await this.store.deleteBySource(input.tenantId, input.sourceType, input.sourceId);
    const chunks = this.chunking.chunk(input.text, {
      chunkSize: input.chunkSize,
      chunkOverlap: input.chunkOverlap,
    });
    if (chunks.length === 0) return { chunks: 0 };
    const vectors = await this.embeddings.embed(chunks.map((c) => c.content));
    const count = await this.store.upsert(
      chunks.map((c, i) => ({
        tenantId: input.tenantId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        chunkIndex: c.index,
        content: c.content,
        embedding: vectors[i],
        metadata: { ...input.metadata, startChar: c.startChar, endChar: c.endChar },
      })),
    );
    this.logger.log(`Ingested ${count} chunks for ${input.sourceType}:${input.sourceId}`);
    return { chunks: count };
  }

  async retrieve(input: RetrieveInput): Promise<RetrieveResult> {
    const topK = input.topK ?? 5;
    const queryEmbedding = await this.embeddings.embedOne(input.query);
    const raw = await this.store.query({
      tenantId: input.tenantId,
      embedding: queryEmbedding,
      topK: topK * 3,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    });
    const ranked = this.ranker.rank(input.query, raw, topK);
    const { citations, contextBlock } = this.citations.build(ranked);
    return { matches: ranked, citations, contextBlock };
  }

  async remove(tenantId: string, sourceType: string, sourceId: string): Promise<number> {
    return this.store.deleteBySource(tenantId, sourceType, sourceId);
  }
}
