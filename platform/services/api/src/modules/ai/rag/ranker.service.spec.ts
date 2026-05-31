import { RankerService } from './ranker.service';
import { VectorMatch } from './vector-store.interface';

describe('RankerService', () => {
  const ranker = new RankerService();
  const match = (content: string, score: number, i: number): VectorMatch => ({
    id: `m${i}`,
    sourceType: 'document',
    sourceId: 'd1',
    chunkIndex: i,
    content,
    score,
  });

  it('boosts lexically relevant matches over pure vector score', () => {
    const matches = [
      match('completely unrelated content about cafeterias', 0.6, 0),
      match('encryption protects data at rest with strong encryption', 0.55, 1),
    ];
    const ranked = ranker.rank('encryption at rest', matches, 2);
    expect(ranked[0].chunkIndex).toBe(1);
  });

  it('limits results to topK', () => {
    const matches = Array.from({ length: 10 }, (_, i) => match(`doc ${i}`, 0.5, i));
    expect(ranker.rank('doc', matches, 3)).toHaveLength(3);
  });

  it('computes a combined finalScore in [0,1]', () => {
    const ranked = ranker.rank('alpha', [match('alpha beta', 0.5, 0)], 1);
    expect(ranked[0].finalScore).toBeGreaterThanOrEqual(0);
    expect(ranked[0].finalScore).toBeLessThanOrEqual(1);
  });
});
