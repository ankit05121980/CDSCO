export interface VectorRecord {
  id?: string;
  tenantId: string;
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorQuery {
  tenantId: string;
  embedding: number[];
  topK: number;
  sourceType?: string;
  sourceId?: string;
}

export interface VectorMatch {
  id: string;
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/** Pluggable vector store contract (DB-backed locally, ChromaDB in production). */
export interface VectorStore {
  upsert(records: VectorRecord[]): Promise<number>;
  query(query: VectorQuery): Promise<VectorMatch[]>;
  deleteBySource(tenantId: string, sourceType: string, sourceId: string): Promise<number>;
}
