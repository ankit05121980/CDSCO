import { Injectable } from '@nestjs/common';
import { VectorMatch } from './vector-store.interface';
import { tokenize } from '../nlp/text-analysis';

export interface RankedMatch extends VectorMatch {
  finalScore: number;
  lexicalScore: number;
}

/**
 * Hybrid re-ranker. Combines the dense vector similarity from the store with a
 * lexical (keyword overlap) score to mitigate pure-embedding failure modes —
 * a lightweight reciprocal-style fusion used by many production RAG stacks.
 */
@Injectable()
export class RankerService {
  rank(query: string, matches: VectorMatch[], topK: number): RankedMatch[] {
    const qTokens = new Set(tokenize(query));
    return matches
      .map((m) => {
        const mTokens = tokenize(m.content);
        const overlap = mTokens.filter((t) => qTokens.has(t)).length;
        const lexicalScore = overlap / Math.max(1, qTokens.size);
        const finalScore = 0.7 * m.score + 0.3 * lexicalScore;
        return { ...m, lexicalScore, finalScore };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, topK);
  }
}
