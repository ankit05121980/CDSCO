import { EmbeddingProvider } from './embedding-provider.interface';
import { tokenize } from '../nlp/text-analysis';

/**
 * Deterministic, dependency-free embedding via hashed bag-of-words.
 *
 * Each token is hashed into a fixed-dimension bucket and the resulting vector is
 * L2-normalized. Cosine similarity over these vectors meaningfully reflects
 * lexical overlap, which is sufficient for offline development, hermetic tests
 * and demos. Swap for {@link OpenAiEmbeddingProvider} in production.
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local-hash';

  constructor(readonly dimensions = 256) {}

  private hash(token: string): number {
    let h = 2166136261;
    for (let i = 0; i < token.length; i++) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % this.dimensions;
  }

  async embedOne(text: string): Promise<number[]> {
    const vec = new Array(this.dimensions).fill(0);
    const tokens = tokenize(text);
    for (const tok of tokens) {
      vec[this.hash(tok)] += 1;
      // bigram features improve discrimination
    }
    for (let i = 1; i < tokens.length; i++) {
      vec[this.hash(`${tokens[i - 1]}_${tokens[i]}`)] += 0.5;
    }
    const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  async embed(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedOne(t)));
  }
}
