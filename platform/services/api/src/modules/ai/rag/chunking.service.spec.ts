import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  const service = new ChunkingService();

  it('returns no chunks for empty text', () => {
    expect(service.chunk('')).toEqual([]);
  });

  it('keeps short text in a single chunk', () => {
    const chunks = service.chunk('A short document. With two sentences.', { chunkSize: 800 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].index).toBe(0);
  });

  it('splits long text into multiple chunks respecting size', () => {
    const sentence = 'This sentence has a fixed length for testing purposes. ';
    const text = sentence.repeat(60);
    const chunks = service.chunk(text, { chunkSize: 200, chunkOverlap: 40 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.content.length).toBeLessThanOrEqual(400);
    }
  });

  it('assigns sequential chunk indices', () => {
    const text = 'Sentence number one is here. '.repeat(50);
    const chunks = service.chunk(text, { chunkSize: 150, chunkOverlap: 20 });
    expect(chunks.map((c) => c.index)).toEqual(chunks.map((_, i) => i));
  });

  it('falls back to fixed-window chunking for text without sentence boundaries', () => {
    const text = 'x'.repeat(1000);
    const chunks = service.chunk(text, { chunkSize: 300, chunkOverlap: 50 });
    expect(chunks.length).toBeGreaterThan(1);
  });
});
