import { LocalEmbeddingProvider } from './local-embedding.provider';
import { cosineSimilarity } from '../nlp/text-analysis';

describe('LocalEmbeddingProvider', () => {
  const provider = new LocalEmbeddingProvider(128);

  it('produces vectors of the configured dimension', async () => {
    const v = await provider.embedOne('hello world');
    expect(v).toHaveLength(128);
  });

  it('produces L2-normalized vectors', async () => {
    const v = await provider.embedOne('enterprise knowledge management platform');
    const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it('is deterministic', async () => {
    const a = await provider.embedOne('compliance audit');
    const b = await provider.embedOne('compliance audit');
    expect(a).toEqual(b);
  });

  it('scores similar texts higher than dissimilar ones', async () => {
    const [q, near, far] = await provider.embed([
      'data encryption at rest and in transit',
      'all data is encrypted at rest using strong encryption',
      'the company picnic is scheduled for summer',
    ]);
    expect(cosineSimilarity(q, near)).toBeGreaterThan(cosineSimilarity(q, far));
  });

  it('embeds batches', async () => {
    const vecs = await provider.embed(['a alpha', 'b beta', 'c gamma']);
    expect(vecs).toHaveLength(3);
  });
});
