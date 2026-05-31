import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { RankerService } from './ranker.service';
import { CitationService } from './citation.service';
import { RagService } from './rag.service';
import { LocalEmbeddingProvider } from '../providers/local-embedding.provider';
import {
  VectorMatch,
  VectorQuery,
  VectorRecord,
  VectorStore,
} from './vector-store.interface';
import { cosineSimilarity } from '../nlp/text-analysis';
import { randomUUID } from 'crypto';

/** In-memory VectorStore double for hermetic RAG integration testing. */
class InMemoryVectorStore implements VectorStore {
  private records: (VectorRecord & { id: string })[] = [];

  async upsert(records: VectorRecord[]): Promise<number> {
    for (const r of records) this.records.push({ ...r, id: randomUUID() });
    return records.length;
  }

  async query(q: VectorQuery): Promise<VectorMatch[]> {
    return this.records
      .filter((r) => r.tenantId === q.tenantId)
      .filter((r) => !q.sourceType || r.sourceType === q.sourceType)
      .map((r) => ({
        id: r.id,
        sourceType: r.sourceType,
        sourceId: r.sourceId,
        chunkIndex: r.chunkIndex,
        content: r.content,
        metadata: r.metadata,
        score: cosineSimilarity(q.embedding, r.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, q.topK);
  }

  async deleteBySource(tenantId: string, sourceType: string, sourceId: string): Promise<number> {
    const before = this.records.length;
    this.records = this.records.filter(
      (r) => !(r.tenantId === tenantId && r.sourceType === sourceType && r.sourceId === sourceId),
    );
    return before - this.records.length;
  }
}

describe('RagService (integration)', () => {
  let rag: RagService;
  let store: InMemoryVectorStore;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    store = new InMemoryVectorStore();
    const embeddings = new EmbeddingService(new LocalEmbeddingProvider(256));
    rag = new RagService(
      new ChunkingService(),
      embeddings,
      new RankerService(),
      new CitationService(),
      store,
    );
  });

  it('ingests text into chunks', async () => {
    const res = await rag.ingest({
      tenantId,
      sourceType: 'document',
      sourceId: 'doc-1',
      text: 'Encryption protects data at rest. Access control uses RBAC. '.repeat(20),
    });
    expect(res.chunks).toBeGreaterThan(0);
  });

  it('retrieves relevant chunks with citations', async () => {
    await rag.ingest({
      tenantId,
      sourceType: 'document',
      sourceId: 'doc-1',
      text:
        'Data is encrypted at rest using AES-256. ' +
        'Breach notification occurs within 72 hours. ' +
        'The annual company picnic is held in July.',
      metadata: { title: 'Security Policy' },
    });
    const result = await rag.retrieve({ tenantId, query: 'how is data encrypted', topK: 2 });
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].content.toLowerCase()).toContain('encrypted');
    expect(result.citations[0].marker).toBe('[1]');
    expect(result.contextBlock).toContain('[1]');
  });

  it('enforces tenant isolation', async () => {
    await rag.ingest({ tenantId: 'tenant-a', sourceType: 'document', sourceId: 'd', text: 'secret alpha content here' });
    const result = await rag.retrieve({ tenantId: 'tenant-b', query: 'secret alpha', topK: 5 });
    expect(result.matches).toHaveLength(0);
  });

  it('re-ingest replaces prior chunks for the same source', async () => {
    await rag.ingest({ tenantId, sourceType: 'document', sourceId: 'd', text: 'first version content' });
    await rag.ingest({ tenantId, sourceType: 'document', sourceId: 'd', text: 'second version content' });
    const result = await rag.retrieve({ tenantId, query: 'version content', topK: 10 });
    const unique = new Set(result.matches.map((m) => m.content));
    expect([...unique].some((c) => c.includes('second'))).toBe(true);
    expect([...unique].some((c) => c.includes('first'))).toBe(false);
  });

  it('removes a source from the index', async () => {
    await rag.ingest({ tenantId, sourceType: 'document', sourceId: 'd', text: 'removable content' });
    const removed = await rag.remove(tenantId, 'document', 'd');
    expect(removed).toBeGreaterThan(0);
    const result = await rag.retrieve({ tenantId, query: 'removable', topK: 5 });
    expect(result.matches).toHaveLength(0);
  });
});
